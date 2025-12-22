package com.blockd.permissions;

import android.app.AppOpsManager;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import android.util.Base64;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    // OVERLAY PERMISSION
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
    // BATTERY OPTIMIZATION
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
    // CHECK ALL PERMISSIONS
    // ============================================

    @ReactMethod
    public void checkAllPermissions(Promise promise) {
        try {
            WritableMap result = Arguments.createMap();
            
            AppOpsManager appOps = (AppOpsManager) reactContext.getSystemService(Context.APP_OPS_SERVICE);
            int mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                android.os.Process.myUid(),
                reactContext.getPackageName()
            );
            result.putBoolean("usageStats", mode == AppOpsManager.MODE_ALLOWED);
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                result.putBoolean("overlay", Settings.canDrawOverlays(reactContext));
            } else {
                result.putBoolean("overlay", true);
            }
            
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
    // GET SCREEN UNLOCK COUNT TODAY
    // ============================================

    @ReactMethod
    public void getUnlockCountToday(Promise promise) {
        try {
            UsageStatsManager usm = (UsageStatsManager) reactContext.getSystemService(Context.USAGE_STATS_SERVICE);
            
            // Start of today (00:00)
            Calendar cal = Calendar.getInstance();
            cal.set(Calendar.HOUR_OF_DAY, 0);
            cal.set(Calendar.MINUTE, 0);
            cal.set(Calendar.SECOND, 0);
            cal.set(Calendar.MILLISECOND, 0);
            long startOfDay = cal.getTimeInMillis();
            long now = System.currentTimeMillis();
            
            UsageEvents events = usm.queryEvents(startOfDay, now);
            int unlockCount = 0;
            
            UsageEvents.Event event = new UsageEvents.Event();
            while (events.hasNextEvent()) {
                events.getNextEvent(event);
                // KEYGUARD_HIDDEN event type = 18
                if (event.getEventType() == 18) {
                    unlockCount++;
                }
            }
            
            promise.resolve(unlockCount);
        } catch (Exception e) {
            promise.resolve(0);
        }
    }

    // ============================================
    // GET TODAY'S APP USAGE (from 00:00)
    // ============================================

    @ReactMethod
    public void getTodayUsage(Promise promise) {
        try {
            UsageStatsManager usm = (UsageStatsManager) reactContext.getSystemService(Context.USAGE_STATS_SERVICE);
            PackageManager pm = reactContext.getPackageManager();
            
            // Start of today (00:00)
            Calendar cal = Calendar.getInstance();
            cal.set(Calendar.HOUR_OF_DAY, 0);
            cal.set(Calendar.MINUTE, 0);
            cal.set(Calendar.SECOND, 0);
            cal.set(Calendar.MILLISECOND, 0);
            long startOfDay = cal.getTimeInMillis();
            long now = System.currentTimeMillis();
            
            List<UsageStats> stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startOfDay, now);
            
            WritableArray result = Arguments.createArray();
            
            if (stats == null || stats.isEmpty()) {
                promise.resolve(result);
                return;
            }
            
            // Sort by usage time
            List<UsageStats> sortedStats = new ArrayList<>(stats);
            Collections.sort(sortedStats, (a, b) -> Long.compare(b.getTotalTimeInForeground(), a.getTotalTimeInForeground()));
            
            for (UsageStats stat : sortedStats) {
                String pkg = stat.getPackageName();
                long timeMs = stat.getTotalTimeInForeground();
                int minutes = (int) (timeMs / 1000 / 60);
                
                if (minutes < 1) continue;
                
                // Skip system apps
                if (pkg.contains("launcher") || pkg.contains("systemui") || 
                    pkg.startsWith("com.android.") || pkg.equals(reactContext.getPackageName())) {
                    continue;
                }
                
                try {
                    ApplicationInfo appInfo = pm.getApplicationInfo(pkg, 0);
                    if (pm.getLaunchIntentForPackage(pkg) == null) continue;
                    
                    String appName = (String) pm.getApplicationLabel(appInfo);
                    String iconBase64 = getIconBase64(pm, pkg);
                    
                    WritableMap app = Arguments.createMap();
                    app.putString("packageName", pkg);
                    app.putString("appName", appName);
                    app.putInt("usageMinutes", minutes);
                    app.putString("icon", iconBase64);
                    result.pushMap(app);
                } catch (Exception ignored) {}
            }
            
            promise.resolve(result);
        } catch (Exception e) {
            promise.resolve(Arguments.createArray());
        }
    }

    // ============================================
    // GET WEEKLY USAGE DATA (7 days)
    // ============================================

    @ReactMethod
    public void getWeeklyUsage(Promise promise) {
        try {
            UsageStatsManager usm = (UsageStatsManager) reactContext.getSystemService(Context.USAGE_STATS_SERVICE);
            WritableArray result = Arguments.createArray();
            
            // Go back 7 days
            for (int i = 6; i >= 0; i--) {
                Calendar cal = Calendar.getInstance();
                cal.add(Calendar.DAY_OF_YEAR, -i);
                cal.set(Calendar.HOUR_OF_DAY, 0);
                cal.set(Calendar.MINUTE, 0);
                cal.set(Calendar.SECOND, 0);
                cal.set(Calendar.MILLISECOND, 0);
                long dayStart = cal.getTimeInMillis();
                
                cal.add(Calendar.DAY_OF_YEAR, 1);
                long dayEnd = cal.getTimeInMillis();
                
                if (i == 0) {
                    dayEnd = System.currentTimeMillis();
                }
                
                List<UsageStats> stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, dayStart, dayEnd);
                
                long totalMs = 0;
                if (stats != null) {
                    for (UsageStats stat : stats) {
                        String pkg = stat.getPackageName();
                        if (!pkg.contains("launcher") && !pkg.contains("systemui") && !pkg.startsWith("com.android.")) {
                            totalMs += stat.getTotalTimeInForeground();
                        }
                    }
                }
                
                result.pushInt((int) (totalMs / 1000 / 60)); // Minutes
            }
            
            promise.resolve(result);
        } catch (Exception e) {
            WritableArray fallback = Arguments.createArray();
            for (int i = 0; i < 7; i++) fallback.pushInt(0);
            promise.resolve(fallback);
        }
    }

    // ============================================
    // GET ALL INSTALLED APPS (NO LIMIT)
    // ============================================

    @ReactMethod
    public void getAllInstalledApps(Promise promise) {
        try {
            PackageManager pm = reactContext.getPackageManager();
            WritableArray result = Arguments.createArray();
            
            Intent intent = new Intent(Intent.ACTION_MAIN, null);
            intent.addCategory(Intent.CATEGORY_LAUNCHER);
            List<ResolveInfo> apps = pm.queryIntentActivities(intent, 0);
            
            for (ResolveInfo info : apps) {
                String pkg = info.activityInfo.packageName;
                
                // Skip system apps
                if (pkg.contains("launcher") || pkg.contains("systemui") || 
                    pkg.startsWith("com.android.") || pkg.equals(reactContext.getPackageName())) {
                    continue;
                }
                
                try {
                    String appName = (String) info.loadLabel(pm);
                    String iconBase64 = getIconBase64(pm, pkg);
                    
                    WritableMap app = Arguments.createMap();
                    app.putString("packageName", pkg);
                    app.putString("appName", appName);
                    app.putInt("usageMinutes", 0);
                    app.putString("icon", iconBase64);
                    result.pushMap(app);
                } catch (Exception ignored) {}
            }
            
            promise.resolve(result);
        } catch (Exception e) {
            promise.resolve(Arguments.createArray());
        }
    }

    // ============================================
    // GET APP USAGE STATS (Legacy method - fixed)
    // ============================================

    @ReactMethod
    public void getAppUsageStats(int days, Promise promise) {
        if (days == 1) {
            getTodayUsage(promise);
            return;
        }
        
        try {
            UsageStatsManager usm = (UsageStatsManager) reactContext.getSystemService(Context.USAGE_STATS_SERVICE);
            PackageManager pm = reactContext.getPackageManager();
            WritableArray result = Arguments.createArray();
            
            long endTime = System.currentTimeMillis();
            long startTime = endTime - ((long) days * 24 * 60 * 60 * 1000L);
            
            List<UsageStats> stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startTime, endTime);
            
            if (stats == null || stats.isEmpty()) {
                promise.resolve(result);
                return;
            }
            
            // Aggregate by package
            Map<String, Long> usageMap = new HashMap<>();
            for (UsageStats stat : stats) {
                String pkg = stat.getPackageName();
                long time = stat.getTotalTimeInForeground();
                Long existing = usageMap.get(pkg);
                usageMap.put(pkg, (existing != null ? existing : 0L) + time);
            }
            
            // Sort and return
            List<Map.Entry<String, Long>> sortedList = new ArrayList<>(usageMap.entrySet());
            Collections.sort(sortedList, (a, b) -> Long.compare(b.getValue(), a.getValue()));
            
            for (Map.Entry<String, Long> entry : sortedList) {
                String pkg = entry.getKey();
                long totalMs = entry.getValue();
                int avgMinutes = (int) ((totalMs / 1000 / 60) / Math.max(1, days));
                
                if (avgMinutes < 1) continue;
                
                if (pkg.contains("launcher") || pkg.contains("systemui") || 
                    pkg.startsWith("com.android.") || pkg.equals(reactContext.getPackageName())) {
                    continue;
                }
                
                try {
                    ApplicationInfo appInfo = pm.getApplicationInfo(pkg, 0);
                    if (pm.getLaunchIntentForPackage(pkg) == null) continue;
                    
                    String appName = (String) pm.getApplicationLabel(appInfo);
                    String iconBase64 = getIconBase64(pm, pkg);
                    
                    WritableMap app = Arguments.createMap();
                    app.putString("packageName", pkg);
                    app.putString("appName", appName);
                    app.putInt("usageMinutes", avgMinutes);
                    app.putString("icon", iconBase64);
                    result.pushMap(app);
                } catch (Exception ignored) {}
            }
            
            promise.resolve(result);
        } catch (Exception e) {
            promise.resolve(Arguments.createArray());
        }
    }

    // ============================================
    // HELPER: Get Icon as Base64
    // ============================================

    private String getIconBase64(PackageManager pm, String packageName) {
        try {
            Drawable icon = pm.getApplicationIcon(packageName);
            Bitmap bitmap = Bitmap.createBitmap(64, 64, Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(bitmap);
            icon.setBounds(0, 0, 64, 64);
            icon.draw(canvas);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, baos);
            return Base64.encodeToString(baos.toByteArray(), Base64.NO_WRAP);
        } catch (Exception e) {
            return "";
        }
    }
}
