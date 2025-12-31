package com.blockd;

import android.app.Activity;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;

public class BlockingModule extends ReactContextBaseJavaModule {
    private static final String TAG = "BlockingModule";
    private final ReactApplicationContext reactContext;
    private Handler handler;
    private Runnable monitorRunnable;
    private boolean isMonitoring = false;
    
    // Map of blocked packages with their mode and remaining time
    private Map<String, BlockedApp> blockedApps = new HashMap<>();
    
    private static class BlockedApp {
        String mode; // "detox" or "limit"
        long detoxEndTime; // Unix timestamp for detox end
        int dailyLimitMinutes;
        int usedTodayMinutes;
        String lastResetDate;
    }

    public BlockingModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
        this.handler = new Handler(Looper.getMainLooper());
    }

    @Override
    public String getName() {
        return "BlockingModule";
    }

    @ReactMethod
    public void showNotification(String title, String message) {
        try {
            android.app.NotificationManager manager = (android.app.NotificationManager) 
                reactContext.getSystemService(Context.NOTIFICATION_SERVICE);
            
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                android.app.NotificationChannel channel = new android.app.NotificationChannel(
                    "blockd_limits", "Limit Warnings", android.app.NotificationManager.IMPORTANCE_HIGH);
                manager.createNotificationChannel(channel);
            }
            
            android.app.Notification notification = new androidx.core.app.NotificationCompat.Builder(reactContext, "blockd_limits")
                .setContentTitle(title)
                .setContentText(message)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setPriority(androidx.core.app.NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .build();
            
            manager.notify((int) System.currentTimeMillis(), notification);
        } catch (Exception e) {
            Log.e(TAG, "Notification error: " + e.getMessage());
        }
    }

    @ReactMethod
    public void startMonitoring() {
        if (isMonitoring) return;
        isMonitoring = true;
        
        monitorRunnable = new Runnable() {
            @Override
            public void run() {
                if (isMonitoring) {
                    checkCurrentApp();
                    handler.postDelayed(this, 1000);
                }
            }
        };
        
        handler.post(monitorRunnable);
        Log.d(TAG, "Started app monitoring");
    }

    @ReactMethod
    public void stopMonitoring() {
        isMonitoring = false;
        if (monitorRunnable != null) {
            handler.removeCallbacks(monitorRunnable);
        }
        Log.d(TAG, "Stopped app monitoring");
    }

    // Check if app was launched due to a block (from AccessibilityService)
    @ReactMethod
    public void checkInitialLaunch(Promise promise) {
        Activity currentActivity = getCurrentActivity();
        if (currentActivity != null) {
            Intent intent = currentActivity.getIntent();
            if (intent != null && intent.getBooleanExtra("show_overlay", false)) {
                String blockedPkg = intent.getStringExtra("blocked_package");
                
                WritableMap params = Arguments.createMap();
                params.putString("packageName", blockedPkg);
                params.putString("blockType", "limit_active");
                params.putInt("remainingMinutes", 0);
                params.putInt("remainingDays", 0);
                params.putInt("dailyLimit", 0);
                
                // Send event to React Native
                sendEvent("onAppBlocked", params);
                
                // Clear the intent extras so we don't trigger again
                intent.removeExtra("show_overlay");
                intent.removeExtra("blocked_package");
                
                Log.d(TAG, "Initial launch detected for blocked app: " + blockedPkg);
                promise.resolve(blockedPkg);
                return;
            }
        }
        promise.resolve(null);
    }

    @ReactMethod
    public void addBlockedApp(String packageName, String mode, double detoxEndTime, int dailyLimitMinutes) {
        BlockedApp app = new BlockedApp();
        app.mode = mode;
        app.detoxEndTime = (long) detoxEndTime;
        app.dailyLimitMinutes = dailyLimitMinutes;
        app.usedTodayMinutes = 0;
        app.lastResetDate = getCurrentDate();
        
        blockedApps.put(packageName, app);
        
        // CRITICAL: Persist to SharedPreferences for AccessibilityService
        persistBlockedApps();
        
        // Notify AccessibilityService if running
        if (BlockingAccessibilityService.isRunning()) {
            BlockingAccessibilityService.getInstance().addBlockedApp(packageName);
        }
        
        Log.d(TAG, "Added blocked app: " + packageName + " mode: " + mode + " (persisted)");
    }

    @ReactMethod
    public void removeBlockedApp(String packageName) {
        blockedApps.remove(packageName);
        
        // CRITICAL: Persist to SharedPreferences for AccessibilityService
        persistBlockedApps();
        
        // Notify AccessibilityService if running
        if (BlockingAccessibilityService.isRunning()) {
            BlockingAccessibilityService.getInstance().removeBlockedApp(packageName);
        }
        
        Log.d(TAG, "Removed blocked app: " + packageName + " (persisted)");
    }
    
    /**
     * Persist blocked apps to SharedPreferences so AccessibilityService can read them
     */
    private void persistBlockedApps() {
        try {
            android.content.SharedPreferences prefs = reactContext.getSharedPreferences("BlockdBlockingPrefs", Context.MODE_PRIVATE);
            org.json.JSONObject json = new org.json.JSONObject();
            
            for (Map.Entry<String, BlockedApp> entry : blockedApps.entrySet()) {
                org.json.JSONObject appData = new org.json.JSONObject();
                appData.put("mode", entry.getValue().mode);
                appData.put("detoxEndTime", entry.getValue().detoxEndTime);
                appData.put("dailyLimitMinutes", entry.getValue().dailyLimitMinutes);
                appData.put("isActive", true);
                json.put(entry.getKey(), appData);
            }
            
            prefs.edit().putString("blocked_apps_json", json.toString()).apply();
            Log.d(TAG, "Persisted " + blockedApps.size() + " apps to SharedPreferences");
        } catch (Exception e) {
            Log.e(TAG, "Error persisting blocked apps: " + e.getMessage());
        }
    }

    @ReactMethod
    public void updateUsage(String packageName, int minutesUsed) {
        BlockedApp app = blockedApps.get(packageName);
        if (app != null) {
            String today = getCurrentDate();
            if (!today.equals(app.lastResetDate)) {
                app.usedTodayMinutes = 0;
                app.lastResetDate = today;
            }
            app.usedTodayMinutes = minutesUsed;
        }
    }
    @ReactMethod
    public void getBlockedApps(Promise promise) {
        try {
            WritableMap result = Arguments.createMap();
            for (Map.Entry<String, BlockedApp> entry : blockedApps.entrySet()) {
                WritableMap appData = Arguments.createMap();
                appData.putString("mode", entry.getValue().mode);
                appData.putDouble("detoxEndTime", entry.getValue().detoxEndTime);
                appData.putInt("dailyLimitMinutes", entry.getValue().dailyLimitMinutes);
                appData.putInt("usedTodayMinutes", entry.getValue().usedTodayMinutes);
                result.putMap(entry.getKey(), appData);
            }
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getCurrentForegroundApp(Promise promise) {
        try {
            String currentApp = getForegroundApp();
            promise.resolve(currentApp);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }


    private void checkCurrentApp() {
        String currentPackage = getForegroundApp();
        if (currentPackage == null || currentPackage.isEmpty()) return;
        
        // Don't block our own app
        if (currentPackage.equals("com.blockd")) return;
        
        BlockedApp blockedApp = blockedApps.get(currentPackage);
        if (blockedApp == null) return;
        
        boolean shouldBlock = false;
        String blockType = "";
        int remainingMinutes = 0;
        int remainingDays = 0;
        
        if ("detox".equals(blockedApp.mode)) {
            if (System.currentTimeMillis() < blockedApp.detoxEndTime) {
                shouldBlock = true;
                blockType = "detox";
                remainingDays = (int) ((blockedApp.detoxEndTime - System.currentTimeMillis()) / (24 * 60 * 60 * 1000));
            }
        } else if ("limit".equals(blockedApp.mode)) {
            // Get REAL usage from UsageStatsManager
            int usedMinutesToday = getAppUsageToday(currentPackage);
            
            remainingMinutes = blockedApp.dailyLimitMinutes - usedMinutesToday;
            
            Log.d(TAG, "App: " + currentPackage + " used: " + usedMinutesToday + "m, limit: " + blockedApp.dailyLimitMinutes + "m, remaining: " + remainingMinutes + "m");
            
            if (remainingMinutes <= 0) {
                shouldBlock = true;
                blockType = "limit_exceeded";
            } else {
                blockType = "limit_active";
            }
        }
        
        // Send event to React Native
        if (shouldBlock || "limit_active".equals(blockType)) {
            WritableMap params = Arguments.createMap();
            params.putString("packageName", currentPackage);
            params.putString("blockType", blockType);
            params.putInt("remainingMinutes", remainingMinutes);
            params.putInt("remainingDays", remainingDays);
            params.putInt("dailyLimit", blockedApp != null ? blockedApp.dailyLimitMinutes : 0);
            
            sendEvent("onAppBlocked", params);
        }
    }
    
    private int getAppUsageToday(String packageName) {
        try {
            UsageStatsManager usm = (UsageStatsManager) reactContext.getSystemService(Context.USAGE_STATS_SERVICE);
            
            // Get start of today
            java.util.Calendar calendar = java.util.Calendar.getInstance();
            calendar.set(java.util.Calendar.HOUR_OF_DAY, 0);
            calendar.set(java.util.Calendar.MINUTE, 0);
            calendar.set(java.util.Calendar.SECOND, 0);
            calendar.set(java.util.Calendar.MILLISECOND, 0);
            long startOfDay = calendar.getTimeInMillis();
            long now = System.currentTimeMillis();
            
            List<UsageStats> stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startOfDay, now);
            
            if (stats != null) {
                for (UsageStats stat : stats) {
                    if (stat.getPackageName().equals(packageName)) {
                        long totalTimeMs = stat.getTotalTimeInForeground();
                        return (int) (totalTimeMs / 60000); // Convert to minutes
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting app usage: " + e.getMessage());
        }
        return 0;
    }

    private void sendEvent(String eventName, WritableMap params) {
        try {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        } catch (Exception e) {
            Log.e(TAG, "Error sending event: " + e.getMessage());
        }
    }

    private String getForegroundApp() {
        String currentApp = "";
        try {
            UsageStatsManager usm = (UsageStatsManager) reactContext.getSystemService(Context.USAGE_STATS_SERVICE);
            long time = System.currentTimeMillis();
            
            List<UsageStats> stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, time - 10000, time);
            
            if (stats != null && !stats.isEmpty()) {
                SortedMap<Long, UsageStats> sortedMap = new TreeMap<>();
                for (UsageStats usageStats : stats) {
                    sortedMap.put(usageStats.getLastTimeUsed(), usageStats);
                }
                if (!sortedMap.isEmpty()) {
                    currentApp = sortedMap.get(sortedMap.lastKey()).getPackageName();
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting foreground app: " + e.getMessage());
        }
        return currentApp;
    }

    private String getCurrentDate() {
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
        return sdf.format(new java.util.Date());
    }
    
    // =====================================================
    // NEW: Accessibility Service & Foreground Service Control
    // =====================================================
    
    @ReactMethod
    public void isAccessibilityEnabled(Promise promise) {
        try {
            boolean enabled = BlockingAccessibilityService.isRunning();
            promise.resolve(enabled);
        } catch (Exception e) {
            promise.resolve(false);
        }
    }
    
    @ReactMethod
    public void openAccessibilitySettings() {
        try {
            Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
        } catch (Exception e) {
            Log.e(TAG, "Error opening accessibility settings: " + e.getMessage());
        }
    }
    
    @ReactMethod
    public void openAppSettings() {
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(android.net.Uri.parse("package:" + reactContext.getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
        } catch (Exception e) {
            Log.e(TAG, "Error opening app settings: " + e.getMessage());
        }
    }
    
    @ReactMethod
    public void startForegroundService() {
        try {
            Intent intent = new Intent(reactContext, AppBlockForegroundService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(intent);
            } else {
                reactContext.startService(intent);
            }
            Log.d(TAG, "Started foreground service");
        } catch (Exception e) {
            Log.e(TAG, "Error starting foreground service: " + e.getMessage());
        }
    }
    
    @ReactMethod
    public void stopForegroundService() {
        try {
            Intent intent = new Intent(reactContext, AppBlockForegroundService.class);
            reactContext.stopService(intent);
            Log.d(TAG, "Stopped foreground service");
        } catch (Exception e) {
            Log.e(TAG, "Error stopping foreground service: " + e.getMessage());
        }
    }
    
    @ReactMethod
    public void isForegroundServiceRunning(Promise promise) {
        try {
            boolean running = AppBlockForegroundService.isServiceRunning();
            promise.resolve(running);
        } catch (Exception e) {
            promise.resolve(false);
        }
    }
    
    @ReactMethod
    public void syncBlockedAppsToAccessibility() {
        // Sync blocked apps to the accessibility service
        if (BlockingAccessibilityService.isRunning()) {
            BlockingAccessibilityService service = BlockingAccessibilityService.getInstance();
            if (service != null) {
                for (String pkg : blockedApps.keySet()) {
                    service.addBlockedApp(pkg);
                }
                Log.d(TAG, "Synced " + blockedApps.size() + " apps to accessibility service");
            }
        }
    }
    
    @ReactMethod
    public void addListener(String eventName) {
        // Required for RN event emitter
    }
    
    @ReactMethod
    public void removeListeners(int count) {
        // Required for RN event emitter
    }
}

