const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: String,
  subject: String,
  class: Number, // 1-12
  description: String,
  chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);
