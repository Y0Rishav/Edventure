const express = require('express');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Temporary storage for generated questions (in-memory for now)
const generatedQuestions = new Map(); // gameId -> questions

// Generate questions using Gemini AI
async function generateQuestions(subject, difficulty, classLevel) {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
      throw new Error('GEMINI_API_KEY not configured properly. Please set your Gemini API key in the .env file.');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Generate 5 multiple choice questions for ${subject} at ${difficulty} difficulty level for class ${classLevel} students. 

Return the response in this exact JSON format:gemini-pro
{
  "questions": [
    {
      "id": "unique_id_1",
      "subject": "${subject}",
      "class": ${classLevel},
      "difficulty": "${difficulty}",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "points": 10,
      "timeLimit": 30
    }
  ]
}

Requirements:
- Generate exactly 5 questions
- Each question must have 4 options (A, B, C, D)
- correctAnswer should be the index (0-3) of the correct option
- Make questions educational and appropriate for the class level
- Ensure questions are challenging but solvable
- Use proper JSON formatting`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response to extract JSON
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\s*/, '').replace(/```\s*$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\s*/, '').replace(/```\s*$/, '');
    }

    const questionsData = JSON.parse(jsonText);
    return questionsData.questions;
  } catch (error) {
    console.error('Error generating questions with Gemini:', error);
    throw error;
  }
}

// Get battlegrounds questions (legacy - keeping for compatibility)
router.get('/battlegrounds-questions', (req, res) => {
  try {
    const filePath = path.join(__dirname, '../battlegrounds-questions.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(data);
    res.json(questions);
  } catch (error) {
    console.error('Error reading battlegrounds questions:', error);
    res.status(500).json({ error: 'Failed to load questions' });
  }
});

// Get filtered questions for battlegrounds (now generates with AI)
router.get('/battlegrounds-questions/filter', async (req, res) => {
  try {
    const { subject, difficulty, class: classLevel, gameId } = req.query;

    if (!subject || !difficulty || !classLevel) {
      return res.status(400).json({ error: 'Missing required parameters: subject, difficulty, class' });
    }

    console.log(`🎯 Generating questions for: ${subject}, ${difficulty}, Class ${classLevel}, Game: ${gameId || 'single-player'}`);

    // For multiplayer games, check if questions already exist
    if (gameId && generatedQuestions.has(gameId)) {
      const existingData = generatedQuestions.get(gameId);
      console.log(`📋 Returning existing questions for game ${gameId}`);
      return res.json({ questions: existingData.questions });
    }

    // Generate questions using Gemini AI
    const questions = await generateQuestions(subject, difficulty, parseInt(classLevel));

    // If this is for a multiplayer game, store the questions temporarily
    if (gameId) {
      generatedQuestions.set(gameId, {
        questions,
        createdAt: Date.now(),
        subject,
        difficulty,
        classLevel: parseInt(classLevel)
      });
      console.log(`💾 Stored ${questions.length} questions for game ${gameId}`);
    }

    res.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions. Please check your Gemini API key configuration.' });
  }
});

// Get stored questions for a specific game
router.get('/battlegrounds-questions/game/:gameId', (req, res) => {
  try {
    const { gameId } = req.params;
    const gameData = generatedQuestions.get(gameId);

    if (!gameData) {
      return res.status(404).json({ error: 'Game questions not found' });
    }

    res.json({ questions: gameData.questions });
  } catch (error) {
    console.error('Error retrieving game questions:', error);
    res.status(500).json({ error: 'Failed to retrieve questions' });
  }
});

// Save completed game questions for practice
router.post('/battlegrounds-questions/save-practice', (req, res) => {
  try {
    const { gameId, subject, difficulty, classLevel, questions } = req.body;

    if (!gameId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'Missing required parameters: gameId, questions' });
    }

    // Read existing practice questions
    let practiceData = { questions: [] };
    const practiceFilePath = path.join(__dirname, '../practice-questions.json');

    try {
      if (fs.existsSync(practiceFilePath)) {
        const data = fs.readFileSync(practiceFilePath, 'utf8');
        practiceData = JSON.parse(data);
      }
    } catch (readError) {
      console.log('Creating new practice questions file');
    }

    // Add new questions with metadata
    const questionsWithMetadata = questions.map(q => ({
      ...q,
      gameId,
      savedAt: new Date().toISOString(),
      subject: subject || 'Unknown',
      difficulty: difficulty || 'Unknown',
      classLevel: classLevel || 'Unknown'
    }));

    practiceData.questions.push(...questionsWithMetadata);

    // Save to file
    fs.writeFileSync(practiceFilePath, JSON.stringify(practiceData, null, 2));
    console.log(`� Saved ${questions.length} questions to practice file`);

    res.json({ success: true, message: 'Questions saved for practice' });
  } catch (error) {
    console.error('Error saving practice questions:', error);
    res.status(500).json({ error: 'Failed to save practice questions' });
  }
});

// Get practice questions
router.get('/battlegrounds-questions/practice', (req, res) => {
  try {
    const { subject, difficulty, class: classLevel, limit } = req.query;
    const practiceFilePath = path.join(__dirname, '../practice-questions.json');

    if (!fs.existsSync(practiceFilePath)) {
      return res.json({ questions: [] });
    }

    const data = fs.readFileSync(practiceFilePath, 'utf8');
    const practiceData = JSON.parse(data);

    let filteredQuestions = practiceData.questions;

    // Apply filters
    if (subject) {
      filteredQuestions = filteredQuestions.filter(q => q.subject === subject);
    }
    if (difficulty) {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
    }
    if (classLevel) {
      filteredQuestions = filteredQuestions.filter(q => q.class === parseInt(classLevel) || q.classLevel === parseInt(classLevel));
    }

    // Shuffle and limit
    const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
    const limitNum = limit ? parseInt(limit) : 10;
    const selectedQuestions = shuffled.slice(0, limitNum);

    console.log(`📚 Loaded ${selectedQuestions.length} practice questions`);
    res.json({ questions: selectedQuestions });
  } catch (error) {
    console.error('Error loading practice questions:', error);
    res.status(500).json({ error: 'Failed to load practice questions' });
  }
});

// Periodic cleanup of old questions (older than 1 hour)
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  for (const [gameId, gameData] of generatedQuestions.entries()) {
    if (now - gameData.createdAt > oneHour) {
      generatedQuestions.delete(gameId);
      console.log(`🧹 Auto-cleaned up expired questions for game ${gameId}`);
    }
  }
}, 10 * 60 * 1000); // Check every 10 minutes

module.exports = router;
