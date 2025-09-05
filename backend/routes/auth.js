const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Passport config
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      return done(null, user);
    }
    user = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      profilePicture: profile.photos[0].value
    });
    await user.save();
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('http://localhost:5173/dashboard');
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/current_user', (req, res) => {
  res.send(req.user);
});

router.post('/update_profile', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { username, age, class: cls, subjects } = req.body;
  console.log('Updating profile for user:', req.user._id, 'data:', { username, age, cls, subjects });
  try {
    await User.findByIdAndUpdate(req.user._id, { username, age, class: cls, subjects });
    res.send('Profile updated');
  } catch (err) {
    console.log('Error updating profile:', err.message);
    res.status(400).send(err.message);
  }
});

router.post('/add_note', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { videoId, timestamp, content } = req.body;
  try {
    const user = await User.findById(req.user._id);
    user.notes.push({ videoId, timestamp: timestamp || Date.now(), content });
    await user.save();
    res.send('Note added');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/update_points', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { points, badge } = req.body;
  try {
    const update = { $inc: { points } };
    if (badge) update.$addToSet = { badges: badge };
    await User.findByIdAndUpdate(req.user._id, update);
    res.send('Updated');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({}).sort({ points: -1 }).limit(10).select('name username points badges');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/update_progress', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  const { subject, chapter, completed } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const existingProgress = user.progress.find(p => p.subject === subject && p.chapter === chapter);
    if (existingProgress) {
      existingProgress.completed = completed;
    } else {
      user.progress.push({ subject, chapter, completed });
    }
    await user.save();
    res.send('Progress updated');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  const { name, username, email, password, age, class: cls, subjects } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
      age,
      class: cls,
      subjects
    });
    await user.save();
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'User registered successfully', user });
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Login successful', user });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
