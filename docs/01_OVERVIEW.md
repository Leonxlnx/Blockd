# Blockd - App Overview

> **Digital Wellbeing & Focus Protection App for Android**

**Last Updated:** December 26, 2024

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
- **Premium metal design**: Liquid metal aesthetic, not another ugly utility app
- **Firebase sync**: Cloud-backed data persistence

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native 0.76 (Bare Workflow) |
| Platform | Android only (API 23+) |
| UI | Premium Metal Cards, LinearGradient, Feather Icons |
| Native | Java (Accessibility, Foreground Service, Permissions) |
| Storage | AsyncStorage + Firebase Firestore |
| Auth | Firebase Authentication (Email, Google, Apple) |
| Theme | Light/Dark mode, OLED-optimized |
| Icons | react-native-vector-icons/Feather |

---

## 📦 Project Structure

```
Blockd/
├── android/app/src/main/java/com/blockd/
│   ├── permissions/
│   │   ├── PermissionsModule.java          # All 5 permissions (Usage, Overlay, Battery, Notif)
│   │   └── PermissionsPackage.java
│   ├── BlockingAccessibilityService.java   # Real-time app detection
│   ├── AppBlockForegroundService.java      # 24/7 background protection
│   ├── BlockingModule.java                 # React Native bridge
│   ├── BlockingService.java                # Service coordinator
│   └── MainApplication.kt / MainActivity.kt
├── src/
│   ├── components/                         # Text, Button, Card, Input
│   ├── screens/
│   │   ├── onboarding/                     # 25+ screens total
│   │   │   ├── OnboardingScreens.tsx       # Welcome, Problem, Solution (6)
│   │   │   ├── OnboardingPermissions.tsx   # All 5 permissions (5)
│   │   │   ├── AppSetupScreens.tsx         # Analysis, Selection, Commitment (5)
│   │   │   └── PersonalizationScreens.tsx  # Age, Gender, Auth (9)
│   │   ├── MainApp.tsx                     # Dashboard, Limits, Settings tabs
│   │   └── overlays/
│   │       └── OverlayManager.tsx          # Blocking overlay UI
│   ├── services/
│   │   └── limitsService.ts                # Limits storage & sync
│   ├── native/
│   │   └── Permissions.ts                  # TypeScript wrapper
│   └── theme/                              # Design tokens, spacing
├── docs/                                   # Documentation
│   ├── 01_OVERVIEW.md                      # This file
│   ├── 02_ONBOARDING.md                    # Onboarding flow
│   ├── 03_PERMISSIONS.md                   # Permission details
│   ├── 04_USERFLOW.md                      # Complete user journey
│   ├── 05_DESIGN.md                        # Design system
│   ├── 06_FEATURE_ROADMAP.md               # Future features & bugs
│   └── 07_BLOCKING_DEBUG.md                # Debugging guide
├── App.tsx                                 # Root navigation (25 screens)
└── README.md
```

---

## 🎨 Design Philosophy

