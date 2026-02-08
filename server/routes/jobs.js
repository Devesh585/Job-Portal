const express = require('express');
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const Application = require('../models/Application');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a new job (recruiters only)
router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('description').trim().notEmpty().withMessage('Job description is required'),
  body('requirements').isArray({ min: 1 }).withMessage('At least one requirement is required'),
  body('responsibilities').isArray({ min: 1 }).withMessage('At least one responsibility is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('jobType').isIn(['full-time', 'part-time', 'contract', 'internship', 'remote']).withMessage('Valid job type is required'),
  body('experienceLevel').isIn(['entry-level', 'mid-level', 'senior-level', 'executive']).withMessage('Valid experience level is required'),
  body('skills').isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('company.name').trim().notEmpty().withMessage('Company name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Only recruiters can post jobs' });
    }

    const jobData = {
      ...req.body,
      postedBy: req.user.userId
    };

    const job = new Job(jobData);
    await job.save();

    res.status(201).json({ job });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all jobs with filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      jobType,
      experienceLevel,
      location,
      skills,
      search
    } = req.query;

    // Build filter
    const filter = { status: 'active' };
    
    if (jobType) filter.jobType = jobType;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (location) filter.location = new RegExp(location, 'i');
    if (skills) {
      const skillArray = skills.split(',').map(skill => skill.trim());
      filter.skills = { $in: skillArray };
    }
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'company.name': new RegExp(search, 'i') }
      ];
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(filter);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email profile.company profile.phone');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update job (recruiter who posted it only)
router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email');

    res.json({ job: updatedJob });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete job (recruiter who posted it only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    
    // Also delete all applications for this job
    await Application.deleteMany({ job: req.params.id });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get jobs posted by current recruiter
router.get('/my-jobs/posted', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const jobs = await Job.find({ postedBy: req.user.userId })
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
