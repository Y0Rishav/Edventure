## Problem  
Traditional learning methods are often **boring and passive**, leading to:  
- Lack of motivation  
- Reduced retention ability  
- No personalized or customizable study environment  

## Solution – Edventure  
**Edventure** is a **gamified learning platform** that makes study sessions engaging and adaptive using AI and personalized learning technology.  

## PPT:

[​Edventure Project Presentation (PPT)](https://drive.google.com/file/d/1UmR15_VO9X-lXP6B_ktKOH0OprpsT8-y/view?usp=sharing)

 

## API Endpoints

### Authentication (`/auth`)
- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/logout` - Logout user (GET for browser redirects)
- `POST /auth/logout` - Logout user (POST for AJAX requests)
- `GET /auth/current_user` - Get current authenticated user
- `POST /auth/update_profile` - Update user profile
- `POST /auth/update_points` - Update user points and badges
- `GET /auth/leaderboard` - Get leaderboard data
- `POST /auth/login` - Login user
- `POST /auth/unlock-course` - Unlock course with points
- `POST /auth/update-avatar` - Update user avatar

### Chatbot (`/chatbot`)
- `POST /chatbot/` - Send message to AI tutor chatbot

### Friends (`/friends`)
- `GET /friends/search` - Search users by username or name
- `GET /friends/` - Get user's friends list
- `POST /friends/add/:friendId` - Add friend
- `DELETE /friends/remove/:friendId` - Remove friend

## Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
PORT=5000
NODE_ENV=development
FORCE_HTTPS=true
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_KEY_CHATBOT=your_gemini_chatbot_api_key
DEEPSEEK_API_KEY_CHATBOT=your_deepseek_api_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_GEMINI_API_KEY=your_vite_gemini_api_key
VITE_BACKEND_URL=http://localhost:5000
```

## How to Run Locally

1. **Clone and Setup:**
   ```bash
   git clone https://github.com/Y0Rishav/Edventure.git
   cd Edventure
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Copy .env and fill in your values
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   # Copy .env and fill in your values
   npm run dev
   ```

4. **Access the Application:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## Features

- **Gamified Learning:** Earn points, unlock badges, Courses and compete on leaderboards
- **Battlegrounds:** Multiplayer quiz battles with AI-generated questions
- **Practice Mode:** Solo practice
- **AI Chatbot:** Personal AI tutor for academic help
- **Friends System:** Connect with other learners
- **Profile Management:** Customize avatar, track progress

## Technologies Used

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** Google OAuth, JWT
- **AI Integration:** Google Gemini, DeepSeek
- **Real-time:** Socket.io
- **Deployment:** Vercel (frontend), Render (backend)

## Team Members

| GitHub ID                                    | Role        |
|----------------------------------------------|-------------|
| [Krypton019](https://github.com/Krypton019)  | Team Leader |
| [Y0Rishav](https://github.com/Y0Rishav)      | Member      |
| [Swayamz-123](https://github.com/Swayamz-123)| Member      |
| [WhiteDemon890](https://github.com/WhiteDemon890) | Member  |
| [ShubhamPandey121](https://github.com/ShubhamPandey121) | Member |
