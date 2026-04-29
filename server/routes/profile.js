const express = require('express');
const User = require('../models/User');
const Submission = require('../models/Submission');
const Achievement = require('../models/Achievement');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/profile/:userId
// @desc    Get user profile by ID
// @access  Public (with optional private info for owner)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const isOwner = req.user && req.user.id === userId;

    const user = await User.findById(userId)
      .populate('achievements', 'title description icon points')
      .select(isOwner ? '' : '-email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get submission statistics
    const submissionStats = await Submission.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          acceptedSubmissions: {
            $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] }
          },
          averageRuntime: { $avg: '$runtime' },
          averageMemory: { $avg: '$memory' }
        }
      }
    ]);

    // Get recent submissions
    const recentSubmissions = await Submission.find({ user: user._id })
      .populate('problem', 'title difficulty category points')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get monthly progress data
    const monthlyProgress = await getMonthlyProgress(user._id);

    // Get category progress
    const categoryProgress = await getCategoryProgress(user._id);

    const profile = {
      ...user.toObject(),
      submissionStats: submissionStats[0] || {
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        averageRuntime: 0,
        averageMemory: 0
      },
      recentSubmissions,
      monthlyProgress,
      categoryProgress
    };

    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/profile/:userId
// @desc    Update user profile
// @access  Private (owner only)
router.put('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allowedUpdates = ['name', 'username', 'avatar'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Check username uniqueness if being updated
    if (updates.username) {
      const existingUser = await User.findOne({
        username: updates.username,
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    Object.assign(user, updates);
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/profile/:userId/achievements
// @desc    Get user achievements
// @access  Public
router.get('/:userId/achievements', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate('achievements');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all achievements and mark which ones are earned
    const allAchievements = await Achievement.find({ isActive: true });
    const userAchievementIds = user.achievements.map(a => a._id.toString());

    const achievementsWithStatus = allAchievements.map(achievement => ({
      ...achievement.toObject(),
      earned: userAchievementIds.includes(achievement._id.toString()),
      earnedDate: user.achievements.find(a => a._id.toString() === achievement._id.toString())?.createdAt
    }));

    res.json({ achievements: achievementsWithStatus });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/profile/:userId/stats
// @desc    Get detailed user statistics
// @access  Private (owner only)
router.get('/:userId/stats', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Not authorized to view these stats' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get detailed statistics
    const stats = await Promise.all([
      getSubmissionStats(userId),
      getDifficultyStats(userId),
      getCategoryStats(userId),
      getTimeStats(userId),
      getStreakStats(userId)
    ]);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        stats: user.stats
      },
      detailedStats: {
        submissions: stats[0],
        difficulty: stats[1],
        category: stats[2],
        time: stats[3],
        streak: stats[4]
      }
    });
  } catch (error) {
    console.error('Get detailed stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions
async function getMonthlyProgress(userId) {
  const submissions = await Submission.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        status: 'Accepted'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        problems: { $sum: 1 },
        points: { $sum: '$points' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 }
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return submissions.map(sub => ({
    month: monthNames[sub._id.month - 1],
    problems: sub.problems,
    points: sub.points
  }));
}

async function getCategoryProgress(userId) {
  const categories = await Submission.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        status: 'Accepted'
      }
    },
    {
      $lookup: {
        from: 'problems',
        localField: 'problem',
        foreignField: '_id',
        as: 'problemInfo'
      }
    },
    { $unwind: '$problemInfo' },
    {
      $group: {
        _id: '$problemInfo.category',
        solved: { $sum: 1 },
        total: { $sum: 1 }
      }
    },
    { $sort: { solved: -1 } }
  ]);

  return categories;
}

async function getSubmissionStats(userId) {
  return await Submission.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
}

async function getDifficultyStats(userId) {
  return await Submission.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        status: 'Accepted'
      }
    },
    {
      $lookup: {
        from: 'problems',
        localField: 'problem',
        foreignField: '_id',
        as: 'problemInfo'
      }
    },
    { $unwind: '$problemInfo' },
    {
      $group: {
        _id: '$problemInfo.difficulty',
        count: { $sum: 1 }
      }
    }
  ]);
}

async function getCategoryStats(userId) {
  return await Submission.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        status: 'Accepted'
      }
    },
    {
      $lookup: {
        from: 'problems',
        localField: 'problem',
        foreignField: '_id',
        as: 'problemInfo'
      }
    },
    { $unwind: '$problemInfo' },
    {
      $group: {
        _id: '$problemInfo.category',
        count: { $sum: 1 }
      }
    }
  ]);
}

async function getTimeStats(userId) {
  return await Submission.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        avgRuntime: { $avg: '$runtime' },
        avgMemory: { $avg: '$memory' },
        fastestSubmission: { $min: '$runtime' },
        slowestSubmission: { $max: '$runtime' }
      }
    }
  ]);
}

async function getStreakStats(userId) {
  const user = await User.findById(userId);
  return {
    current: user.stats.currentStreak,
    longest: user.stats.longestStreak,
    lastActive: user.lastActive
  };
}

module.exports = router;
