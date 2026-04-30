# Smart Evaluation Platform

A full-stack web application for coding challenges, evaluation, and competitive programming with leaderboard functionality.

## Features

- **Home/Dashboard**: User overview with statistics and recent activity
- **Problems**: Browse and solve coding challenges with difficulty levels
- **Leaderboard**: Real-time rankings and performance tracking
- **Profile**: User profile with progress, achievements, and statistics
- **Recommendations**: Personalized problem suggestions based on performance

## Tech Stack

### Frontend
- React 18
- React Router
- Tailwind CSS
- Axios
- Recharts (for analytics)

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Socket.io (real-time features)

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/vigneshrao77/FP.git
cd FP
```

2. **Install all dependencies** (This installs both client and server packages)
```bash
npm run install-all
```

3. **Set up environment variables**
You will need to create two `.env` files (one in the `server` folder and one in the `client` folder).

**Create `server/.env`:**
```env
# MongoDB Connection String (Local or Atlas)
MONGODB_URI=your_mongodb_connection_string

# JWT Secret for Authentication
JWT_SECRET=your_super_secret_jwt_key

# Port for Backend Server
PORT=5000

# OpenRouter API Key for the AI DSA Mentor
# Get your free key at: https://openrouter.ai/
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

**Create `client/.env`:**
```env
REACT_APP_API_URL=http://localhost:5000
```

4. **Start the development servers**
Run this command from the root directory to start both the frontend and backend concurrently:
```bash
npm run dev
```

### Accessing the Application
- **Frontend (UI)**: [http://localhost:3000](http://localhost:3000)
- **Backend (API)**: [http://localhost:5000](http://localhost:5000)

> **Note on AI Features**: To use the AI DSA Mentor on the Recommendations page, you **must** provide a valid `OPENROUTER_API_KEY` in your `server/.env` file. Without it, the AI Chat feature will fail to respond.

## Project Structure

```
smart-evaluation-platform/
client/                 # React frontend
  public/
  src/
    components/         # Reusable components
    pages/             # Page components
    hooks/             # Custom hooks
    utils/             # Utility functions
    styles/            # CSS and Tailwind
server/                # Node.js backend
  controllers/         # Route controllers
  models/             # Database models
  routes/             # API routes
  middleware/         # Custom middleware
  utils/              # Server utilities
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/problems` - Get all problems
- `POST /api/submissions` - Submit solution
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/profile/:id` - Get user profile
- `GET /api/recommendations` - Get recommendations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
