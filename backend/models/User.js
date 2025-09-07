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
    default:'https://th.bing.com/th?id=ORMS.ed048131bfcbae2933327f4318b54a71&pid=Wdp&w=268&h=140&qlt=90&c=1&rs=1&dpr=1&p=0'
  },


  test: [String],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
