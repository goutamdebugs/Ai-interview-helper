# 🤖 AI Interview System

An interactive, AI-powered interview preparation platform built specifically for students. This application simulates real-world interview environments by using webcam access and leveraging the Google Gemini API to ask dynamic, topic-specific questions tailored to a student's course or chosen subject. 

## ✨ Key Features

* **Real-time AI Interviewer:** Powered by Google's Gemini API to ask contextual, dynamic questions.
* **Immersive Experience:** Webcam integration to simulate face-to-face interview pressure and build confidence.
* **Topic-Based Sessions:** Questions adapt to the student's selected topic or course domain.
* **Text-to-Speech / Speech-to-Text:** (Integrated via ElevenLabs & custom hooks) for realistic conversational flow.
* **Secure Authentication:** JWT-based user registration and login.
* **Session Tracking:** Complete history of previous interview sessions and chat logs.

---

## 🛠️ Tech Stack

**Frontend (Client)**
* **Framework:** React 19 (via Vite)
* **Styling & Animation:** Framer Motion, CSS
* **Routing:** React Router DOM v7
* **State Management:** React Context API
* **API Calls:** Axios
* **Other Tools:** React Icons, React Toastify, Web Speech API integrations

**Backend (Server)**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose)
* **AI Integration:** `@google/generative-ai` (Gemini)
* **Authentication:** JSON Web Tokens (JWT), bcryptjs
* **Middleware:** CORS, dotenv

---

## 📁 Folder Structure

```text
gemini-interview-system/
├── client/                     # React Frontend Application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/         # Reusable UI elements
│   │   │   ├── common/         # Button, Input
│   │   │   └── layout/         # WebcamPreview
│   │   ├── context/            # AuthContext
│   │   ├── hooks/              # useSpeechToText, useTextToSpeech
│   │   ├── pages/              # Auth, Dashboard, InterviewRoom
│   │   ├── services/           # api.js
│   │   └── styles/
│   ├── .env                    # Frontend environment variables
│   └── package.json
│
└── server/                     # Node.js Backend API
    ├── config/                 # db.js, gemini.js
    ├── controllers/            # authController, chatController
    ├── middleware/             # authMiddleware
    ├── models/                 # User.js, Interview.js
    ├── routes/                 # authRoutes, chatRoutes
    ├── .env                    # Backend environment variables
    ├── server.js               # Application entry point
    └── package.json
```
```
git clone <your-repo-url>
cd gemini-interview-system
```
```
cd server
npm install
```

```
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Server Port
PORT=5000
```

```
npm run dev
```

```
cd client
npm install
```

```
# Backend API URL
VITE_API_URL=http://localhost:5000

# ElevenLabs API Key (For Text-to-Speech)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

```
npm run dev
```
# 📚 AI Interview System - API Documentation

**Base URL:** `http://localhost:5000`

---

## 1. Authentication APIs

### A. User Registration
* **Endpoint:** `POST /api/auth/register`
* **Description:** Register a new user account.
* **Request Body (JSON):**
```json
{
  "name": "Goutam Maity",
  "email": "goutam@example.com",
  "password": "password123"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "65b2c3d4e8a7f9c1d4e5f6a7",
    "name": "Goutam Maity",
    "email": "goutam@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
* **Error Responses:**
  * `400 Bad Request` - User already exists or Validation error
  * `500 Internal Server Error` - Server error

### B. User Login
* **Endpoint:** `POST /api/auth/login`
* **Description:** Authenticate a user and receive a JWT token.
* **Request Body (JSON):**
```json
{
  "email": "goutam@example.com",
  "password": "password123"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "65b2c3d4e8a7f9c1d4e5f6a7",
    "name": "Goutam Maity",
    "email": "goutam@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
* **Error Responses:**
  * `401 Unauthorized` - Invalid credentials
  * `400 Bad Request` - Missing fields
  * `500 Internal Server Error` - Server error

---

## 2. Chat / Interview APIs (Protected)
*⚠️ Note: All protected APIs require a valid JWT token in the request headers.*
* **Header Format:** `Authorization: Bearer <your_token_here>`

### A. Send Message to AI Interviewer
* **Endpoint:** `POST /api/chat/message`
* **Headers:** * `Authorization: Bearer <token>`
  * `Content-Type: application/json`
* **Request Body (JSON):**
```json
{
  "message": "What is React Virtual DOM?",
  "sessionId": "mern_interview_001",
  "history": [
    {
      "role": "user",
      "content": "Hello, I want to practice MERN interview"
    },
    {
      "role": "assistant",
      "content": "Great! Let's start with React basics..."
    }
  ]
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "response": "React Virtual DOM is a lightweight copy of the real DOM...",
    "sessionId": "mern_interview_001",
    "messageId": "65b2c3d4e8a7f9c1d4e5f6a8",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "metadata": {
      "responseTime": 1200,
      "tokensUsed": 150
    }
  }
}
```
* **Error Responses:**
  * `401 Unauthorized` - No token/invalid token
  * `400 Bad Request` - Missing message/sessionId or empty message
  * `500 Internal Server Error` - AI service error

### B. Get Chat History for Session
* **Endpoint:** `GET /api/chat/history/:sessionId`
* **Example:** `GET /api/chat/history/mern_interview_001`
* **Headers:** * `Authorization: Bearer <token>`
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sessionId": "mern_interview_001",
    "messages": [
      {
        "_id": "65b2c3d4e8a7f9c1d4e5f6a8",
        "role": "user",
        "content": "Hello, start interview",
        "timestamp": "2024-01-15T10:30:00.000Z"
      },
      {
        "_id": "65b2c3d4e8a7f9c1d4e5f6a9",
        "role": "assistant",
        "content": "Welcome! What is Node.js?",
        "timestamp": "2024-01-15T10:30:01.000Z",
        "metadata": {
          "responseTime": 1500,
          "tokensUsed": 120
        }
      }
    ],
    "count": 2
  }
}
```
* **Error Responses:**
  * `401 Unauthorized` - No token/invalid token
  * `404 Not Found` - No history found
  * `500 Internal Server Error` - Server error

---

## 3. Utility APIs (No Auth Required)

### A. Health Check
* **Endpoint:** `GET /health`
* **Description:** Check if the API server is running and responsive.
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "AI Interview Bot API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

### B. 404 Route Handler
* **Endpoint:** `ANY undefined route`
* **Description:** Fallback handler for unmatched routes.
* **Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Route /api/some/wrong/route not found"
}
```

