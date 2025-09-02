const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

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

module.exports = router;
