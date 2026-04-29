const express = require('express');
const { body, validationResult } = require('express-validator');
const Problem = require('../models/Problem');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/problems
// @desc    Get all problems with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { difficulty, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter
    const filter = { isActive: true };
    
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const problems = await Problem.find(filter)
      .populate('createdBy', 'name username')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Problem.countDocuments(filter);
    
    res.json({
      problems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/problems/:id
// @desc    Get a single problem by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate('createdBy', 'name username')
      .select('-solution'); // Don't return solution in public view
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    res.json({ problem });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/problems
// @desc    Create a new problem
// @access  Private (would be admin only in production)
router.post('/', auth, [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty'),
  body('category').isIn(['Arrays', 'Strings', 'Trees', 'Linked Lists', 'Stack', 'Queue', 'Dynamic Programming', 'Graph', 'Recursion', 'Sorting', 'Searching', 'Hash Table', 'Greedy', 'Backtracking', 'Math']).withMessage('Invalid category'),
  body('examples').isArray({ min: 1 }).withMessage('At least one example is required'),
  body('constraints').optional().isArray(),
  body('testCases').isArray({ min: 1 }).withMessage('At least one test case is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const problemData = {
      ...req.body,
      createdBy: req.user.id
    };

    const problem = new Problem(problemData);
    await problem.save();

    res.status(201).json({
      message: 'Problem created successfully',
      problem
    });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/problems/:id
// @desc    Update a problem
// @access  Private (would be admin only in production)
router.put('/:id', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // Check if user is the creator (in production, check for admin role)
    if (problem.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this problem' });
    }
    
    const updatedProblem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      message: 'Problem updated successfully',
      problem: updatedProblem
    });
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/problems/:id
// @desc    Delete a problem
// @access  Private (would be admin only in production)
router.delete('/:id', auth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // Check if user is the creator (in production, check for admin role)
    if (problem.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this problem' });
    }
    
    await Problem.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/problems/categories
// @desc    Get all problem categories
// @access  Public
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Problem.distinct('category');
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/problems/difficulties
// @desc    Get all difficulty levels
// @access  Public
router.get('/meta/difficulties', async (req, res) => {
  try {
    const difficulties = await Problem.distinct('difficulty');
    res.json({ difficulties });
  } catch (error) {
    console.error('Get difficulties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
