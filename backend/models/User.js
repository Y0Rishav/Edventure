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

  //for avatar customization
  avatar:{
    type:String,
    default:'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="%23e0e0e0"/><circle cx="32" cy="24" r="14" fill="%23bdbdbd"/><ellipse cx="32" cy="48" rx="20" ry="12" fill="%23bdbdbd"/></svg>'
  },

  test: [String],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
