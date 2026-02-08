const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Update user profile
router.put('/profile', auth, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('location').optional().trim(),
  body('bio').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, location, bio, ...profileData } = req.body;
    
    // Build update object
    const updateData = { updatedAt: Date.now() };
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (profileData) {
      updateData.profile = { ...updateData.profile, ...profileData };
    }
    
    // Add common profile fields
    if (phone !== undefined) updateData.profile = { ...updateData.profile, phone };
    if (location !== undefined) updateData.profile = { ...updateData.profile, location };
    if (bio !== undefined) updateData.profile = { ...updateData.profile, bio };

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (for recruiters to view candidates)
router.get('/candidates', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const candidates = await User.find({ role: 'candidate' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ candidates });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
