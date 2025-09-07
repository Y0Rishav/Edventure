const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  username: { type: String, unique: true },
  email: String,
  password: String, // Added for traditional login
  age: Number,
  class: Number, // 1-12
  subjects: [String],
  profilePicture: String,
  points: { type: Number, default: 0 },

  //for rewards section
  unlockedCourses: {
    type: [Number], // Defines an array of numbers
    default: [1]    // Course with ID 1 is unlocked by default
  },

  
  test: [String],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
