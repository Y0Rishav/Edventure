const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  username: { type: String, unique: true },
  email: String,
  age: Number,
  class: Number, // 1-12
  subjects: [String],
  profilePicture: String,
  points: { type: Number, default: 0 },
  badges: [String],
  notes: [{ videoId: String, timestamp: Number, content: String }],
  progress: [{ subject: String, chapter: String, completed: Boolean }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
