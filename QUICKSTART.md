# SafePath AI - Quick Start Guide

This guide will help you get SafePath AI up and running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- **Git** (optional, for cloning)

## API Keys Required

You'll need to sign up for these free services:

1. **Mapbox API Token** - [Sign up here](https://account.mapbox.com/auth/signup/)
   - After signup, go to your [account page](https://account.mapbox.com/) to get your token

2. **GROQ API Key** - [Sign up here](https://console.groq.com/)
   - After signup, create an API key from the console

## Installation Steps

### Step 1: Install Dependencies

Open a terminal in the project root directory (`safe/`) and run:

**For Backend:**
```bash
cd backend
npm install
```

**For Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Configure Environment Variables

The `.env` files have already been created with default values. You need to update them with your API keys.

**Backend (backend/.env):**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/safepath
JWT_ACCESS_SECRET=your_jwt_access_secret_change_this_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_change_this_in_production
FRONTEND_URL=http://localhost:5173
MAPBOX_TOKEN=YOUR_ACTUAL_MAPBOX_TOKEN_HERE
GROQ_API_KEY=YOUR_ACTUAL_GROQ_API_KEY_HERE
```

**Frontend (frontend/.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_MAPBOX_TOKEN=YOUR_ACTUAL_MAPBOX_TOKEN_HERE
```

**Important:** Replace the placeholder values with your actual API keys!

### Step 3: Start MongoDB

If using local MongoDB, make sure it's running:

**Windows:**
```bash
# MongoDB should be running as a service
# If not, start it from Services or run:
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

If using MongoDB Atlas, just ensure your connection string is correct in `backend/.env`.

### Step 4: Start the Application

Open TWO terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected
✅ FAQs seeded successfully
🚀 Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 5: Access the Application

Open your browser and go to: **http://localhost:5173**

You should see the SafePath AI login page!

## First Time Usage

1. Click "Sign up" to create a new account
2. Fill in your details (name, email, password)
3. After signup, you'll be logged in automatically
4. **Grant location permissions** when prompted - this is required for many features
5. Explore the app:
   - Dashboard - Overview
   - Emergency - SOS button and emergency numbers
   - Community - Discussions
   - Favorites - Add emergency contacts
   - Chat icon (bottom right) - AI assistant

## Troubleshooting

### Backend won't start

**MongoDB connection error:**
- Make sure MongoDB is running
- Check your `MONGO_URI` in `backend/.env`
- For MongoDB Atlas, ensure your IP is whitelisted

**Port 5000 already in use:**
- Change `PORT` in `backend/.env` to another port (e.g., 5001)
- Update `VITE_API_URL` in `frontend/.env` accordingly

### Frontend won't start

**Port 5173 already in use:**
- The error message will show an alternative port
- Or update `vite.config.ts` to use a different port

**API errors:**
- Make sure backend is running first
- Check that `VITE_API_URL` matches your backend URL

### Location not working

- Grant location permissions when prompted
- Check browser settings to ensure location is enabled
- Some browsers require HTTPS for geolocation (works on localhost)

### Mapbox/AI features not working

- Verify your API keys are correctly set in `.env` files
- Restart both servers after changing `.env` files
- Check API key validity on respective platforms

## Testing the Features

### Test AI Chatbot
1. Click the chat icon (bottom right)
2. Type: "Find nearest hospital"
3. The AI should respond with location information

### Test SOS
1. Go to Emergency page
2. Add at least one emergency contact in Favorites
3. Click the SOS button
4. Check that the alert was created

### Test Community
1. Go to Community page
2. Click "New Discussion"
3. Create a post
4. It should appear in the list

## Next Steps

- Add your real emergency contacts in the Favorites section
- Explore the AI chatbot capabilities
- Join community discussions
- Customize your profile

## Need Help?

If you encounter issues:
1. Check the browser console for errors (F12)
2. Check terminal output for backend errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB is running
5. Make sure you're using Node.js v18 or higher

## Production Deployment

For production deployment:
1. Change all secret keys in `.env` files
2. Use environment-specific MongoDB (MongoDB Atlas recommended)
3. Build frontend: `cd frontend && npm run build`
4. Build backend: `cd backend && npm run build`
5. Use a process manager like PM2 for the backend
6. Serve frontend build with nginx or similar
7. Use HTTPS in production

Enjoy using SafePath AI! 🚀
