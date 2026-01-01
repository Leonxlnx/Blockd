# Blocking System Debug Guide

## Current Implementation (Working ✅)

### Flow
```
BlockingAccessibilityService.onAccessibilityEvent()
    ↓
Check if package in blockedPackages
    ↓
launchBlockOverlay(packageName)
    ↓
MainActivity.onNewIntent() → setIntent(intent)
    ↓
OverlayManager: AppState 'active' → checkBlockStatus()
    ↓
BlockingModule.checkInitialLaunch() → reads intent extras
    ↓
sendEvent("onAppBlocked", params)
    ↓
React Native overlay appears
```

### Key Files
| File | Purpose |
|------|---------|
| `BlockingAccessibilityService.java` | Detects app launches |
| `BlockingModule.java` | Bridge between native and React Native |
| `MainActivity.kt` | Handles onNewIntent |
| `OverlayManager.tsx` | Manages overlay state |
| `OverlayScreens.tsx` | Overlay UI components |

## Debugging Checklist

### Overlay Not Showing?
1. ☐ Is AccessibilityService enabled?
2. ☐ Is the app in blockedPackages?
3. ☐ Check Logcat for "BLOCKED APP DETECTED"
4. ☐ Check if onNewIntent is called
5. ☐ Check if checkInitialLaunch returns the package

### Overlay Disappears/Flickers?
1. ☐ REMOVED: SystemUI from hide list (was causing flicker)
2. ☐ Only hide on home/launcher navigation
3. ☐ BackHandler blocks back button

### Service Killed on MIUI?
1. ☐ Enable Autostart
2. ☐ Disable battery optimization
3. ☐ Lock app in recents
4. ☐ ForegroundService running?

## Logcat Commands

```bash
# Filter Blockd logs
adb logcat | grep -E "BlockingA11yService|BlockingModule|Blockd"

# All app logs
adb logcat -s ReactNative:V ReactNativeJS:V
```

## Testing Procedure

1. Add app to limits (e.g., YouTube)
2. Close Blockd completely (swipe from recents)
3. Open YouTube
4. **Expected**: Blockd opens with overlay
5. Press back button
6. **Expected**: Nothing happens (blocked)
7. Press "Exit App"
8. **Expected**: Go to home screen
