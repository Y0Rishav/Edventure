const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { createServer } = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const battlegroundsRoutes = require('./routes/battlegrounds');
const friendsRoutes = require('./routes/friends');
const chatbotRoutes = require('./routes/chatbot');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');

// Import AI question generation function
const { generateQuestions } = require('./routes/battlegrounds');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000' // in case frontend runs on different port
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Routes
app.use('/auth', authRoutes);
app.use('/api', battlegroundsRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.get('/', (req, res) => {
  res.send('Gamified Learning Platform API');
});

// Register game room handlers (moved to separate module)
const registerGameHandlers = require('./gameRooms');
registerGameHandlers(io, generateQuestions, User);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
