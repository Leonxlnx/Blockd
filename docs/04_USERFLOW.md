# Blockd - User Flow

> Complete user journey from app install to daily usage

**Last Updated:** December 26, 2024

---

## 🗺️ Journey Overview

```
📱 INSTALL → 🎬 ONBOARDING → 🔐 PERMISSIONS → ⚙️ SETUP → 🏠 MAIN APP → 📊 DAILY USE → 🎯 LIMIT REACHED
```

---

## 1. First Install

### User Actions
1. Downloads Blockd from Play Store
2. Opens app for first time
3.Sees splash screen (2s)

### App State
- `currentScreen = 'splash'`
- `initializing = true`
- Checks Firebase auth state

---

## 2. Onboarding Journey (6-8 minutes)

### Phase 1: Introduction (2 min)
**Screens 1-7: Building Trust**
1. Welcome → Learn about app
2. Problem → Relate to screen addiction
3. Solution → Understand how Blockd works
4. Benefits → See value proposition
5. How Heard → Quick attribution question
6. Name Input → Personalization begins
7. Hello {Name} → Warm transition

**Psychology**: Builds rapport before asking for sensitive permissions

### Phase 2: Permissions (3-5 min)
**Screens 8-13: Critical Setup**
8. Permissions Intro → Prepare user
9. Usage Stats → Grant in settings
10. Overlay → Grant in settings  
11. Battery → Grant optimization bypass
12. Accessibility → Enable service (complex on Android 13+)

**Challenge**: Accessibility can take 2+ minutes due to Restricted Settings

### Phase 3: App Setup (1 min)
**Screens 14-18: App Selection**
13. Analysis → Scan installed apps
14. Selection → Choose apps to limit
15. Time Calculation → Show potential time savings
16. Commitment → Hold-to-confirm promise
17. You Got This → Celebration

**Outcome**: User has selected apps and made psychological commitment

###Phase 4: Personalization (1-2 min)
**Screens 19-27: Profile Building**
18. Let's Personalize → Transition
19. Age → Demographics
20. Gender → Demographics  
21. Concentration → Determine blocking strictness
22. Phone Stats → Show current usage impact
23. Study → Scientific backing
24. Rewire → Hope/motivation
25. Five Days → Concrete benefits timeline
26. Ready → Build excitement

**Purpose**: Collect data + increase motivation before auth

### Phase 5: Authentication (30s)
**Screens 28-29: Account Creation**
27. Auth Screen → Sign in with Google/Email/Apple
28. Welcome First Time → Celebration
29. Main App → User is in

---

## 3. Main App Entry

### First Load
```typescript
// User lands on Dashboard tab
- Fetches user name from Firebase
- Loads usage stats for today
- Displays weekly chart
- Shows most used apps
```

### Dashboard Elements
- Header: "Hello, {Name}" (tappable in Settings to edit)
- Screen Time Card: Today's total usage
- Stats Row: Unlocks, blocks, focus time
- Weekly Chart: Last 7 days (interactive)
- Most Used: Top 5 apps today

---

## 4. Creating First Limit

### User Flow
1. **Tap** Limits tab (shield icon)
2. **See** Empty state: "No Limits Yet"
3. **Tap** "Add Limit" dashed button
4. **Modal Opens**: App Picker
   - Shows all installed apps
   - Search bar at top
   - Checkbox selection
5. **Select App**: e.g., Instagram
6. **Tap** Continue
7. **Setup Modal**: Choose mode
   - **Limit Mode**: Set daily minutes (e.g., 30)
   - **Detox Mode**: Set days (e.g., 7)
8. **Tap** Save Limit
9. **Limit Created**: 
   - Added to Firebase
   - Synced to native module
   - Shows in Limits tab

### What Happens Behind Scenes
```typescript
// React Native
limitsService.addLimit({
  packageName: 'com.instagram.android',
  appName: 'Instagram',
  mode: 'limit',
  dailyLimitMinutes: 30
});

// Native Android
BlockingModule.addBlockedApp(
  'com.instagram.android',
  'limit',
  0, // no end time for limit mode
  30
);
```

---

## 5. Daily Usage Pattern

### Morning (8 AM)
User wakes up and checks phone:
1. **Opens Blockd** → Dashboard refreshes
2. **Sees** yesterday's stats
3. **Weekly chart** updates to include yesterday
4. **Streak** maintained if no limits broken

### During Day
User goes about normal phone usage:
- **AccessibilityService** monitors all app opens
- **Background Service** tracks usage time
- **No user interaction** with Blockd needed

