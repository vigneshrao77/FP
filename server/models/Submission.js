const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    maxlength: [10000, 'Code cannot exceed 10000 characters']
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp', 'c'],
    default: 'javascript'
  },
  status: {
    type: String,
    required: true,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Pending'],
    default: 'Pending'
  },
  runtime: {
    type: Number, // in milliseconds
    default: 0
  },
  memory: {
    type: Number, // in KB
    default: 0
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  },
  error: {
    type: String,
    default: null
  },
  executionTime: {
    type: Date,
    default: Date.now
  },
  points: {
    type: Number,
    default: 0
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for user submissions
submissionSchema.index({ user: 1, problem: 1 });
submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ problem: 1, status: 1 });

// Method to calculate points based on performance
submissionSchema.methods.calculatePoints = function() {
  const Problem = mongoose.model('Problem');
  const basePoints = this.points || 0;
  
  if (this.status === 'Accepted') {
    this.points = basePoints;
    this.isCorrect = true;
  } else {
    // Partial points for attempts
    this.points = Math.floor(basePoints * 0.1);
    this.isCorrect = false;
  }
};

// Update user stats after submission
submissionSchema.post('save', async function() {
  const User = mongoose.model('User');
  const Problem = mongoose.model('Problem');
  
  try {
    const user = await User.findById(this.user);
    const problem = await Problem.findById(this.problem);
    
    if (!user || !problem) return;
    
    // Update user stats
    if (this.status === 'Accepted' && this.isCorrect) {
      user.stats.totalPoints += this.points;
      user.stats.problemsSolved += 1;
      
      // Update accuracy
      const Submission = mongoose.model('Submission');
      const totalSubmissions = await Submission.countDocuments({ user: user._id });
      const correctSubmissions = await Submission.countDocuments({ user: user._id, status: 'Accepted' });
      user.stats.accuracy = totalSubmissions > 0 ? (correctSubmissions / totalSubmissions) * 100 : 0;
      
      // Update streak (simplified - would need date logic for real implementation)
      user.stats.currentStreak += 1;
      if (user.stats.currentStreak > user.stats.longestStreak) {
        user.stats.longestStreak = user.stats.currentStreak;
      }
    }
    
    user.updateLevel();
    await user.save();
    
    // Update problem acceptance rate
    await problem.updateAcceptanceRate();
    
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
});

module.exports = mongoose.model('Submission', submissionSchema);
