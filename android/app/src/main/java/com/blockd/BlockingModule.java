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

    @ReactMethod
    public void addBlockedApp(String packageName, String mode, double detoxEndTime, int dailyLimitMinutes) {
        BlockedApp app = new BlockedApp();
        app.mode = mode;
        app.detoxEndTime = (long) detoxEndTime;
        app.dailyLimitMinutes = dailyLimitMinutes;
        app.usedTodayMinutes = 0;
        app.lastResetDate = getCurrentDate();
        
        blockedApps.put(packageName, app);
        Log.d(TAG, "Added blocked app: " + packageName + " mode: " + mode);
    }

    @ReactMethod
    public void removeBlockedApp(String packageName) {
        blockedApps.remove(packageName);
        Log.d(TAG, "Removed blocked app: " + packageName);
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
            String today = getCurrentDate();
            if (!today.equals(blockedApp.lastResetDate)) {
                blockedApp.usedTodayMinutes = 0;
                blockedApp.lastResetDate = today;
            }
            
            remainingMinutes = blockedApp.dailyLimitMinutes - blockedApp.usedTodayMinutes;
            
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
}
