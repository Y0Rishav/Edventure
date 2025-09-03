const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  title: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  description: String,
  order: Number,
  quiz: {
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number
    }]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chapter', chapterSchema);
