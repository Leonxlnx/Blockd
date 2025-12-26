# Blockd Feature Roadmap & Bug Fixes

**Last Updated:** December 26, 2024

---

## 🔴 CRITICAL BUGS TO FIX

### 1. Overlay/Blocking Not Working
**Problem:** Limits und Detox blockieren Apps nicht - Overlay erscheint nicht.

**Root Cause Analysis:**
- BlockingService startet möglicherweise nicht korrekt
- AccessibilityService nicht aktiviert
- Overlay Permission nicht erteilt
- Service wird vom System beendet (Battery Optimization)

**Debug Steps:**
```bash
# 1. Check if BlockingService is running
adb shell dumpsys activity services com.blockd

# 2. Check Accessibility Service status
adb shell settings get secure enabled_accessibility_services

# 3. Check Overlay permission
adb shell appops get com.blockd SYSTEM_ALERT_WINDOW

# 4. Check logs for blocking events
adb logcat | grep -i "blockd\|blocking\|overlay"
```

**Fixes Required:**
- [ ] Add persistent notification for Foreground Service
- [ ] Implement service restart on boot via BroadcastReceiver
- [ ] Add proper error handling in BlockingModule.java
- [ ] Test AccessibilityService activation flow
- [ ] Add visual feedback when blocking is active

---

### 2. Weekly Time Data Incorrect
**Problem:** Das Weekly Chart zeigt falsche/keine Daten.

**Root Cause Analysis:**
- `getWeeklyUsage()` gibt möglicherweise leeres Array zurück
- Timezone-Offset nicht berücksichtigt
- Cache nicht aktualisiert

**Fixes Required:**
- [ ] Add timezone support to usage stats queries
- [ ] Implement proper date range calculation (Monday-Sunday)
- [ ] Add fallback data for debugging
- [ ] Log actual values returned from native module
- [ ] Verify UsageStatsManager interval settings

---

## 🟡 HIGH PRIORITY FEATURES

### 3. Real-Time Usage Tracking
- [ ] Show live screen time in notification
- [ ] Update dashboard automatically every 60 seconds
- [ ] Background sync for accurate data

### 4. Push Notifications
- [ ] Daily summary notification (evening)
- [ ] Limit reached warnings
- [ ] Streak achievements
- [ ] Detox reminders

### 5. Widget Support
- [ ] Home screen widget with daily usage
- [ ] Quick stats widget (1x1)
- [ ] Progress widget (2x2)

---

## 🟢 UI/UX IMPROVEMENTS

### Dashboard
- [ ] Animated number transitions
- [ ] Pull-to-refresh for data
- [ ] Skeleton loading states
- [ ] Haptic feedback on interactions
- [ ] Weekly chart with actual dates (not just MO, TU)

### Cards & Design
- [ ] More subtle shadows (currently too heavy)
- [ ] Consistent icon sizes
- [ ] Better color contrast for accessibility
- [ ] Smooth page transitions

### Navigation
- [ ] Gesture-based navigation
- [ ] Tab bar badge for active limits
- [ ] Quick actions from long-press

---

## 🔵 NEW FEATURE IDEAS

### Phase 1 - Core Improvements
1. **Focus Mode** - Schedule screen-free hours
2. **App Categories** - Group limits (Social, Games, etc.)
3. **Daily Goals** - Set target screen time
4. **Usage Insights** - Weekly/Monthly reports

### Phase 2 - Social Features
5. **Family Sharing** - Monitor kids' usage
6. **Friends Leaderboard** - Compare with friends
7. **Accountability Partner** - Share progress

### Phase 3 - Gamification
8. **Achievements System** - Unlock badges
9. **Streak Rewards** - Visual rewards for consistency
10. **Level System** - XP for staying focused

### Phase 4 - Advanced
11. **Location-based Rules** - Different limits at work/home
12. **Schedule Templates** - Weekday vs Weekend limits
13. **AI Suggestions** - Personalized recommendations
14. **Export Data** - CSV/PDF reports

---

## 📱 PERMISSION CHECKLIST

For blocking to work, ALL of these must be granted:

| Permission | Required For | How to Grant |
|-----------|-------------|--------------|
| Usage Stats | Reading app usage | Settings → Apps → Special Access → Usage Access |
| Overlay | Showing block screen | Settings → Apps → Special Access → Display over apps |
| Battery | Keep service running | Settings → Battery → Unrestricted |
| Accessibility | Detecting app launches | Settings → Accessibility → Blockd |
| Notifications | Foreground service | Auto-granted on Android 13+ |

---

## 🛠️ TECHNICAL DEBT

- [ ] Refactor BlockingModule.java to Kotlin
- [ ] Add unit tests for limitsService
- [ ] Implement proper error boundaries in React
- [ ] Add crash reporting (Sentry/Firebase Crashlytics)
- [ ] Optimize bundle size
- [ ] Add ProGuard rules for release builds

---

## 📊 TESTING MATRIX

| Feature | Tested | Working | Notes |
|---------|--------|---------|-------|
| Onboarding Flow | ✅ | ✅ | Smooth animations |
| Permission Flow | ✅ | ⚠️ | Need to verify all 5 |
| Dashboard UI | ✅ | ✅ | Premium design |
| Weekly Chart | ✅ | ❌ | Wrong data |
| App Limits | ⚠️ | ❌ | Overlay not showing |
| Detox Mode | ⚠️ | ❌ | Same as limits |
| Streaks | ❌ | ❌ | Not tested |
| Name Editing | ✅ | ✅ | Works with Firebase |

---

## 🎯 IMMEDIATE NEXT STEPS

1. **Debug BlockingService** - Add logs and test on device
2. **Check AccessibilityService** - Verify it's enabled
3. **Test Overlay** - Create simple test overlay
4. **Fix Weekly Data** - Add timezone support
5. **Add Foreground Notification** - Required for persistent service

---
