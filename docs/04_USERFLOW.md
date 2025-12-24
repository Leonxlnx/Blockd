# Blockd - User Flow

> Complete journey from installation to daily usage

---

## 🗺️ High-Level Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   INSTALL   │───▶│  ONBOARDING │───▶│   MAIN APP  │───▶│   BLOCKING  │
│   (APK)     │    │  (20 min)   │    │  (Daily)    │    │  (Overlay)  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## 👤 User Journey

### Phase 1: First Launch

1. **User installs APK**
2. **Opens app → Splash screen**
3. **Enters onboarding flow**
   - Learns about the app
   - Provides name
   - Grants permissions
   - Selects apps to limit
   - Makes commitment
   - Creates account (optional)
4. **Lands on Dashboard**

---

### Phase 2: Setting Up Limits

```
Dashboard → Limits Tab → "Add Limit" → Select App → Choose Mode → Set Duration → Confirm
```

#### Limit Modes

**1. Daily Limit**
- Set max minutes per day (e.g., 30 min)
- After limit reached, app is blocked
- Resets at midnight

**2. Detox Mode**
- Complete block for X days
- No usage allowed
- Cannot be bypassed easily

---

### Phase 3: Daily Usage

#### Morning
1. User wakes up, unlocks phone
2. Blockd Foreground Service is running
3. Notification: "Blockd is protecting your focus"

#### During the Day
1. User opens Instagram (blocked app)
2. **If Detox Mode:**
   - Immediate overlay: "You're on a detox!"
   - Options: Exit | Cancel (with friction)
3. **If Limit Mode (time remaining):**
   - Brief overlay: "15 minutes remaining today"
   - Options: Continue | Exit
4. **If Limit Mode (exceeded):**
   - Full overlay: "Daily limit reached"
   - Options: Exit | Cancel (with friction)

#### Evening
1. User checks Dashboard
2. Sees: Today's screen time, unlocks, streaks
3. Weekly chart shows progress

---

### Phase 4: Breaking a Limit (Cancel Flow)

When user tries to bypass a block:

```
Overlay → "Cancel" → Warning Screen → Confirmation → Type reason → Final confirm
```

**Steps:**
1. **Warning**: "Breaking this will reset your streak!"
2. **Confirmation**: "Are you sure?"
3. **Reason**: "Why do you need to use this app?"
4. **Final**: "I understand the consequences"

**Result:** Streak resets, limit is temporarily disabled for session.

---

## 📱 Main App Screens

### Dashboard (Overview Tab)
```
┌────────────────────────────────────┐
│  Welcome back, {Name}! 👋          │
├────────────────────────────────────┤
│  ┌──────────┐ ┌────────┐ ┌──────┐ │
│  │ 2h 34m   │ │ 45     │ │ 3    │ │
│  │ Today    │ │ Unlocks│ │Limits│ │
│  └──────────┘ └────────┘ └──────┘ │
├────────────────────────────────────┤
│  App Usage Today                   │
│  ┌────────────────────────────────┐│
│  │ Instagram     │ 45m            ││
│  │ TikTok        │ 32m            ││
│  │ YouTube       │ 28m            ││
│  └────────────────────────────────┘│
├────────────────────────────────────┤
│  Weekly Overview                   │
│  [Bar Chart: M T W T F S S]        │
└────────────────────────────────────┘
```

### Limits Tab
```
┌────────────────────────────────────┐
│  Your Limits                       │
├────────────────────────────────────┤
│  ┌────────────────────────────────┐│
│  │ 📱 Instagram                   ││
│  │ LIMIT | 30m/day | 🔥 5 days    ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ 📱 TikTok                      ││
│  │ DETOX | 7d left | 🔥 2 days    ││
│  └────────────────────────────────┘│
├────────────────────────────────────┤
│  [+ Add Limit]                     │
└────────────────────────────────────┘
```

### Settings Tab
```
┌────────────────────────────────────┐
│  Settings                          │
├────────────────────────────────────┤
│  ACCOUNT                           │
│  Email: user@example.com           │
│  Member since: Dec 2024            │
│  [Edit Name]                       │
├────────────────────────────────────┤
│  APP                               │
│  Version: 1.0.0                    │
├────────────────────────────────────┤
│  LEGAL                             │
│  Privacy Policy  →                 │
│  Terms of Service  →               │
├────────────────────────────────────┤
│  PERMISSIONS                       │
│  Manage Permissions  →             │
├────────────────────────────────────┤
│  [Log Out]                         │
└────────────────────────────────────┘
```

---

## 🚫 Blocking Overlays

### Detox Overlay
```
┌────────────────────────────────────┐
│                                    │
│           🛡️                       │
│                                    │
│    You're on a Detox!              │
│                                    │
│    {App Name} is blocked           │
│    for 5 more days                 │
│                                    │
│    Stay strong! 💪                 │
│                                    │
│    [Exit App]                      │
│                                    │
│    ─────────────────────           │
│    Cancel Detox (lose streak)      │
└────────────────────────────────────┘
```

### Limit Reached Overlay
```
┌────────────────────────────────────┐
│                                    │
│           ⏰                        │
│                                    │
│    Daily Limit Reached             │
│                                    │
│    You've used your 30 minutes     │
│    of {App Name} today             │
│                                    │
│    Come back tomorrow!             │
│                                    │
│    [Exit App]                      │
│                                    │
│    ─────────────────────           │
│    Use anyway (lose streak)        │
└────────────────────────────────────┘
```

### Limit Active (Timer) Overlay
```
┌────────────────────────────────────┐
│                                    │
│    ⏱️ 15 minutes left today        │
│                                    │
│    [Continue]    [Exit]            │
│                                    │
└────────────────────────────────────┘
```

---

## 🔄 Background States

| State | Behavior |
|-------|----------|
| App in foreground | Full UI, can manage limits |
| App in background | Monitoring active, overlay ready |
| App killed | Foreground service keeps monitoring |
| Device rebooted | Auto-start via BOOT_COMPLETED |
| No permissions | Reduced functionality, prompts shown |
