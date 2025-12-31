package com.blockd;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;

import org.json.JSONObject;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

/**
 * Accessibility Service for real-time app launch detection.
 * This service is notified by the system within milliseconds when any app window changes.
 */
public class BlockingAccessibilityService extends AccessibilityService {
    private static final String TAG = "BlockingA11yService";
    private static final String PREFS_NAME = "BlockdBlockingPrefs";
    private static final String KEY_BLOCKED_APPS = "blocked_apps_json";
    
    private Set<String> blockedPackages = new HashSet<>();
    private String lastBlockedPackage = "";
    private long lastBlockTime = 0;
    
    // Static reference for React Native bridge
    private static BlockingAccessibilityService instance;
    
    public static BlockingAccessibilityService getInstance() {
        return instance;
    }
    
    public static boolean isRunning() {
        return instance != null;
    }

    @Override
    public void onServiceConnected() {
        super.onServiceConnected();
        instance = this;
        
        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED;
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
        info.flags = AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS;
        info.notificationTimeout = 100;
        setServiceInfo(info);
        
        loadBlockedApps();
        Log.d(TAG, "Accessibility Service connected and configured");
    }

    private android.view.WindowManager windowManager;
    private android.view.View overlayView;
    private android.widget.FrameLayout overlayLayout;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null || event.getPackageName() == null) return;
        
        String packageName = event.getPackageName().toString();
        
        // Don't block ourselves, system UI, or launcher
        if (packageName.equals("com.blockd") || 
            packageName.equals("com.android.systemui") ||
            packageName.contains("launcher") || 
            packageName.contains("home")) {
            hideOverlay(); // Hide if we switch to home/blockd
            return;
        }
        
        // Check if this app is blocked
        if (blockedPackages.contains(packageName)) {
            Log.d(TAG, "BLOCKED APP DETECTED: " + packageName);
            showOverlay(packageName);
        } else {
            // App is not blocked, ensure overlay is hidden
            if (overlayView != null) {
                hideOverlay();
            }
        }
    }

    private void showOverlay(String packageName) {
        if (overlayView != null) return; // Already showing
        
        long now = System.currentTimeMillis();
        
        // Debounce: Don't re-show if recently blocked (within 1 second)
        if (packageName.equals(lastBlockedPackage) && (now - lastBlockTime) < 1000) {
            return;
        }
        
        lastBlockedPackage = packageName;
        lastBlockTime = now;
        
        try {
            windowManager = (android.view.WindowManager) getSystemService(WINDOW_SERVICE);
            
            // Create premium overlay layout
            overlayLayout = new android.widget.FrameLayout(this);
            overlayLayout.setBackgroundColor(0xFF0A0A12); // Premium dark background (solid, no transparency)

            android.widget.LinearLayout content = new android.widget.LinearLayout(this);
            content.setOrientation(android.widget.LinearLayout.VERTICAL);
            content.setGravity(android.view.Gravity.CENTER);
            content.setPadding(60, 0, 60, 0);
            android.widget.FrameLayout.LayoutParams contentParams = new android.widget.FrameLayout.LayoutParams(
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT, 
                android.widget.FrameLayout.LayoutParams.WRAP_CONTENT);
            contentParams.gravity = android.view.Gravity.CENTER;
            overlayLayout.addView(content, contentParams);

            // App Icon Circle Placeholder
            android.widget.FrameLayout iconCircle = new android.widget.FrameLayout(this);
            android.widget.LinearLayout.LayoutParams iconParams = new android.widget.LinearLayout.LayoutParams(120, 120);
            iconParams.gravity = android.view.Gravity.CENTER;
            iconCircle.setBackgroundColor(0x33FFFFFF);
            content.addView(iconCircle, iconParams);
            
            // TIME'S UP Label with icon
            android.widget.LinearLayout labelRow = new android.widget.LinearLayout(this);
            labelRow.setOrientation(android.widget.LinearLayout.HORIZONTAL);
            labelRow.setGravity(android.view.Gravity.CENTER);
            labelRow.setPadding(0, 40, 0, 10);
            
            android.widget.TextView clockIcon = new android.widget.TextView(this);
            clockIcon.setText("⏰");
            clockIcon.setTextSize(18);
            labelRow.addView(clockIcon);
            
            android.widget.TextView timeLabel = new android.widget.TextView(this);
            timeLabel.setText(" TIME'S UP");
            timeLabel.setTextColor(0xFFFF8C00); // Orange
            timeLabel.setTextSize(20);
            timeLabel.setTypeface(null, android.graphics.Typeface.BOLD);
            labelRow.addView(timeLabel);
            content.addView(labelRow);

            // Daily Limit Reached Title
            android.widget.TextView title = new android.widget.TextView(this);
            title.setText("Daily limit reached");
            title.setTextColor(0xFFFFFFFF);
            title.setTextSize(26);
            title.setTypeface(null, android.graphics.Typeface.BOLD);
            title.setGravity(android.view.Gravity.CENTER);
            title.setPadding(0, 0, 0, 30);
            content.addView(title);

            // Subtitle
            android.widget.TextView subtitle = new android.widget.TextView(this);
            subtitle.setText("Great job sticking to your limit!\nCome back tomorrow.");
            subtitle.setTextColor(0x99FFFFFF);
            subtitle.setTextSize(15);
            subtitle.setGravity(android.view.Gravity.CENTER);
            subtitle.setPadding(0, 0, 0, 80);
            content.addView(subtitle);

            // "Done for Today" Button
            android.widget.Button doneBtn = new android.widget.Button(this);
            doneBtn.setText("Done for Today");
            doneBtn.setBackgroundColor(0x33FFFFFF);
            doneBtn.setTextColor(0xFFFFFFFF);
            doneBtn.setTextSize(16);
            doneBtn.setPadding(60, 30, 60, 30);
            doneBtn.setAllCaps(false);
            doneBtn.setOnClickListener(v -> {
                performGlobalAction(GLOBAL_ACTION_HOME);
                hideOverlay();
            });
            android.widget.LinearLayout.LayoutParams btnParams = new android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
            btnParams.setMargins(0, 0, 0, 20);
            content.addView(doneBtn, btnParams);

            // "Cancel Limit" Link
            android.widget.TextView cancelLink = new android.widget.TextView(this);
            cancelLink.setText("Cancel limit");
            cancelLink.setTextColor(0x66FFFFFF);
            cancelLink.setTextSize(14);
            cancelLink.setGravity(android.view.Gravity.CENTER);
            cancelLink.setPadding(0, 20, 0, 0);
            cancelLink.setOnClickListener(v -> {
                Intent intent = new Intent(this, MainActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                intent.putExtra("blocked_package", packageName);
                intent.putExtra("show_cancel_flow", true);
                startActivity(intent);
                hideOverlay();
            });
            content.addView(cancelLink);

            // Window Params - Fullscreen overlay
            int type = android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O
                    ? android.view.WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                    : android.view.WindowManager.LayoutParams.TYPE_PHONE;

            android.view.WindowManager.LayoutParams params = new android.view.WindowManager.LayoutParams(
                    android.view.WindowManager.LayoutParams.MATCH_PARENT,
                    android.view.WindowManager.LayoutParams.MATCH_PARENT,
                    type,
                    android.view.WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
                    android.view.WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                    android.graphics.PixelFormat.OPAQUE);
            
            params.gravity = android.view.Gravity.CENTER;

            windowManager.addView(overlayLayout, params);
            overlayView = overlayLayout;
            Log.d(TAG, "Premium overlay shown for: " + packageName);

        } catch (Exception e) {
            Log.e(TAG, "Error showing overlay: " + e.getMessage());
        }
    }

    private void hideOverlay() {
        if (overlayView != null && windowManager != null) {
            try {
                windowManager.removeView(overlayView);
                Log.d(TAG, "Overlay hidden");
            } catch (Exception e) {
                Log.e(TAG, "Error hiding overlay: " + e.getMessage());
            }
            overlayView = null;
        }
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "Accessibility Service interrupted");
        hideOverlay();
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        hideOverlay();
        instance = null;
        Log.d(TAG, "Accessibility Service destroyed");
    }
    
    /**
     * Launch the Blockd app (Fallback)
     */
    private void launchBlockOverlay(String blockedPackage) {
        try {
            Intent intent = new Intent(this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            intent.putExtra("blocked_package", blockedPackage);
            intent.putExtra("show_overlay", true);
            startActivity(intent);
        } catch (Exception e) {
            Log.e(TAG, "Error launching block overlay: " + e.getMessage());
        }
    }
    
    /**
     * Load blocked apps from SharedPreferences
     */
    public void loadBlockedApps() {
        try {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            String json = prefs.getString(KEY_BLOCKED_APPS, "{}");
            JSONObject obj = new JSONObject(json);
            
            blockedPackages.clear();
            Iterator<String> keys = obj.keys();
            while (keys.hasNext()) {
                String pkg = keys.next();
                JSONObject appData = obj.getJSONObject(pkg);
                if (appData.optBoolean("isActive", true)) {
                    blockedPackages.add(pkg);
                }
            }
            
            Log.d(TAG, "Loaded " + blockedPackages.size() + " blocked apps");
        } catch (Exception e) {
            Log.e(TAG, "Error loading blocked apps: " + e.getMessage());
        }
    }
    
    /**
     * Add a package to the blocked list
     */
    public void addBlockedApp(String packageName) {
        blockedPackages.add(packageName);
        Log.d(TAG, "Added blocked app: " + packageName);
    }
    
    /**
     * Remove a package from the blocked list
     */
    public void removeBlockedApp(String packageName) {
        blockedPackages.remove(packageName);
        // If we remove the block for the current app, hide overlay immediately
        if (overlayView != null) {
             hideOverlay(); 
             // Ideally we should check if current foreground is this package, but simpler to just hide
        }
        Log.d(TAG, "Removed blocked app: " + packageName);
    }
    
    /**
     * Check if a package is currently blocked
     */
    public boolean isBlocked(String packageName) {
        return blockedPackages.contains(packageName);
    }
}

