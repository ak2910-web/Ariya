# 🎙️ AI Guidance System — Jarvis Mode

## Overview

Aegis now has **awareness** — idle moments feel *noticed*, hesitation gets gentle nudges, completion gets acknowledgment.

The AI **observes**, never controls. Messages are rare, short, and calm.

---

## 🎯 What This Adds

### Before
```
[User sits idle for 10 minutes]
[Nothing happens]
```

### After
```
[User sits idle for 8 minutes]
[Bottom-right corner, gentle pulse]
"Sir… we've been idle for a bit."
[Auto-dismisses after 12 seconds]
```

---

## 🧠 Trigger Conditions (EXACT)

The AI **only** speaks when:

| Trigger | Condition | Cooldown |
|---------|-----------|----------|
| **Idle** | 8+ min no activity + pending tasks | 5 min |
| **Completion** | Task just completed | 5 min |
| **Never during** | Active focus session | — |

### What "Idle" Means
- No task completions
- No task avoidances
- Not in active focus
- Has pending tasks

If user has no pending tasks, **guidance never triggers** (nothing to nudge toward).

---

## 🔒 Rate Limiting (HARD RULES)

✅ **Minimum 5 minutes** between messages  
✅ **Never during focus** (unless paused)  
✅ **One message at a time** (no stacking)  
✅ **Auto-dismiss after 12 seconds**  
✅ **Manual dismiss on click**  

This prevents:
- Spam
- Distraction during deep work
- Annoyance

---

## 🎨 UI Behavior

### Appearance
- **Location**: Bottom-right corner (z-index 50)
- **Style**: Purple gradient card with glow
- **Animation**: Smooth spring entrance (0.3s)
- **Exit**: Fade + scale down

### States
| State | UI |
|-------|-----|
| No guidance | Nothing visible |
| Active guidance | Card visible with message |
| Dismissed | Smooth exit animation |
| Auto-dismissed | Same as dismissed (12s timer) |

### Visual Design
```
┌─────────────────────────────────┐
│ ● Aegis                        │  ← Pulsing dot + label
│                                 │
│ "Sir, are we deciding—         │  ← AI message
│  or avoiding?"                  │
│                                 │
│ Click to dismiss      Dismiss   │  ← Hint + button
└─────────────────────────────────┘
   ↑ Purple glow around card
```

---

## 🔌 Technical Implementation

### Files Created

#### `/lib/hooks/useGuidanceDetection.ts`
Two detection hooks:

**`useIdleDetection()`**
- Checks every 30 seconds
- Tracks last activity timestamp
- Triggers `requestGuidance('idle')` after 8 min

**`useCompletionDetection()`**
- Watches task status changes
- Triggers `requestGuidance('completed')` on new completion
- Compares previous vs current state

#### `/components/GuidanceMessage.tsx`
UI component:
- AnimatePresence for smooth entry/exit
- Auto-dismiss timer (12s)
- Click-to-dismiss handler
- Purple gradient + glow effect
- Spring animation

#### `/app/api/ai/guidance/route.ts`
API endpoint:
- Calls `generateGuidance()` from `/lib/ai.ts`
- Validates AI availability
- Returns short message (< 15 words)

### Store Changes

Added to `AegisState`:
```typescript
lastGuidanceTime: number | null;
currentGuidance: string | null;
guidanceVisible: boolean;

canShowGuidance: () => boolean;
requestGuidance: (state) => Promise<void>;
dismissGuidance: () => void;
```

### Flow Diagram

```
Dashboard loads
  ↓
useIdleDetection() hook starts
  ↓
[8 minutes pass with no activity]
  ↓
Hook calls store.requestGuidance('idle')
  ↓
Store checks canShowGuidance() (rate limit)
  ↓
POST to /api/ai/guidance
  ↓
OpenAI generates message (gpt-4o-mini)
  ↓
Store updates: guidanceVisible=true
  ↓
GuidanceMessage component renders
  ↓
[12 seconds pass OR user clicks]
  ↓
dismissGuidance() called
  ↓
Component exits with animation
```

---

## 🎤 AI Prompt (Production)

Located in `/lib/ai.ts`, `generateGuidance()`:

