const express = require('express');
const jwt = require('jwt-simple');
const { User } = require('./models');
const joi = require('joi');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Validation schemas
const registerSchema = joi.object({
  username: joi.string().alphanum().min(3).max(30).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  phone: joi.string().optional()
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required()
});

// Register
router.post('/register', async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const existingUser = await User.findOne({ $or: [{ email: value.email }, { username: value.username }] });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const user = new User({
      username: value.username,
      email: value.email,
      phone: value.phone,
      passwordHash: value.password
    });
    await user.save();

    const token = jwt.encode({ userId: user._id, email: user.email }, SECRET);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const user = await User.findOne({ email: value.email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(value.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.encode({ userId: user._id, email: user.email }, SECRET);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify token middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.decode(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Export both router and middleware for different use cases
module.exports = router;
module.exports.authMiddleware = authMiddleware;
module.exports.SECRET = SECRET;
