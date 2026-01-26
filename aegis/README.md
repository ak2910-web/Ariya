# Aegis - AI-Powered Personal Productivity Assistant

> A premium productivity website with a Jarvis-style AI assistant that helps you decide what to work on, stay focused, and reflect intelligently on your day.

## 🎯 Project Vision

Aegis is built on these core principles:
- **One task at a time** - Focus on what matters most
- **Clarity over clutter** - Clean, purposeful interface
- **Calm, premium UI** - Professional dark theme with purple accents
- **Human-like AI assistant** - Addresses you as "Sir" with intelligence and respect
- **Intentional development** - UI → Logic → Backend (strict order)

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **AI** (coming): OpenAI
- **Voice** (coming): ElevenLabs / OpenAI TTS
- **Database** (coming): Supabase

## 🚀 Getting Started

```bash
# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
aegis/
├── app/
│   ├── page.tsx              # Home page with orb
│   ├── dashboard/page.tsx    # Main dashboard
│   ├── focus/page.tsx        # Focus mode timer
│   ├── analysis/page.tsx     # Daily analytics
│   ├── tasks/page.tsx        # Task management
│   └── settings/page.tsx     # Settings & preferences
│
├── components/
│   ├── Orb.tsx              # Animated AI orb
│   ├── Button.tsx           # Reusable button
│   ├── Card.tsx             # Card container
│   ├── Header.tsx           # Navigation
│   └── ProgressBar.tsx      # Progress bar
│
└── data/
    ├── mockTasks.ts         # Mock task data
    └── mockAnalysis.ts      # Mock analytics data
```

## 🏁 Current Status

**Phase 1: UI Layer - COMPLETE ✅**

All 6 pages are built with premium UI, animations, and mock data.

**Next Steps**: Say **"LOGIC"**, **"BACKEND"**, or **"AI"** when ready to proceed.

---

Built with Next.js, Tailwind CSS, and Framer Motion.
