# SafePath AI - AI Powered Safety Assistance

SafePath AI is a comprehensive safety assistance platform that combines artificial intelligence, real-time location tracking, and community features to help users navigate safely and respond to emergencies.

## Features

- **AI-Powered Chatbot**: Get safety advice and location recommendations
- **Emergency SOS**: One-tap emergency alerts to trusted contacts
- **Location Tracking**: Real-time geolocation with safe route suggestions
- **Community Discussions**: Share safety tips and experiences
- **Q&A Platform**: Ask and answer safety-related questions
- **Emergency Contacts**: Quick access to favorite contacts
- **Dark Mode**: Eye-friendly theme switching

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Mapbox API (location services)
- GROQ API (AI chatbot)

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Router (routing)
- Axios (HTTP client)
- Mapbox GL JS (maps)

## Installation

### Prerequisites
- Node.js 18 or higher
- MongoDB (local or Atlas)
- Mapbox API token
- GROQ API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/safepath
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
FRONTEND_URL=http://localhost:5173
MAPBOX_TOKEN=your_mapbox_token_here
GROQ_API_KEY=your_groq_api_key_here
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

5. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. Sign up for a new account at `/signup`
2. Enable location permissions when prompted
3. Explore features:
   - Dashboard: Overview of your activity
   - Emergency: Quick SOS button and emergency contacts
   - Community: Participate in discussions
   - Favorites: Manage emergency contacts
   - Chat: Talk to the AI assistant (bottom-right corner)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### User
- `GET /api/users/me` - Get current user
- `PUT /api/users/location` - Update location

### Places
- `GET /api/places/nearby` - Get nearby safe places

### AI Chatbot
- `POST /api/ai/chat` - Chat with AI assistant

### SOS
- `POST /api/sos` - Create SOS alert
- `GET /api/sos` - Get SOS history
- `PUT /api/sos/:id` - Update SOS status

### Favorites
- `GET /api/favorites` - List emergency contacts
- `POST /api/favorites` - Add contact
- `PUT /api/favorites/:id` - Update contact
- `DELETE /api/favorites/:id` - Delete contact

### Community
- `GET /api/community/discussions` - List discussions
- `POST /api/community/discussions` - Create discussion
- `GET /api/community/discussions/:id` - Get discussion
- `POST /api/community/discussions/:id/replies` - Add reply
- `POST /api/community/vote` - Toggle vote

### Q&A
- `GET /api/qna` - List questions
- `POST /api/qna` - Create question
- `POST /api/qna/:id/answers` - Add answer
- `POST /api/qna/:questionId/answers/:answerId/upvote` - Upvote answer
- `POST /api/qna/:questionId/answers/:answerId/downvote` - Downvote answer
- `POST /api/qna/:questionId/answers/:answerId/accept` - Accept answer

### FAQs
- `GET /api/faqs` - List FAQs

## Project Structure

```
safe/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth & error handling
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   └── index.ts         # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
│
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or personal use.

## Credits

Built with ❤️ by the SafePath AI team

Original Repository: [SafePathAI](https://github.com/SrinjoyeeDey/SafePathAI-AI-Powered-Safety-Assistance)
