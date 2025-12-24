# Blockd - App Overview

> **Digital Wellbeing & Focus Protection App for Android**

---

## 🎯 The Idea

**Blockd** is a minimalist focus app that helps users break phone addiction by blocking distracting apps. Unlike other solutions, Blockd uses a **psychological commitment system** combined with professional-grade Android blocking technology.

### Core Concept
1. **User sets limits** for specific apps (e.g., Instagram: 30 min/day)
2. **Real-time blocking** via Android Accessibility Service
3. **Overlay appears** when blocked app is opened
4. **Cancel flow** requires conscious effort to break commitment

### Why Blockd is Different
- **No bypass tricks**: Uses system-level Accessibility Service
- **Streak motivation**: Tracks consecutive days of discipline
- **Detox mode**: Complete app blocking for X days
- **Premium design**: Not another ugly utility app

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native 0.76 (Bare Workflow) |
| Platform | Android only |
| UI | Custom components, LinearGradient, GlassCard |
| Native | Java (Accessibility Service, Foreground Service) |
| Storage | AsyncStorage, SharedPreferences |
| Auth | Firebase Authentication |
| Theme | Light/Dark mode, OLED-optimized |

---

## 📦 Project Structure

```
Blockd/
├── android/app/src/main/java/com/blockd/
│   ├── BlockingAccessibilityService.java   # Real-time app detection
│   ├── AppBlockForegroundService.java      # 24/7 background protection
│   ├── BlockingModule.java                 # React Native bridge
│   ├── PermissionsModule.java              # Usage stats, permissions
│   └── MainApplication/MainActivity
├── src/
│   ├── components/                         # Reusable UI components
│   ├── screens/
│   │   ├── onboarding/                     # Onboarding flow (12+ screens)
│   │   ├── main/                           # Main app tabs
│   │   └── overlays/                       # Blocking overlays
│   ├── services/                           # Business logic
│   └── theme/                              # Design tokens
├── docs/                                   # This documentation
├── App.tsx                                 # Root navigation
└── README.md
```

---

## 🎨 Design Philosophy

### Premium 2.5D Aesthetic
- **Light Mode First**: Clean whites with soft sage shadows
- **OLED Dark Mode**: True black (#0A0908) for battery saving
- **8-Point Grid**: Consistent spacing throughout
- **Squircle Corners**: Apple-style continuous curvature
- **Micro-animations**: Spring physics, subtle transitions

### Key Visual Elements
- **GlassCard**: Frosted glass effect for cards
- **Floating NavBar**: Rounded bottom navigation
- **Gradient Buttons**: Sage-colored primary actions
- **Interactive Charts**: Touch-enabled usage visualization

---

## 📱 Key Features

### 1. App Limits
Set daily time limits per app. When limit is reached, overlay blocks access.

### 2. Detox Mode
Complete app blocking for specified days (3, 7, 14, 30+). No usage allowed.

### 3. Streak Tracking
Consecutive days of respecting limits. Breaking a limit resets streak.

### 4. Cancel Flow
Breaking a block requires a multi-step confirmation with psychological friction.

### 5. Usage Statistics
- Today's screen time
- Weekly chart
- Unlock count
- App-by-app breakdown

---

## 🔐 Blocking Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Android System                      │
│  ┌─────────────────────────────────────────────┐   │
│  │         AccessibilityService                 │   │
│  │  • Receives TYPE_WINDOW_STATE_CHANGED       │   │
│  │  • Detects app launch in milliseconds       │   │
│  └──────────────────┬──────────────────────────┘   │
│                     │                               │
│  ┌──────────────────▼──────────────────────────┐   │
│  │         ForegroundService                    │   │
│  │  • Keeps process alive 24/7                 │   │
│  │  • Shows persistent notification            │   │
│  └──────────────────┬──────────────────────────┘   │
│                     │                               │
└─────────────────────┼───────────────────────────────┘
                      │
        ┌─────────────▼─────────────┐
        │      React Native App      │
        │  • OverlayManager.tsx      │
        │  • Shows block overlay     │
        └───────────────────────────┘
```

---

## 📅 Version History

| Date | Version | Changes |
|------|---------|---------|
| 2024-12-18 | 0.1 | Initial setup, theme system |
| 2024-12-20 | 0.2 | Onboarding, basic permissions |
| 2024-12-24 | 0.3 | Main app, limits, overlays |
| 2024-12-25 | 1.0 | Professional blocking (Accessibility Service) |

---

## 👤 Author

Developed with ❤️ using React Native and Android native modules.
