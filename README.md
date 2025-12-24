# Blockd - Focus & Digital Wellbeing App

> **Block distracting apps. Reclaim your time. Focus on what matters.**

## What is Blockd?

Blockd is a digital wellbeing app for Android that helps you break free from phone addiction and regain focus. Using advanced app monitoring and intelligent blocking, Blockd helps you:

- 📊 **Track** your app usage automatically
- 🚫 **Block** distracting apps with customizable limits
- ⏱️ **Save** hours per day by reducing screen time
- 🎯 **Focus** on what truly matters in your life
- 📈 **See** your progress with beautiful analytics

## How It Works

1. **Analyze** - Blockd scans your phone to find your most-used apps
2. **Select** - Choose which apps you want to limit
3. **Calculate** - See how much time you could save (if you reduce just 25%!)
4. **Commit** - Make a promise to yourself with our hold-to-commit feature
5. **Track** - Watch your focus improve day by day

## Key Features

- 🔒 **App Blocking** - Hard blocks via Accessibility Service (instant)
- 📱 **Overlay Screen** - Can't bypass when an app is blocked
- 🔋 **Background Running** - Works 24/7 with Foreground Service
- 🔔 **Smart Notifications** - 5-minute warnings before you hit your limit
- 📊 **Real Usage Data** - Accurate tracking using Android's UsageStats API
- 🌓 **Dark/Light Mode** - Beautiful OLED-optimized design

## 📚 Documentation

Full documentation available in [`docs/`](./docs/):

| Document | Description |
|----------|-------------|
| [01_OVERVIEW.md](./docs/01_OVERVIEW.md) | App concept, architecture, tech stack |
| [02_ONBOARDING.md](./docs/02_ONBOARDING.md) | Complete 20+ screen onboarding flow |
| [03_PERMISSIONS.md](./docs/03_PERMISSIONS.md) | All Android permissions explained |
| [04_USERFLOW.md](./docs/04_USERFLOW.md) | User journey, screens, overlays |
| [05_DESIGN.md](./docs/05_DESIGN.md) | Colors, typography, components |

## Quick Start

```bash
# Install dependencies
npm install

# Run on Android
npx react-native run-android

# Build release APK
cd android && ./gradlew assembleRelease
```

**APK Location:** `android/app/build/outputs/apk/release/app-release.apk`

## Project Structure

```
├── android/app/src/main/java/com/blockd/
│   ├── BlockingAccessibilityService.java   # Real-time blocking
│   ├── AppBlockForegroundService.java      # 24/7 protection
│   ├── BlockingModule.java                 # RN bridge
│   └── PermissionsModule.java
├── src/
│   ├── components/       # Button, Text, Card, GlassCard...
│   ├── screens/
│   │   ├── onboarding/   # 20+ onboarding screens
│   │   ├── main/         # Overview, Limits, Settings tabs
│   │   └── overlays/     # Blocking overlays, cancel flow
│   ├── services/         # Business logic
│   └── theme/            # Design tokens
├── docs/                 # Full documentation
└── App.tsx               # Root navigation
```

---

**Made with ❤️ for people who want to focus better.**

