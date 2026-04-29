const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/leaderboard
// @desc    Get leaderboard with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const { timeFilter = 'allTime', category = 'all' } = req.query;

    // Build aggregation pipeline based on time filter
    let matchStage = {};
    
    if (timeFilter !== 'allTime') {
      const now = new Date();
      let startDate;
      
      switch (timeFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'thisWeek':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      matchStage = { lastActive: { $gte: startDate } };
    }

    const users = await User.aggregate([
      { $match: matchStage },
      {
        $project: {
          name: 1,
          username: 1,
          avatar: 1,
          'stats.totalPoints': 1,
          'stats.problemsSolved': 1,
          'stats.currentStreak': 1,
          'stats.longestStreak': 1,
          'stats.accuracy': 1,
          'stats.rank': 1,
          joinDate: 1,
          lastActive: 1,
          // Calculate rank dynamically
          rankPosition: {
            $function: {
              body: function(points) {
                // This is a simplified rank calculation
                // In production, you'd use a more sophisticated method
                return Math.floor(points / 100) + 1;
              },
              args: ['$stats.totalPoints'],
              lang: 'js'
            }
          }
        }
      },
      { $sort: { 'stats.totalPoints': -1, 'stats.problemsSolved': -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $addFields: {
          rank: { $add: ['$skip', skip + 1] } // Add 1-based ranking
        }
      }
    ]);

    // Get total count for pagination
    const total = await User.countDocuments(matchStage);

    // Find current user's rank if authenticated
    let currentUserRank = null;
    if (req.query.userId) {
      const currentUser = await User.findById(req.query.userId);
      if (currentUser) {
        currentUserRank = await currentUser.updateRank();
      }
    }

    res.json({
      leaderboard: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      currentUserRank
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leaderboard/top
// @desc    Get top N users on leaderboard
// @access  Public
router.get('/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topUsers = await User.find()
      .select('name username avatar stats joinDate')
      .sort({ 'stats.totalPoints': -1, 'stats.problemsSolved': -1 })
      .limit(limit);

    // Add rank positions
    const leaderboard = topUsers.map((user, index) => ({
      ...user.toObject(),
      rank: index + 1
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get top leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leaderboard/user/:userId
// @desc    Get user's position and nearby users
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's rank
    const userRank = await user.updateRank();

    // Get nearby users (users above and below)
    const nearbyUsers = await User.find({
      'stats.totalPoints': {
        $gte: user.stats.totalPoints - 100,
        $lte: user.stats.totalPoints + 100
      },
      _id: { $ne: userId }
    })
    .select('name username avatar stats')
    .sort({ 'stats.totalPoints': -1, 'stats.problemsSolved': -1 })
    .limit(limit * 2);

    // Add rank positions to nearby users
    const nearbyWithRank = nearbyUsers.map((nearbyUser, index) => ({
      ...nearbyUser.toObject(),
      rank: userRank - Math.floor(limit / 2) + index + 1
    }));

    // Insert current user in the middle
    const startIndex = Math.floor(nearbyWithRank.length / 2);
    nearbyWithRank.splice(startIndex, 0, {
      ...user.toObject(),
      rank: userRank,
      isCurrentUser: true
    });

    res.json({
      user: {
        ...user.toObject(),
        rank: userRank
      },
      nearbyUsers: nearbyWithRank
    });
  } catch (error) {
    console.error('Get user leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leaderboard/stats
// @desc    Get leaderboard statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalPoints: { $sum: '$stats.totalPoints' },
          averagePoints: { $avg: '$stats.totalPoints' },
          maxPoints: { $max: '$stats.totalPoints' },
          totalProblemsSolved: { $sum: '$stats.problemsSolved' },
          averageAccuracy: { $avg: '$stats.accuracy' },
          activeUsers: {
            $sum: {
              $cond: [
                { $gte: ['$lastActive', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const leaderboardStats = stats[0] || {
      totalUsers: 0,
      totalPoints: 0,
      averagePoints: 0,
      maxPoints: 0,
      totalProblemsSolved: 0,
      averageAccuracy: 0,
      activeUsers: 0
    };

    res.json({ stats: leaderboardStats });
  } catch (error) {
    console.error('Get leaderboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
