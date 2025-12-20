# Blockd - 50 Phase Development Roadmap

> **Digital Wellbeing App for Android**

---

## COMPLETED PHASES

### Phase 1-5: Foundation ✅
- [x] React Native Bare Workflow setup
- [x] Theme system (Dark/Light mode)
- [x] Typography & spacing system
- [x] Reusable components (Button, Text, Card, Input)
- [x] LinearGradient integration

### Phase 6-10: Onboarding Basics ✅
- [x] Splash screen with logo animation
- [x] Welcome screen with mascot
- [x] Problem screen (overstimulation)
- [x] Solution screen (Blockd intro)
- [x] Benefits screen (5 stars)

### Phase 11-15: User Input Screens ✅
- [x] "How did you hear about us" screen
- [x] Name input screen
- [x] Progress bar at top
- [x] Flowing blob background
- [x] Premium 2.5D buttons

### Phase 16-20: Permissions ✅
- [x] Usage Stats permission screen
- [x] Overlay permission screen
- [x] Battery optimization screen
- [x] Native Android PermissionsModule
- [x] Permission status checking

---

## IN PROGRESS

### Phase 21-25: App Analysis
- [x] getAppUsageStats native method
- [ ] FIX: Apps not loading in selection
- [ ] Real app data from UsageStatsManager
- [ ] App selection with checkmarks
- [ ] Singular/plural text handling

### Phase 26-30: Commitment Flow
- [x] Time calculation screen
- [x] Hold-to-commit screen
- [ ] "Go back" button centered
- [ ] Transition screen after name
- [ ] Notifications permission

---

## PLANNED

### Phase 31-35: Personalization
- [ ] Age selection screen
- [ ] Gender selection screen
- [ ] Concentration difficulty (1-5 scale)
- [ ] Phone usage stats calculation
- [ ] Scientific study screen

### Phase 36-40: Pre-Launch
- [ ] "5 days difference" screen
- [ ] "Blockd is ready" screen
- [ ] Auth: Login/Signup UI
- [ ] Auth: Google Sign-In
- [ ] Auth: Demo mode

### Phase 41-45: Main App Core
- [ ] Dashboard with stats
- [ ] App limits management
- [ ] Limit creation flow
- [ ] Overlay blocking screen
- [ ] Background monitoring service

### Phase 46-50: Polish & Launch
- [ ] Settings screen
- [ ] Streak tracking
- [ ] Notifications (5-min warning)
- [ ] Accessibility service (optional)
- [ ] Release APK + Play Store prep

---

## All Required Permissions

| # | Permission | Purpose | Request Type |
|---|------------|---------|--------------|
| 1 | PACKAGE_USAGE_STATS | Read app usage data | Settings → Usage Access |
| 2 | SYSTEM_ALERT_WINDOW | Show overlay blocking screen | Settings → Display over apps |
| 3 | REQUEST_IGNORE_BATTERY | Background running | System dialog |
| 4 | FOREGROUND_SERVICE | Continuous monitoring | Auto-granted |
| 5 | RECEIVE_BOOT_COMPLETED | Auto-start after reboot | Auto-granted |
| 6 | QUERY_ALL_PACKAGES | List installed apps | Manifest |
| 7 | POST_NOTIFICATIONS | Warnings & reminders | Runtime (Android 13+) |
| 8 | VIBRATE | Haptic feedback | Auto-granted |
| 9 | ACCESSIBILITY_SERVICE | Reliable foreground detection | Settings → Accessibility |

---

**Last Updated**: 2024-12-20
