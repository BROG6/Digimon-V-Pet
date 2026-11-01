package com.digipet.companion;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.provider.Settings;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.TextView;
import androidx.core.app.NotificationCompat;

public class FloatingPetService extends Service {
    public static boolean isRunning = false;
    private static final String CHANNEL_ID = "digipet_overlay_channel";
    private static final int NOTIF_ID = 1001;

    private WindowManager windowManager;
    private View floatingView;
    private WindowManager.LayoutParams params;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && "STOP".equals(intent.getAction())) {
            stopSelf();
            return START_NOT_STICKY;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            stopSelf();
            return START_NOT_STICKY;
        }

        createNotificationChannel();
        Notification notification = buildForegroundNotification();
        try {
            startForeground(NOTIF_ID, notification);
        } catch (Exception e) {
            // Android 14 safe fallback
        }

        if (floatingView == null) {
            setupFloatingView(intent);
        }

        isRunning = true;
        return START_STICKY;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "DigiPet Overlay Companion",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Shows your floating Digimon pet on top of all apps");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private Notification buildForegroundNotification() {
        Intent openAppIntent = new Intent(this, MainActivity.class);
        openAppIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingOpen = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0
        );

        Intent stopIntent = new Intent(this, FloatingPetService.class);
        stopIntent.setAction("STOP");
        PendingIntent pendingStop = PendingIntent.getService(
            this,
            1,
            stopIntent,
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("DigiPet Companion Active")
            .setContentText("Your Digimon is floating on your screen! Tap to open.")
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setContentIntent(pendingOpen)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Close Overlay", pendingStop)
            .setOngoing(true);

        return builder.build();
    }

    private void setupFloatingView(Intent intent) {
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);

        int layoutType;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            layoutType = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            layoutType = WindowManager.LayoutParams.TYPE_PHONE;
        }

        int viewSize = dpToPx(150);
        params = new WindowManager.LayoutParams(
            viewSize,
            viewSize,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        );

        params.gravity = Gravity.TOP | Gravity.START;
        params.x = dpToPx(40);
        params.y = dpToPx(160);

        String speciesName = intent != null && intent.getStringExtra("speciesName") != null
            ? intent.getStringExtra("speciesName")
            : "Digimon";
        String spriteUrl = intent != null && intent.getStringExtra("spriteUrl") != null
            ? intent.getStringExtra("spriteUrl")
            : "file:///android_asset/public/assets/aistudio/Copy_of_Agumon_Adventure_04d0832a.png";
        
        int frameX = intent != null ? intent.getIntExtra("frameX", 2) : 2;
        int frameY = intent != null ? intent.getIntExtra("frameY", 2) : 2;
        int frameW = intent != null ? intent.getIntExtra("frameW", 48) : 48;
        int frameH = intent != null ? intent.getIntExtra("frameH", 48) : 48;

        // Root container
        FrameLayout rootLayout = new FrameLayout(this);
        rootLayout.setBackgroundColor(Color.TRANSPARENT);

        // Transparent mini-WebView to display pixel-perfect animated Digimon
        WebView webView = new WebView(this);
        webView.setBackgroundColor(Color.TRANSPARENT);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);

        String html = "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>" +
            "html, body { margin:0; padding:0; background:transparent; overflow:hidden; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; user-select:none; -webkit-user-select:none; pointer-events:none; }" +
            ".pet { width:" + frameW + "px; height:" + frameH + "px; background: url('" + spriteUrl + "') -" + frameX + "px -" + frameY + "px; image-rendering: pixelated; transform: scale(2.0); transform-origin: center; animation: hop 1.1s infinite ease-in-out; }" +
            "@keyframes hop { 0%, 100% { transform: scale(2.0) translateY(0); } 50% { transform: scale(2.0) translateY(-6px); } }" +
            ".shadow { width:" + (frameW * 1.4) + "px; height: 5px; background: rgba(0,0,0,0.35); border-radius: 50%; margin-top: 10px; }" +
            ".label { font-family: monospace; font-size: 9px; font-weight: bold; color: #38bdf8; background: rgba(15,23,42,0.85); border: 1px solid rgba(56,189,248,0.5); padding: 1px 6px; border-radius: 9999px; margin-top: 3px; text-shadow: 0 1px 2px #000; letter-spacing: 0.5px; }" +
            "</style></head><body>" +
            "<div class='pet'></div>" +
            "<div class='shadow'></div>" +
            "<div class='label'>" + speciesName.toUpperCase() + "</div>" +
            "</body></html>";

        webView.loadDataWithBaseURL("file:///android_asset/public/", html, "text/html", "utf-8", null);

        rootLayout.addView(webView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));

        // Floating Close button on top-right corner
        TextView closeBtn = new TextView(this);
        closeBtn.setText("✕");
        closeBtn.setTextColor(Color.WHITE);
        closeBtn.setTextSize(11);
        closeBtn.setGravity(Gravity.CENTER);
        closeBtn.setBackgroundColor(Color.argb(180, 220, 38, 38));
        
        FrameLayout.LayoutParams closeParams = new FrameLayout.LayoutParams(dpToPx(22), dpToPx(22));
        closeParams.gravity = Gravity.TOP | Gravity.END;
        closeParams.setMargins(0, dpToPx(4), dpToPx(4), 0);
        closeBtn.setLayoutParams(closeParams);
        closeBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                stopSelf();
            }
        });
        rootLayout.addView(closeBtn);

        // Touch handling: Drag to move, or short tap to return to main game
        rootLayout.setOnTouchListener(new View.OnTouchListener() {
            private int initialX;
            private int initialY;
            private float initialTouchX;
            private float initialTouchY;
            private long touchStartTime;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        initialX = params.x;
                        initialY = params.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        touchStartTime = System.currentTimeMillis();
                        return true;

                    case MotionEvent.ACTION_MOVE:
                        params.x = initialX + (int) (event.getRawX() - initialTouchX);
                        params.y = initialY + (int) (event.getRawY() - initialTouchY);
                        if (windowManager != null && floatingView != null) {
                            windowManager.updateViewLayout(floatingView, params);
                        }
                        return true;

                    case MotionEvent.ACTION_UP:
                        long duration = System.currentTimeMillis() - touchStartTime;
                        float diffX = Math.abs(event.getRawX() - initialTouchX);
                        float diffY = Math.abs(event.getRawY() - initialTouchY);
                        // Short tap: launch MainActivity
                        if (duration < 250 && diffX < 15 && diffY < 15) {
                            Intent appIntent = new Intent(FloatingPetService.this, MainActivity.class);
                            appIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                            startActivity(appIntent);
                        }
                        return true;
                }
                return false;
            }
        });

        floatingView = rootLayout;
        windowManager.addView(floatingView, params);
    }

    private int dpToPx(int dp) {
        return (int) (dp * getResources().getDisplayMetrics().density);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isRunning = false;
        if (floatingView != null && windowManager != null) {
            try {
                windowManager.removeView(floatingView);
            } catch (Exception e) {
                // safe ignore
            }
            floatingView = null;
        }
    }
}
