import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const STORAGE_KEY = 'lc_profile';

const LeetCodeContext = createContext(null);

// ─── Default empty state ──────────────────────────────────
const DEFAULT = {
  username: '',
  realName: '',
  avatar: null,
  easy: 0,
  medium: 0,
  hard: 0,
  totalSolved: 0,
  totalSubmissions: 0,
  acceptance: 0,
  ranking: 0,
  lastSynced: null,
};

// ─── Derived helpers ──────────────────────────────────────
export function derivePoints(lc) {
  return lc.easy * 1 + lc.medium * 3 + lc.hard * 5;
}

export function deriveLevel(lc) {
  const pts = derivePoints(lc);
  if (pts >= 5000) return 'Elite';
  if (pts >= 3000) return 'Advanced';
  if (pts >= 1500) return 'Intermediate';
  if (pts >= 500)  return 'Junior';
  return 'Beginner';
}

export function deriveRecommendations(lc) {
  const total = lc.totalSolved;
  const easyRatio  = total ? lc.easy   / total : 0;
  const mediumRatio = total ? lc.medium / total : 0;
  const hardRatio   = total ? lc.hard   / total : 0;

  const all = [
    { id: 1,  title: 'Two Sum',                                      difficulty: 'Easy',   category: 'Arrays',              tags: ['Arrays','Hash Table'],          points: 10, estimatedTime: '15 min', reason: 'Great starting point for array problems',                    matchPercentage: 95 },
    { id: 2,  title: 'Valid Parentheses',                             difficulty: 'Easy',   category: 'Stack',               tags: ['Stack','String'],               points: 15, estimatedTime: '20 min', reason: 'Fundamental stack problem',                                  matchPercentage: 88 },
    { id: 3,  title: 'Climbing Stairs',                               difficulty: 'Easy',   category: 'Dynamic Programming', tags: ['DP'],                           points: 10, estimatedTime: '15 min', reason: 'Intro to dynamic programming concepts',                      matchPercentage: 85 },
    { id: 4,  title: 'Binary Tree Level Order Traversal',             difficulty: 'Medium', category: 'Trees',               tags: ['Trees','BFS'],                  points: 25, estimatedTime: '30 min', reason: 'Challenge yourself with tree data structures',               matchPercentage: 82 },
    { id: 5,  title: 'Longest Substring Without Repeating Characters',difficulty: 'Medium', category: 'Strings',             tags: ['Strings','Sliding Window'],     points: 30, estimatedTime: '35 min', reason: 'Improve your string manipulation skills',                    matchPercentage: 78 },
    { id: 6,  title: 'Coin Change',                                   difficulty: 'Medium', category: 'Dynamic Programming', tags: ['DP'],                           points: 35, estimatedTime: '40 min', reason: 'Classic DP problem for optimization',                         matchPercentage: 74 },
    { id: 7,  title: 'Merge k Sorted Lists',                          difficulty: 'Hard',   category: 'Linked Lists',        tags: ['Linked Lists','Heap'],          points: 50, estimatedTime: '45 min', reason: 'Advanced problem combining multiple concepts',               matchPercentage: 65 },
    { id: 8,  title: 'Trapping Rain Water',                           difficulty: 'Hard',   category: 'Arrays',              tags: ['Arrays','Two Pointers'],        points: 50, estimatedTime: '45 min', reason: 'Classic hard array problem',                                 matchPercentage: 60 },
  ];

  // Sort: push weaknesses to top
  return all.sort((a, b) => {
    const scoreA = a.difficulty === 'Easy'   ? (1 - easyRatio)   * a.matchPercentage :
                   a.difficulty === 'Medium' ? (1 - mediumRatio) * a.matchPercentage :
                                               (1 - hardRatio)   * a.matchPercentage;
    const scoreB = b.difficulty === 'Easy'   ? (1 - easyRatio)   * b.matchPercentage :
                   b.difficulty === 'Medium' ? (1 - mediumRatio) * b.matchPercentage :
                                               (1 - hardRatio)   * b.matchPercentage;
    return scoreB - scoreA;
  }).slice(0, 6);
}

