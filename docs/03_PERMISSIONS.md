# Blockd - Permissions Guide

> Complete reference for all Android permissions required by Blockd

---

## 📋 Permission Summary

| # | Permission | Type | Purpose | Required |
|---|------------|------|---------|----------|
| 1 | Usage Stats | Settings | Read app usage data | ✅ Critical |
| 2 | Overlay | Settings | Show blocking screen | ✅ Critical |
| 3 | Battery | Dialog | Background running | ⚠️ Recommended |
| 4 | Accessibility | Settings | Real-time app detection | ✅ Critical |
| 5 | Notifications | Runtime | Warnings & reminders | ⚠️ Recommended |
| 6 | Foreground Service | Auto | Continuous monitoring | ✅ Auto-granted |
| 7 | Boot Completed | Auto | Auto-start after reboot | ✅ Auto-granted |
| 8 | Query All Packages | Manifest | List installed apps | ✅ Auto-granted |

---

## 🔐 Detailed Permission Guide

### 1. Usage Stats (`PACKAGE_USAGE_STATS`)

**Why it's needed:**
- Read which apps are installed
- Get daily/weekly usage statistics
- Track time spent in each app

**How to grant:**
```
Settings → Apps → Special access → Usage access → Blockd → ON
```

**Native check:**
```java
AppOpsManager appOps = context.getSystemService(AppOpsManager.class);
int mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, 
    uid, context.getPackageName());
return mode == AppOpsManager.MODE_ALLOWED;
```

---

### 2. Overlay (`SYSTEM_ALERT_WINDOW`)

**Why it's needed:**
- Display blocking screen over other apps
- Show limit warnings and timers
- Present the "Cancel Flow" overlay

**How to grant:**
```
Settings → Apps → Special access → Display over other apps → Blockd → ON
```

**Native check:**
```java
Settings.canDrawOverlays(context);
```

---

### 3. Battery Optimization

**Why it's needed:**
- Prevent Android from killing Blockd in background
- Ensure 24/7 monitoring

**How to grant:**
```
Settings → Apps → Blockd → Battery → Unrestricted
```

**Native code:**
```java
PowerManager pm = context.getSystemService(PowerManager.class);
pm.isIgnoringBatteryOptimizations(context.getPackageName());
```

---

### 4. Accessibility Service (`BIND_ACCESSIBILITY_SERVICE`)

**Why it's needed:**
- Detect app launches in real-time (milliseconds)
- Required for reliable blocking
- Cannot be replaced by polling

**How to grant (Android 12 and below):**
```
Settings → Accessibility → Installed services → Blockd → ON
```

**How to grant (Android 13+):**
> ⚠️ Android 13+ blocks this for sideloaded apps by default!

Step-by-step:
1. Open **Settings → Apps → Blockd**
2. Tap **⋮** (three dots, top-right)
3. Select **"Allow restricted settings"**
4. Authenticate (fingerprint/PIN)
5. Go to **Settings → Accessibility**
6. Find **Blockd** and enable it

**AndroidManifest declaration:**
```xml
<service
    android:name=".BlockingAccessibilityService"
    android:exported="true"
    android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
    android:label="@string/app_name">
    <intent-filter>
        <action android:name="android.accessibilityservice.AccessibilityService" />
    </intent-filter>
    <meta-data
        android:name="android.accessibilityservice"
        android:resource="@xml/accessibility_service_config" />
</service>
```

---

### 5. Notifications (`POST_NOTIFICATIONS`)

**Why it's needed (Android 13+):**
- Show limit warnings (5 min remaining)
- Display "Blockd is active" notification
- Alert when streak is at risk

**How to grant:**
- Runtime permission dialog appears automatically
- Or: Settings → Apps → Blockd → Notifications → ON

---

### 6. Foreground Service (`FOREGROUND_SERVICE`)

**Why it's needed:**
- Keep Blockd process alive 24/7
- Display persistent notification
- Prevent system from killing the app

**Auto-granted:** Yes, declared in manifest.

```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
```

---

### 7. Boot Completed (`RECEIVE_BOOT_COMPLETED`)

**Why it's needed:**
- Automatically start Blockd after device reboot
- Resume monitoring without user intervention

**Auto-granted:** Yes, declared in manifest.

---

### 8. Query All Packages (`QUERY_ALL_PACKAGES`)

**Why it's needed:**
- List all installed apps for limit selection
- Get app names and icons

**Auto-granted:** Yes, declared in manifest (with Play Store review implications).

---

## 🔧 React Native Bridge Methods

```typescript
// PermissionsModule
NativeModules.PermissionsModule.hasUsageStatsPermission(): Promise<boolean>
NativeModules.PermissionsModule.requestUsageStatsPermission(): void
NativeModules.PermissionsModule.hasOverlayPermission(): Promise<boolean>
NativeModules.PermissionsModule.requestOverlayPermission(): void
NativeModules.PermissionsModule.isIgnoringBatteryOptimizations(): Promise<boolean>
NativeModules.PermissionsModule.requestBatteryOptimization(): void

// BlockingModule
NativeModules.BlockingModule.isAccessibilityEnabled(): Promise<boolean>
NativeModules.BlockingModule.openAccessibilitySettings(): void
NativeModules.BlockingModule.openAppSettings(): void
NativeModules.BlockingModule.startForegroundService(): void
NativeModules.BlockingModule.stopForegroundService(): void
```

---

## ⚠️ Common Issues

### "Restricted Setting" Error (Android 13+)
**Problem:** User can't enable Accessibility service.
**Solution:** Guide user to App Info → ⋮ → "Allow restricted settings" first.

### Foreground Service Killed
**Problem:** Notification disappears, blocking stops.
**Solution:** 
1. Disable battery optimization
2. Lock app in recent apps (if supported)
3. Check OEM-specific battery settings (Samsung, Xiaomi, etc.)

### Overlay Not Showing
**Problem:** Block screen doesn't appear.
**Solution:** Ensure "Display over other apps" is enabled AND app is running in background.
