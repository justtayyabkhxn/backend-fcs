const express = require('express');
const { User } = require('./models');
const authMiddleware = require('./auth').authMiddleware;
const joi = require('joi');

const router = express.Router();

const profileSchema = joi.object({
  username: joi.string().alphanum().min(3).max(30).optional(),
  phone: joi.string().optional(),
  preferences: joi.object({
    language: joi.string().optional(),
    timezone: joi.string().optional(),
    notifications: joi.boolean().optional(),
    autoAnswer: joi.boolean().optional()
  }).optional()
});

// Get profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { error, value } = profileSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { ...value, updatedAt: new Date() },
      { new: true }
    ).select('-passwordHash');

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get preferences
router.get('/preferences', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({ preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update preferences
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { preferences: req.body, updatedAt: new Date() },
      { new: true }
    );

    res.json({ message: 'Preferences updated', preferences: user.preferences });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete account
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