### Limit Reached (3:00 PM)
User has used Instagram for 30 minutes:
1. **Opens Instagram** from home screen
2. **AccessibilityService** detects open
3. **Checks** blocked apps list → Instagram is blocked
4. **Triggers** `showBlockingOverlay()`
5. **Overlay Appears** immediately:
   - App name: "Instagram"
   - Message: "Daily limit reached"
   - Stats: "30/30 minutes used"
   - Options: "Cancel Limit" button

### Cancel Flow (If User Breaks)
1. **Tap** "Cancel Limit" button
2. **Confirmation Dialog**: "Are you sure? This will reset your streak"
3. **Tap** "Yes, Cancel"
4. **Consequences**:
   - Limit removed for today
   - Streak resets to 0
   - Recorded in Firebase
5. **Instagram Opens** normally

### If User Respects Limit
- **Taps** outside overlay or back button
- **Returns** to home screen
- **Streak** continues
- **Usage** blocked until tomorrow

---

## 6. Evening Review (9 PM)

### User Opens App
1. **Dashboard** shows:
   - Total screen time: 4h 23m
   - Unlocks: 87 times
   - Blocked attempts: 3
2. **Weekly chart** shows today's bar
3. **Most Used** shows top apps

### Checking Limits
1. **Tap** Limits tab
2. **View** all active limits:
   - Instagram: Streak 5 days 🔥
   - TikTok: Detox 3/7 days
3. **Proud feeling** of discipline

---

## 7. Settings Usage

### Editing Name
1. **Tap** Settings tab
2. **Under** PROFILE section
3. **Tap** Name row → Edit mode
4. **Type** new name
5. **Tap** checkmark → Saves to Firebase
6. **Dashboard** updates: "Hello, NewName"

### Managing Permissions
1. **Tap** Permissions row
2. **Opens** System Settings
3. **User** can verify all granted
4. **Returns** to app

### Logout
1. **Tap** red Logout button
2. **Confirmation**: "Are you sure?"
3. **Tap** Logout
4. **Returns** to Auth screen
5. **All data** preserved in Firebase

---

## 8. Next Day

### New Day Cycle (00:00)
- All daily limits reset
- Usage counters reset to 0
- Yesterday's data archived
- Streak updated:
  - +1 if no limits broken yesterday
  - Remains 0 if broken

### User Experience
1. **Opens** Blockd at 9 AM
2. **Sees** fresh daily stats
3. **Instagram** available again (limit reset)
4. **Detox** days still counting
5. **Streak** displayed: "6 days 🔥"

---

## 9. Detox Completion

### Day 7 of Instagram Detox
1. **User** wakes up
2. **Opens Blockd** → Notification: "Detox complete! 🎉"
3. **Limit Auto-Removed** from list
4. **Streak** recorded: "7 day detox completed"
5. **Instagram** accessible again

---

## 🧠 User Psychology

### Commitment Devices
- **Hold Button**: Creates deliberate action
- **Streak Counter**: Loss aversion
- **Cancel Flow**: Friction to break
- **Visual Progress**: Positive reinforcement

### Behavioral Nudges
- **Hello {Name}**: Personalization increases accountability
- **Weekly Chart**: Shows trends, encourages patterns
- **Celebration Screens**: Positive reinforcement
- **Time Savings**: Tangible benefit visualization

---

## 📊 Data Flow

```
User creates limit
    ↓
React Native (limitsService.ts)
    ↓ 
Firebase (cloud persistence)
    ↓
Native Module (BlockingModule.java)
    ↓
AccessibilityService (real-time monitoring)
    ↓
Overlay triggered
    ↓
User decision
    ↓
Streak updated
    ↓
Firebase synced
```

---

## 🔄 Edge Cases

### App Reinstalled
- User signs in
- Firebase syncs all limits
- Streak restored
- Usage history preserved

### Phone Rebooted
- Services restart on boot
- Limits still active
- No user action needed

### Permission Revoked
- App detects on next open
- Shows permission error screen
- Redirects to settings
- Blocks functionality until granted

---

## 🎯 Success Metrics

### Onboarding
- **Completion Rate**: % who reach main app
- **Permission Grant Rate**: % who grant all 5
- **Time to Complete**: Average duration

### Engagement
- **Daily Active Users**: Open app daily
- **Limits Created**: Average per user
- **Limit Respect Rate**: % of limits honored

### Outcomes
- **Average Streak**: Days of consistency
- **Screen Time Reduction**: % decrease week-over-week
- **Detox Completion**: % who finish detox mode

---