```typescript
You are a Jarvis-style personal assistant for a productivity app.
Address the user as "Sir".

Context:
- User state: ${data.state}
- Idle for: ${data.timeIdleMinutes} minutes (if applicable)
- Active task: ${data.activeTask} (if any)
- Pending tasks: ${data.pendingTasks}

Gently guide the user to action.
You may ask one light, slightly playful question.
Keep it under 15 words.
Never sound robotic.
Do not use emojis.

Output: One short sentence only.
```

### Example Outputs

| Context | AI Response |
|---------|-------------|
| Idle 10 min, 3 pending | "Sir, shall we tackle one of these?" |
| Just completed task | "Well done, Sir. Ready for the next?" |
| Idle 15 min, no active | "One small step would help, Sir." |
| Hesitating on task | "This task is manageable. Let's begin." |

Tone is:
- Calm
- Respectful ("Sir")
- Slightly playful
- Never pushy
- Never verbose

---

## 🔧 Configuration

### Change Idle Threshold

In `/lib/hooks/useGuidanceDetection.ts`, line 30:
```typescript
const IDLE_THRESHOLD = 8 * 60 * 1000; // Change to 10 min: 10 * 60 * 1000
```

### Change Rate Limit

In `/lib/store.ts`, `canShowGuidance()`, line 507:
```typescript
const MIN_INTERVAL = 5 * 60 * 1000; // Change to 10 min: 10 * 60 * 1000
```

### Change Auto-Dismiss Time

In `/components/GuidanceMessage.tsx`, line 20:
```typescript
const timer = setTimeout(() => {
  dismissGuidance();
}, 12000); // Change to 20s: 20000
```

### Change Check Frequency

In `/lib/hooks/useGuidanceDetection.ts`, line 31:
```typescript
const CHECK_INTERVAL = 30 * 1000; // Check every 60s: 60 * 1000
```

---

## 💰 Cost Analysis

### Per Guidance Message
- Model: `gpt-4o-mini`
- Input: ~150 tokens
- Output: ~15 tokens
- Cost: **~$0.00003** (3 cents per 1000 messages)

### Realistic Usage
- Active user: 2-3 guidance messages/day
- Monthly: 60-90 messages
- Cost: **~$0.003/month** = **$0.036/year**

This is **negligible** compared to insights (which are 10x more expensive but still cheap).

---

## 🐛 Troubleshooting

### Guidance Never Appears
- Check `.env.local` has `OPENAI_API_KEY`
- Check you have pending tasks
- Check you've been idle >8 minutes
- Check browser console for errors
- Check last guidance wasn't <5 min ago

### Guidance Appears Too Often
- Increase `MIN_INTERVAL` in store (default 5 min)
- Increase `IDLE_THRESHOLD` (default 8 min)

### Guidance Text is Wrong
- Check prompt in `/lib/ai.ts`, `generateGuidance()`
- Try different temperature (default 0.8)
- Check input data being sent to API

### Guidance Blocks Focus
- **This shouldn't happen** — guidance never triggers during active focus
- Check `canShowGuidance()` logic in store
- Verify `focusSession.isActive` is being set correctly

---

## ✅ Success Metrics

You'll know guidance works when:

✅ Messages feel rare but timely  
✅ Tone matches Jarvis ("Sir", calm, aware)  
✅ Never intrusive during focus  
✅ Auto-dismisses naturally  
✅ Feels like gentle presence, not nagging  

---

## 🧪 Testing Checklist

Manual tests:

- [ ] Go to Dashboard, wait 8+ min idle → guidance appears
- [ ] Complete a task → guidance appears (if rate limit passed)
- [ ] Start focus session → guidance stops appearing
- [ ] Pause focus → guidance can appear again
- [ ] Click guidance card → dismisses immediately
- [ ] Wait 12 seconds → auto-dismisses
- [ ] Trigger guidance twice in 3 min → second one blocked (rate limit)
- [ ] Disable API key → guidance fails gracefully (no UI error)

---

## 🚀 What's Next (Phase 3B.2)

Once guidance feels natural:

**Next: NEXTTASK** — AI-driven task recommendations

This will add:
- "What should I do?" button on Dashboard
- Smart task selection based on priority, time, energy
- One-sentence reasoning

After NEXTTASK:
- **Phase 3C: Voice** — Speak insights + guidance aloud

---

**Phase 3B.1 (GUIDANCE) Status: ✅ COMPLETE**

Your app now has **awareness**.

— Aegis Team
