# Android Permissions

## Required Permissions

### 1. Usage Stats Permission
**Purpose**: Read app usage statistics
**How to get**: `Settings → Apps → Special access → Usage access`
**Code**: `UsageStatsManager`

### 2. Accessibility Service ⭐ CRITICAL
**Purpose**: Detect when any app is opened
**How to get**: `Settings → Accessibility → Blockd`
**Code**: `BlockingAccessibilityService.java`

This is the core of app blocking. Without this, blocking doesn't work!

### 3. Display Over Other Apps (Overlay)
**Purpose**: Show blocking overlays
**How to get**: `Settings → Apps → Special access → Display over other apps`
**Code**: `TYPE_ACCESSIBILITY_OVERLAY` (doesn't require separate permission when using AccessibilityService)

### 4. Notifications
**Purpose**: Show blocking notifications, reminders
**Code**: Standard notification permission

### 5. Foreground Service
**Purpose**: Keep blocking service alive (especially on MIUI/Xiaomi)
**Code**: `AppBlockForegroundService.java`

## Permission Check Flow

```typescript
// In OnboardingPermissions.tsx
const checkPermissions = async () => {
  const hasUsageStats = await BlockingModule.hasUsageStatsPermission();
  const hasAccessibility = await BlockingModule.isAccessibilityServiceEnabled();
  // ... etc
};
```

## MIUI/Xiaomi Special Requirements

On Xiaomi/Poco devices, also enable:
1. **Autostart**: Settings → Apps → Blockd → Autostart
2. **No Battery Restrictions**: Settings → Battery → Blockd → No restrictions
3. **Lock in Recent Apps**: Long press app in recents → Lock

## Native Module Methods

```java
// BlockingModule.java
@ReactMethod
public void hasUsageStatsPermission(Promise promise) { ... }

@ReactMethod
public void requestUsageStatsPermission() { ... }

@ReactMethod
public void isAccessibilityServiceEnabled(Promise promise) { ... }

@ReactMethod
public void openAccessibilitySettings() { ... }
```
