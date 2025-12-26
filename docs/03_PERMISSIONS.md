# Blockd - Permissions Guide

> Detailed explanation of all 5 Android permissions required for Blockd

**Last Updated:** December 26, 2024

---

## 📋 Permission Overview

Blockd requires **5 critical permissions** to function properly:

| # | Permission | Required | Purpose | Android API |
|---|------------|----------|---------|-------------|
| 1 | Usage Stats | ✅ Yes | Track app usage time | USAGE_ACCESS_SETTINGS |
| 2 | Overlay | ✅ Yes | Show blocking screen | SYSTEM_ALERT_WINDOW |
| 3 | Battery Optimization | ⚠️ Recommended | Keep service alive | IGNORE_BATTERY_OPTIMIZATIONS |
| 4 | Accessibility | ✅ Yes | Detect app launches | BIND_ACCESSIBILITY_SERVICE |
| 5 | Notifications | ✅ Auto (13+) | Foreground service | POST_NOTIFICATIONS |

---

## 1️⃣ Usage Stats Permission

### What It Does
Allows Blockd to read UsageStatsManager data to track:
- Time spent in each app
- Number of app opens
- Daily/weekly usage patterns

### How It Works
```java
AppOpsManager appOps = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);
int mode = appOps.checkOpNoThrow(
    AppOpsManager.OPSTR_GET_USAGE_STATS,
    Process.myUid(),
    context.getPackageName()
);
boolean granted = (mode == AppOpsManager.MODE_ALLOWED);
```

### User Flow
1. Blockd requests permission via `Settings.ACTION_USAGE_ACCESS_SETTINGS`
2. User navigates to Settings → Apps → Special Access → Usage Access
3. User finds "Blockd" and toggles ON
4. User returns to app (detected via AppState listener)

### Checking Status
```typescript
const hasUsageStats = await Permissions.checkUsageStatsPermission();
```

### Why Required
Without this, Blockd can't:
- Show accurate screen time
- Know when daily limits are exceeded
- Display weekly usage charts

---

## 2️⃣ Overlay Permission

### What It Does
Grants `SYSTEM_ALERT_WINDOW` permission to display fullscreen overlays on top of other apps.

### How It Works
```java
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
    boolean canDraw = Settings.canDrawOverlays(context);
}
```

### User Flow
1. Blockd opens `Settings.ACTION_MANAGE_OVERLAY_PERMISSION`
2. System shows "Display over other apps" settings
3. User finds Blockd and enables permission
4. Returns to app

### Implementation
```java
WindowManager.LayoutParams params = new WindowManager.LayoutParams(
    WindowManager.LayoutParams.MATCH_PARENT,
    WindowManager.LayoutParams.MATCH_PARENT,
    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
    PixelFormat.TRANSLUCENT
);
windowManager.addView(overlayView, params);
```

### Why Required
This is THE core blocking mechanism. Without it:
- No blocking overlay appears
- Limits are useless
- App is just a tracker

---

## 3️⃣ Battery Optimization

### What It Does
Exempts Blockd from Doze mode and App Standby to keep services running 24/7.

### How It Works
```java
PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
boolean isIgnoring = pm.isIgnoringBatteryOptimizations(context.getPackageName());
```

### User Flow
1. Request via `Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`
2. System dialog appears: "Allow Blockd to ignore battery optimizations?"
3. User taps "Allow"

### Why Recommended
- Android aggressively kills background services
- Without this, blocking service stops after ~10 minutes
- **Critical for overnight blocking**

### Alternative
Use Foreground Service with persistent notification (we do both).

---

## 4️⃣ Accessibility Service

### What It Does
Most powerful permission - detects all app opens in real-time via AccessibilityEvent.

### How It Works
```java
// BlockingAccessibilityService.java
@Override
public void onAccessibilityEvent(AccessibilityEvent event) {
    if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
        String packageName = event.getPackageName().toString();
        // Check if app is blocked
        if (blockedApps.contains(packageName)) {
            showBlockingOverlay(packageName);
        }
    }
}
```

### User Flow (Android 13+)
**Complex due to Restricted Settings:**

