const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Get videos based on filters
router.get('/videos', (req, res) => {
  try {
    const { class: cls, subject, chapter, difficulty_level } = req.query;

    // Read the videos JSON file
    const videosPath = path.join(__dirname, '../videos.json');
    const videosData = JSON.parse(fs.readFileSync(videosPath, 'utf8'));

    let filteredVideos = videosData.videos;

    // Apply filters
    if (cls) {
      filteredVideos = filteredVideos.filter(video => video.class === parseInt(cls));
    }

    if (subject) {
      filteredVideos = filteredVideos.filter(video => video.subject.toLowerCase() === subject.toLowerCase());
    }

    if (chapter) {
      filteredVideos = filteredVideos.filter(video => video.chapter.toLowerCase().includes(chapter.toLowerCase()));
    }

    if (difficulty_level) {
      filteredVideos = filteredVideos.filter(video => video.difficulty_level === difficulty_level);
    }

    res.json(filteredVideos);
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get video by unique ID
router.get('/videos/:unique_id', (req, res) => {
  try {
    const { unique_id } = req.params;

    // Read the videos JSON file
    const videosPath = path.join(__dirname, '../videos.json');
    const videosData = JSON.parse(fs.readFileSync(videosPath, 'utf8'));

    const video = videosData.videos.find(v => v.unique_id === unique_id);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(video);
  } catch (err) {
    console.error('Error fetching video:', err);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Get available filter options
router.get('/videos/filters/options', (req, res) => {
  try {
    const videosPath = path.join(__dirname, '../videos.json');
    const videosData = JSON.parse(fs.readFileSync(videosPath, 'utf8'));

    const options = {
      classes: [...new Set(videosData.videos.map(v => v.class))].sort((a, b) => a - b),
      subjects: [...new Set(videosData.videos.map(v => v.subject))],
      chapters: [...new Set(videosData.videos.map(v => v.chapter))],
      difficulty_levels: [...new Set(videosData.videos.map(v => v.difficulty_level))]
    };

    res.json(options);
  } catch (err) {
    console.error('Error fetching filter options:', err);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
});

module.exports = router;
