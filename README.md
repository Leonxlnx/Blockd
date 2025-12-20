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

- 🔒 **App Blocking** - Hard blocks when you reach your limits
- 📱 **Overlay Screen** - Can't bypass when an app is blocked
- 🔋 **Background Running** - Works 24/7, even after restart
- 🔔 **Smart Notifications** - 5-minute warnings before you hit your limit
- 📊 **Real Usage Data** - Accurate tracking using Android's UsageStats API
- 🌓 **Dark/Light Mode** - Beautiful design that adapts to your preference

## Permissions

| Permission | Why We Need It |
|------------|----------------|
| Usage Stats | Read which apps you use and for how long |
| Overlay | Show blocking screen over other apps |
| Battery | Keep running in background reliably |
| Notifications | Send warnings and reminders |
| Boot Completed | Auto-start after device restart |

## Tech Stack

- **React Native** (Bare Workflow)
- **TypeScript** for type safety
- **Native Android Modules** (Java) for system permissions
- **Linear Gradient** for beautiful UI
- **Animated API** for smooth animations

## Getting Started

```bash
# Install dependencies
npm install

# Run on Android
npx react-native run-android

# Build release APK
cd android && ./gradlew assembleRelease
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            
│   ├── SplashScreen.tsx
│   ├── Landing.tsx
│   ├── MainPlaceholder.tsx
│   └── onboarding/
│       ├── OnboardingScreens.tsx
│       ├── OnboardingPermissions.tsx
│       ├── AppSetupScreens.tsx
│       └── PersonalizationScreens.tsx
├── native/             # Native module wrappers
├── theme/              # Design system
└── utils/              # Helpers
```

---

**Made with ❤️ for people who want to focus better.**
