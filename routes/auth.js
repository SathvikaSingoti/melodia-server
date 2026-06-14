const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Account already exists. Login instead?' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email: email.toLowerCase(),
      passwordHash,
    });

    await newUser.save();

    const token = generateToken(newUser._id);
    
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        onboardingCompleted: newUser.onboardingCompleted,
        avatarUrl: newUser.avatarUrl,
        favoriteGenres: newUser.favoriteGenres,
        favoriteArtists: newUser.favoriteArtists,
        createdAt: newUser.createdAt,
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup: ' + (error.message || error.toString()) });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found. Sign up instead?' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ message: 'Please login with Google' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted,
        avatarUrl: user.avatarUrl,
        favoriteGenres: user.favoriteGenres,
        favoriteArtists: user.favoriteArtists,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login: ' + (error.message || error.toString()) });
  }
});

// GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GET /api/auth/google/callback
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login?error=auth_failed' }), (req, res) => {
  const token = generateToken(req.user._id);
  const clientUrl = process.env.CLIENT_URL || 'https://melodia-client.vercel.app';
  res.redirect(`${clientUrl}/auth/callback?token=${token}`);
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash -password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Always return both id and _id so client AuthContext can normalize properly
    res.json({
      ...user.toObject(),
      id: user._id.toString(),
      _id: user._id.toString(),
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