export function deriveSkillGaps(lc) {
  const total = lc.totalSolved || 1;
  const easyPct   = Math.min(100, Math.round((lc.easy   / Math.max(total * 0.5, 1)) * 100));
  const mediumPct = Math.min(100, Math.round((lc.medium / Math.max(total * 0.35, 1)) * 100));
  const hardPct   = Math.min(100, Math.round((lc.hard   / Math.max(total * 0.15, 1)) * 100));
  const acceptance = Math.min(100, lc.acceptance);

  const color = (p) => p >= 75 ? 'bg-green-500' : p >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return [
    { category: 'Easy Problems',    progress: easyPct,   color: color(easyPct)   },
    { category: 'Medium Problems',  progress: mediumPct, color: color(mediumPct) },
    { category: 'Hard Problems',    progress: hardPct,   color: color(hardPct)   },
    { category: 'Acceptance Rate',  progress: Math.round(acceptance), color: color(acceptance) },
  ];
}

// ─── Provider ─────────────────────────────────────────────
export function LeetCodeProvider({ children }) {
  const [lcData, setLcData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT, ...JSON.parse(saved) } : DEFAULT;
    } catch { return DEFAULT; }
  });

  const [syncing, setSyncing]   = useState(false);
  const [syncMsg, setSyncMsg]   = useState(null);

  // Persist to localStorage whenever data changes
  useEffect(() => {
    if (lcData.username) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lcData));
    }
  }, [lcData]);

  const syncProfile = useCallback(async (lcUsername) => {
    if (!lcUsername?.trim()) {
      setSyncMsg({ type: 'error', text: 'Please enter a LeetCode username.' });
      return false;
    }

    setSyncing(true);
    setSyncMsg(null);

    try {
      const token = localStorage.getItem('token');
      let responseData;

      if (token) {
        const res = await axios.post(
          `${API}/leetcode/sync`,
          { leetcodeUsername: lcUsername.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        responseData = res.data;
      } else {
        const res = await axios.get(
          `${API}/leetcode/preview?username=${encodeURIComponent(lcUsername.trim())}`
        );
        responseData = res.data;
      }

      const s = responseData.leetcodeStats || {};
      setLcData({
        username:         responseData.leetcodeUsername || lcUsername.trim(),
        realName:         s.realName  || '',
        avatar:           s.avatar    || null,
        easy:             s.easy      || 0,
        medium:           s.medium    || 0,
        hard:             s.hard      || 0,
        totalSolved:      s.totalSolved      || 0,
        totalSubmissions: s.totalSubmissions || 0,
        acceptance:       s.acceptance       || 0,
        ranking:          s.ranking          || 0,
        lastSynced:       s.lastSynced || new Date().toISOString(),
      });

      setSyncMsg({
        type: 'success',
        text: `✅ Synced "${responseData.leetcodeUsername}"${token ? ' and saved!' : ' (preview — log in to save)'}`,
      });
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch LeetCode data. Try again.';
      setSyncMsg({ type: 'error', text: `❌ ${msg}` });
      return false;
    } finally {
      setSyncing(false);
    }
  }, []);

  const clearProfile = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setLcData(DEFAULT);
    setSyncMsg(null);
  }, []);

  const hasSynced = Boolean(lcData.username && lcData.totalSolved > 0);

  return (
    <LeetCodeContext.Provider value={{ lcData, syncing, syncMsg, syncProfile, clearProfile, hasSynced }}>
      {children}
    </LeetCodeContext.Provider>
  );
}

export function useLeetCode() {
  const ctx = useContext(LeetCodeContext);
  if (!ctx) throw new Error('useLeetCode must be used within LeetCodeProvider');
  return ctx;
}
