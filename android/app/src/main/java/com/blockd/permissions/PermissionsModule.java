package com.blockd.permissions;

import android.app.AppOpsManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class PermissionsModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public PermissionsModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "PermissionsModule";
    }

    // ============================================
    // USAGE STATS PERMISSION
    // ============================================

    @ReactMethod
    public void checkUsageStatsPermission(Promise promise) {
        try {
            AppOpsManager appOps = (AppOpsManager) reactContext.getSystemService(Context.APP_OPS_SERVICE);
            int mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                reactContext.getPackageName()
            );
            promise.resolve(mode == AppOpsManager.MODE_ALLOWED);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void requestUsageStatsPermission(Promise promise) {
        try {
            Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    // ============================================
    // OVERLAY (SYSTEM ALERT WINDOW) PERMISSION
    // ============================================

    @ReactMethod
    public void checkOverlayPermission(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                promise.resolve(Settings.canDrawOverlays(reactContext));
            } else {
                promise.resolve(true);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void requestOverlayPermission(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Intent intent = new Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + reactContext.getPackageName())
                );
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
            }
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    // ============================================
    // BATTERY OPTIMIZATION PERMISSION
    // ============================================

    @ReactMethod
    public void checkBatteryOptimization(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PowerManager pm = (PowerManager) reactContext.getSystemService(Context.POWER_SERVICE);
                promise.resolve(pm.isIgnoringBatteryOptimizations(reactContext.getPackageName()));
            } else {
                promise.resolve(true);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void requestIgnoreBatteryOptimization(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                intent.setData(Uri.parse("package:" + reactContext.getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
            }
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    // ============================================
    // CHECK ALL PERMISSIONS AT ONCE
    // ============================================

    @ReactMethod
    public void checkAllPermissions(Promise promise) {
        try {
            com.facebook.react.bridge.WritableMap result = com.facebook.react.bridge.Arguments.createMap();
            
            // Usage Stats
            AppOpsManager appOps = (AppOpsManager) reactContext.getSystemService(Context.APP_OPS_SERVICE);
            int mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                reactContext.getPackageName()
            );
            result.putBoolean("usageStats", mode == AppOpsManager.MODE_ALLOWED);
            
            // Overlay
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                result.putBoolean("overlay", Settings.canDrawOverlays(reactContext));
            } else {
                result.putBoolean("overlay", true);
            }
            
            // Battery
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PowerManager pm = (PowerManager) reactContext.getSystemService(Context.POWER_SERVICE);
                result.putBoolean("battery", pm.isIgnoringBatteryOptimizations(reactContext.getPackageName()));
            } else {
                result.putBoolean("battery", true);
            }
            
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    // ============================================
    // GET APP USAGE STATS
    // ============================================

    @ReactMethod
    public void getAppUsageStats(int days, Promise promise) {
        try {
            android.app.usage.UsageStatsManager usageStatsManager = 
                (android.app.usage.UsageStatsManager) reactContext.getSystemService(Context.USAGE_STATS_SERVICE);
            
            if (usageStatsManager == null) {
                promise.resolve(com.facebook.react.bridge.Arguments.createArray());
                return;
            }

            long endTime = System.currentTimeMillis();
            long startTime = endTime - ((long) days * 24 * 60 * 60 * 1000L);

            java.util.List<android.app.usage.UsageStats> stats = 
                usageStatsManager.queryUsageStats(
                    android.app.usage.UsageStatsManager.INTERVAL_DAILY,
                    startTime,
                    endTime
                );

            com.facebook.react.bridge.WritableArray result = com.facebook.react.bridge.Arguments.createArray();
            android.content.pm.PackageManager pm = reactContext.getPackageManager();

            // Aggregate stats by package
            java.util.Map<String, Long> usageMap = new java.util.HashMap<>();
            if (stats != null) {
                for (android.app.usage.UsageStats stat : stats) {
                    String pkg = stat.getPackageName();
                    long time = stat.getTotalTimeInForeground();
                    Long existing = usageMap.get(pkg);
                    usageMap.put(pkg, (existing != null ? existing : 0L) + time);
                }
            }

            // Convert to array and get app names
            for (java.util.Map.Entry<String, Long> entry : usageMap.entrySet()) {
                try {
                    String packageName = entry.getKey();
                    long totalMs = entry.getValue();
                    int avgMinutesPerDay = (int) ((totalMs / 1000 / 60) / days);
                    
                    if (avgMinutesPerDay < 5) continue; // Filter out rarely used apps

                    android.content.pm.ApplicationInfo appInfo = pm.getApplicationInfo(packageName, 0);
                    String appName = (String) pm.getApplicationLabel(appInfo);

                    com.facebook.react.bridge.WritableMap app = com.facebook.react.bridge.Arguments.createMap();
                    app.putString("packageName", packageName);
                    app.putString("appName", appName);
                    app.putInt("usageMinutes", avgMinutesPerDay);
                    result.pushMap(app);
                } catch (Exception ignored) {
                    // App not found, skip
                }
            }

            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
}
