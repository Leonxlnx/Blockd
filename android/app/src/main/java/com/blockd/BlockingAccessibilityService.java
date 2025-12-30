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
        
        try {
            windowManager = (android.view.WindowManager) getSystemService(WINDOW_SERVICE);
            
            // Main container with dark gradient background
            overlayLayout = new android.widget.FrameLayout(this);
            
            // Create gradient drawable for premium look
            android.graphics.drawable.GradientDrawable gradient = new android.graphics.drawable.GradientDrawable(
                android.graphics.drawable.GradientDrawable.Orientation.TOP_BOTTOM,
                new int[] { 0xFF0A0A12, 0xFF12121D, 0xFF0D0D15 }
            );
            overlayLayout.setBackground(gradient);

            // Center content container
            android.widget.LinearLayout content = new android.widget.LinearLayout(this);
            content.setOrientation(android.widget.LinearLayout.VERTICAL);
            content.setGravity(android.view.Gravity.CENTER);
            content.setPadding(60, 0, 60, 0);
            android.widget.FrameLayout.LayoutParams contentParams = new android.widget.FrameLayout.LayoutParams(
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT, 
                android.widget.FrameLayout.LayoutParams.WRAP_CONTENT);
            contentParams.gravity = android.view.Gravity.CENTER;
            overlayLayout.addView(content, contentParams);

            // Shield Icon Circle
            android.widget.FrameLayout iconCircle = new android.widget.FrameLayout(this);
            android.graphics.drawable.GradientDrawable circleDrawable = new android.graphics.drawable.GradientDrawable();
            circleDrawable.setShape(android.graphics.drawable.GradientDrawable.OVAL);
            circleDrawable.setColor(0x33FF4444); // Soft red glow
            iconCircle.setBackground(circleDrawable);
            android.widget.LinearLayout.LayoutParams circleParams = new android.widget.LinearLayout.LayoutParams(160, 160);
            circleParams.gravity = android.view.Gravity.CENTER;
            circleParams.setMargins(0, 0, 0, 60);
            
            // X Icon inside circle (created with Views)
            android.widget.TextView xIcon = new android.widget.TextView(this);
            xIcon.setText("✕");
            xIcon.setTextColor(0xFFFF4444);
            xIcon.setTextSize(48);
            xIcon.setGravity(android.view.Gravity.CENTER);
            android.widget.FrameLayout.LayoutParams xParams = new android.widget.FrameLayout.LayoutParams(
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT);
            iconCircle.addView(xIcon, xParams);
            content.addView(iconCircle, circleParams);

            // "BLOCKED" Title
            android.widget.TextView blockedLabel = new android.widget.TextView(this);
            blockedLabel.setText("BLOCKED");
            blockedLabel.setTextColor(0xFFFF4444);
            blockedLabel.setTextSize(14);
            blockedLabel.setTypeface(null, android.graphics.Typeface.BOLD);
            blockedLabel.setGravity(android.view.Gravity.CENTER);
            blockedLabel.setLetterSpacing(0.3f);
            android.widget.LinearLayout.LayoutParams blockedParams = new android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
            blockedParams.gravity = android.view.Gravity.CENTER;
            blockedParams.setMargins(0, 0, 0, 24);
            content.addView(blockedLabel, blockedParams);

            // Main Title
            android.widget.TextView title = new android.widget.TextView(this);
            title.setText("This App is Restricted");
            title.setTextColor(0xFFFFFFFF);
            title.setTextSize(26);
            title.setTypeface(null, android.graphics.Typeface.BOLD);
            title.setGravity(android.view.Gravity.CENTER);
            android.widget.LinearLayout.LayoutParams titleParams = new android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
            titleParams.gravity = android.view.Gravity.CENTER;
            titleParams.setMargins(0, 0, 0, 20);
            content.addView(title, titleParams);

            // Subtitle
            android.widget.TextView subtitle = new android.widget.TextView(this);
            subtitle.setText("Stay focused. You set this limit\nfor a reason. Keep going!");
            subtitle.setTextColor(0x99FFFFFF); // 60% white
            subtitle.setTextSize(15);
            subtitle.setGravity(android.view.Gravity.CENTER);
            subtitle.setLineSpacing(6, 1);
            android.widget.LinearLayout.LayoutParams subParams = new android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
            subParams.gravity = android.view.Gravity.CENTER;
            subParams.setMargins(0, 0, 0, 80);
            content.addView(subtitle, subParams);

            // Exit App Button (Primary - White)
            android.widget.Button exitBtn = new android.widget.Button(this);
            exitBtn.setText("Exit App");
            exitBtn.setTextColor(0xFF000000);
            exitBtn.setTextSize(16);
            exitBtn.setTypeface(null, android.graphics.Typeface.BOLD);
            exitBtn.setAllCaps(false);
            android.graphics.drawable.GradientDrawable exitBg = new android.graphics.drawable.GradientDrawable();
            exitBg.setColor(0xFFFFFFFF);
            exitBg.setCornerRadius(60);
            exitBtn.setBackground(exitBg);
            exitBtn.setPadding(80, 40, 80, 40);
            exitBtn.setOnClickListener(v -> {
                performGlobalAction(GLOBAL_ACTION_HOME);
                hideOverlay();
            });
            android.widget.LinearLayout.LayoutParams exitParams = new android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
            exitParams.gravity = android.view.Gravity.CENTER;
            exitParams.setMargins(0, 0, 0, 24);
            content.addView(exitBtn, exitParams);

            // Open Blockd Link (Secondary - Subtle)
            android.widget.TextView openLink = new android.widget.TextView(this);
            openLink.setText("Open Blockd");
            openLink.setTextColor(0x66FFFFFF); // 40% white
            openLink.setTextSize(14);
            openLink.setGravity(android.view.Gravity.CENTER);
            openLink.setPadding(40, 20, 40, 20);
            openLink.setOnClickListener(v -> {
                Intent intent = new Intent(this, MainActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(intent);
                hideOverlay();
            });
            android.widget.LinearLayout.LayoutParams linkParams = new android.widget.LinearLayout.LayoutParams(
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT,
                android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
            linkParams.gravity = android.view.Gravity.CENTER;
            content.addView(openLink, linkParams);

            // Window Params
            int type = android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O
                    ? android.view.WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                    : android.view.WindowManager.LayoutParams.TYPE_PHONE;

            android.view.WindowManager.LayoutParams params = new android.view.WindowManager.LayoutParams(
                    android.view.WindowManager.LayoutParams.MATCH_PARENT,
                    android.view.WindowManager.LayoutParams.MATCH_PARENT,
                    type,
                    android.view.WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
                    android.view.WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
                    android.view.WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                    android.graphics.PixelFormat.TRANSLUCENT);
            
            params.gravity = android.view.Gravity.CENTER;

            // Add View
            windowManager.addView(overlayLayout, params);
            overlayView = overlayLayout;
            Log.d(TAG, "Premium overlay shown for: " + packageName);

        } catch (Exception e) {
            Log.e(TAG, "Error showing overlay: " + e.getMessage());
            // Fallback to old activity method if overlay fails (e.g. permission missing)
            launchBlockOverlay(packageName);
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

