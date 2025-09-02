const express = require('express');
const Chapter = require('../models/Chapter');

const router = express.Router();

// Get chapter by id
router.get('/:id', async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    res.json(chapter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit quiz
router.post('/:id/quiz', async (req, res) => {
  const { answers } = req.body;
  try {
    const chapter = await Chapter.findById(req.params.id);
    let score = 0;
    chapter.quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });
    // TODO: Update user points and progress
    res.json({ score, total: chapter.quiz.questions.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
