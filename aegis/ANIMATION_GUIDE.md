# 🎨 Aegis Animation Guide

## 🔮 The Orb - Core Animation System

The orb is the **heart** of Aegis. It must feel **alive**, not decorative.

### Animation Layers (3 Total)

#### 1. Outer Glow - Presence & Intelligence
- Size: 72 (288px)
- Duration: 6 seconds
- Scale: 1 → 1.15 → 1
- Opacity: 0.4 → 0.7 → 0.4
- Purpose: Creates ambient presence

#### 2. Middle Glow - Energy Layer
- Size: 44 (176px)
- Duration: 4 seconds
- Scale: 1 → 1.08 → 1
- Opacity: 0.6 → 0.9 → 0.6
- Purpose: Shows active energy

#### 3. Core Orb - Identity
- Size: 24 (96px)
- Duration: 5 seconds
- Y-axis: 0 → -6px → 0 (floating)
- Scale: 1 → 1.03 → 1 (breathing)
- Hover: Scale 1.08
- Purpose: The AI's presence

### Design Principles

✅ **DO:**
- Slow, deliberate motion
- Natural breathing rhythm
- Subtle floating effect
- Calm presence
- Jarvis-style intelligence feel

❌ **DON'T:**
- Fast spinning
- Particle explosions
- Neon flashing
- Aggressive motion
- Sound tied to animation

### Animation Timing Philosophy

All animations are:
- **Slow** - 4-6 second cycles
- **Infinite** - Continuous loops
- **EaseInOut** - Natural breathing feel
- **Staggered** - Layers move independently

### The 10-Second Test

Open the home page and **watch without clicking** for 10 seconds.

**If successful, you should feel:**
- The orb is alive
- Intelligence is present
- Calm, not distraction
- Desire to interact

**If not successful:**
- Motion is too fast
- Too many layers competing
- Colors too bright
- Animation is mechanical

---

## 🎬 Future Animation States (Not Implemented)

### Thinking State
```tsx
// When AI is processing
animate={{
  scale: [1, 1.06, 1],
  opacity: [1, 0.8, 1],
}}
transition={{
  duration: 1.5,
  repeat: Infinity,
}}
```

### Speaking State
```tsx
// When voice output is active
animate={{
  scale: [1, 1.04, 1, 1.04, 1],
}}
transition={{
  duration: 2,
  repeat: Infinity,
}}
```

### Listening State
```tsx
// When voice input is active
animate={{
  scale: [1, 1.02, 1],
  opacity: [0.9, 1, 0.9],
}}
transition={{
  duration: 0.8,
  repeat: Infinity,
}}
```

---

## 📐 Technical Specifications

### Color System
- Base: `bg-purple-500`
- Gradient: `from-purple-400 to-purple-600`
- Opacity range: 0.2 - 0.9
- Blur: `blur-3xl` (outer), `blur-xl` (middle)

### Size Hierarchy
- Outer: 72 (w-72 h-72)
- Middle: 44 (w-44 h-44)
- Core: 24 (w-24 h-24)

### Motion Values
- Float distance: 6px
- Scale change: 3-15%
- Duration: 4-6 seconds
- Easing: easeInOut

---

## 🧠 Copilot Prompt (If Needed)

```
Improve the AI orb animation to feel alive and premium.
Use layered glows, slow breathing animations, and subtle floating.
Avoid fast motion or flashy effects.
This orb should feel like a calm, intelligent presence (Jarvis-style).
```

---

## ✅ Current Status

**Orb Animation: Complete** ✅

The orb now:
- Breathes naturally (3 layers)
- Floats subtly (Y-axis motion)
- Responds to hover (gentle scale)
- Feels intelligent and alive

**Test it at: http://localhost:3000**

---

**Remember**: Voice and motion must **never compete**.
