# VoiceScript — AI Audio Transcription

A full-stack Next.js application that transcribes audio using Google Gemini AI.

## Live Demo
🔗 https://voice-transcriber-production-3e5e.up.railway.app

## Admin Credentials
- **Email:** admin@burzt.com
- **Password:** Admin@Burzt2024

## Tech Stack
- **Framework:** Next.js 16 (App Router, full-stack)
- **Database:** PostgreSQL (Railway)
- **Auth:** Better Auth (email/password)
- **AI:** Google Gemini 1.5 Flash (audio transcription)
- **ORM:** Drizzle ORM
- **Deployment:** Railway

## Features
- 🔐 Secure admin login/logout
- 📁 Audio file upload and transcription (MP3, WAV, OGG, WEBM)
- 🎙️ Real-time voice recording and transcription
- 📝 Transcript history with copy functionality
- 🗄️ PostgreSQL storage (transcripts only, no audio files)

## Local Setup

1. Clone the repo
```bash
   git clone https://github.com/AaryanNanda/voice-transcriber.git
   cd voice-transcriber
```

2. Install dependencies
```bash
   npm install
```

3. Set up `.env.local`
```env
   DATABASE_URL=your_postgresql_url
   BETTER_AUTH_SECRET=your_secret
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   GEMINI_API_KEY=your_gemini_key
```

4. Push database schema
```bash
   npm run db:push
```

5. Seed admin account

http://localhost:3000/api/seed

6. Run development server
```bash
   npm run dev
```
