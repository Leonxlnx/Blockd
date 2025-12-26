# Blocking & Overlay Debug Guide

**Last Updated:** December 26, 2024

---

## 🚨 WARUM BLOCKING NICHT FUNKTIONIERT

Es gibt 5 kritische Komponenten die alle funktionieren müssen:

### 1. BlockingService (Background Service)
**Datei:** `android/app/src/main/java/com/blockd/BlockingService.java`

**Was es tut:** Läuft im Hintergrund und überwacht app launches.

**Mögliche Probleme:**
- Service wird nicht gestartet
- Service wird vom System gekillt (Battery Optimization)
- Service hat keine Foreground Notification (required seit Android 8+)

**Quick Fix - Foreground Service Notification:**
```java
// In BlockingService.java, add to onStartCommand():
Notification notification = new NotificationCompat.Builder(this, "blocking_channel")
    .setContentTitle("Blockd")
    .setContentText("Monitoring your screen time")
    .setSmallIcon(R.mipmap.ic_launcher)
    .build();
startForeground(1, notification);
```

---

### 2. AccessibilityService
**Datei:** `android/app/src/main/java/com/blockd/BlockingAccessibilityService.java`

**Was es tut:** Erkennt wenn Apps geöffnet werden via AccessibilityEvent.

**Mögliche Probleme:**
- User hat Service nicht aktiviert
- Service nicht in AndroidManifest registriert
- Falscher Event Type

**Prüfen:**
```bash
# Check if accessibility service is enabled
adb shell settings get secure enabled_accessibility_services
# Should contain: com.blockd/.BlockingAccessibilityService
```

**Manuell aktivieren:**
Settings → Accessibility → Installed Services → Blockd → Enable

---

### 3. Overlay Window
**Datei:** `android/app/src/main/java/com/blockd/BlockingModule.java`

**Was es tut:** Zeigt ein Vollbild-Overlay wenn geblockte App erkannt wird.

**Mögliche Probleme:**
- SYSTEM_ALERT_WINDOW Permission nicht erteilt
- WindowManager.LayoutParams falsch konfiguriert
- Overlay View wird nicht richtig erstellt

**Permission prüfen:**
```bash
adb shell appops get com.blockd SYSTEM_ALERT_WINDOW
# Should show: SYSTEM_ALERT_WINDOW: allow
```

**Manuell aktivieren:**
Settings → Apps → Special App Access → Display over other apps → Blockd → Allow

---

### 4. Limits Storage
**Datei:** `src/services/limitsService.ts`

**Was es tut:** Speichert Limits in AsyncStorage und synct zu native Module.

**Mögliche Probleme:**
- Limits werden nicht gespeichert
- Limits werden nicht an BlockingModule übertragen
- PackageNames sind falsch

**Debug in React:**
```typescript
// In MainApp.tsx, add:
console.log('Active limits:', limits);
console.log('Limit packages:', limits.map(l => l.packageName));
```

---

### 5. Native-JS Bridge
**Problem:** JS speichert limits aber Native weiß nichts davon.

**Check in BlockingModule.java:**
```java
@ReactMethod
public void addBlockedApp(String packageName, String mode, double endTime, int limitMinutes) {
    Log.d("BlockingModule", "Adding blocked app: " + packageName);
    // ... rest of method
}
```

---

## 🔧 STEP-BY-STEP DEBUG

### Step 1: Verify All Permissions
```javascript
// In React, add to MainApp:
import { Permissions } from '../native/Permissions';

const checkAll = async () => {
    const perms = await Permissions.checkAllPermissions();
    console.log('Usage Stats:', perms.usageStats);
    console.log('Overlay:', perms.overlay);
    console.log('Battery:', perms.battery);
    // Add toast/alert to show results
};
```

### Step 2: Test Overlay Manually
```java
// In BlockingModule.java, add test method:
@ReactMethod
public void testOverlay(Promise promise) {
    Activity activity = getCurrentActivity();
    if (activity != null) {
        activity.runOnUiThread(() -> {
            showBlockingOverlay("Test App", "com.test.app");
        });
    }
    promise.resolve(true);
}
```

### Step 3: Check Service Status
```java
// Add to BlockingService:
@Override
public int onStartCommand(Intent intent, int flags, int startId) {
    Log.d("BlockingService", "Service started!");
    Toast.makeText(this, "Blocking Service Active", Toast.LENGTH_SHORT).show();
    return START_STICKY;
}
```

### Step 4: Test Accessibility Events
```java
// In BlockingAccessibilityService:
@Override
public void onAccessibilityEvent(AccessibilityEvent event) {
    String packageName = event.getPackageName().toString();
    Log.d("Accessibility", "App opened: " + packageName);
    // Test: Show toast for EVERY app open
    // Toast.makeText(this, "Detected: " + packageName, Toast.LENGTH_SHORT).show();
}
```

---

## 📋 COMPLETE CHECKLIST

### Before Testing:
- [ ] Uninstall old app version
- [ ] Install fresh APK
- [ ] Complete full onboarding (all 5 permission screens)
- [ ] Verify each permission was granted

### During Testing:
- [ ] Add a test limit (e.g., YouTube 1 minute)
- [ ] Open limited app
- [ ] Wait for limit to be reached
- [ ] Check if overlay appears

### If Not Working:
- [ ] Check ADB logs: `adb logcat | grep -i blockd`
- [ ] Check if service is running: `adb shell dumpsys activity services com.blockd`
- [ ] Manually test overlay with test button
- [ ] Re-grant all permissions

---

## 🔄 KNOWN ISSUES & WORKAROUNDS

### Issue 1: Service Killed
**Symptom:** Blocking works initially then stops.
**Cause:** Android kills background services.
**Fix:** Must use Foreground Service with persistent notification.

### Issue 2: Accessibility Disabled
**Symptom:** App opens aren't detected.
**Cause:** User didn't enable accessibility service.
**Fix:** Add check on app start, redirect to settings if not enabled.

### Issue 3: Overlay Permission Revoked
**Symptom:** No overlay appears.
**Cause:** User or system revoked permission.
**Fix:** Check permission on each block attempt, request if not granted.

### Issue 4: Wrong Package Name
**Symptom:** Wrong apps get blocked or none.
**Cause:** Package name mismatch.
**Fix:** Log actual package names and compare with stored limits.

---

## 💡 RECOMMENDED ARCHITECTURE

```
┌──────────────────────────────────────────────────────┐
│                    React Native                       │
│  ┌───────────────┐    ┌────────────────────────────┐ │
│  │ LimitsService │───▶│ BlockingModule (JS Bridge) │ │
│  └───────────────┘    └────────────────────────────┘ │
└────────────────────────────────┬─────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────┐
│                   Native Android                      │
│  ┌──────────────────┐    ┌────────────────────────┐  │
│  │ BlockingModule   │───▶│ BlockedApps HashMap    │  │
│  └──────────────────┘    └────────────────────────┘  │
│           │                         ▲                 │
│           ▼                         │                 │
│  ┌──────────────────┐    ┌────────────────────────┐  │
│  │ BlockingService  │◀──▶│ AccessibilityService   │  │
│  │ (Foreground)     │    │ (Detects app opens)    │  │
│  └──────────────────┘    └────────────────────────┘  │
│           │                                           │
│           ▼                                           │
│  ┌──────────────────────────────────────────────┐    │
│  │          Overlay Window Manager               │    │
│  │          (Shows blocking screen)              │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

---
