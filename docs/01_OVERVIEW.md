# Blockd - App Blocking & Focus App

## Overview

Blockd is a premium Android app that helps users control their screen time and stay focused by blocking distracting apps. Built with React Native and native Android modules for reliable, system-level app blocking.

## Current Status: ✅ WORKING

The app is fully functional with:
- ✅ App blocking via AccessibilityService
- ✅ Beautiful React Native overlays
- ✅ Detox mode (complete app block for X days)
- ✅ Daily limit mode (time-based blocking)
- ✅ Streak tracking
- ✅ onNewIntent handling for background launches
- ✅ Back button blocking to prevent escape

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | React Native 0.76+ |
| Language | TypeScript, Kotlin, Java |
| Backend | Firebase (Auth, Firestore) |
| Storage | AsyncStorage (local), Firestore (cloud) |
| Styling | Custom components, LinearGradient |
| Native | AccessibilityService, ForegroundService |

## Project Structure

```
Blockd/
├── android/                    # Native Android code
│   └── app/src/main/java/com/blockd/
│       ├── MainActivity.kt           # App entry + onNewIntent
│       ├── BlockingAccessibilityService.java  # App detection
│       ├── BlockingModule.java        # React Native bridge
│       └── AppBlockForegroundService.java     # Keep-alive service
├── src/
│   ├── components/            # Reusable UI components
│   ├── screens/
│   │   ├── MainApp.tsx        # Main app with tabs
│   │   ├── onboarding/        # Onboarding screens
│   │   └── overlays/          # Blocking overlays
│   │       ├── OverlayManager.tsx     # Overlay logic
│   │       ├── OverlayScreens.tsx     # UI components
│   │       └── CancelFlow.tsx         # Limit removal flow
│   ├── services/
│   │   └── limitsService.ts   # Limits CRUD operations
│   └── theme/                 # Design system
└── docs/                      # Documentation
```

## Key Features

### 1. Blocking Modes
- **Detox Mode**: Complete block for 1-30 days
- **Daily Limit Mode**: Allow X minutes per day

### 2. Overlay System
- Beautiful React Native overlays
- Shows blocked app icon and name
- Exit button returns to home
- Cancel flow with 4-step verification

### 3. Streak System
- Track consecutive days of discipline
- Broken when user cancels a limit early

## How Blocking Works

```
User opens blocked app (e.g., YouTube)
    ↓
AccessibilityService detects window change
    ↓
Checks if package is in blockedPackages
    ↓
Calls launchBlockOverlay(packageName)
    ↓
MainActivity receives intent (onNewIntent)
    ↓
OverlayManager detects 'active' state
    ↓
checkInitialLaunch() reads intent extras
    ↓
onAppBlocked event fires
    ↓
React Native overlay appears
    ↓
Back button is BLOCKED
    ↓
User must tap "Exit App" to leave
```

## Installation

```bash
# Install dependencies
npm install

# Run on Android
npx react-native run-android

# Build release APK
cd android && ./gradlew assembleRelease
```

## Release APK Location
`android/app/build/outputs/apk/release/app-release.apk`
