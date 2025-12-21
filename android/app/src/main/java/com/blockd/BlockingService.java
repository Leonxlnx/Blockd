package com.blockd;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;

public class BlockingService extends Service {
    private static final String TAG = "BlockingService";
    private static final String CHANNEL_ID = "BlockdBlockingChannel";
    private static final int NOTIFICATION_ID = 1001;
    
    private Handler handler;
    private Runnable checkRunnable;
    private boolean isRunning = false;
    
    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        handler = new Handler(Looper.getMainLooper());
        
        checkRunnable = new Runnable() {
            @Override
            public void run() {
                if (isRunning) {
                    checkCurrentApp();
                    handler.postDelayed(this, 1000); // Check every second
                }
            }
        };
    }
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForeground(NOTIFICATION_ID, createNotification());
        isRunning = true;
        handler.post(checkRunnable);
        Log.d(TAG, "BlockingService started");
        return START_STICKY;
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        isRunning = false;
        handler.removeCallbacks(checkRunnable);
        Log.d(TAG, "BlockingService stopped");
    }
    
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
    
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Focus Mode Active",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Monitoring your app usage");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }
    
    private Notification createNotification() {
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Blockd is protecting your focus")
            .setContentText("Monitoring app usage")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build();
    }
    
    private void checkCurrentApp() {
        String currentApp = getForegroundApp();
        if (currentApp != null && !currentApp.isEmpty()) {
            // Send broadcast to React Native
            Intent intent = new Intent("com.blockd.FOREGROUND_APP");
            intent.putExtra("packageName", currentApp);
            sendBroadcast(intent);
        }
    }
    
    private String getForegroundApp() {
        String currentApp = "";
        UsageStatsManager usm = (UsageStatsManager) getSystemService(Context.USAGE_STATS_SERVICE);
        long time = System.currentTimeMillis();
        
        List<UsageStats> stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, time - 1000 * 10, time);
        
        if (stats != null && !stats.isEmpty()) {
            SortedMap<Long, UsageStats> sortedMap = new TreeMap<>();
            for (UsageStats usageStats : stats) {
                sortedMap.put(usageStats.getLastTimeUsed(), usageStats);
            }
            if (!sortedMap.isEmpty()) {
                currentApp = sortedMap.get(sortedMap.lastKey()).getPackageName();
            }
        }
        
        return currentApp;
    }
}
