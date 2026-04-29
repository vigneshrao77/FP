const express = require('express');
const { body, validationResult } = require('express-validator');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/submissions
// @desc    Submit a solution to a problem
// @access  Private
router.post('/', auth, [
  body('problem').isMongoId().withMessage('Invalid problem ID'),
  body('code').trim().isLength({ min: 1, max: 10000 }).withMessage('Code must be between 1 and 10000 characters'),
  body('language').isIn(['javascript', 'python', 'java', 'cpp', 'c']).withMessage('Invalid programming language')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { problem, code, language } = req.body;

    // Check if problem exists
    const problemDoc = await Problem.findById(problem);
    if (!problemDoc) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Check if user has already solved this problem (optional)
    const existingSubmission = await Submission.findOne({
      user: req.user.id,
      problem: problem,
      status: 'Accepted'
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already solved this problem' });
    }

    // Create submission
    const submission = new Submission({
      user: req.user.id,
      problem,
      code,
      language,
      points: problemDoc.points
    });

    // Simulate code execution (in production, this would be a real code runner)
    await simulateCodeExecution(submission, problemDoc);

    await submission.save();

    res.status(201).json({
      message: 'Solution submitted successfully',
      submission: {
        id: submission._id,
        status: submission.status,
        points: submission.points,
        runtime: submission.runtime,
        memory: submission.memory,
        testCasesPassed: submission.testCasesPassed,
        totalTestCases: submission.totalTestCases
      }
    });
  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/submissions
// @desc    Get user's submission history
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { problem, status } = req.query;

    // Build filter
    const filter = { user: req.user.id };
    if (problem) filter.problem = problem;
    if (status) filter.status = status;

    const submissions = await Submission.find(filter)
      .populate('problem', 'title difficulty category points')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Submission.countDocuments(filter);

    res.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/submissions/:id
// @desc    Get a single submission by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problem', 'title description examples constraints')
      .populate('user', 'name username');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user owns this submission
    if (submission.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this submission' });
    }

    res.json({ submission });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/submissions/problem/:problemId
// @desc    Get all submissions for a specific problem
// @access  Private
router.get('/problem/:problemId', auth, async (req, res) => {
  try {
    const { problemId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const submissions = await Submission.find({ problem: problemId })
      .populate('user', 'name username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Submission.countDocuments({ problem: problemId });

    res.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get problem submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Simulate code execution (mock implementation)
async function simulateCodeExecution(submission, problem) {
  // This is a mock implementation - in production, you would:
  // 1. Set up a secure sandbox environment
  // 2. Run the user's code against all test cases
  // 3. Measure runtime and memory usage
  // 4. Return appropriate status and metrics

  const testCases = problem.testCases;
  const totalTestCases = testCases.length;
  let testCasesPassed = 0;

  // Simulate running test cases
  for (const testCase of testCases) {
    // Mock execution - randomly pass/fail test cases
    const passed = Math.random() > 0.3; // 70% pass rate for demo
    if (passed) {
      testCasesPassed++;
    }
  }

  // Determine status based on test cases
  let status = 'Wrong Answer';
  let runtime = 0;
  let memory = 0;

  if (testCasesPassed === totalTestCases) {
    status = 'Accepted';
    runtime = Math.floor(Math.random() * 1000) + 100; // 100-1100ms
    memory = Math.floor(Math.random() * 50000) + 10000; // 10-60KB
  } else if (testCasesPassed > 0) {
    status = 'Wrong Answer';
    runtime = Math.floor(Math.random() * 1000) + 100;
    memory = Math.floor(Math.random() * 50000) + 10000;
  } else {
    // Random other errors
    const errors = ['Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compilation Error'];
    status = errors[Math.floor(Math.random() * errors.length)];
    runtime = Math.floor(Math.random() * 2000) + 1000;
    memory = Math.floor(Math.random() * 100000) + 50000;
  }

  submission.status = status;
  submission.runtime = runtime;
  submission.memory = memory;
  submission.testCasesPassed = testCasesPassed;
  submission.totalTestCases = totalTestCases;
  submission.calculatePoints();
}

module.exports = router;
