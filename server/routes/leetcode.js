const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Helper: fetch LeetCode stats from unofficial API (no key needed)
 */
async function fetchLeetCodeData(username) {
  const url = `https://leetcode-api-pied.vercel.app/user/${encodeURIComponent(username)}`;

  // Use native fetch (Node 18+) or fall back to dynamic import of node-fetch
  let fetchFn;
  try {
    fetchFn = fetch; // Node 18+ global
  } catch {
    const { default: nodeFetch } = await import('node-fetch');
    fetchFn = nodeFetch;
  }

  const response = await fetchFn(url, { signal: AbortSignal.timeout(10000) });

  if (!response.ok) {
    throw new Error(`LeetCode API returned status ${response.status}`);
  }

  const data = await response.json();

  // Validate: the API returns { errors: [...] } when user not found
  if (data.errors || !data.submitStats) {
    throw new Error('LeetCode user not found. Please check the username.');
  }

  return data;
}

/**
 * Map raw LeetCode API response → structured stats object
 */
function mapLeetCodeData(data) {
  const ac = data.submitStats?.acSubmissionNum ?? [];
  const total = data.submitStats?.totalSubmissionNum ?? [];

  const getCount = (arr, difficulty) =>
    arr.find((d) => d.difficulty === difficulty)?.count ?? 0;
  const getSubs = (arr, difficulty) =>
    arr.find((d) => d.difficulty === difficulty)?.submissions ?? 0;

  const easy   = getCount(ac, 'Easy');
  const medium = getCount(ac, 'Medium');
  const hard   = getCount(ac, 'Hard');
  const totalSolved = getCount(ac, 'All');

  const totalSubmissionsCount = getSubs(total, 'All');
  const acSubmissionsCount    = getSubs(ac, 'All');

  const acceptance =
    totalSubmissionsCount > 0
      ? parseFloat(((acSubmissionsCount / totalSubmissionsCount) * 100).toFixed(1))
      : 0;

  return {
    easy,
    medium,
    hard,
    totalSolved,
    totalSubmissions: totalSubmissionsCount,
    acceptance,
    ranking: data.profile?.ranking ?? 0,
    avatar: data.profile?.userAvatar ?? null,
    realName: data.profile?.realName ?? null,
    lastSynced: new Date(),
  };
}

// ─────────────────────────────────────────────────────────
// POST /api/leetcode/sync  (authenticated — saves to DB)
// Body: { leetcodeUsername: "someuser" }
// ─────────────────────────────────────────────────────────
router.post('/sync', auth, async (req, res) => {
  try {
    const { leetcodeUsername } = req.body;

    if (!leetcodeUsername || typeof leetcodeUsername !== 'string' || !leetcodeUsername.trim()) {
      return res.status(400).json({ message: 'LeetCode username is required.' });
    }

    const username = leetcodeUsername.trim();

    // Fetch from LeetCode
    const rawData = await fetchLeetCodeData(username);
    const stats   = mapLeetCodeData(rawData);

    // Persist to MongoDB
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.leetcodeUsername = username;
    user.leetcodeStats    = stats;

    // Mirror some fields into the main stats so rest of app benefits
    user.stats.problemsSolved = stats.totalSolved;
    user.stats.accuracy       = stats.acceptance;
    if (stats.ranking > 0) {
      user.stats.rank = stats.ranking;
    }

    // Re-evaluate level
    const easy   = stats.easy   * 1;
    const medium = stats.medium * 3;
    const hard   = stats.hard   * 5;
    const derivedPoints = easy + medium + hard;
    user.stats.totalPoints = derivedPoints;
    user.updateLevel();

    user.lastActive = new Date();
    await user.save();

    res.json({
      message: `LeetCode profile synced successfully!`,
      leetcodeUsername: username,
      leetcodeStats: stats,
      stats: user.stats,
    });
  } catch (error) {
    console.error('LeetCode sync error:', error.message);

    if (error.message.includes('not found') || error.message.includes('check the username')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return res.status(504).json({ message: 'LeetCode API timed out. Please try again.' });
    }

    res.status(500).json({ message: 'Failed to fetch LeetCode data. Please try again later.' });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/leetcode/preview?username=someuser  (public — no DB save)
// Used when user is not logged in but wants to preview
// ─────────────────────────────────────────────────────────
router.get('/preview', async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || !username.trim()) {
      return res.status(400).json({ message: 'Username query param is required.' });
    }

    const rawData = await fetchLeetCodeData(username.trim());
    const stats   = mapLeetCodeData(rawData);

    res.json({
      leetcodeUsername: username.trim(),
      leetcodeStats: stats,
    });
  } catch (error) {
    console.error('LeetCode preview error:', error.message);

    if (error.message.includes('not found') || error.message.includes('check the username')) {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: 'Failed to fetch LeetCode data. Please try again later.' });
  }
});

module.exports = router;
