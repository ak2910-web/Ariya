# 🎙️ Phase 3C — Jarvis Voice

## ✅ Status: READY TO TEST

Voice system is fully wired. **Needs ElevenLabs API key to activate.**

---

## 🎯 What's Built

### Core Files
- **`/lib/voice.ts`** - Voice service with rate limiting
- **`/app/api/voice/route.ts`** - ElevenLabs TTS endpoint  
- **`/app/page.tsx`** - Welcome voice on first daily visit
- **`/app/focus/page.tsx`** - "Let's begin" + "Well done" triggers
- **`/app/settings/page.tsx`** - Voice ON/OFF toggle + test

### Architecture
```
Text → Voice Queue → TTS API → Audio Player
```

Voice never triggers AI. Voice only speaks approved phrases.

---

## 🔒 When Jarvis Speaks (EXACTLY 3 TIMES)

| Trigger | Phrase | Timing |
|---------|--------|--------|
| First home visit (daily) | "Good to see you, Sir." | Once per day |
| Focus session starts | "Let's begin, Sir." | On Start button |
| Task completed | "Well done, Sir." | On Complete button |

**That's it.** No commentary. No chatter.

### Rate Limiting
- **10 minutes** minimum between any speeches
- Never during active focus (unless completing)
- OFF by default (user must enable)

---

## 🚀 Setup (2 Steps)

### 1. Get ElevenLabs API Key

Go to: [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys)

1. Sign up (free tier available)
2. Create API key
3. Choose a voice ID from: [elevenlabs.io/app/voice-library](https://elevenlabs.io/app/voice-library)
   - Recommended: "Adam" (calm, professional male)
   - Voice ID format: `21m00Tcm4TlvDq8ikWAM`

### 2. Add to Environment

In `/aegis/.env.local`:
```env
ELEVENLABS_API_KEY=your-api-key-here
ELEVENLABS_VOICE_ID=your-voice-id-here
```

Restart dev server:
```bash
npm run dev
```

---

## 🧪 Testing

### Test 1: Settings Page
1. Go to `/settings`
2. Toggle "Enable Voice" ON
3. Click "Test Voice"
4. Should hear: "Good to see you, Sir."

### Test 2: Welcome Voice
1. Go to home `/`
2. First visit today → voice plays automatically
3. Refresh page → no voice (once per day only)
4. Clear localStorage → voice plays again

### Test 3: Focus Start
1. Add a task
2. Go to `/focus`
3. Click "Start"
4. Should hear: "Let's begin, Sir."

### Test 4: Task Complete
1. During active focus
2. Click "Complete Task"
3. Should hear: "Well done, Sir."

### Test 5: Rate Limiting
1. Trigger voice
2. Try again within 10 min
3. Should be blocked (silent)

---

## 💰 Cost

Using ElevenLabs:
- **Per speech**: ~$0.0003 (300 characters)
- **Daily active user**: 3 speeches = ~$0.001/day
- **Monthly**: ~$0.03/user

Free tier: 10,000 characters/month = ~33 speeches

---

## 🎨 UI Behavior

### Settings Page
- Toggle switch (OFF by default)
- When ON: Shows "When Jarvis Speaks" info card
- "Test Voice" button (disabled if OFF)
- Purple styling, matches Aegis design

### Voice Playback
- Volume: 0.6 (calm, not loud)
- No UI indicator during playback
- Fails silently if API error
- Auto-cleanup after playback

---

## 🔧 Configuration

### Change Voice Volume
`/lib/voice.ts`, line 72:
```typescript
audio.volume = 0.6; // Change to 0.4 for quieter
```

### Change Rate Limit
`/lib/voice.ts`, line 11:
```typescript
const VOICE_COOLDOWN = 10 * 60 * 1000; // Change to 5 min: 5 * 60 * 1000
```

### Add New Phrases
`/lib/voice.ts`, bottom:
```typescript
export const JARVIS_PHRASES = {
  WELCOME: "Good to see you, Sir.",
  FOCUS_START: "Let's begin, Sir.",
  TASK_COMPLETE: "Well done, Sir.",
  // ADD HERE (but keep it minimal)
} as const;
```

### Change Voice Settings
`/app/api/voice/route.ts`, lines 34-38:
```typescript
voice_settings: {
  stability: 0.75,        // 0-1 (higher = more consistent)
  similarity_boost: 0.75, // 0-1 (higher = closer to voice)
  style: 0.4,            // 0-1 (emotional expression)
  use_speaker_boost: true,
},
```

---

## 🐛 Troubleshooting

### "Voice generation failed"
- Check `.env.local` has both keys
- Check ElevenLabs account has credits
- Check voice ID is correct format
- Check API key is valid

### Voice doesn't play
- Check voice is enabled in Settings
- Check 10 min hasn't passed since last speech
- Check browser allows audio autoplay
- Check browser console for errors

### Voice plays too often
- Check rate limit logic in `/lib/voice.ts`
- Verify `lastSpeakTime` is updating
- Check `can Speak()` returns false when expected

### Wrong voice/accent
- Change `ELEVENLABS_VOICE_ID` in `.env.local`
- Browse voices at [elevenlabs.io/app/voice-library](https://elevenlabs.io/app/voice-library)
- Premium voices require paid account

---

## ✅ Success Checklist

- [ ] Voice plays on first home visit (once per day)
- [ ] Voice plays when starting focus
- [ ] Voice plays when completing task
- [ ] Voice respects 10-min cooldown
- [ ] Voice can be toggled OFF in Settings
- [ ] Test Voice button works
- [ ] App works perfectly with voice OFF
- [ ] No voice during active focus (except completion)

---

## 🎯 What This Achieves

Your app now has:
1. **Presence** - Feels aware
2. **Intelligence** - Understands patterns (AI insights)
3. **Voice** - Speaks calmly

This is **Jarvis-level UX**.

---

## 🚦 Next Steps (Optional)

### Phase 3C Complete → Phase 4 Options

**Option A: NEXTTASK**
- "What should I do?" button
- AI recommends best next task
- One-sentence reasoning

**Option B: POLISH**
- Refine voice timing
- Add subtle animations
- Performance optimization

**Option C: SHIP IT**
- Deploy to production
- Get user feedback
- Iterate based on real usage

---

**Phase 3C Status: ✅ IMPLEMENTED** (needs API key to test)

Sir, add the ElevenLabs credentials and hear Jarvis speak.

— Aegis Team
