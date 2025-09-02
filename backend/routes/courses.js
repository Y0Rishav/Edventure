const express = require('express');
const Course = require('../models/Course');

const router = express.Router();

// Get courses by subject and class
router.get('/', async (req, res) => {
  const { subject, class: cls } = req.query;
  try {
    const courses = await Course.find({ subject, class: cls }).populate('chapters');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get course by id
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('chapters');
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
