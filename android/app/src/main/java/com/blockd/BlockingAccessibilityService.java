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
    private String currentOverlayPackage = null; // Track which package the overlay is for
    
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
        
        // Start ForegroundService to keep alive on MIUI/Xiaomi devices
        try {
            Intent serviceIntent = new Intent(this, AppBlockForegroundService.class);
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent);
            } else {
                startService(serviceIntent);
            }
            Log.d(TAG, "Started ForegroundService for MIUI stability");
        } catch (Exception e) {
            Log.e(TAG, "Error starting ForegroundService: " + e.getMessage());
        }
        
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
            hideOverlay(); // User navigated away - hide overlay
            return;
        }
        
        // Check if this app is blocked
        if (blockedPackages.contains(packageName)) {
            // If overlay is already showing for THIS package, keep it
            if (overlayView != null && packageName.equals(currentOverlayPackage)) {
                return; // Keep overlay visible - don't recreate
            }
            Log.d(TAG, "BLOCKED APP DETECTED: " + packageName);
            showOverlay(packageName);
        }
        // Note: We do NOT hide overlay for non-blocked app events
        // YouTube and other apps send many internal events from different package names
        // Overlay only hides when user navigates to home/launcher/Blockd (handled above)
    }

    private void showOverlay(String packageName) {
        if (overlayView != null) return; // Already showing
        
        long now = System.currentTimeMillis();
        
        // Debounce: Don't re-show if recently blocked (within 500ms)
        if (packageName.equals(lastBlockedPackage) && (now - lastBlockTime) < 500) {
            return;
        }
        
        lastBlockedPackage = packageName;
        lastBlockTime = now;
        currentOverlayPackage = packageName;
        
        try {
            windowManager = (android.view.WindowManager) getSystemService(WINDOW_SERVICE);
            
            // Create fullscreen dark overlay
            overlayLayout = new android.widget.FrameLayout(this);
            overlayLayout.setBackgroundColor(0xFF0A0A0F); // Solid dark background
            
            // Content container
            android.widget.LinearLayout content = new android.widget.LinearLayout(this);
            content.setOrientation(android.widget.LinearLayout.VERTICAL);
            content.setGravity(android.view.Gravity.CENTER);
            content.setPadding(80, 0, 80, 0);
            android.widget.FrameLayout.LayoutParams contentParams = new android.widget.FrameLayout.LayoutParams(
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT, 
                android.widget.FrameLayout.LayoutParams.WRAP_CONTENT);
            contentParams.gravity = android.view.Gravity.CENTER;
            overlayLayout.addView(content, contentParams);

            // Red X icon
            android.widget.TextView icon = new android.widget.TextView(this);
            icon.setText("⛔");
            icon.setTextSize(48);
            icon.setGravity(android.view.Gravity.CENTER);
            content.addView(icon);

            // BLOCKED Label
            android.widget.TextView blockedLabel = new android.widget.TextView(this);
            blockedLabel.setText("BLOCKED");
            blockedLabel.setTextColor(0xFFEF4444); // Red
            blockedLabel.setTextSize(24);
            blockedLabel.setTypeface(null, android.graphics.Typeface.BOLD);
            blockedLabel.setGravity(android.view.Gravity.CENTER);
            blockedLabel.setPadding(0, 40, 0, 20);
            content.addView(blockedLabel);

            // Title
            android.widget.TextView title = new android.widget.TextView(this);
            title.setText("This app is blocked");
            title.setTextColor(0xFFFFFFFF);
            title.setTextSize(22);
            title.setTypeface(null, android.graphics.Typeface.BOLD);
            title.setGravity(android.view.Gravity.CENTER);
            content.addView(title);

            // Subtitle
            android.widget.TextView subtitle = new android.widget.TextView(this);
            subtitle.setText("Stay focused! You set this limit.\nPress the button to go home.");
            subtitle.setTextColor(0x99FFFFFF);
            subtitle.setTextSize(14);
            subtitle.setGravity(android.view.Gravity.CENTER);
            subtitle.setPadding(0, 20, 0, 60);
            content.addView(subtitle);

            // Exit Button
            android.widget.Button exitBtn = new android.widget.Button(this);
            exitBtn.setText("Exit App");
            exitBtn.setBackgroundColor(0x33FFFFFF);
            exitBtn.setTextColor(0xFFFFFFFF);
            exitBtn.setTextSize(16);
            exitBtn.setPadding(60, 24, 60, 24);
            exitBtn.setAllCaps(false);
            exitBtn.setOnClickListener(v -> {
                performGlobalAction(GLOBAL_ACTION_HOME);
                hideOverlay();
            });
            android.widget.LinearLayout.LayoutParams btnParams = new android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
            content.addView(exitBtn, btnParams);

            // Window Params - TYPE_ACCESSIBILITY_OVERLAY is stable on MIUI
            android.view.WindowManager.LayoutParams params = new android.view.WindowManager.LayoutParams(
                android.view.WindowManager.LayoutParams.MATCH_PARENT,
                android.view.WindowManager.LayoutParams.MATCH_PARENT,
                android.view.WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
                android.view.WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
                android.view.WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
                android.view.WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN |
                android.view.WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                android.graphics.PixelFormat.OPAQUE);
            params.gravity = android.view.Gravity.CENTER;

            windowManager.addView(overlayLayout, params);
            overlayView = overlayLayout;
            Log.d(TAG, "Native overlay shown for: " + packageName);

        } catch (Exception e) {
            Log.e(TAG, "Error showing overlay: " + e.getMessage());
            e.printStackTrace();
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
        }
        overlayView = null;
        currentOverlayPackage = null;
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

