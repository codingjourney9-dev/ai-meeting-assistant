# Smart Meeting Assistant

A full-stack React and Node.js application for real-time video meetings, live audio transcription, and automated summarization.

## Features
- **Video Calling**: Real-time peer-to-peer video communication.
- **Live Transcription**: Audio is streamed and transcribed in real-time.
- **AI Summarization**: Extracts key points, action items, and context automatically.
- **Direct Messaging**: In-app chat functionality.

## Tech Stack
- Frontend: React, Vite, CSS (Glassmorphism & Brutalist UI)
- Backend: Node.js, Express, Socket.io, WebSockets
- Database: MongoDB
- AI/APIs: OpenAI, Deepgram

## Setup Instructions

```bash
# Clone the repository
npm install

# Start the application
npm start
```

## Docker Deployment
The project includes a multi-stage Dockerfile that builds the React frontend and serves it via the Express backend in a single container.

```bash
docker build -t smart-meeting-assistant .
docker run -p 5000:5000 smart-meeting-assistant
```