1. **In-App Step**: User taps "Enable Accessibility"
2. **System Redirects**: Opens Accessibility Settings
3. **Finds Service**: User scrolls to "Blockd"
4. **Restricted Warning**: "Restricted settings - Open app info"
5. **App Info**: Taps ⋮ menu → "Allow restricted settings"
6. **Confirmation**: System asks to confirm
7. **Back to Accessibility**: User returns and enables Blockd
8. **Confirmation Dialog**: "Allow Blockd to access...?"
9. **Enable**: User taps "Allow"

### Why So Complex
Android 13+ introduced "Restricted Settings" to prevent malware from enabling dangerous permissions without user knowledge.

### Checking Status
```bash
adb shell settings get secure enabled_accessibility_services
# Should contain: com.blockd/.BlockingAccessibilityService
```

### Why Required
This is the **heart of real-time blocking**:
- Detects app opens in <50ms
- Works even if service is killed
- Can't be bypassed by user

---

## 5️⃣ Notification Permission

### What It Does
Allows showing notifications, required for Foreground Service.

### How It Works
```java
// Android 13+ (Tiramisu)
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
    if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
        != PackageManager.PERMISSION_GRANTED) {
        requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQUEST_CODE);
    }
}
```

### User Flow
- **Android 12 and below**: Auto-granted
- **Android 13+**: System dialog appears on first notification

### Why Required
Foreground Services MUST show a persistent notification:
```java
Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
    .setContentTitle("Blockd")
    .setContentText("Monitoring your screen time")
    .setSmallIcon(R.mipmap.ic_launcher)
    .build();
startForeground(NOTIFICATION_ID, notification);
```

---

## 🔒 Permission Best Practices

### Request Order
We request in this specific order for UX reasons:
1. **Usage Stats** - Least scary, builds trust
2. **Overlay** - Visual demonstration of what it does
3. **Battery** - Explains "always running"
4. **Accessibility** - Most complex, saved for last

### Permission Persistence
- All permissions persist across app updates
- User can revoke at any time
- We check on each app start and before critical actions

### Handling Denials
```typescript
if (!hasOverlay) {
  Alert.alert(
    'Permission Required',
    'Blockd needs overlay permission to block apps. Please enable it in settings.',
    [{ text: 'Open Settings', onPress: () => Permissions.requestOverlayPermission() }]
  );
}
```

---

## 🧪 Testing Permissions

### Check All At Once
```typescript
const allPerms = await Permissions.checkAllPermissions();
console.log('Usage Stats:', allPerms.usageStats);
console.log('Overlay:', allPerms.overlay);
console.log('Battery:', allPerms.battery);
```

### ADB Commands
```bash
# Usage Stats
adb shell appops get com.blockd GET_USAGE_STATS

# Overlay
adb shell appops get com.blockd SYSTEM_ALERT_WINDOW

# Battery
adb shell dumpsys battery

# Accessibility
adb shell settings get secure enabled_accessibility_services

# Revoke overlay (for testing)
adb shell appops set com.blockd SYSTEM_ALERT_WINDOW deny
```

---

## ⚠️ Common Issues

### Issue 1: Accessibility Not Enabling
**Symptom**: Service toggle grayed out
**Cause**: Restricted Settings on Android 13+
**Fix**: Follow the "Allow restricted settings" flow

### Issue 2: Service Stops After Time
**Symptom**: Blocking works then stops
**Cause**: Battery optimization killing service
**Fix**: Request battery exemption + use Foreground Service

### Issue 3: Overlay Not Showing
**Symptom**: Limit reached but no overlay
**Cause**: Permission revoked or service not running
**Fix**: Check permission status and restart service

---

## 📚 Android Documentation

- [UsageStatsManager](https://developer.android.com/reference/android/app/usage/UsageStatsManager)
- [Overlay Permission](https://developer.android.com/reference/android/provider/Settings#ACTION_MANAGE_OVERLAY_PERMISSION)
- [Accessibility Service](https://developer.android.com/guide/topics/ui/accessibility/service)
- [Battery Optimization](https://developer.android.com/training/monitoring-device-state/doze-standby)
- [Foreground Services](https://developer.android.com/guide/components/foreground-services)

---
