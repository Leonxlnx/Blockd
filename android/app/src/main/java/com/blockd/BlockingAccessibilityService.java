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
        long now = System.currentTimeMillis();
        
        // Debounce: Don't re-launch if recently blocked (within 2 seconds)
        if (packageName.equals(lastBlockedPackage) && (now - lastBlockTime) < 2000) {
            return;
        }
        
        lastBlockedPackage = packageName;
        lastBlockTime = now;
        currentOverlayPackage = packageName;
        
        // Bring Blockd app to foreground - React Native OverlayManager will show the nice overlay
        try {
            Intent intent = new Intent(this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | 
                           Intent.FLAG_ACTIVITY_CLEAR_TOP | 
                           Intent.FLAG_ACTIVITY_SINGLE_TOP |
                           Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
            intent.putExtra("blocked_package", packageName);
            intent.putExtra("show_overlay", true);
            startActivity(intent);
            
            Log.d(TAG, "Launched Blockd overlay for: " + packageName);
        } catch (Exception e) {
            Log.e(TAG, "Error launching Blockd overlay: " + e.getMessage());
        }
    }

    private void hideOverlay() {
        // React Native overlay handles its own dismissal
        // Just reset tracking
        currentOverlayPackage = null;
        overlayView = null;
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

