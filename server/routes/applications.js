const express = require('express');
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply for a job (candidates only)
router.post('/', auth, [
  body('job').notEmpty().withMessage('Job ID is required'),
  body('coverLetter').trim().notEmpty().withMessage('Cover letter is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can apply for jobs' });
    }

    const { job, coverLetter, expectedSalary, availability } = req.body;

    // Check if job exists and is active
    const jobExists = await Job.findById(job);
    if (!jobExists || jobExists.status !== 'active') {
      return res.status(404).json({ message: 'Job not found or not active' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job,
      applicant: req.user.userId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create application
    const application = new Application({
      job,
      applicant: req.user.userId,
      recruiter: jobExists.postedBy,
      coverLetter,
      expectedSalary,
      availability
    });

    await application.save();
    await application.populate([
      { path: 'job', select: 'title company' },
      { path: 'applicant', select: 'name email profile' },
      { path: 'recruiter', select: 'name email' }
    ]);

    res.status(201).json({ application });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get applications for a job (recruiters only)
router.get('/job/:jobId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Verify the job belongs to the recruiter
    const job = await Job.findById(req.params.jobId);
    if (!job || job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to view applications for this job' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email profile')
      .sort({ appliedAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get candidate's applications
router.get('/my-applications', auth, async (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const applications = await Application.find({ applicant: req.user.userId })
      .populate('job', 'title company location jobType')
      .sort({ appliedAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application status (recruiters only)
router.put('/:id/status', auth, [
  body('status').isIn(['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status } = req.body;

    const application = await Application.findById(req.params.id).populate('job');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify the job belongs to the recruiter
    if (application.job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    application.updatedAt = Date.now();
    await application.save();

    await application.populate([
      { path: 'applicant', select: 'name email profile' },
      { path: 'job', select: 'title company' }
    ]);

    res.json({ application });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all applications for recruiter's jobs
router.get('/recruiter/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all jobs posted by this recruiter
    const jobs = await Job.find({ postedBy: req.user.userId }).select('_id');
    const jobIds = jobs.map(job => job._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('job', 'title company location')
      .populate('applicant', 'name email profile')
      .sort({ appliedAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
