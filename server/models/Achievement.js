const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Achievement title is required'],
    trim: true,
    maxlength: [50, 'Title cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Achievement description is required'],
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  icon: {
    type: String,
    required: true,
    enum: ['star', 'fire', 'trophy', 'target', 'calendar', 'crown', 'rocket', 'shield', 'zap', 'heart']
  },
  points: {
    type: Number,
    required: true,
    min: 5,
    max: 100,
    default: 25
  },
  category: {
    type: String,
    required: true,
    enum: ['Problems', 'Streak', 'Accuracy', 'Points', 'Special'],
    default: 'Problems'
  },
  condition: {
    type: {
      type: String,
      required: true,
      enum: ['problems_solved', 'streak_days', 'accuracy_rate', 'total_points', 'special']
    },
    value: {
      type: Number,
      required: true,
      min: 1
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Method to check if user has earned this achievement
achievementSchema.methods.checkEligibility = async function(user) {
  const User = mongoose.model('User');
  const Submission = mongoose.model('Submission');
  
  switch(this.condition.type) {
    case 'problems_solved':
      return user.stats.problemsSolved >= this.condition.value;
    
    case 'streak_days':
      return user.stats.currentStreak >= this.condition.value;
    
    case 'accuracy_rate':
      return user.stats.accuracy >= this.condition.value;
    
    case 'total_points':
      return user.stats.totalPoints >= this.condition.value;
    
    case 'special':
      // Special conditions would be handled separately
      return false;
    
    default:
      return false;
  }
};

// Static method to get achievements for user
achievementSchema.statics.getUserAchievements = async function(userId) {
  const User = mongoose.model('User');
  const user = await User.findById(userId).populate('achievements');
  return user.achievements;
};

// Static method to check and award new achievements
achievementSchema.statics.checkAndAwardAchievements = async function(userId) {
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  
  if (!user) return [];
  
  const allAchievements = await this.find({ isActive: true });
  const userAchievementIds = user.achievements.map(a => a.toString());
  const unearnedAchievements = allAchievements.filter(a => !userAchievementIds.includes(a._id.toString()));
  
  const newAchievements = [];
  
  for (const achievement of unearnedAchievements) {
    if (await achievement.checkEligibility(user)) {
      user.achievements.push(achievement._id);
      user.stats.totalPoints += achievement.points;
      newAchievements.push(achievement);
    }
  }
  
  if (newAchievements.length > 0) {
    await user.save();
  }
  
  return newAchievements;
};

module.exports = mongoose.model('Achievement', achievementSchema);
