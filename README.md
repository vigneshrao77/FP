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

### Installation

1. Clone and extract the project
2. Install dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
```bash
# In server/.env
MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
PORT=5000

# In client/.env
REACT_APP_API_URL=http://localhost:5000
```

4. Start the development servers:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

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
