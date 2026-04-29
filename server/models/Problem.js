const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Problem description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy'
  },
  category: {
    type: String,
    required: true,
    enum: ['Arrays', 'Strings', 'Trees', 'Linked Lists', 'Stack', 'Queue', 'Dynamic Programming', 'Graph', 'Recursion', 'Sorting', 'Searching', 'Hash Table', 'Greedy', 'Backtracking', 'Math'],
    default: 'Arrays'
  },
  tags: [{
    type: String,
    trim: true
  }],
  timeComplexity: {
    type: String,
    enum: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)', 'O(n^3)', 'O(2^n)', 'O(n!)'],
    default: 'O(n)'
  },
  spaceComplexity: {
    type: String,
    enum: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)', 'O(n^3)', 'O(2^n)', 'O(n!)'],
    default: 'O(1)'
  },
  acceptance: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  submissions: {
    type: Number,
    default: 0,
    min: 0
  },
  points: {
    type: Number,
    required: true,
    min: 5,
    max: 100,
    default: function() {
      switch(this.difficulty) {
        case 'Easy': return 10;
        case 'Medium': return 25;
        case 'Hard': return 50;
        default: return 10;
      }
    }
  },
  estimatedTime: {
    type: String,
    default: function() {
      switch(this.difficulty) {
        case 'Easy': return '15 min';
        case 'Medium': return '30 min';
        case 'Hard': return '45 min';
        default: return '15 min';
      }
    }
  },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  constraints: [{
    type: String
  }],
  testCases: [{
    input: String,
    output: String,
    isHidden: { type: Boolean, default: true }
  }],
  solution: {
    approach: String,
    code: String,
    explanation: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for searching
problemSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Method to update acceptance rate
problemSchema.methods.updateAcceptanceRate = async function() {
  const Submission = mongoose.model('Submission');
  const totalSubmissions = await Submission.countDocuments({ problem: this._id });
  const correctSubmissions = await Submission.countDocuments({ problem: this._id, status: 'Accepted' });
  
  this.submissions = totalSubmissions;
  this.acceptance = totalSubmissions > 0 ? (correctSubmissions / totalSubmissions) * 100 : 0;
  await this.save();
};

module.exports = mongoose.model('Problem', problemSchema);
