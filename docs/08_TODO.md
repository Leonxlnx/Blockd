# TODO - Remaining Work

## 🔴 Critical (Must Have)

### 1. Daily Limit Time Tracking
**Status**: Not implemented
**What's needed**:
- [ ] Track actual time spent in blocked apps
- [ ] Store daily usage in AsyncStorage/Firestore
- [ ] Reset at midnight
- [ ] Trigger `limit_exceeded` when time runs out
- [ ] Show remaining time in overlay

**Files to modify**:
- `BlockingModule.java`: Add `usageTracker` map
- `OverlayManager.tsx`: Handle `limit_exceeded` type
- `limitsService.ts`: Add `usedTodayMinutes` field

### 2. Detox Days Calculation
**Status**: Partial
**What's needed**:
- [ ] Calculate remaining days from `detoxEndDate`
- [ ] Pass to overlay correctly
- [ ] Show "X days remaining" in overlay

### 3. Persist Limits to Native
**Status**: Working but needs verification
**What's needed**:
- [ ] Ensure limits survive app restart
- [ ] Ensure limits survive device restart
- [ ] ForegroundService should reload limits on boot

---

## 🟡 Important (Should Have)

### 4. App Icons in Overlay
**Status**: Placeholder only
**What's needed**:
- [ ] Load actual app icon in overlay
- [ ] Store app icon path in limit
- [ ] Display in React Native Image

### 5. handleExit Function
**Status**: Does nothing
**What's needed**:
- [ ] Actually navigate to home screen
- [ ] Use native module to press home button

**Code**:
```java
// BlockingModule.java
@ReactMethod
public void goToHome() {
    Intent intent = new Intent(Intent.ACTION_MAIN);
    intent.addCategory(Intent.CATEGORY_HOME);
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    reactContext.startActivity(intent);
}
```

### 6. Limit Details in Overlay
**Status**: Basic info only
**What's needed**:
- [ ] Show limit mode (Detox vs Daily Limit)
- [ ] Show daily limit duration
- [ ] Show time used today
- [ ] Show streak info

---

## 🟢 Nice to Have

### 7. Onboarding Fixes
- [ ] Skip if permissions already granted
- [ ] Remember onboarding completed
- [ ] Don't show again on reinstall

### 8. Settings Screen
- [ ] Edit name
- [ ] Change notification preferences
- [ ] Link to permission settings
- [ ] Clear all data option

### 9. Dashboard Improvements
- [ ] Real usage data (not dummy)
- [ ] Weekly chart with real data
- [ ] "Most used" from UsageStats

### 10. Error Handling
- [ ] Handle Firestore offline
- [ ] Handle permission revoked
- [ ] Handle service killed gracefully

---

## 📁 Code Quality

### Cleanup
- [ ] Remove unused imports
- [ ] Add TypeScript types everywhere
- [ ] Add JSDoc comments to key functions
- [ ] Consistent naming conventions

### Testing
- [ ] Unit tests for limitsService
- [ ] Integration tests for blocking flow
- [ ] UI tests for overlays
