### Installation

1. Clone the repository
2. Install frontend dependencies: `cd frontend && npm install`
3. Install backend dependencies: `cd backend && npm install`
4. Set up environment variables in `backend/.env`
5. Start MongoDB
6. Run frontend: `cd frontend && npm run dev`
7. Run backend: `cd backend && npm start`

## Project Structure

- `frontend/`: React application
- `backend/`: Node.js server


## API Endpoints
1. Get videos for specific criteria
GET /api/videos?class=1&subject=Mathematics&chapter=Numbers 1-10

2. Get filter options
GET /api/videos/filters/options

3. Get specific video
GET /api/videos/math_class1_numbers