### Premium Liquid Metal Aesthetic (v1.1)
- **MetalCard Components**: Multi-layered gradient borders for 2.5D depth
- **OLED Dark Mode**: Pure black (#000) with subtle white gradients
- **Light Mode**: Near-white (#FCFCFF) with gentle shadows
- **Consistent Spacing**: 8-point grid system (spacing[1] to spacing[8])
- **Smooth Animations**: Spring physics for all transitions
- **Feather Icons**: Minimal, consistent iconography

### Key Visual Elements
- **Premium Metal Cards**: Gradient border → gradient fill → content
- **Floating NavBar**: Bottom navigation with glass effect
- **Interactive Weekly Chart**: Touch-to-view, current day highlighted white
- **Name Editing**: Inline edit with Firebase sync
- **Status Badges**: Real-time permission status indicators

---

## 📱 Key Features

### 1. Dashboard Tab
- **Personalized Header**: "Hello, {userName}" (editable in Settings)
- **Real-time Stats**: Today's screen time, unlocks, blocked attempts
- **Weekly Overview**: Last 7 days chart with touch interaction
- **Most Used Apps**: Top apps by usage time
- **Premium UI**: Liquid metal cards with gradient effects

### 2. Limits Tab
- **App Limits**: Daily time limits (e.g., Instagram 30min)
- **Detox Mode**: Complete blocking for X days
- **Streak Tracking**: Days of successful discipline
- **Limit Cards**: Show mode (LIMIT/DETOX), time remaining, streaks
- **Add Limit**: Full app picker with icons

### 3. Settings Tab
- **Profile Section**: Edit name (syncs to Firebase), view email
- **App Info**: Version, permissions management
- **Legal**: Privacy policy, Terms of Service
- **Premium UI**: Metal cards with Feather icons throughout

### 4. Blocking System
- **Accessibility Service**: Detects app opens in real-time
- **Foreground Service**: 24/7 monitoring with persistent notification
- **Overlay Display**: Full-screen block with usage stats
- **Cancel Flow**: Multi-step confirmation to break limit

### 5. Usage Statistics
- **Real-time tracking**: Via UsageStatsManager API
- **Weekly trends**: Monday-Sunday chart
- **App breakdown**: Per-app usage time
- **Timezone support**: Accurate time calculations

---

## 🔐 Blocking Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Android System                      │
│  ┌─────────────────────────────────────────────┐   │
│  │    BlockingAccessibilityService.java         │   │
│  │  • TYPE_WINDOW_STATE_CHANGED events        │   │
│  │  • Detects app launch (packageName)        │   │
│  │  • Checks against blocked apps list        │   │
│  └──────────────────┬──────────────────────────┘   │
│                     │                               │
│  ┌──────────────────▼──────────────────────────┐   │
│  │    AppBlockForegroundService.java            │   │
│  │  • Persistent notification                  │   │
│  │  • START_STICKY for reliability            │   │
│  │  • Restart on boot                         │   │
│  └──────────────────┬──────────────────────────┘   │
│                     │                               │
│  ┌──────────────────▼──────────────────────────┐   │
│  │         BlockingModule.java                  │   │
│  │  • Stores blocked apps (HashMap)            │   │
│  │  • addBlockedApp() from React Native       │   │
│  │  • showBlockingOverlay() when triggered    │   │
│  └──────────────────┬──────────────────────────┘   │
│                     │                               │
└─────────────────────┼───────────────────────────────┘
                      │
        ┌─────────────▼─────────────┐
        │    React Native Layer     │
        │  • limitsService.ts       │
        │  • OverlayManager.tsx     │
        │  • Firebase sync          │
        └───────────────────────────┘
```

---

## 📅 Version History

| Date | Version | Changes |
|------|---------|---------|
| 2024-12-18 | 0.1 | Initial setup, theme system |
| 2024-12-20 | 0.2 | Onboarding flow, basic permissions |
| 2024-12-24 | 0.3 | Main app tabs, limits UI, overlay basics |
| 2024-12-25 | 1.0 | Professional blocking (Accessibility Service) |
| 2024-12-26 | 1.1 | Premium metal UI, name editing, Feather icons, Settings/Limits redesign |

---

## 🚀 Current Status

### ✅ Working
- Complete 25+ screen onboarding flow
- Firebase authentication (Email, Google, Apple)
- All 5 permission screens with status tracking
- Dashboard with real-time stats
- Premium metal card UI
- Name editing with Firebase sync
- Weekly chart with touch interaction

### ⚠️ Known Issues
- Weekly chart shows incorrect/no data (timezone issues)
- Blocking/Overlay not triggering (needs AccessibilityService debug)
- Limits not enforced (service coordination needed)

### 🔧 Next Priority
1. Debug BlockingAccessibilityService activation
2. Fix weekly data timezone calculation
3. Add Foreground Service persistent notification
4. Test complete limit enforcement flow
5. Add real-time dashboard updates

---

## 📚 Documentation

- **01_OVERVIEW.md** ← You are here
- **02_ONBOARDING.md** - Complete onboarding flow breakdown
- **03_PERMISSIONS.md** - All 5 Android permissions explained
- **04_USERFLOW.md** - User journey from install to daily use
- **05_DESIGN.md** - Design system & component library
- **06_FEATURE_ROADMAP.md** - Planned features & bug tracking
- **07_BLOCKING_DEBUG.md** - Debugging guide for blocking system

---

## 👤 Author

Developed with ❤️ using React Native, Firebase, and Android native modules.

**GitHub:** [Leonxlnx/Blockd](https://github.com/Leonxlnx/Blockd)
