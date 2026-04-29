const express = require('express');
const Problem = require('../models/Problem');
const User = require('../models/User');
const Submission = require('../models/Submission');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/recommendations
// @desc    Get personalized problem recommendations
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, category, difficulty } = req.query;

    // Get user profile and performance data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's submission history
    const userSubmissions = await Submission.find({ user: userId })
      .populate('problem')
      .sort({ createdAt: -1 });

    // Analyze user performance and generate recommendations
    const recommendations = await generateRecommendations(user, userSubmissions, {
      limit: parseInt(limit),
      category,
      difficulty
    });

    // Get skill gaps analysis
    const skillGaps = await analyzeSkillGaps(userId);

    // Get learning path progress
    const learningPath = await getLearningPathProgress(user);

    res.json({
      recommendations,
      skillGaps,
      learningPath,
      userStats: {
        level: user.stats.level,
        totalPoints: user.stats.totalPoints,
        problemsSolved: user.stats.problemsSolved,
        accuracy: user.stats.accuracy
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/recommendations/refresh
// @desc    Refresh recommendations based on recent activity
// @access  Private
router.post('/refresh', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Update user's last activity
    await User.findByIdAndUpdate(userId, { lastActive: new Date() });

    // Generate fresh recommendations
    const recommendations = await generateRecommendations(
      await User.findById(userId),
      await Submission.find({ user: userId }).populate('problem').sort({ createdAt: -1 }),
      { limit: 10 }
    );

    res.json({
      message: 'Recommendations refreshed successfully',
      recommendations
    });
  } catch (error) {
    console.error('Refresh recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/recommendations/learning-path
// @desc    Get personalized learning path
// @access  Private
router.get('/learning-path', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const learningPath = await getLearningPathProgress(user);
    res.json({ learningPath });
  } catch (error) {
    console.error('Get learning path error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/recommendations/skill-analysis
// @desc    Get detailed skill analysis
// @access  Private
router.get('/skill-analysis', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const skillGaps = await analyzeSkillGaps(userId);

    res.json({ skillGaps });
  } catch (error) {
    console.error('Get skill analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions
async function generateRecommendations(user, userSubmissions, options = {}) {
  const { limit = 10, category, difficulty } = options;
  
  // Analyze user's solved problems and performance
  const solvedProblemIds = userSubmissions
    .filter(s => s.status === 'Accepted')
    .map(s => s.problem._id.toString());

  const attemptedProblemIds = userSubmissions
    .map(s => s.problem._id.toString());

  // Get user's skill level based on points and accuracy
  const skillLevel = determineSkillLevel(user.stats);

  // Build recommendation criteria
  const filter = {
    _id: { $nin: attemptedProblemIds },
    isActive: true
  };

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (difficulty && difficulty !== 'all') {
    filter.difficulty = difficulty;
  } else {
    // Recommend appropriate difficulty based on skill level
    const recommendedDifficulties = getRecommendedDifficulties(skillLevel);
    filter.difficulty = { $in: recommendedDifficulties };
  }

  // Get candidate problems
  const candidateProblems = await Problem.find(filter)
    .populate('createdBy', 'name username')
    .limit(limit * 3); // Get more candidates to rank them

  // Rank problems based on various factors
  const rankedProblems = rankProblems(candidateProblems, user, userSubmissions);

  return rankedProblems.slice(0, limit);
}

function determineSkillLevel(stats) {
  const { totalPoints, accuracy, problemsSolved } = stats;
  
  if (totalPoints >= 3000 && accuracy >= 85) return 'advanced';
  if (totalPoints >= 1500 && accuracy >= 75) return 'intermediate';
  if (totalPoints >= 500 && accuracy >= 65) return 'junior';
  return 'beginner';
}

function getRecommendedDifficulties(skillLevel) {
  switch (skillLevel) {
    case 'advanced':
      return ['Medium', 'Hard'];
    case 'intermediate':
      return ['Easy', 'Medium', 'Hard'];
    case 'junior':
      return ['Easy', 'Medium'];
    default:
      return ['Easy'];
  }
}

function rankProblems(problems, user, userSubmissions) {
  return problems.map(problem => {
    let score = 0;
    let reason = '';

    // Factor 1: Difficulty appropriateness
    const userSkillLevel = determineSkillLevel(user.stats);
    if (problem.difficulty === 'Easy' && userSkillLevel === 'beginner') {
      score += 30;
      reason = 'Perfect for your current skill level';
    } else if (problem.difficulty === 'Medium' && userSkillLevel === 'intermediate') {
      score += 25;
      reason = 'Good challenge for your level';
    } else if (problem.difficulty === 'Hard' && userSkillLevel === 'advanced') {
      score += 20;
      reason = 'Challenge yourself with advanced problems';
    }

    // Factor 2: Category balance
    const userCategoryStats = getCategoryStats(userSubmissions);
    const categoryCount = userCategoryStats[problem.category] || 0;
    if (categoryCount < 3) {
      score += 15;
      reason = reason ? `${reason} and explore new categories` : 'Explore new categories';
    }

    // Factor 3: Points value
    score += Math.min(problem.points / 2, 10);

    // Factor 4: Acceptance rate (easier problems have higher acceptance)
    score += (100 - problem.acceptance) / 10;

    // Factor 5: Recent activity in similar problems
    const recentSimilar = userSubmissions.filter(s => 
      s.problem.category === problem.category && 
      new Date(s.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    if (recentSimilar.length > 0) {
      score += 10;
      reason = reason ? `${reason} and build on recent success` : 'Build on recent success';
    }

    return {
      ...problem.toObject(),
      recommendationScore: score,
      reason: reason || 'Recommended based on your profile',
      matchPercentage: Math.min(Math.round(score * 2.5), 100)
    };
  }).sort((a, b) => b.recommendationScore - a.recommendationScore);
}

function getCategoryStats(submissions) {
  const stats = {};
  submissions.forEach(submission => {
    if (submission.problem && submission.status === 'Accepted') {
      const category = submission.problem.category;
      stats[category] = (stats[category] || 0) + 1;
    }
  });
  return stats;
}

async function analyzeSkillGaps(userId) {
  const categories = ['Arrays', 'Strings', 'Trees', 'Dynamic Programming', 'Graph Algorithms', 'Linked Lists', 'Stack'];
  const skillGaps = [];

  for (const category of categories) {
    const totalProblems = await Problem.countDocuments({ category, isActive: true });
    const solvedProblems = await Submission.countDocuments({
      user: userId,
      status: 'Accepted'
    }).populate({
      path: 'problem',
      match: { category }
    });

    const progress = totalProblems > 0 ? (solvedProblems / totalProblems) * 100 : 0;
    
    let color = 'bg-green-500';
    if (progress < 30) color = 'bg-red-500';
    else if (progress < 70) color = 'bg-yellow-500';

    skillGaps.push({
      category,
      progress: Math.round(progress),
      color,
      totalProblems,
      solvedProblems
    });
  }

  return skillGaps;
}

async function getLearningPathProgress(user) {
  const learningSteps = [
    { step: 1, title: 'Master Arrays & Strings', requiredPoints: 100, requiredProblems: 10 },
    { step: 2, title: 'Learn Basic Data Structures', requiredPoints: 300, requiredProblems: 20 },
    { step: 3, title: 'Practice Tree Algorithms', requiredPoints: 600, requiredProblems: 35 },
    { step: 4, title: 'Introduction to Dynamic Programming', requiredPoints: 1000, requiredProblems: 50 },
    { step: 5, title: 'Advanced Graph Algorithms', requiredPoints: 2000, requiredProblems: 75 }
  ];

  return learningSteps.map(step => ({
    ...step,
    completed: user.stats.totalPoints >= step.requiredPoints && user.stats.problemsSolved >= step.requiredProblems,
    progress: Math.min(
      Math.round((user.stats.totalPoints / step.requiredPoints) * 100),
      Math.round((user.stats.problemsSolved / step.requiredProblems) * 100)
    )
  }));
}

module.exports = router;
