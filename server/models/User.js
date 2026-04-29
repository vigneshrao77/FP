const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  avatar: {
    type: String,
    default: function() {
      return this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
  },
  stats: {
    totalPoints: { type: Number, default: 0 },
    problemsSolved: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    level: { type: String, default: 'Beginner' }
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  achievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  }],
  leetcodeUsername: {
    type: String,
    default: null,
    trim: true
  },
  leetcodeStats: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    acceptance: { type: Number, default: 0 },
    ranking: { type: Number, default: 0 },
    avatar: { type: String, default: null },
    realName: { type: String, default: null },
    lastSynced: { type: Date, default: null }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update rank method
userSchema.methods.updateRank = async function() {
  const users = await this.constructor.find().sort({ 'stats.totalPoints': -1 });
  const rank = users.findIndex(user => user._id.toString() === this._id.toString()) + 1;
  this.stats.rank = rank;
  await this.save();
  return rank;
};

// Update level based on points
userSchema.methods.updateLevel = function() {
  const points = this.stats.totalPoints;
  let level = 'Beginner';
  
  if (points >= 5000) level = 'Elite';
  else if (points >= 3000) level = 'Advanced';
  else if (points >= 1500) level = 'Intermediate';
  else if (points >= 500) level = 'Junior';
  
  this.stats.level = level;
};

module.exports = mongoose.model('User', userSchema);
