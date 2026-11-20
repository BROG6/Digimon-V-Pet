package com.digipet.companion;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.provider.Settings;
import android.text.SpannableStringBuilder;
import android.text.Spanned;
import android.text.style.ForegroundColorSpan;
import android.util.DisplayMetrics;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.HapticFeedbackConstants;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.core.app.NotificationCompat;
import java.util.Random;
import org.json.JSONArray;
import org.json.JSONObject;

public class FloatingPetService extends Service {
    public static boolean isRunning = false;
    private static final String CHANNEL_ID = "digipet_overlay_channel";
    private static final int NOTIF_ID = 1001;
    private static final int FRAME_MS = 33; // ~30 fps physics step

    private enum PetState {
        WALKING_GRID,
        JUMPING,
        FLYING,
        IDLE,
        OFF_SCREEN
    }

    private enum OffScreenPhase {
        NONE,
        EXITING,
        HIDDEN,
        ENTERING
    }

    private WindowManager windowManager;
    private View floatingView;
    private WindowManager.LayoutParams params;
    private WebView webView;

    // Dedicated non-touchable speech bubble window (unclipped regardless of message length or sprite size)
    private FrameLayout bubbleContainer;
    private TextView bubbleTextView;
    private WindowManager.LayoutParams bubbleParams;
    private boolean bubbleVisible = false;
    private int bubbleSpriteHeightDp = 58;

    // Bottom drag-to-close dismiss drop target
    private LinearLayout dismissContainer;
    private TextView dismissCircleView;
    private TextView dismissLabelView;
    private WindowManager.LayoutParams dismissParams;
    private boolean dismissVisible = false;
    private boolean isOverDismissZone = false;

    // Double-tap Care HUD (Hunger Hearts + Happiness Stars above pet, 4 care buttons below)
    private LinearLayout hudStatsContainer;
    private TextView hudStatsTextView;
    private WindowManager.LayoutParams hudStatsParams;
    private LinearLayout hudButtonsContainer;
    private WindowManager.LayoutParams hudButtonsParams;
    private TextView hudMeatLabel;
    private TextView hudVitLabel;
    private boolean hudVisible = false;

    // Compact Native Floating Chat Bar
    private LinearLayout chatContainer;
    private EditText chatEditText;
    private WindowManager.LayoutParams chatParams;
    private boolean chatVisible = false;

    // Multi-tap detection (1 = talk, 2 = care HUD, 3 = open app)
    private int tapCount = 0;
    private long lastTapUpMs = 0L;

    private final Handler physicsHandler = new Handler(Looper.getMainLooper());
    private final Random random = new Random();
    private final Runnable hideBubbleRunnable = new Runnable() {
        @Override
        public void run() {
            hideNativeBubble();
        }
    };
    private final Runnable singleTapRunnable = new Runnable() {
        @Override
        public void run() {
            tapCount = 0;
            lastTapUpMs = 0L;
            if (webView != null) {
                webView.evaluateJavascript("window.onPetTapped && window.onPetTapped();", null);
            }
        }
    };
    private final Runnable doubleTapRunnable = new Runnable() {
        @Override
        public void run() {
            tapCount = 0;
            lastTapUpMs = 0L;
            toggleCareHud();
        }
    };
    private final Runnable hudAutoHideRunnable = new Runnable() {
        @Override
        public void run() {
            setHudVisible(false);
        }
    };

    private class NativeBubbleBridge {
        @JavascriptInterface
        public void showBubble(final String text, final int durationMs, final int spriteHeightDp) {
            physicsHandler.post(new Runnable() {
                @Override
                public void run() {
                    showNativeBubble(text, durationMs, spriteHeightDp);
                }
            });
        }
    }

    // Display & Viewport metrics
    private int viewW;
    private int viewH;
    private int awakeViewW = 0;
    private int awakeViewH = 0;
    private int sleepViewW = 0;
    private int sleepViewH = 0;
    private int footOffsetPx;
    private int screenW = 1080;
    private int screenH = 2200;
    private int topSystemOffsetPx = 0;
    private boolean topOffsetCalibrated = false;

    // Pet & Grid Configuration
    private boolean isFlyingPet = false;
    private double[] rowRatios = new double[] { 0.365, 0.497, 0.629, 0.76, 0.92 };
    private int[] rowYs = new int[] { 740, 1050, 1360, 1670, 2020 };
    private int currentRowIndex = 4; // Start at bottom dock
    private int pendingPreviewRowIndex = -1;
    private int petHunger = 80;
    private int petHappiness = 80;
    private int petBigMeatStock = 0;
    private int petVitaminStock = 0;
    private String petStage = "rookie";
    private boolean isPetFrozen = false;
    private long hungerHeartMs = 3600000L;
    private long lastHungerDropAtMs = 0L;
    private long lastHungerClockStepMs = 0L;
    private boolean isPetSleeping = false;
    private String currentSpeciesName = "Digimon";
    private String currentQuotesJson = "[]";

    // In-place Evolution Tracking
    private String loadedSpeciesKey = "";
    private String pendingEvolvedMessage = "";
    private long nextEvoTriggerMs = 0L;
    private String nextEvoPayloadJson = "";

    // 5-State Machine Variables
    private PetState petState = PetState.IDLE;
    private OffScreenPhase offScreenPhase = OffScreenPhase.NONE;
    private float posX = 120f;
    private float posY = 1200f;
    private float targetX = 120f;
    private float targetY = 1200f;

    // Jump arc state
    private float jumpStartX = 0f;
    private float jumpStartY = 0f;
    private float jumpEndX = 0f;
    private float jumpEndY = 0f;
    private int jumpTargetRow = 0;
    private long jumpStartMs = 0L;
    private static final long JUMP_DURATION_MS = 560L;
    private static final long OFF_SCREEN_MIN_COOLDOWN_MS = 180_000L;
    private static final long OFF_SCREEN_NEEDY_COOLDOWN_MS = 120_000L;

    // Timers & Phases
    private long stateUntilMs = 0L;
    private long offScreenWakeMs = 0L;
    private long lastOffScreenAtMs = 0L;
    private long clearItemAtMs = 0L;
    private int cyclesSinceForage = 0;
    private boolean exitToRight = true;
    private boolean enterFromTop = false;
    private String pendingForageKind = "meat"; // "meat" or "friends"
    private String carriedItem = "";
    private float hoverPhase = 0f;

    // Visual sync tracking (avoid redundant evaluateJavascript calls)
    private String lastJsAnimMode = "";
    private boolean lastJsFacingRight = true;
    private String lastJsCarriedItem = "";
    private boolean facingRight = true;
    private boolean isUserDragging = false;
    private boolean physicsStarted = false;

    private final Runnable physicsRunnable = new Runnable() {
        @Override
        public void run() {
            if (!isRunning || floatingView == null || params == null) {
                return;
            }
            stepPhysics(System.currentTimeMillis());
            physicsHandler.postDelayed(this, FRAME_MS);
        }
    };

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

        parseConfigFromIntent(intent);

        if (floatingView == null) {
            setupFloatingView(intent);
        } else {
            updateFloatingView(intent);
        }

        isRunning = true;
        if (!physicsStarted) {
            physicsStarted = true;
            physicsHandler.postDelayed(physicsRunnable, 250);
        }
        return START_STICKY;
    }

    private void parseConfigFromIntent(Intent intent) {
        SharedPreferences syncPrefs = getSharedPreferences("digipet_overlay_sync", MODE_PRIVATE);
        long nowMs = System.currentTimeMillis();
        if (intent == null) {
            int pendingMeat = Math.max(0, syncPrefs.getInt("pendingMeatUsed", 0));
            int pendingVit = Math.max(0, syncPrefs.getInt("pendingVitUsed", 0));
            petHunger = syncPrefs.getInt("lastKnownHunger", petHunger);
            petHappiness = syncPrefs.getInt("lastKnownHappiness", petHappiness);
            petBigMeatStock = Math.max(0, syncPrefs.getInt("lastKnownMeatStock", petBigMeatStock) - pendingMeat);
            petVitaminStock = Math.max(0, syncPrefs.getInt("lastKnownVitStock", petVitaminStock) - pendingVit);
            petStage = syncPrefs.getString("petStage", petStage);
            isPetFrozen = syncPrefs.getBoolean("isPetFrozen", isPetFrozen);
            hungerHeartMs = syncPrefs.getLong("hungerHeartMs", hungerHeartMs);
            lastHungerDropAtMs = syncPrefs.getLong("lastHungerDropAtMs", nowMs);
            advanceOverlayHungerClock(nowMs);
            updateHudStatsText();
            return;
        }
        isFlyingPet = intent.getBooleanExtra("isFlying", false);
        isPetSleeping = intent.getBooleanExtra("isSleeping", false);
        isPetFrozen = intent.getBooleanExtra("isFrozen", syncPrefs.getBoolean("isPetFrozen", false));
        String incStage = intent.getStringExtra("stage");
        if (incStage != null && !incStage.isEmpty()) {
            petStage = incStage;
        } else {
            petStage = syncPrefs.getString("petStage", petStage);
        }
        hungerHeartMs = intent.getLongExtra("hungerHeartMs", syncPrefs.getLong("hungerHeartMs", hungerHeartMs));
        long incAnchor = intent.getLongExtra("lastHungerDropAtMs", syncPrefs.getLong("lastHungerDropAtMs", nowMs));
        if (incAnchor <= 0L) incAnchor = nowMs;

        int pendingMeat = Math.max(0, syncPrefs.getInt("pendingMeatUsed", 0));
        int pendingVit = Math.max(0, syncPrefs.getInt("pendingVitUsed", 0));
        int pendingPraise = Math.max(0, syncPrefs.getInt("pendingPraiseCount", 0));
        long lastOverlayMeatAtMs = syncPrefs.getLong("lastOverlayMeatAtMs", 0L);

        pendingPreviewRowIndex = intent.getIntExtra("previewRowIndex", -1);
        petHunger = intent.getIntExtra("hunger", syncPrefs.getInt("lastKnownHunger", 80));
        petHappiness = intent.getIntExtra("happiness", syncPrefs.getInt("lastKnownHappiness", 80));
        if (intent.hasExtra("bigMeatStock")) {
            petBigMeatStock = Math.max(0, intent.getIntExtra("bigMeatStock", petBigMeatStock) - pendingMeat);
        } else {
            petBigMeatStock = Math.max(0, syncPrefs.getInt("lastKnownMeatStock", petBigMeatStock) - pendingMeat);
        }
        if (intent.hasExtra("vitaminStock")) {
            petVitaminStock = Math.max(0, intent.getIntExtra("vitaminStock", petVitaminStock) - pendingVit);
        } else {
            petVitaminStock = Math.max(0, syncPrefs.getInt("lastKnownVitStock", petVitaminStock) - pendingVit);
        }
        if (pendingMeat > 0) {
            petHunger = Math.min(100, petHunger + pendingMeat * 25);
            if (lastOverlayMeatAtMs > incAnchor) {
                incAnchor = lastOverlayMeatAtMs;
            }
        }
        if (pendingMeat > 0 || pendingVit > 0 || pendingPraise > 0) {
            petHappiness = Math.min(100, petHappiness + pendingMeat * 10 + pendingVit * 20 + pendingPraise * 15);
        }
        lastHungerDropAtMs = incAnchor;

        String sName = intent.getStringExtra("speciesName");
        if (sName != null && !sName.isEmpty()) currentSpeciesName = sName;
        String qJson = intent.getStringExtra("quotesJson");
        if (qJson != null && !qJson.isEmpty()) currentQuotesJson = qJson;
        if (lastOffScreenAtMs == 0L) {
            lastOffScreenAtMs = nowMs;
        }
        advanceOverlayHungerClock(nowMs);
        updateHudStatsText();
        if (hudVisible) {
            updateCareHudPositions();
        }

        String evoMsg = intent.getStringExtra("evolvedMessage");
        pendingEvolvedMessage = evoMsg != null ? evoMsg : "";

        String triggerStr = intent.getStringExtra("nextEvoTriggerMsStr");
        if (triggerStr != null && !triggerStr.isEmpty()) {
            try {
                nextEvoTriggerMs = Long.parseLong(triggerStr);
            } catch (Exception ignored) {
                nextEvoTriggerMs = 0L;
            }
        } else {
            nextEvoTriggerMs = 0L;
        }

        String evoPayload = intent.getStringExtra("nextEvoPayloadJson");
        nextEvoPayloadJson = evoPayload != null ? evoPayload : "";

        String ratiosJson = intent.getStringExtra("gridRowRatiosJson");
        if (ratiosJson != null && !ratiosJson.isEmpty()) {
            try {
                JSONArray arr = new JSONArray(ratiosJson);
                if (arr.length() > 0) {
                    double[] parsed = new double[arr.length()];
                    for (int i = 0; i < arr.length(); i++) {
                        double val = arr.optDouble(i, 0.90);
                        if (val < 0.12) val = 0.12;
                        if (val > 0.96) val = 0.96;
                        parsed[i] = val;
                    }
                    rowRatios = parsed;
                }
            } catch (Exception ignored) {
                // Keep default ratios
            }
        }
        refreshScreenMetrics();
    }

    private void refreshScreenMetrics() {
        if (windowManager != null) {
            DisplayMetrics dm = new DisplayMetrics();
            windowManager.getDefaultDisplay().getRealMetrics(dm);
            if (dm.widthPixels > 100 && dm.heightPixels > 100) {
                screenW = dm.widthPixels;
                screenH = dm.heightPixels;
            }
        } else {
            DisplayMetrics dm = getResources().getDisplayMetrics();
            screenW = Math.max(320, dm.widthPixels);
            screenH = Math.max(480, dm.heightPixels);
        }

        if (!topOffsetCalibrated) {
            int statusResId = getResources().getIdentifier("status_bar_height", "dimen", "android");
            if (statusResId > 0) {
                topSystemOffsetPx = getResources().getDimensionPixelSize(statusResId);
            }
        }

        rowYs = new int[rowRatios.length];
        int minRow = dpToPx(72);
        int maxRow = screenH - dpToPx(14);
        for (int i = 0; i < rowRatios.length; i++) {
            int y = (int) Math.round(rowRatios[i] * screenH);
            if (y < minRow) y = minRow;
            if (y > maxRow) y = maxRow;
            rowYs[i] = y;
        }
        if (currentRowIndex >= rowYs.length) {
            currentRowIndex = rowYs.length - 1;
        }
    }

    private float getTopYForFootY(float footY) {
        return footY - (viewH - footOffsetPx) - topSystemOffsetPx;
    }

    private float getFootYForTopY(float topY) {
        return topY + topSystemOffsetPx + (viewH - footOffsetPx);
    }

    private void scheduleTopOffsetCalibration() {
        if (floatingView == null) return;
        floatingView.post(new Runnable() {
            @Override
            public void run() {
                if (floatingView == null || params == null || isUserDragging) return;
                if (offScreenPhase == OffScreenPhase.HIDDEN || floatingView.getVisibility() != View.VISIBLE) return;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT && !floatingView.isAttachedToWindow()) return;
                int[] loc = new int[2];
                floatingView.getLocationOnScreen(loc);
                int measured = loc[1] - params.y;
                if (measured >= 0 && measured <= dpToPx(84) && params.y > 0) {
                    if (measured != topSystemOffsetPx) {
                        topSystemOffsetPx = measured;
                        if (!isFlyingPet && petState != PetState.OFF_SCREEN && petState != PetState.JUMPING) {
                            posY = getTopYForFootY(rowYs[currentRowIndex]);
                            applyWindowPosition();
                        }
                    }
                    topOffsetCalibrated = true;
                }
            }
        });
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "DigiPet Overlay Companion",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Shows your floating Digimon pet on top of all apps");
            channel.setSound(null, null);
            channel.enableVibration(false);
            channel.setShowBadge(false);
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
            .setContentTitle("DigiPet Companion Roaming")
            .setContentText("Pet navigates your home screen. Tap 'Close Overlay' to dismiss.")
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setSound(null)
            .setVibrate(new long[]{0})
            .setContentIntent(pendingOpen)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "✕ CLOSE OVERLAY", pendingStop)
            .setOngoing(true);

        return builder.build();
    }

    private void setupFloatingView(Intent intent) {
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        refreshScreenMetrics();

        int layoutType;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            layoutType = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            layoutType = WindowManager.LayoutParams.TYPE_PHONE;
        }

        // Tightly size overlay window to the rendered Digimon sprite bounds (expands automatically for large or sleeping sprites)
        viewW = dpToPx(184);
        viewH = dpToPx(184);
        footOffsetPx = dpToPx(6);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.TRANSPARENT);
        webView.setClickable(false);
        webView.setFocusable(false);
        webView.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                return false;
            }
        });

        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
            webSettings.setAllowFileAccessFromFileURLs(true);
            webSettings.setAllowUniversalAccessFromFileURLs(true);
        }
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        webView.addJavascriptInterface(new NativeBubbleBridge(), "NativeBubbleBridge");

        loadWebViewFromIntent(intent, pendingEvolvedMessage);
        pendingEvolvedMessage = "";
        int initTargetW = isPetSleeping ? sleepViewW : awakeViewW;
        int initTargetH = isPetSleeping ? sleepViewH : awakeViewH;
        if (initTargetW > 0 && initTargetH > 0) {
            viewW = initTargetW;
            viewH = initTargetH;
        }

        params = new WindowManager.LayoutParams(
            viewW,
            viewH,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        );

        params.gravity = Gravity.TOP | Gravity.START;
        currentRowIndex = Math.max(0, rowYs.length - 1);
        lastOffScreenAtMs = System.currentTimeMillis();
        posX = Math.max(dpToPx(8), (screenW - viewW) * 0.5f);
        if (isPetSleeping) {
            posY = isFlyingPet ? (screenH * 0.45f) : getTopYForFootY(rowYs[currentRowIndex]);
            petState = PetState.IDLE;
            stateUntilMs = System.currentTimeMillis() + 1400L;
        } else if (isFlyingPet) {
            posY = screenH * 0.38f;
            petState = PetState.FLYING;
            pickNextFlyWaypoint();
        } else {
            posY = getTopYForFootY(rowYs[currentRowIndex]);
            petState = PetState.IDLE;
            stateUntilMs = System.currentTimeMillis() + 1400L;
        }
        params.x = Math.round(posX);
        params.y = Math.round(posY);

        FrameLayout rootLayout = new FrameLayout(this) {
            @Override
            public boolean onInterceptTouchEvent(MotionEvent ev) {
                return true;
            }
        };
        rootLayout.setBackgroundColor(Color.TRANSPARENT);

        rootLayout.addView(webView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));

        // Dragging & Tapping Touch Listener (pauses state machine during drag, supports double-tap to open app & drag-to-bottom to close)
        rootLayout.setOnTouchListener(new View.OnTouchListener() {
            private int initialX;
            private int initialY;
            private float initialTouchX;
            private float initialTouchY;
            private long touchStartTime;
            private boolean isDragging = false;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                if (offScreenPhase == OffScreenPhase.HIDDEN) {
                    return false;
                }
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        isUserDragging = true;
                        initialX = params.x;
                        initialY = params.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        touchStartTime = System.currentTimeMillis();
                        isDragging = false;
                        isOverDismissZone = false;
                        return true;

                    case MotionEvent.ACTION_MOVE:
                        int dx = (int) (event.getRawX() - initialTouchX);
                        int dy = (int) (event.getRawY() - initialTouchY);
                        if (!isDragging && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
                            isDragging = true;
                            physicsHandler.removeCallbacks(singleTapRunnable);
                            physicsHandler.removeCallbacks(doubleTapRunnable);
                            tapCount = 0;
                            lastTapUpMs = 0L;
                            setHudVisible(false);
                            setChatBarVisible(false);
                            syncVisualState("walk", dx >= 0, carriedItem, null);
                            setDismissTargetVisible(true, false);
                        }
                        if (isDragging) {
                            params.x = initialX + dx;
                            params.y = initialY + dy;
                            posX = params.x;
                            posY = params.y;
                            safeUpdateWindowLayout();
                            boolean inDismiss = isDragPointInDismissZone(event.getRawY());
                            if (inDismiss != isOverDismissZone) {
                                isOverDismissZone = inDismiss;
                                setDismissTargetVisible(true, inDismiss);
                                if (inDismiss && floatingView != null) {
                                    floatingView.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);
                                }
                            }
                        }
                        return true;

                    case MotionEvent.ACTION_UP:
                    case MotionEvent.ACTION_CANCEL:
                        isUserDragging = false;
                        boolean shouldCloseOverlay = isDragging && isOverDismissZone;
                        setDismissTargetVisible(false, false);
                        isOverDismissZone = false;

                        if (shouldCloseOverlay) {
                            setHudVisible(false);
                            setChatBarVisible(false);
                            hideNativeBubble();
                            stopSelf();
                            return true;
                        }

                        long duration = System.currentTimeMillis() - touchStartTime;
                        int diffX = (int) Math.abs(event.getRawX() - initialTouchX);
                        int diffY = (int) Math.abs(event.getRawY() - initialTouchY);

                        if (!isDragging && duration < 320 && diffX < 20 && diffY < 20) {
                            long now = System.currentTimeMillis();
                            physicsHandler.removeCallbacks(singleTapRunnable);
                            physicsHandler.removeCallbacks(doubleTapRunnable);
                            if (lastTapUpMs > 0L && (now - lastTapUpMs) <= 320L) {
                                tapCount++;
                            } else {
                                tapCount = 1;
                            }
                            lastTapUpMs = now;
                            if (tapCount >= 3) {
                                tapCount = 0;
                                lastTapUpMs = 0L;
                                setHudVisible(false);
                                setChatBarVisible(false);
                                openMainApp();
                            } else if (tapCount == 2) {
                                physicsHandler.postDelayed(doubleTapRunnable, 270L);
                            } else {
                                physicsHandler.postDelayed(singleTapRunnable, 290L);
                            }
                        } else if (isPetSleeping) {
                            if (!isFlyingPet) {
                                snapGroundedToNearestRow();
                            }
                            petState = PetState.IDLE;
                            syncVisualState("sleep", facingRight, "", null);
                        } else if (!isFlyingPet) {
                            // Snap grounded pet feet onto nearest surface row
                            snapGroundedToNearestRow();
                            petState = PetState.IDLE;
                            stateUntilMs = System.currentTimeMillis() + 1200L;
                        } else {
                            petState = PetState.FLYING;
                            pickNextFlyWaypoint();
                        }
                        return true;
                }
                return false;
            }
        });

        floatingView = rootLayout;
        windowManager.addView(floatingView, params);
        setupBubbleOverlay(layoutType);
        setupCareHudOverlay(layoutType);
        setupChatBarOverlay(layoutType);
        setupDismissOverlay(layoutType);
        scheduleTopOffsetCalibration();
    }

    private void openMainApp() {
        try {
            Intent openIntent = new Intent(this, MainActivity.class);
            openIntent.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK |
                Intent.FLAG_ACTIVITY_SINGLE_TOP |
                Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
            );
            startActivity(openIntent);
        } catch (Exception ignored) {
            // Safe ignore
        }
    }

    private boolean isDragPointInDismissZone(float rawY) {
        int thresholdRaw = screenH - dpToPx(135);
        float petBottom = params.y + viewH + topSystemOffsetPx;
        return rawY >= thresholdRaw || petBottom >= (screenH - dpToPx(110));
    }

    private void setupDismissOverlay(int layoutType) {
        if (windowManager == null || dismissContainer != null) return;

        dismissContainer = new LinearLayout(this);
        dismissContainer.setOrientation(LinearLayout.VERTICAL);
        dismissContainer.setGravity(Gravity.CENTER_HORIZONTAL);
        dismissContainer.setBackgroundColor(Color.TRANSPARENT);
        dismissContainer.setVisibility(View.GONE);
        int pad = dpToPx(8);
        dismissContainer.setPadding(pad, pad, pad, pad);

        dismissCircleView = new TextView(this);
        dismissCircleView.setText("✕");
        dismissCircleView.setTextColor(Color.WHITE);
        dismissCircleView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18f);
        dismissCircleView.setTypeface(Typeface.DEFAULT_BOLD);
        dismissCircleView.setGravity(Gravity.CENTER);
        int circleSize = dpToPx(48);
        LinearLayout.LayoutParams circleLp = new LinearLayout.LayoutParams(circleSize, circleSize);
        dismissContainer.addView(dismissCircleView, circleLp);

        dismissLabelView = new TextView(this);
        dismissLabelView.setText("DROP TO CLOSE");
        dismissLabelView.setTextColor(0xFFFDA4AF);
        dismissLabelView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 9.5f);
        dismissLabelView.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
        dismissLabelView.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams labelLp = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        labelLp.topMargin = dpToPx(4);
        dismissContainer.addView(dismissLabelView, labelLp);

        styleDismissTarget(false);

        dismissParams = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
            WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE |
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        );
        dismissParams.gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
        dismissParams.x = 0;
        dismissParams.y = dpToPx(24);

        try {
            windowManager.addView(dismissContainer, dismissParams);
        } catch (Exception ignored) {
            dismissContainer = null;
        }
    }

    private void styleDismissTarget(boolean highlighted) {
        if (dismissCircleView != null) {
            GradientDrawable circleBg = new GradientDrawable();
            circleBg.setShape(GradientDrawable.OVAL);
            circleBg.setColor(highlighted ? 0xEEEF4444 : 0xCC0F172A);
            circleBg.setStroke(dpToPx(2), highlighted ? 0xFFFFFFFF : 0xFFFB7185);
            dismissCircleView.setBackground(circleBg);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                dismissCircleView.setElevation(dpToPx(highlighted ? 8 : 4));
            }
        }
        if (dismissLabelView != null) {
            dismissLabelView.setText(highlighted ? "RELEASE TO CLOSE" : "DROP TO CLOSE");
            dismissLabelView.setTextColor(highlighted ? 0xFFFFFFFF : 0xFFFDA4AF);
        }
        if (dismissContainer != null) {
            float scale = highlighted ? 1.18f : 1.0f;
            dismissContainer.setScaleX(scale);
            dismissContainer.setScaleY(scale);
        }
    }

    private void setDismissTargetVisible(boolean visible, boolean highlighted) {
        if (dismissContainer == null) return;
        if (visible) {
            styleDismissTarget(highlighted);
            if (!dismissVisible) {
                dismissVisible = true;
                dismissContainer.setVisibility(View.VISIBLE);
            }
        } else if (dismissVisible) {
            dismissVisible = false;
            dismissContainer.setVisibility(View.GONE);
        }
    }

    private void setupBubbleOverlay(int layoutType) {
        if (windowManager == null || bubbleContainer != null) return;

        bubbleContainer = new FrameLayout(this);
        bubbleContainer.setBackgroundColor(Color.TRANSPARENT);
        bubbleContainer.setVisibility(View.GONE);
        int padShadow = dpToPx(6);
        bubbleContainer.setPadding(padShadow, padShadow, padShadow, padShadow);

        bubbleTextView = new TextView(this);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(0xF7FFFFFF);
        bg.setCornerRadius(dpToPx(12));
        bg.setStroke(dpToPx(2), 0xFF0F172A);
        bubbleTextView.setBackground(bg);
        bubbleTextView.setTextColor(0xFF0F172A);
        bubbleTextView.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
        bubbleTextView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11.5f);
        bubbleTextView.setGravity(Gravity.CENTER);
        bubbleTextView.setSingleLine(false);
        bubbleTextView.setEllipsize(null);
        bubbleTextView.setLineSpacing(dpToPx(1), 1.15f);
        bubbleTextView.setPadding(dpToPx(10), dpToPx(6), dpToPx(10), dpToPx(6));
        int maxBubbleW = Math.min(dpToPx(236), Math.max(dpToPx(160), screenW - dpToPx(28)));
        bubbleTextView.setMaxWidth(maxBubbleW);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            bubbleTextView.setElevation(dpToPx(4));
        }

        bubbleContainer.addView(bubbleTextView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        ));

        bubbleParams = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
            WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE |
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        );
        bubbleParams.gravity = Gravity.TOP | Gravity.START;
        bubbleParams.x = 0;
        bubbleParams.y = 0;

        try {
            windowManager.addView(bubbleContainer, bubbleParams);
        } catch (Exception ignored) {
            bubbleContainer = null;
        }
    }

    private void showNativeBubble(String text, int durationMs, int spriteHeightDp) {
        if (bubbleContainer == null || bubbleTextView == null || text == null || text.trim().isEmpty()) {
            return;
        }
        if (offScreenPhase == OffScreenPhase.HIDDEN) {
            return;
        }
        if (spriteHeightDp > 16 && spriteHeightDp < 140) {
            bubbleSpriteHeightDp = spriteHeightDp;
        }
        int maxBubbleW = Math.min(dpToPx(236), Math.max(dpToPx(160), screenW - dpToPx(28)));
        bubbleTextView.setMaxWidth(maxBubbleW);
        bubbleTextView.setText(text.trim());
        bubbleVisible = true;
        bubbleContainer.setVisibility(View.VISIBLE);
        updateBubblePosition();

        physicsHandler.removeCallbacks(hideBubbleRunnable);
        long safeDuration = Math.max(2400L, Math.min(9000L, durationMs));
        physicsHandler.postDelayed(hideBubbleRunnable, safeDuration);
    }

    private void hideNativeBubble() {
        bubbleVisible = false;
        if (bubbleContainer != null) {
            bubbleContainer.setVisibility(View.GONE);
        }
    }

    private void updateBubblePosition() {
        if (!bubbleVisible || bubbleContainer == null || bubbleParams == null || params == null || windowManager == null) {
            return;
        }
        try {
            int maxWSpec = View.MeasureSpec.makeMeasureSpec(Math.max(dpToPx(160), screenW - dpToPx(16)), View.MeasureSpec.AT_MOST);
            int maxHSpec = View.MeasureSpec.makeMeasureSpec(Math.max(dpToPx(120), screenH / 2), View.MeasureSpec.AT_MOST);
            bubbleContainer.measure(maxWSpec, maxHSpec);
            int bw = Math.max(dpToPx(48), bubbleContainer.getMeasuredWidth());
            int bh = Math.max(dpToPx(28), bubbleContainer.getMeasuredHeight());

            int petWindowY = params.y;
            int petWindowX = params.x;

            int bx = Math.round(petWindowX + (viewW - bw) * 0.5f);
            int minBx = dpToPx(6);
            int maxBx = Math.max(minBx, screenW - bw - dpToPx(6));
            if (bx < minBx) bx = minBx;
            if (bx > maxBx) bx = maxBx;

            // Anchor right above the sprite's actual head inside the pet window (above stats HUD if visible)
            int spriteTopInWindow = Math.max(dpToPx(4), viewH - dpToPx(12 + bubbleSpriteHeightDp));
            int spriteTopY = petWindowY + spriteTopInWindow;
            int hudTopGap = hudVisible ? dpToPx(36) : 0;
            int by = spriteTopY - bh - dpToPx(2) - hudTopGap;

            // If near top of screen, flip bubble below the pet (or below buttons HUD if visible)
            if (by < dpToPx(8)) {
                by = petWindowY + viewH + (hudVisible ? dpToPx(64) : -dpToPx(2));
                int maxBy = Math.max(dpToPx(8), screenH - bh - dpToPx(16) - topSystemOffsetPx);
                if (by > maxBy) by = maxBy;
            }

            if (bubbleParams.x != bx || bubbleParams.y != by) {
                bubbleParams.x = bx;
                bubbleParams.y = by;
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.KITKAT || bubbleContainer.isAttachedToWindow()) {
                    windowManager.updateViewLayout(bubbleContainer, bubbleParams);
                }
            }
        } catch (Exception ignored) {
            // Safe guard during shutdown
        }
    }

    private void setupCareHudOverlay(int layoutType) {
        if (windowManager == null || hudStatsContainer != null) return;

        // 1. Top Stats Pill (Hunger Hearts + Happiness Stars)
        hudStatsContainer = new LinearLayout(this);
        hudStatsContainer.setOrientation(LinearLayout.HORIZONTAL);
        hudStatsContainer.setGravity(Gravity.CENTER);
        hudStatsContainer.setVisibility(View.GONE);
        GradientDrawable statsBg = new GradientDrawable();
        statsBg.setColor(0xEB0F172A);
        statsBg.setCornerRadius(dpToPx(12));
        statsBg.setStroke(dpToPx(1), 0xFF38BDF8);
        hudStatsContainer.setBackground(statsBg);
        hudStatsContainer.setPadding(dpToPx(10), dpToPx(4), dpToPx(10), dpToPx(4));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            hudStatsContainer.setElevation(dpToPx(6));
        }

        hudStatsTextView = new TextView(this);
        hudStatsTextView.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
        hudStatsTextView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 11f);
        hudStatsTextView.setGravity(Gravity.CENTER);
        hudStatsTextView.setSingleLine(true);
        hudStatsContainer.addView(hudStatsTextView, new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        ));

        hudStatsParams = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
            WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE |
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        );
        hudStatsParams.gravity = Gravity.TOP | Gravity.START;
        hudStatsParams.x = 0;
        hudStatsParams.y = 0;

        try {
            windowManager.addView(hudStatsContainer, hudStatsParams);
        } catch (Exception ignored) {
            hudStatsContainer = null;
        }

        // 2. Bottom 4-Button Care Bar (MEAT, VIT, PRAISE, CHAT)
        hudButtonsContainer = new LinearLayout(this);
        hudButtonsContainer.setOrientation(LinearLayout.HORIZONTAL);
        hudButtonsContainer.setGravity(Gravity.CENTER);
        hudButtonsContainer.setVisibility(View.GONE);
        GradientDrawable barBg = new GradientDrawable();
        barBg.setColor(0xEB0F172A);
        barBg.setCornerRadius(dpToPx(14));
        barBg.setStroke(dpToPx(1), 0xFF334155);
        hudButtonsContainer.setBackground(barBg);
        hudButtonsContainer.setPadding(dpToPx(5), dpToPx(5), dpToPx(5), dpToPx(5));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            hudButtonsContainer.setElevation(dpToPx(8));
        }
        hudButtonsContainer.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                if (event.getAction() == MotionEvent.ACTION_DOWN) {
                    resetHudAutoHide();
                }
                return false;
            }
        });

        LinearLayout meatBtn = createHudActionButton("🍖", "MEAT", 0xFFFDBA74, 0xFFEA580C, true);
        hudMeatLabel = (TextView) meatBtn.getChildAt(1);
        meatBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                v.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);
                onHudMeatClicked();
            }
        });

        LinearLayout vitBtn = createHudActionButton("💊", "VIT", 0xFF7DD3FC, 0xFF0284C7, false);
        hudVitLabel = (TextView) vitBtn.getChildAt(1);
        vitBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                v.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);
                onHudVitClicked();
            }
        });

        LinearLayout praiseBtn = createHudActionButton("💖", "PRAISE", 0xFFFDA4AF, 0xFFE11D48, false);
        praiseBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                v.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);
                onHudPraiseClicked();
            }
        });

        LinearLayout chatBtn = createHudActionButton("💬", "CHAT", 0xFF67E8F9, 0xFF0891B2, false);
        chatBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                v.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY);
                onHudChatClicked();
            }
        });

        hudButtonsContainer.addView(meatBtn);
        hudButtonsContainer.addView(vitBtn);
        hudButtonsContainer.addView(praiseBtn);
        hudButtonsContainer.addView(chatBtn);

        hudButtonsParams = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        );
        hudButtonsParams.gravity = Gravity.TOP | Gravity.START;
        hudButtonsParams.x = 0;
        hudButtonsParams.y = 0;

        try {
            windowManager.addView(hudButtonsContainer, hudButtonsParams);
        } catch (Exception ignored) {
            hudButtonsContainer = null;
        }

        updateHudStatsText();
    }

    private LinearLayout createHudActionButton(String icon, String label, int textColor, int borderColor, boolean isFirst) {
        LinearLayout btn = new LinearLayout(this);
        btn.setOrientation(LinearLayout.VERTICAL);
        btn.setGravity(Gravity.CENTER);
        btn.setClickable(true);
        btn.setFocusable(false);
        GradientDrawable btnBg = new GradientDrawable();
        btnBg.setColor(0xD91E293B);
        btnBg.setCornerRadius(dpToPx(10));
        btnBg.setStroke(dpToPx(1), borderColor);
        btn.setBackground(btnBg);
        btn.setPadding(dpToPx(7), dpToPx(4), dpToPx(7), dpToPx(4));

        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
            dpToPx(54),
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        if (!isFirst) {
            lp.leftMargin = dpToPx(4);
        }
        btn.setLayoutParams(lp);

        TextView iconTv = new TextView(this);
        iconTv.setText(icon);
        iconTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f);
        iconTv.setGravity(Gravity.CENTER);
        btn.addView(iconTv);

        TextView labelTv = new TextView(this);
        labelTv.setText(label);
        labelTv.setTextColor(textColor);
        labelTv.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
        labelTv.setTextSize(TypedValue.COMPLEX_UNIT_SP, 8.5f);
        labelTv.setGravity(Gravity.CENTER);
        labelTv.setSingleLine(true);
        btn.addView(labelTv);

        return btn;
    }

    private void updateHudStatsText() {
        int filledHearts = petHunger <= 0 ? 0 : Math.min(4, (int) Math.ceil((petHunger / 100.0) * 4.0));
        int filledStars = petHappiness <= 0 ? 0 : Math.min(4, (int) Math.ceil((petHappiness / 100.0) * 4.0));

        if (hudStatsTextView != null) {
            SpannableStringBuilder sb = new SpannableStringBuilder();
            int start = sb.length();
            sb.append("H:");
            sb.setSpan(new ForegroundColorSpan(0xFFFCD34D), start, sb.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);

            for (int i = 0; i < 4; i++) {
                boolean f = i < filledHearts;
                int s = sb.length();
                sb.append(f ? "♥" : "♡");
                sb.setSpan(new ForegroundColorSpan(f ? 0xFFFB7185 : 0xFF475569), s, sb.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
            }

            int sepStart = sb.length();
            sb.append("  ");
            sb.setSpan(new ForegroundColorSpan(0xFF64748B), sepStart, sb.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);

            int starPrefixStart = sb.length();
            sb.append("S:");
            sb.setSpan(new ForegroundColorSpan(0xFF7DD3FC), starPrefixStart, sb.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);

            for (int i = 0; i < 4; i++) {
                boolean f = i < filledStars;
                int s = sb.length();
                sb.append(f ? "★" : "☆");
                sb.setSpan(new ForegroundColorSpan(f ? 0xFFFACC15 : 0xFF475569), s, sb.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
            }

            hudStatsTextView.setText(sb);
        }

        if (hudMeatLabel != null) {
            hudMeatLabel.setText(petBigMeatStock > 0 ? ("MEAT " + petBigMeatStock) : "MEAT 0");
            hudMeatLabel.setTextColor(petBigMeatStock > 0 ? 0xFFFDBA74 : 0xFF94A3B8);
        }
        if (hudVitLabel != null) {
            hudVitLabel.setText(petVitaminStock > 0 ? ("VIT " + petVitaminStock) : "VIT 0");
            hudVitLabel.setTextColor(petVitaminStock > 0 ? 0xFF7DD3FC : 0xFF94A3B8);
        }
    }

    private void toggleCareHud() {
        setHudVisible(!hudVisible);
    }

    private void setHudVisible(boolean visible) {
        if (hudStatsContainer == null || hudButtonsContainer == null) return;
        if (visible && offScreenPhase == OffScreenPhase.HIDDEN) return;

        hudVisible = visible;
        physicsHandler.removeCallbacks(hudAutoHideRunnable);
        if (visible) {
            setChatBarVisible(false);
            advanceOverlayHungerClock(System.currentTimeMillis());
            updateHudStatsText();
            hudStatsContainer.setVisibility(View.VISIBLE);
            hudButtonsContainer.setVisibility(View.VISIBLE);
            updateCareHudPositions();
            if (bubbleVisible) {
                updateBubblePosition();
            }
            resetHudAutoHide();
        } else {
            hudStatsContainer.setVisibility(View.GONE);
            hudButtonsContainer.setVisibility(View.GONE);
            if (bubbleVisible) {
                updateBubblePosition();
            }
        }
    }

    private void resetHudAutoHide() {
        physicsHandler.removeCallbacks(hudAutoHideRunnable);
        if (hudVisible) {
            physicsHandler.postDelayed(hudAutoHideRunnable, 3000L);
        }
    }

    private void updateCareHudPositions() {
        if (!hudVisible || hudStatsContainer == null || hudButtonsContainer == null || params == null || windowManager == null) {
            return;
        }
        try {
            int maxWSpec = View.MeasureSpec.makeMeasureSpec(Math.max(dpToPx(200), screenW - dpToPx(16)), View.MeasureSpec.AT_MOST);
            int maxHSpec = View.MeasureSpec.makeMeasureSpec(dpToPx(120), View.MeasureSpec.AT_MOST);

            hudStatsContainer.measure(maxWSpec, maxHSpec);
            int sw = Math.max(dpToPx(80), hudStatsContainer.getMeasuredWidth());
            int sh = Math.max(dpToPx(24), hudStatsContainer.getMeasuredHeight());

            hudButtonsContainer.measure(maxWSpec, maxHSpec);
            int bw = Math.max(dpToPx(180), hudButtonsContainer.getMeasuredWidth());
            int bh = Math.max(dpToPx(42), hudButtonsContainer.getMeasuredHeight());

            int petCenterX = Math.round(params.x + viewW * 0.5f);
            int spriteTopInWindow = Math.max(dpToPx(4), viewH - dpToPx(12 + bubbleSpriteHeightDp));
            int spriteTopY = params.y + spriteTopInWindow;

            int sx = Math.round(petCenterX - sw * 0.5f);
            int minSx = dpToPx(6);
            int maxSx = Math.max(minSx, screenW - sw - dpToPx(6));
            sx = Math.max(minSx, Math.min(maxSx, sx));

            int bx = Math.round(petCenterX - bw * 0.5f);
            int minBx = dpToPx(6);
            int maxBx = Math.max(minBx, screenW - bw - dpToPx(6));
            bx = Math.max(minBx, Math.min(maxBx, bx));

            int sy = spriteTopY - sh - dpToPx(6);
            int by = params.y + viewH - dpToPx(2);

            // Keep inside vertical screen bounds cleanly
            if (sy < dpToPx(12)) {
                sy = params.y + viewH - dpToPx(2);
                by = sy + sh + dpToPx(4);
            }
            int maxBy = Math.max(dpToPx(16), screenH - bh - dpToPx(16) - topSystemOffsetPx);
            if (by > maxBy) {
                by = maxBy;
            }

            if (hudStatsParams.x != sx || hudStatsParams.y != sy) {
                hudStatsParams.x = sx;
                hudStatsParams.y = sy;
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.KITKAT || hudStatsContainer.isAttachedToWindow()) {
                    windowManager.updateViewLayout(hudStatsContainer, hudStatsParams);
                }
            }

            if (hudButtonsParams.x != bx || hudButtonsParams.y != by) {
                hudButtonsParams.x = bx;
                hudButtonsParams.y = by;
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.KITKAT || hudButtonsContainer.isAttachedToWindow()) {
                    windowManager.updateViewLayout(hudButtonsContainer, hudButtonsParams);
                }
            }
        } catch (Exception ignored) {
            // Safe guard
        }
    }

    private void recordCareSyncDelta(int meatDelta, int vitDelta, int praiseDelta, long meatAtMs) {
        SharedPreferences prefs = getSharedPreferences("digipet_overlay_sync", MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        if (meatDelta != 0) {
            editor.putInt("pendingMeatUsed", prefs.getInt("pendingMeatUsed", 0) + meatDelta);
            if (meatAtMs > 0L) {
                editor.putLong("lastOverlayMeatAtMs", meatAtMs);
            }
        }
        if (vitDelta != 0) {
            editor.putInt("pendingVitUsed", prefs.getInt("pendingVitUsed", 0) + vitDelta);
        }
        if (praiseDelta != 0) {
            editor.putInt("pendingPraiseCount", prefs.getInt("pendingPraiseCount", 0) + praiseDelta);
        }
        editor.putInt("lastKnownHunger", petHunger);
        editor.putInt("lastKnownHappiness", petHappiness);
        editor.putInt("lastKnownMeatStock", petBigMeatStock);
        editor.putInt("lastKnownVitStock", petVitaminStock);
        editor.putLong("lastHungerDropAtMs", lastHungerDropAtMs);
        editor.apply();
    }

    private void triggerHudHopFeedback(String msg) {
        showNativeBubble(msg, 2800, bubbleSpriteHeightDp);
        if (webView != null) {
            webView.evaluateJavascript(
                "(function(){var p=document.getElementById('petWrap');if(p){p.classList.remove('hopping');void p.offsetWidth;p.classList.add('hopping');}})();",
                null
            );
        }
    }

    private void onHudMeatClicked() {
        resetHudAutoHide();
        if (isPetFrozen) {
            triggerHudHopFeedback("❄️ Cold Mode (Paused) — unfreeze in app first!");
            return;
        }
        if (isPetSleeping) {
            triggerHudHopFeedback("Zzz... Wake me up in the app before feeding!");
            return;
        }
        long nowMs = System.currentTimeMillis();
        advanceOverlayHungerClock(nowMs);
        if (petBigMeatStock <= 0) {
            triggerHudHopFeedback("Out of Big Meat! Buy more in Shop.");
            return;
        }
        petBigMeatStock--;
        petHunger = Math.min(100, petHunger + 25);
        petHappiness = Math.min(100, petHappiness + 10);
        lastHungerDropAtMs = nowMs;
        recordCareSyncDelta(1, 0, 0, nowMs);
        OverlayPlugin.rescheduleHungerAlarmsFromOverlay(this, petHunger, hungerHeartMs, lastHungerDropAtMs);
        updateHudStatsText();
        triggerHudHopFeedback("Yum!! Big Meat hits the spot! (+25 Hunger)");
    }

    private void onHudVitClicked() {
        resetHudAutoHide();
        if (isPetFrozen) {
            triggerHudHopFeedback("❄️ Cold Mode (Paused) — unfreeze in app first!");
            return;
        }
        if (isPetSleeping) {
            triggerHudHopFeedback("Zzz... Let me sleep first!");
            return;
        }
        if (petVitaminStock <= 0) {
            triggerHudHopFeedback("Out of Vitamins! Grab some in Shop.");
            return;
        }
        petVitaminStock--;
        petHappiness = Math.min(100, petHappiness + 20);
        recordCareSyncDelta(0, 1, 0, 0L);
        updateHudStatsText();
        triggerHudHopFeedback("Vitamin boost! Feeling energized! (+Happy)");
    }

    private void onHudPraiseClicked() {
        resetHudAutoHide();
        if (isPetFrozen) {
            triggerHudHopFeedback("❄️ Cold Mode (Paused) — staying fresh!");
            return;
        }
        if (isPetSleeping) {
            triggerHudHopFeedback("Zzz... *happy sleep noises* ♥");
            return;
        }
        petHappiness = Math.min(100, petHappiness + 15);
        recordCareSyncDelta(0, 0, 1, 0L);
        updateHudStatsText();
        triggerHudHopFeedback("Yay! Thanks for praising me, Tamer! ♥");
    }

    private void onHudChatClicked() {
        setHudVisible(false);
        setChatBarVisible(true);
    }

    private void setupChatBarOverlay(int layoutType) {
        if (windowManager == null || chatContainer != null) return;

        chatContainer = new LinearLayout(this);
        chatContainer.setOrientation(LinearLayout.HORIZONTAL);
        chatContainer.setGravity(Gravity.CENTER_VERTICAL);
        chatContainer.setVisibility(View.GONE);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(0xF20F172A);
        bg.setCornerRadius(dpToPx(16));
        bg.setStroke(dpToPx(2), 0xFF38BDF8);
        chatContainer.setBackground(bg);
        chatContainer.setPadding(dpToPx(10), dpToPx(6), dpToPx(8), dpToPx(6));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            chatContainer.setElevation(dpToPx(10));
        }

        chatEditText = new EditText(this);
        chatEditText.setHint("Talk to " + currentSpeciesName + "...");
        chatEditText.setHintTextColor(0xFF94A3B8);
        chatEditText.setTextColor(0xFFFFFFFF);
        chatEditText.setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f);
        chatEditText.setSingleLine(true);
        chatEditText.setImeOptions(EditorInfo.IME_ACTION_SEND);
        chatEditText.setBackgroundColor(Color.TRANSPARENT);
        chatEditText.setPadding(dpToPx(4), dpToPx(6), dpToPx(6), dpToPx(6));
        LinearLayout.LayoutParams editLp = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
        chatContainer.addView(chatEditText, editLp);

        chatEditText.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                if (actionId == EditorInfo.IME_ACTION_SEND ||
                    (event != null && event.getKeyCode() == KeyEvent.KEYCODE_ENTER && event.getAction() == KeyEvent.ACTION_DOWN)) {
                    submitNativeChat();
                    return true;
                }
                return false;
            }
        });

        TextView sendBtn = new TextView(this);
        sendBtn.setText("SEND");
        sendBtn.setTextColor(0xFF0F172A);
        sendBtn.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
        sendBtn.setTextSize(TypedValue.COMPLEX_UNIT_SP, 10.5f);
        sendBtn.setGravity(Gravity.CENTER);
        GradientDrawable sendBg = new GradientDrawable();
        sendBg.setColor(0xFF38BDF8);
        sendBg.setCornerRadius(dpToPx(10));
        sendBtn.setBackground(sendBg);
        sendBtn.setPadding(dpToPx(10), dpToPx(6), dpToPx(10), dpToPx(6));
        LinearLayout.LayoutParams sendLp = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        sendLp.leftMargin = dpToPx(6);
        chatContainer.addView(sendBtn, sendLp);
        sendBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                submitNativeChat();
            }
        });

        TextView closeBtn = new TextView(this);
        closeBtn.setText("✕");
        closeBtn.setTextColor(0xFF94A3B8);
        closeBtn.setTypeface(Typeface.DEFAULT_BOLD);
        closeBtn.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f);
        closeBtn.setGravity(Gravity.CENTER);
        closeBtn.setPadding(dpToPx(8), dpToPx(4), dpToPx(4), dpToPx(4));
        LinearLayout.LayoutParams closeLp = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        closeLp.leftMargin = dpToPx(2);
        chatContainer.addView(closeBtn, closeLp);
        closeBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                setChatBarVisible(false);
            }
        });

        chatParams = new WindowManager.LayoutParams(
            Math.min(dpToPx(340), Math.max(dpToPx(240), screenW - dpToPx(28))),
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        );
        chatParams.softInputMode = WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE;
        chatParams.gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
        chatParams.x = 0;
        chatParams.y = dpToPx(26);

        try {
            windowManager.addView(chatContainer, chatParams);
        } catch (Exception ignored) {
            chatContainer = null;
        }
    }

    private void setChatBarVisible(boolean visible) {
        if (chatContainer == null || chatParams == null || windowManager == null) return;
        chatVisible = visible;
        try {
            if (visible) {
                if (chatEditText != null) {
                    chatEditText.setHint("Talk to " + currentSpeciesName + "...");
                    chatEditText.setText("");
                }
                chatParams.width = Math.min(dpToPx(340), Math.max(dpToPx(240), screenW - dpToPx(28)));
                chatParams.flags &= ~WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE;
                chatContainer.setVisibility(View.VISIBLE);
                windowManager.updateViewLayout(chatContainer, chatParams);
                if (chatEditText != null) {
                    chatEditText.requestFocus();
                    chatEditText.postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            if (chatEditText != null && chatVisible) {
                                InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
                                if (imm != null) {
                                    imm.showSoftInput(chatEditText, InputMethodManager.SHOW_IMPLICIT);
                                }
                            }
                        }
                    }, 80L);
                }
            } else {
                chatParams.flags |= WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE;
                if (chatEditText != null) {
                    InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
                    if (imm != null) {
                        imm.hideSoftInputFromWindow(chatEditText.getWindowToken(), 0);
                    }
                    chatEditText.clearFocus();
                }
                chatContainer.setVisibility(View.GONE);
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.KITKAT || chatContainer.isAttachedToWindow()) {
                    windowManager.updateViewLayout(chatContainer, chatParams);
                }
            }
        } catch (Exception ignored) {
            // Safe guard
        }
    }

    private void submitNativeChat() {
        if (chatEditText == null) return;
        String input = chatEditText.getText() != null ? chatEditText.getText().toString().trim() : "";
        setChatBarVisible(false);
        if (input.isEmpty()) return;

        String reply = buildNativeChatReply(input);
        triggerHudHopFeedback(reply);
    }

    private String buildNativeChatReply(String userText) {
        if (isPetSleeping) {
            return "Zzz... " + currentSpeciesName + " heard you in a dream...";
        }
        String lower = userText.toLowerCase();
        if (lower.contains("meat") || lower.contains("food") || lower.contains("hungry") || lower.contains("eat")) {
            if (petHunger < 50) return "Yes please!! My tummy is rumbling! 🍖";
            return "I could always go for a Big Meat snack, Tamer!";
        }
        if (lower.contains("love") || lower.contains("good") || lower.contains("cute") || lower.contains("praise")) {
            return "Hehe! Being your partner is the best, Tamer! ♥";
        }
        if (lower.contains("battle") || lower.contains("fight") || lower.contains("train") || lower.contains("attack")) {
            return "Ready anytime! Triple-tap me to jump into the Arena!";
        }
        if (lower.contains("how are") || lower.contains("feeling") || lower.contains("status")) {
            if (petHunger < 40) return "A little hungry... could use some Meat! 🍖";
            if (petHappiness < 45) return "Could use a vitamin or some praise, Tamer!";
            return "Feeling awesome right here on your home screen! ★";
        }
        if (lower.contains("hello") || lower.contains("hi") || lower.contains("hey")) {
            return "Hey Tamer! Exploring your home screen with you!";
        }
        try {
            JSONArray arr = new JSONArray(currentQuotesJson);
            if (arr.length() > 0) {
                return arr.optString(random.nextInt(arr.length()), "I'm right here with you, Tamer!");
            }
        } catch (Exception ignored) {
            // Fallback
        }
        return "Roger that, Tamer! Let's keep growing stronger together!";
    }

    private void snapGroundedToNearestRow() {
        refreshScreenMetrics();
        int minX = -dpToPx(12);
        int maxX = screenW - viewW + dpToPx(12);
        posX = Math.max(minX, Math.min(maxX, params.x));
        float footY = getFootYForTopY(params.y);
        int bestIdx = 0;
        float bestDist = Math.abs(footY - rowYs[0]);
        for (int i = 1; i < rowYs.length; i++) {
            float d = Math.abs(footY - rowYs[i]);
            if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
            }
        }
        currentRowIndex = bestIdx;
        posY = getTopYForFootY(rowYs[currentRowIndex]);
        params.x = Math.round(posX);
        params.y = Math.round(posY);
        safeUpdateWindowLayout();
    }

    /**
     * In-place update when the React side evolves the Digimon or changes settings,
     * keeping the floating window open smoothly at its exact current position!
     */
    private void updateFloatingView(Intent intent) {
        if (intent == null || webView == null) return;

        // Clear any pending native-side evo marker since app pushed authoritative state
        getSharedPreferences("digipet_overlay_sync", MODE_PRIVATE)
            .edit()
            .remove("pendingSpeciesId")
            .remove("pendingEvolvedAt")
            .apply();

        String sName = intent.getStringExtra("speciesName") != null
            ? intent.getStringExtra("speciesName")
            : "Digimon";
        String sUrl = intent.getStringExtra("spriteUrl") != null
            ? intent.getStringExtra("spriteUrl")
            : "assets/digidestined/agumon.png";
        String newKey = sName + "|" + sUrl;
        boolean hasEvoMessage = pendingEvolvedMessage != null && !pendingEvolvedMessage.isEmpty();

        if (!newKey.equals(loadedSpeciesKey) || hasEvoMessage) {
            lastJsAnimMode = "";
            loadWebViewFromIntent(intent, pendingEvolvedMessage);
            pendingEvolvedMessage = "";
            // Ensure visible when evolving in-place unless actively hidden off-screen
            if (offScreenPhase == OffScreenPhase.HIDDEN && (hasEvoMessage || isPetSleeping)) {
                setOverlayHidden(false);
                offScreenPhase = OffScreenPhase.NONE;
            }
            if (isPetSleeping) {
                if (!isFlyingPet) {
                    snapGroundedToNearestRow();
                }
                petState = PetState.IDLE;
                carriedItem = "";
            } else if (isFlyingPet && petState != PetState.OFF_SCREEN) {
                petState = PetState.FLYING;
                pickNextFlyWaypoint();
            } else if (!isFlyingPet && petState == PetState.FLYING) {
                snapGroundedToNearestRow();
                petState = PetState.IDLE;
                stateUntilMs = System.currentTimeMillis() + 1400L;
            }
        } else {
            if (!isFlyingPet && petState != PetState.OFF_SCREEN && petState != PetState.JUMPING) {
                // Grid preset ratios or manual line adjustment updated
                if (pendingPreviewRowIndex >= 0 && pendingPreviewRowIndex < rowYs.length) {
                    currentRowIndex = pendingPreviewRowIndex;
                    pendingPreviewRowIndex = -1;
                    petState = PetState.IDLE;
                    stateUntilMs = System.currentTimeMillis() + 2600L;
                } else {
                    currentRowIndex = Math.max(0, Math.min(currentRowIndex, rowYs.length - 1));
                }
                posY = getTopYForFootY(rowYs[currentRowIndex]);
                applyWindowPosition();
            }

            if (isPetSleeping) {
                applyWindowDimensionsForSleepState(true);
                if (offScreenPhase == OffScreenPhase.HIDDEN) {
                    setOverlayHidden(false);
                    posX = Math.max(dpToPx(20), (screenW - viewW) * 0.5f);
                    posY = isFlyingPet ? (screenH * 0.45f) : getTopYForFootY(rowYs[currentRowIndex]);
                    applyWindowPosition();
                }
                offScreenPhase = OffScreenPhase.NONE;
                if (!isFlyingPet && petState == PetState.JUMPING) {
                    snapGroundedToNearestRow();
                }
                petState = PetState.IDLE;
                carriedItem = "";
                syncVisualState("sleep", facingRight, "", null);
            } else if ("sleep".equals(lastJsAnimMode)) {
                applyWindowDimensionsForSleepState(false);
                if (isFlyingPet) {
                    petState = PetState.FLYING;
                    pickNextFlyWaypoint();
                    syncVisualState("walk", facingRight, carriedItem, null);
                } else {
                    petState = PetState.IDLE;
                    stateUntilMs = System.currentTimeMillis() + 1000L;
                    syncVisualState("idle", facingRight, carriedItem, null);
                }
            }
        }
    }

    private void advanceOverlayHungerClock(long nowMs) {
        if (isPetFrozen || isPetSleeping || "egg".equals(petStage) || hungerHeartMs <= 0L) {
            if (lastHungerDropAtMs != nowMs) {
                lastHungerDropAtMs = nowMs;
                getSharedPreferences("digipet_overlay_sync", MODE_PRIVATE)
                    .edit()
                    .putLong("lastHungerDropAtMs", lastHungerDropAtMs)
                    .apply();
            }
            return;
        }
        if (lastHungerDropAtMs <= 0L) {
            lastHungerDropAtMs = nowMs;
            return;
        }
        long msPerPoint = Math.max(1000L, hungerHeartMs / 25L);
        long elapsed = Math.min(4L * 3_600_000L, Math.max(0L, nowMs - lastHungerDropAtMs));
        int pointsToDrop = (int) (elapsed / msPerPoint);
        if (pointsToDrop > 0) {
            int nextHunger = Math.max(0, petHunger - pointsToDrop);
            lastHungerDropAtMs = (elapsed >= 4L * 3_600_000L)
                ? nowMs
                : (lastHungerDropAtMs + pointsToDrop * msPerPoint);
            boolean changed = nextHunger != petHunger;
            petHunger = nextHunger;
            getSharedPreferences("digipet_overlay_sync", MODE_PRIVATE)
                .edit()
                .putInt("lastKnownHunger", petHunger)
                .putLong("lastHungerDropAtMs", lastHungerDropAtMs)
                .apply();
            if (changed) {
                updateHudStatsText();
            }
        }
    }

    private void performNativeBackgroundEvolution(long nowMs) {
        String rawPayload = nextEvoPayloadJson;
        nextEvoTriggerMs = 0L;
        nextEvoPayloadJson = "";
        if (rawPayload == null || rawPayload.isEmpty()) return;

        try {
            JSONObject obj = new JSONObject(rawPayload);
            String targetSpeciesId = obj.optString("speciesId", "");
            String targetName = obj.optString("speciesName", "Digimon");
            String spriteUrl = obj.optString("spriteUrl", "assets/digidestined/agumon.png");
            String evolvedMsg = obj.optString("evolvedMessage", "Digivolved into " + targetName + "!");
            boolean nextFlying = obj.optBoolean("isFlying", isFlyingPet);
            String nextStage = obj.optString("stage", petStage);
            long nextHeartMs = obj.optLong("hungerHeartMs", hungerHeartMs);

            if (!targetSpeciesId.isEmpty()) {
                SharedPreferences prefs = getSharedPreferences("digipet_overlay_sync", MODE_PRIVATE);
                prefs.edit()
                    .putString("pendingSpeciesId", targetSpeciesId)
                    .putLong("pendingEvolvedAt", nowMs)
                    .apply();
            }

            isFlyingPet = nextFlying;
            if (nextStage != null && !nextStage.isEmpty()) {
                petStage = nextStage;
            }
            if (nextHeartMs > 0L) {
                hungerHeartMs = nextHeartMs;
            }
            petHappiness = 100;
            lastHungerDropAtMs = nowMs;
            lastJsAnimMode = "";
            loadedSpeciesKey = targetName + "|" + spriteUrl;
            updateHudStatsText();

            loadWebViewFromFields(
                spriteUrl,
                obj.optInt("sheetWidth", 200),
                obj.optInt("sheetHeight", 200),
                obj.optInt("stageWidth", 0),
                obj.optInt("stageHeight", 0),
                obj.optInt("groundOffset", 0),
                obj.optInt("frameX", 2),
                obj.optInt("frameY", 2),
                obj.optInt("frameW", 48),
                obj.optInt("frameH", 48),
                obj.optInt("frameRotate", 0),
                obj.optString("standingFramesJson", "[]"),
                obj.optString("walkingFramesJson", "[]"),
                obj.optString("sleepingFramesJson", "[]"),
                obj.optString("quotesJson", "[]"),
                evolvedMsg,
                isPetSleeping
            );

            if (offScreenPhase == OffScreenPhase.HIDDEN) {
                setOverlayHidden(false);
                offScreenPhase = OffScreenPhase.NONE;
                posX = Math.max(dpToPx(20), (screenW - viewW) * 0.5f);
                if (isFlyingPet) {
                    posY = screenH * 0.42f;
                } else {
                    currentRowIndex = Math.max(0, rowYs.length - 1);
                    posY = getTopYForFootY(rowYs[currentRowIndex]);
                }
                applyWindowPosition();
            }

            if (isPetSleeping) {
                if (!isFlyingPet) {
                    snapGroundedToNearestRow();
                }
                petState = PetState.IDLE;
                syncVisualState("sleep", facingRight, "", null);
            } else if (isFlyingPet) {
                petState = PetState.FLYING;
                pickNextFlyWaypoint();
            } else {
                snapGroundedToNearestRow();
                petState = PetState.IDLE;
                stateUntilMs = nowMs + 2600L;
            }
        } catch (Exception ignored) {
            // Non-fatal guard
        }
    }

    private void stepPhysics(long nowMs) {
        if (nowMs - lastHungerClockStepMs >= 5000L) {
            lastHungerClockStepMs = nowMs;
            advanceOverlayHungerClock(nowMs);
        }

        if (isUserDragging) return;

        // Cold Mode (Fridge): pause roaming/evolution timer just like the Digivice
        if (isPetFrozen) {
            if (offScreenPhase == OffScreenPhase.HIDDEN) {
                setOverlayHidden(false);
                posX = Math.max(dpToPx(20), (screenW - viewW) * 0.5f);
                posY = isFlyingPet ? (screenH * 0.45f) : getTopYForFootY(rowYs[currentRowIndex]);
                applyWindowPosition();
            }
            offScreenPhase = OffScreenPhase.NONE;
            petState = PetState.IDLE;
            syncVisualState("idle", facingRight, carriedItem, null);
            return;
        }

        // Check autonomous natural evolution timer even when main app is backgrounded
        if (nextEvoTriggerMs > 0L && nowMs >= nextEvoTriggerMs && nextEvoPayloadJson != null && !nextEvoPayloadJson.isEmpty()) {
            performNativeBackgroundEvolution(nowMs);
        }

        // Sleep state synced from Digivice: stay on-screen, stationary, and show sleeping animation + Zzz
        if (isPetSleeping) {
            if (offScreenPhase == OffScreenPhase.HIDDEN) {
                refreshScreenMetrics();
                setOverlayHidden(false);
                posX = Math.max(dpToPx(20), (screenW - viewW) * 0.5f);
                if (isFlyingPet) {
                    posY = screenH * 0.45f;
                } else {
                    currentRowIndex = Math.max(0, Math.min(currentRowIndex, rowYs.length - 1));
                    posY = getTopYForFootY(rowYs[currentRowIndex]);
                }
                applyWindowPosition();
            } else if (offScreenPhase == OffScreenPhase.EXITING || offScreenPhase == OffScreenPhase.ENTERING) {
                posX = Math.max(dpToPx(8), Math.min(screenW - viewW - dpToPx(8), posX));
                if (!isFlyingPet) {
                    snapGroundedToNearestRow();
                } else {
                    applyWindowPosition();
                }
            } else if (!isFlyingPet && petState == PetState.JUMPING) {
                snapGroundedToNearestRow();
            }
            offScreenPhase = OffScreenPhase.NONE;
            petState = PetState.IDLE;
            carriedItem = "";
            clearItemAtMs = 0L;
            syncVisualState("sleep", facingRight, "", null);
            return;
        }

        // Hold position steady while Care HUD or Chat Bar is open so buttons don't walk away
        if (hudVisible || chatVisible) {
            syncVisualState("idle", facingRight, carriedItem, null);
            return;
        }

        // Clear carried forage item badge cleanly after arrival showcase
        if (!carriedItem.isEmpty() && clearItemAtMs > 0L && nowMs >= clearItemAtMs) {
            carriedItem = "";
            clearItemAtMs = 0L;
        }

        int minX = -dpToPx(10);
        int maxX = Math.max(minX + 40, screenW - viewW + dpToPx(10));

        switch (petState) {
            case WALKING_GRID: {
                float speed = dpToPx(2);
                float dx = targetX - posX;
                if (Math.abs(dx) <= speed) {
                    posX = targetX;
                    posY = getTopYForFootY(rowYs[currentRowIndex]);
                    applyWindowPosition();
                    onActionCycleComplete(nowMs);
                } else {
                    facingRight = dx > 0f;
                    posX += dx > 0f ? speed : -speed;
                    posY = getTopYForFootY(rowYs[currentRowIndex]);
                    applyWindowPosition();
                    syncVisualState("walk", facingRight, carriedItem, null);
                }
                break;
            }

            case JUMPING: {
                float t = (nowMs - jumpStartMs) / (float) JUMP_DURATION_MS;
                if (t >= 1f) {
                    posX = jumpEndX;
                    posY = jumpEndY;
                    currentRowIndex = jumpTargetRow;
                    applyWindowPosition();
                    onActionCycleComplete(nowMs);
                } else {
                    float linearX = jumpStartX + (jumpEndX - jumpStartX) * t;
                    float linearY = jumpStartY + (jumpEndY - jumpStartY) * t;
                    float arcH = dpToPx(56);
                    float arcOffset = 4f * arcH * t * (1f - t);
                    posX = linearX;
                    posY = linearY - arcOffset;
                    applyWindowPosition();
                    syncVisualState("walk", facingRight, carriedItem, null);
                }
                break;
            }

            case FLYING: {
                float speed = dpToPx(2) + 0.5f;
                float dx = targetX - posX;
                float dy = targetY - posY;
                float dist = (float) Math.hypot(dx, dy);
                hoverPhase += 0.14f;
                float hoverWave = (float) (Math.sin(hoverPhase) * dpToPx(4));

                if (dist <= speed || dist < 2f) {
                    posX = targetX;
                    posY = targetY;
                    applyWindowPosition();
                    onActionCycleComplete(nowMs);
                } else {
                    facingRight = dx >= 0f;
                    posX += (dx / dist) * speed;
                    posY += (dy / dist) * speed;
                    params.x = Math.round(posX);
                    params.y = Math.round(posY + hoverWave);
                    safeUpdateWindowLayout();
                    syncVisualState("walk", facingRight, carriedItem, null);
                }
                break;
            }

            case IDLE: {
                if (isFlyingPet) {
                    hoverPhase += 0.1f;
                    params.x = Math.round(posX);
                    params.y = Math.round(posY + (float) Math.sin(hoverPhase) * dpToPx(4));
                    safeUpdateWindowLayout();
                }
                syncVisualState("idle", facingRight, carriedItem, null);
                if (nowMs >= stateUntilMs) {
                    chooseNextActiveBehavior(nowMs);
                }
                break;
            }

            case OFF_SCREEN: {
                stepOffScreen(nowMs, minX, maxX);
                break;
            }
        }
    }

    private void onActionCycleComplete(long nowMs) {
        cyclesSinceForage++;
        long elapsedSinceOffScreen = lastOffScreenAtMs > 0L ? (nowMs - lastOffScreenAtMs) : Long.MAX_VALUE;
        boolean shouldForage = false;
        if (petHunger < 40 && cyclesSinceForage >= 14 && elapsedSinceOffScreen >= OFF_SCREEN_NEEDY_COOLDOWN_MS && random.nextFloat() < 0.18f) {
            shouldForage = true;
            pendingForageKind = "meat";
        } else if (petHappiness < 45 && cyclesSinceForage >= 14 && elapsedSinceOffScreen >= OFF_SCREEN_NEEDY_COOLDOWN_MS && random.nextFloat() < 0.15f) {
            shouldForage = true;
            pendingForageKind = "friends";
        } else if (cyclesSinceForage >= 28 && elapsedSinceOffScreen >= OFF_SCREEN_MIN_COOLDOWN_MS && random.nextFloat() < 0.10f) {
            shouldForage = true;
            pendingForageKind = random.nextFloat() < 0.55f ? "meat" : "friends";
        }

        if (shouldForage) {
            startOffScreenSequence(nowMs);
            return;
        }

        if (random.nextFloat() < 0.45f) {
            petState = PetState.IDLE;
            stateUntilMs = nowMs + 1800L + random.nextInt(2400);
        } else {
            chooseNextActiveBehavior(nowMs);
        }
    }

    private void chooseNextActiveBehavior(long nowMs) {
        refreshScreenMetrics();
        int minX = dpToPx(4);
        int maxX = Math.max(minX + 40, screenW - viewW - dpToPx(4));

        if (isFlyingPet) {
            petState = PetState.FLYING;
            pickNextFlyWaypoint();
            return;
        }

        if (rowYs.length > 1 && random.nextFloat() < 0.42f) {
            int nextRow = currentRowIndex;
            if (currentRowIndex == 0) {
                nextRow = 1;
            } else if (currentRowIndex == rowYs.length - 1) {
                nextRow = currentRowIndex - 1;
            } else {
                nextRow = random.nextBoolean() ? currentRowIndex - 1 : currentRowIndex + 1;
            }

            jumpStartX = posX;
            jumpStartY = posY;
            jumpTargetRow = nextRow;
            jumpEndX = minX + random.nextFloat() * (maxX - minX);
            jumpEndY = getTopYForFootY(rowYs[nextRow]);
            facingRight = jumpEndX >= jumpStartX;
            jumpStartMs = nowMs;
            petState = PetState.JUMPING;
        } else {
            petState = PetState.WALKING_GRID;
            targetX = minX + random.nextFloat() * (maxX - minX);
            if (Math.abs(targetX - posX) < dpToPx(32)) {
                targetX = posX < (screenW * 0.45f) ? maxX - dpToPx(12) : minX + dpToPx(12);
            }
            targetY = getTopYForFootY(rowYs[currentRowIndex]);
            facingRight = targetX >= posX;
        }
    }

    private void pickNextFlyWaypoint() {
        int minX = dpToPx(4);
        int maxX = Math.max(minX + 40, screenW - viewW - dpToPx(4));
        int minY = Math.max(dpToPx(4), dpToPx(42) - topSystemOffsetPx);
        int maxY = Math.max(minY + 120, screenH - viewH - dpToPx(24) - topSystemOffsetPx);
        targetX = minX + random.nextFloat() * (maxX - minX);
        targetY = minY + random.nextFloat() * (maxY - minY);
        facingRight = targetX >= posX;
    }

    private void startOffScreenSequence(long nowMs) {
        cyclesSinceForage = 0;
        lastOffScreenAtMs = nowMs;
        petState = PetState.OFF_SCREEN;
        offScreenPhase = OffScreenPhase.EXITING;
        exitToRight = posX > (screenW * 0.4f);
        facingRight = exitToRight;
        targetX = exitToRight ? (screenW + dpToPx(16)) : (-viewW - dpToPx(16));
        String leaveMsg = "meat".equals(pendingForageKind)
            ? "Going foraging for food! 🍖"
            : "Visiting Digi-friends! 👋";
        syncVisualState("walk", facingRight, "", leaveMsg);
    }

    private void stepOffScreen(long nowMs, int minX, int maxX) {
        float speed = dpToPx(3);
        switch (offScreenPhase) {
            case EXITING: {
                posX += exitToRight ? speed : -speed;
                applyWindowPosition();
                syncVisualState("walk", exitToRight, carriedItem, null);
                boolean exitedRight = exitToRight && posX >= screenW + dpToPx(8);
                boolean exitedLeft = !exitToRight && posX <= -viewW - dpToPx(8);
                if (exitedRight || exitedLeft) {
                    offScreenPhase = OffScreenPhase.HIDDEN;
                    offScreenWakeMs = nowMs + 20000L + random.nextInt(15001);
                    setOverlayHidden(true);
                }
                break;
            }

            case HIDDEN: {
                if (nowMs >= offScreenWakeMs) {
                    refreshScreenMetrics();
                    setOverlayHidden(false);
                    offScreenPhase = OffScreenPhase.ENTERING;
                    enterFromTop = random.nextFloat() < 0.38f;
                    carriedItem = "meat".equals(pendingForageKind) ? "meat" : "";

                    if (enterFromTop) {
                        posX = Math.max(dpToPx(20), Math.min(screenW - viewW - dpToPx(20), random.nextFloat() * (screenW - viewW)));
                        posY = -viewH;
                        targetX = posX;
                        if (isFlyingPet) {
                            targetY = screenH * (0.28f + random.nextFloat() * 0.35f);
                        } else {
                            currentRowIndex = random.nextInt(rowYs.length);
                            targetY = getTopYForFootY(rowYs[currentRowIndex]);
                        }
                    } else {
                        boolean enterFromLeft = exitToRight;
                        posX = enterFromLeft ? (-viewW - dpToPx(6)) : (screenW + dpToPx(6));
                        if (isFlyingPet) {
                            posY = screenH * (0.25f + random.nextFloat() * 0.45f);
                            targetY = posY;
                        } else {
                            currentRowIndex = random.nextInt(rowYs.length);
                            posY = getTopYForFootY(rowYs[currentRowIndex]);
                            targetY = posY;
                        }
                        targetX = enterFromLeft ? dpToPx(44) : Math.max(dpToPx(44), screenW - viewW - dpToPx(44));
                        facingRight = enterFromLeft;
                    }
                    applyWindowPosition();
                    String returnBubble = "meat".equals(pendingForageKind)
                        ? "Found Big Meat! 🍖"
                        : "Back from visiting friends! 🤝";
                    syncVisualState("walk", facingRight, carriedItem, returnBubble);
                }
                break;
            }

            case ENTERING: {
                if (enterFromTop) {
                    float dropSpeed = dpToPx(4);
                    posY += dropSpeed;
                    if (posY >= targetY) {
                        posY = targetY;
                        finishReEntry(nowMs);
                    } else {
                        applyWindowPosition();
                    }
                } else {
                    float dx = targetX - posX;
                    if (Math.abs(dx) <= speed) {
                        posX = targetX;
                        finishReEntry(nowMs);
                    } else {
                        facingRight = dx > 0f;
                        posX += dx > 0f ? speed : -speed;
                        applyWindowPosition();
                    }
                }
                break;
            }

            case NONE:
            default:
                chooseNextActiveBehavior(nowMs);
                break;
        }
    }

    private void finishReEntry(long nowMs) {
        applyWindowPosition();
        offScreenPhase = OffScreenPhase.NONE;
        lastOffScreenAtMs = nowMs;
        if (!carriedItem.isEmpty()) {
            clearItemAtMs = nowMs + 2200L;
        }
        petState = PetState.IDLE;
        stateUntilMs = nowMs + 2200L;
        syncVisualState("idle", facingRight, carriedItem, null);
    }

    private void setOverlayHidden(boolean hidden) {
        if (floatingView == null || params == null) return;
        if (hidden) {
            setHudVisible(false);
            setChatBarVisible(false);
            hideNativeBubble();
            setDismissTargetVisible(false, false);
            floatingView.setVisibility(View.INVISIBLE);
            params.flags |= WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE;
        } else {
            params.flags &= ~WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE;
            floatingView.setVisibility(View.VISIBLE);
        }
        safeUpdateWindowLayout();
    }

    private void applyWindowPosition() {
        if (params == null) return;
        params.x = Math.round(posX);
        params.y = Math.round(posY);
        safeUpdateWindowLayout();
    }

    private void safeUpdateWindowLayout() {
        if (windowManager == null || floatingView == null || params == null) return;
        try {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.KITKAT || floatingView.isAttachedToWindow()) {
                windowManager.updateViewLayout(floatingView, params);
            }
            if (bubbleVisible) {
                updateBubblePosition();
            }
            if (hudVisible) {
                updateCareHudPositions();
            }
        } catch (Exception ignored) {
            // Safe guard during shutdown
        }
    }

    private void syncVisualState(String mode, boolean right, String item, String speechText) {
        if (webView == null) return;
        boolean changed = !mode.equals(lastJsAnimMode) || right != lastJsFacingRight || !item.equals(lastJsCarriedItem);
        if (!changed && (speechText == null || speechText.isEmpty())) {
            return;
        }
        lastJsAnimMode = mode;
        lastJsFacingRight = right;
        lastJsCarriedItem = item;
        String safeSpeech = speechText == null
            ? "null"
            : "'" + speechText.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ") + "'";
        String js = "window.setPetVisualState && window.setPetVisualState('"
            + mode + "', " + (right ? "true" : "false") + ", '" + item + "', " + safeSpeech + ");";
        webView.evaluateJavascript(js, null);
    }

    private void loadWebViewFromIntent(Intent intent, String evolvedMessage) {
        String speciesName = intent != null && intent.getStringExtra("speciesName") != null
            ? intent.getStringExtra("speciesName")
            : "Digimon";
        String rawSpriteUrl = intent != null && intent.getStringExtra("spriteUrl") != null
            ? intent.getStringExtra("spriteUrl")
            : "assets/digidestined/agumon.png";
        loadedSpeciesKey = speciesName + "|" + rawSpriteUrl;

        loadWebViewFromFields(
            rawSpriteUrl,
            intent != null ? intent.getIntExtra("sheetWidth", 200) : 200,
            intent != null ? intent.getIntExtra("sheetHeight", 200) : 200,
            intent != null ? intent.getIntExtra("stageWidth", 0) : 0,
            intent != null ? intent.getIntExtra("stageHeight", 0) : 0,
            intent != null ? intent.getIntExtra("groundOffset", 0) : 0,
            intent != null ? intent.getIntExtra("frameX", 2) : 2,
            intent != null ? intent.getIntExtra("frameY", 2) : 2,
            intent != null ? intent.getIntExtra("frameW", 48) : 48,
            intent != null ? intent.getIntExtra("frameH", 48) : 48,
            intent != null ? intent.getIntExtra("frameRotate", 0) : 0,
            intent != null && intent.getStringExtra("standingFramesJson") != null
                ? intent.getStringExtra("standingFramesJson")
                : "[]",
            intent != null && intent.getStringExtra("walkingFramesJson") != null
                ? intent.getStringExtra("walkingFramesJson")
                : "[]",
            intent != null && intent.getStringExtra("sleepingFramesJson") != null
                ? intent.getStringExtra("sleepingFramesJson")
                : "[]",
            intent != null && intent.getStringExtra("quotesJson") != null
                ? intent.getStringExtra("quotesJson")
                : "[]",
            evolvedMessage,
            isPetSleeping
        );
    }

    private int[] measureMaxSpriteDims(String framesJson, int defaultW, int defaultH) {
        int maxW = Math.max(1, defaultW);
        int maxH = Math.max(1, defaultH);
        if (framesJson == null || framesJson.isEmpty()) {
            return new int[] { maxW, maxH };
        }
        try {
            JSONArray arr = new JSONArray(framesJson);
            for (int i = 0; i < arr.length(); i++) {
                JSONObject obj = arr.optJSONObject(i);
                if (obj == null) continue;
                int fw = Math.max(1, obj.optInt("w", defaultW));
                int fh = Math.max(1, obj.optInt("h", defaultH));
                int rot = obj.optInt("rotate", 0);
                boolean isRot = (rot == 90 || rot == -90 || rot == 270);
                int uw = isRot ? fh : fw;
                int uh = isRot ? fw : fh;
                if (uw > maxW) maxW = uw;
                if (uh > maxH) maxH = uh;
            }
        } catch (Exception ignored) {
            // Keep default bounds
        }
        return new int[] { maxW, maxH };
    }

    private void computeSpriteWindowDimensions(
        int stageWidth,
        int stageHeight,
        int frameW,
        int frameH,
        int frameRotate,
        String standingFramesJson,
        String walkingFramesJson,
        String sleepingFramesJson
    ) {
        boolean fbRot = (frameRotate == 90 || frameRotate == -90 || frameRotate == 270);
        int fbW = Math.max(1, fbRot ? frameH : frameW);
        int fbH = Math.max(1, fbRot ? frameW : frameH);
        int[] standDims = measureMaxSpriteDims(standingFramesJson, fbW, fbH);
        int[] walkDims = measureMaxSpriteDims(walkingFramesJson, fbW, fbH);
        int[] sleepDims = measureMaxSpriteDims(sleepingFramesJson, fbW, fbH);

        int awakeMaxW = Math.max(stageWidth > 0 ? stageWidth : fbW, Math.max(standDims[0], walkDims[0]));
        int awakeMaxH = Math.max(stageHeight > 0 ? stageHeight : fbH, Math.max(standDims[1], walkDims[1]));
        int sleepMaxW = Math.max(stageWidth > 0 ? stageWidth : fbW, sleepDims[0]);
        int sleepMaxH = Math.max(stageHeight > 0 ? stageHeight : fbH, sleepDims[1]);

        int maxAllW = Math.max(awakeMaxW, sleepMaxW);
        int maxAllH = Math.max(awakeMaxH, sleepMaxH);
        double scale = Math.min(1.22, Math.min(168.0 / Math.max(1, maxAllW), 152.0 / Math.max(1, maxAllH)));

        awakeViewW = dpToPx(Math.max(44, Math.min(184, (int) Math.ceil(awakeMaxW * scale) + 10)));
        awakeViewH = dpToPx(Math.max(48, Math.min(184, (int) Math.ceil(awakeMaxH * scale) + 20)));
        sleepViewW = dpToPx(Math.max(48, Math.min(184, (int) Math.ceil(sleepMaxW * scale) + 12)));
        sleepViewH = dpToPx(Math.max(48, Math.min(184, (int) Math.ceil(sleepMaxH * scale) + 22)));
    }

    private void applyWindowDimensionsForSleepState(boolean sleeping) {
        int targetW = sleeping ? sleepViewW : awakeViewW;
        int targetH = sleeping ? sleepViewH : awakeViewH;
        if (targetW <= 0 || targetH <= 0) return;
        if (targetW == viewW && targetH == viewH) return;

        float oldCenterX = posX + viewW * 0.5f;
        float oldFootY = getFootYForTopY(posY);
        viewW = targetW;
        viewH = targetH;
        if (params != null && floatingView != null) {
            params.width = viewW;
            params.height = viewH;
            posX = Math.max(-dpToPx(4), Math.min(Math.max(0, screenW - viewW + dpToPx(4)), oldCenterX - viewW * 0.5f));
            if (isFlyingPet || petState == PetState.OFF_SCREEN) {
                posY = Math.max(0, oldFootY - (viewH - footOffsetPx) - topSystemOffsetPx);
            } else {
                currentRowIndex = Math.max(0, Math.min(currentRowIndex, rowYs.length - 1));
                posY = getTopYForFootY(rowYs[currentRowIndex]);
            }
            applyWindowPosition();
        }
    }

    private void loadWebViewFromFields(
        String rawSpriteUrl,
        int sheetWidth,
        int sheetHeight,
        int stageWidth,
        int stageHeight,
        int groundOffset,
        int frameX,
        int frameY,
        int frameW,
        int frameH,
        int frameRotate,
        String standingFramesJson,
        String walkingFramesJson,
        String sleepingFramesJson,
        String quotesJson,
        String evolvedMessage,
        boolean initialIsSleeping
    ) {
        computeSpriteWindowDimensions(
            stageWidth,
            stageHeight,
            frameW,
            frameH,
            frameRotate,
            standingFramesJson,
            walkingFramesJson,
            sleepingFramesJson
        );
        applyWindowDimensionsForSleepState(initialIsSleeping);

        String relSpriteUrl = rawSpriteUrl != null ? rawSpriteUrl : "assets/digidestined/agumon.png";
        if (relSpriteUrl.startsWith("file:///android_asset/public/")) {
            relSpriteUrl = relSpriteUrl.substring("file:///android_asset/public/".length());
        } else if (relSpriteUrl.startsWith("/")) {
            relSpriteUrl = relSpriteUrl.substring(1);
        }
        String absSpriteUrl = "file:///android_asset/public/" + relSpriteUrl;

        String safeEvoJs = (evolvedMessage != null && !evolvedMessage.isEmpty())
            ? "'" + evolvedMessage.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ") + "'"
            : "''";

        String html = "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>" +
            "html, body { margin:0; padding:0; background:transparent; overflow:hidden; width:100%; height:100%; user-select:none; -webkit-user-select:none; pointer-events:none; font-family:sans-serif; }" +
            "#stage { position:relative; width:100%; height:100%; overflow:visible; }" +
            "#bubble { position:absolute; bottom:calc(100% - 8px); left:50%; transform:translateX(-50%) scale(0); opacity:0; max-width:130px; background:rgba(255,255,255,0.96); color:#0f172a; border:2px solid #0f172a; border-radius:11px; padding:3px 7px; font-size:8.5px; font-weight:bold; font-family:monospace; text-align:center; box-shadow:0 4px 10px rgba(0,0,0,0.45); transition:transform 0.22s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.18s ease; z-index:1; pointer-events:none; white-space:normal; line-height:1.25; }" +
            "#bubble.show { transform:translateX(-50%) scale(1); opacity:1; }" +
            "#bubble::after { content:''; position:absolute; bottom:-5px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; border-top:5px solid #ffffff; }" +
            "#bubble::before { content:''; position:absolute; bottom:-7px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:6px solid #0f172a; z-index:-1; }" +
            "#petWrap { position:absolute; bottom:6px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; overflow:visible; }" +
            "#evoAura { display:none; position:absolute; inset:-14px; border-radius:999px; background:radial-gradient(circle, rgba(250,204,21,0.85) 0%, rgba(56,189,248,0.45) 55%, rgba(255,255,255,0) 75%); z-index:5; pointer-events:none; }" +
            "#petWrap.evolving #evoAura { display:block; animation:evoBurst 1.3s ease-out forwards; }" +
            "#petWrap.evolving #spriteBox { animation:evoFlash 1.3s ease-in-out; }" +
            "@keyframes evoBurst { 0% { transform:scale(0.4); opacity:0; } 30% { transform:scale(1.45); opacity:1; } 100% { transform:scale(1.9); opacity:0; } }" +
            "@keyframes evoFlash { 0%, 100% { filter:brightness(1); transform:scale(1); } 25% { filter:brightness(2.8) drop-shadow(0 0 12px #fde047); transform:scale(1.18); } 60% { filter:brightness(2.0) drop-shadow(0 0 10px #38bdf8); transform:scale(1.08); } }" +
            "#sleepBadge { display:none; position:absolute; top:-12px; right:2px; z-index:22; color:#67e8f9; font-family:monospace; font-weight:900; font-size:12px; text-shadow:0 1px 4px rgba(15,23,42,0.95), 0 0 8px rgba(56,189,248,0.7); pointer-events:none; }" +
            "#petWrap.sleeping #sleepBadge { display:block; animation:zzzFloat 1.8s ease-out infinite; }" +
            "#petWrap.sleeping #spriteBox { filter:brightness(0.88); }" +
            "#petWrap.sleeping #frameClip { transform-origin:bottom center; animation:sleepBreathe 2.6s ease-in-out infinite; }" +
            "@keyframes sleepBreathe { 0%, 100% { transform:scale(1, 1); } 50% { transform:scale(1.035, 1.045); } }" +
            "@keyframes zzzFloat { 0% { transform:translate(0px, 2px) scale(0.85); opacity:0; } 35% { opacity:1; } 100% { transform:translate(8px, -14px) scale(1.1); opacity:0; } }" +
            "#carryBadge { display:none; position:absolute; top:-12px; right:-4px; z-index:20; background:#1e1b4b; border:1.5px solid #fbbf24; border-radius:8px; padding:2px; box-shadow:0 2px 6px rgba(0,0,0,0.5); }" +
            "#carryBadge.show { display:block; }" +
            "#spriteBox { position:relative; overflow:visible; z-index:10; }" +
            "#frameClip { position:relative; overflow:hidden; }" +
            "#innerBox { position:absolute; top:50%; left:50%; transform-origin:center center; overflow:hidden; }" +
            "#sheetImg { position:absolute; max-width:none; image-rendering:pixelated; }" +
            "#shadow { width:22px; height:4px; background:rgba(0,0,0,0.35); border-radius:50%; margin-top:1px; z-index:10; }" +
            "@keyframes hopAnim { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-9px); } }" +
            ".hopping { animation: hopAnim 0.3s ease-in-out; }" +
            "</style></head><body>" +
            "<div id='stage'>" +
            "  <div id='petWrap'>" +
            "    <div id='evoAura'></div>" +
            "    <div id='bubble'>Ready!</div>" +
            "    <div id='sleepBadge'>Zzz...</div>" +
            "    <div id='carryBadge'>" +
            "      <svg viewBox='0 0 16 16' width='16' height='16' shape-rendering='crispEdges'>" +
            "        <rect x='2' y='2' width='2' height='2' fill='#18181b'/>" +
            "        <rect x='1' y='3' width='3' height='2' fill='#fef3c7'/>" +
            "        <rect x='4' y='4' width='8' height='8' fill='#b45309'/>" +
            "        <rect x='5' y='5' width='5' height='5' fill='#ea580c'/>" +
            "        <rect x='6' y='6' width='2' height='2' fill='#fdba74'/>" +
            "        <rect x='12' y='11' width='3' height='2' fill='#fef3c7'/>" +
            "      </svg>" +
            "    </div>" +
            "    <div id='spriteBox'>" +
            "      <div id='frameClip'>" +
            "        <div id='innerBox'>" +
            "          <img id='sheetImg' src='" + relSpriteUrl + "' onerror=\"if(this.getAttribute('data-tried')!=='1'){this.setAttribute('data-tried','1');this.src='" + absSpriteUrl + "';}\" />" +
            "        </div>" +
            "      </div>" +
            "    </div>" +
            "    <div id='shadow'></div>" +
            "  </div>" +
            "</div>" +
            "<script>" +
            "var sheetW = " + sheetWidth + ";" +
            "var sheetH = " + sheetHeight + ";" +
            "var stageBoxW = " + stageWidth + ";" +
            "var stageBoxH = " + stageHeight + ";" +
            "var groundOffset = " + groundOffset + ";" +
            "var fallbackFrame = { x: " + frameX + ", y: " + frameY + ", w: " + frameW + ", h: " + frameH + ", rotate: " + frameRotate + " };" +
            "var initialEvoMsg = " + safeEvoJs + ";" +
            "var isSleeping = " + (initialIsSleeping ? "true" : "false") + ";" +
            "var standingFrames = [];" +
            "var walkingFrames = [];" +
            "var sleepingFrames = [];" +
            "var quotes = [];" +
            "try { standingFrames = " + standingFramesJson + "; } catch(e){}" +
            "try { walkingFrames = " + walkingFramesJson + "; } catch(e){}" +
            "try { sleepingFrames = " + sleepingFramesJson + "; } catch(e){}" +
            "try { quotes = " + quotesJson + "; } catch(e){}" +
            "if (!standingFrames || standingFrames.length === 0) standingFrames = [fallbackFrame];" +
            "if (!walkingFrames || walkingFrames.length === 0) walkingFrames = standingFrames;" +
            "if (!sleepingFrames || sleepingFrames.length === 0) sleepingFrames = standingFrames;" +
            "if (!quotes || quotes.length === 0) quotes = ['Exploring your home screen!', 'Ready to train!', 'Together forever, Tamer!'];" +

            "var petWrap = document.getElementById('petWrap');" +
            "var spriteBox = document.getElementById('spriteBox');" +
            "var frameClip = document.getElementById('frameClip');" +
            "var innerBox = document.getElementById('innerBox');" +
            "var sheetImg = document.getElementById('sheetImg');" +
            "var bubble = document.getElementById('bubble');" +
            "var carryBadge = document.getElementById('carryBadge');" +

            "var maxSpriteW = Math.max(stageBoxW || 0, fallbackFrame.w || 48);" +
            "var maxSpriteH = Math.max(stageBoxH || 0, fallbackFrame.h || 48);" +
            "var allPoseLists = [standingFrames, walkingFrames, sleepingFrames];" +
            "for (var li = 0; li < allPoseLists.length; li++) {" +
            "  var plist = allPoseLists[li];" +
            "  for (var fi = 0; fi < plist.length; fi++) {" +
            "    var pf = plist[fi];" +
            "    if (!pf) continue;" +
            "    var pr = (pf.rotate === 90 || pf.rotate === -90 || pf.rotate === 270);" +
            "    var pw = pr ? pf.h : pf.w;" +
            "    var ph = pr ? pf.w : pf.h;" +
            "    if (pw > maxSpriteW) maxSpriteW = pw;" +
            "    if (ph > maxSpriteH) maxSpriteH = ph;" +
            "  }" +
            "}" +
            "var scale = Math.min(1.22, 168 / Math.max(1, maxSpriteW), 152 / Math.max(1, maxSpriteH));" +
            "var facingRight = true;" +
            "var isWalking = false;" +
            "var walkFrameIdx = 0;" +
            "var standFrameIdx = 0;" +
            "var sleepFrameIdx = isSleeping ? Math.max(0, sleepingFrames.length - 1) : 0;" +
            "var bubbleTimeout = null;" +

            "function renderFrame(frame) {" +
            "  if (!frame) return;" +
            "  if (frame.sheetPath) {" +
            "    var sp = frame.sheetPath;" +
            "    if (sp.indexOf('android_asset/public/') !== -1) sp = sp.substring(sp.indexOf('android_asset/public/') + 21);" +
            "    if (sp.startsWith('/')) sp = sp.substring(1);" +
            "    if (sheetImg.getAttribute('data-src') !== sp) {" +
            "      sheetImg.setAttribute('data-src', sp);" +
            "      sheetImg.src = sp;" +
            "    }" +
            "  }" +
            "  var rot = frame.rotate || 0;" +
            "  var isRot = (rot === 90 || rot === -90 || rot === 270);" +
            "  var uw = (isRot ? frame.h : frame.w);" +
            "  var uh = (isRot ? frame.w : frame.h);" +
            "  var dw = uw * scale;" +
            "  var dh = uh * scale;" +
            "  if (stageBoxW > 0 && stageBoxH > 0) {" +
            "    var effBoxW = isSleeping ? Math.max(stageBoxW, uw) : stageBoxW;" +
            "    var effBoxH = isSleeping ? Math.max(stageBoxH, uh) : stageBoxH;" +
            "    var rawOy = (frame.offsetY || 0) + groundOffset;" +
            "    var effOx = isSleeping ? ((effBoxW - uw) * 0.5) : (frame.offsetX || 0);" +
            "    var effOy = isSleeping ? Math.max(0, Math.min(rawOy, Math.max(0, effBoxH - uh))) : rawOy;" +
            "    spriteBox.style.width = (effBoxW * scale) + 'px';" +
            "    spriteBox.style.height = (effBoxH * scale) + 'px';" +
            "    spriteBox.style.transform = 'scaleX(' + (facingRight ? 1 : -1) + ')';" +
            "    frameClip.style.position = 'absolute';" +
            "    frameClip.style.left = (effOx * scale) + 'px';" +
            "    frameClip.style.top = (effOy * scale) + 'px';" +
            "    frameClip.style.width = dw + 'px';" +
            "    frameClip.style.height = dh + 'px';" +
            "  } else {" +
            "    var effOffset = isSleeping ? 0 : (((frame.offsetY || 0) + groundOffset) * scale);" +
            "    spriteBox.style.width = dw + 'px';" +
            "    spriteBox.style.height = dh + 'px';" +
            "    spriteBox.style.transform = 'translateY(' + effOffset + 'px) scaleX(' + (facingRight ? 1 : -1) + ')';" +
            "    frameClip.style.position = 'relative';" +
            "    frameClip.style.left = '0px';" +
            "    frameClip.style.top = '0px';" +
            "    frameClip.style.width = dw + 'px';" +
            "    frameClip.style.height = dh + 'px';" +
            "  }" +
            "  innerBox.style.width = (frame.w * scale) + 'px';" +
            "  innerBox.style.height = (frame.h * scale) + 'px';" +
            "  innerBox.style.transform = 'translate(-50%, -50%) ' + (rot ? 'rotate(' + rot + 'deg)' : '');" +
            "  var curSheetW = (frame.sheetWidth || sheetW) * scale;" +
            "  var curSheetH = (frame.sheetHeight || sheetH) * scale;" +
            "  sheetImg.style.width = curSheetW + 'px';" +
            "  sheetImg.style.height = curSheetH + 'px';" +
            "  sheetImg.style.left = '-' + (frame.x * scale) + 'px';" +
            "  sheetImg.style.top = '-' + (frame.y * scale) + 'px';" +
            "}" +

            "function showSpeech(text, ms) {" +
            "  if (!text) text = quotes[Math.floor(Math.random() * quotes.length)];" +
            "  var dur = Math.max(ms || 3800, Math.min(8500, 2600 + String(text).length * 42));" +
            "  var rect = spriteBox ? spriteBox.getBoundingClientRect() : null;" +
            "  var sh = rect && rect.height ? Math.round(rect.height) : 58;" +
            "  if (window.NativeBubbleBridge && window.NativeBubbleBridge.showBubble) {" +
            "    bubble.classList.remove('show');" +
            "    window.NativeBubbleBridge.showBubble(String(text), Math.round(dur), sh);" +
            "    return;" +
            "  }" +
            "  bubble.innerText = text;" +
            "  bubble.classList.add('show');" +
            "  if (bubbleTimeout) clearTimeout(bubbleTimeout);" +
            "  bubbleTimeout = setTimeout(function() { bubble.classList.remove('show'); }, dur);" +
            "}" +

            "function playEvolutionEffect(msg) {" +
            "  petWrap.classList.remove('evolving');" +
            "  void petWrap.offsetWidth;" +
            "  petWrap.classList.add('evolving');" +
            "  showSpeech(msg, 4800);" +
            "  setTimeout(function() { petWrap.classList.remove('evolving'); }, 1400);" +
            "}" +

            "window.onPetTapped = function() {" +
            "  if (isSleeping) {" +
            "    showSpeech('Zzz... sleeping soundly...', 2400);" +
            "    return;" +
            "  }" +
            "  showSpeech();" +
            "  petWrap.classList.remove('hopping');" +
            "  void petWrap.offsetWidth;" +
            "  petWrap.classList.add('hopping');" +
            "};" +

            "window.setPetVisualState = function(mode, right, carried, speech) {" +
            "  var wasSleeping = isSleeping;" +
            "  facingRight = !!right;" +
            "  isSleeping = (mode === 'sleep');" +
            "  isWalking = !isSleeping && (mode === 'walk');" +
            "  if (isSleeping) {" +
            "    petWrap.classList.add('sleeping');" +
            "    if (!wasSleeping) sleepFrameIdx = 0;" +
            "  } else {" +
            "    petWrap.classList.remove('sleeping');" +
            "  }" +
            "  if (carried === 'meat') carryBadge.classList.add('show'); else carryBadge.classList.remove('show');" +
            "  if (speech) showSpeech(speech);" +
            "  if (isSleeping) renderFrame(sleepingFrames[Math.min(sleepFrameIdx, sleepingFrames.length - 1)]);" +
            "  else renderFrame(isWalking ? walkingFrames[walkFrameIdx] : standingFrames[standFrameIdx]);" +
            "};" +

            "setInterval(function() {" +
            "  if (isSleeping) {" +
            "    if (sleepFrameIdx < sleepingFrames.length - 1) sleepFrameIdx++;" +
            "    renderFrame(sleepingFrames[Math.min(sleepFrameIdx, sleepingFrames.length - 1)]);" +
            "  } else if (isWalking) {" +
            "    walkFrameIdx = (walkFrameIdx + 1) % walkingFrames.length;" +
            "    renderFrame(walkingFrames[walkFrameIdx]);" +
            "  } else {" +
            "    standFrameIdx = (standFrameIdx + 1) % standingFrames.length;" +
            "    renderFrame(standingFrames[standFrameIdx]);" +
            "  }" +
            "}, 62);" +

            "if (isSleeping) {" +
            "  petWrap.classList.add('sleeping');" +
            "  renderFrame(sleepingFrames[Math.min(sleepFrameIdx, sleepingFrames.length - 1)]);" +
            "} else {" +
            "  renderFrame(standingFrames[0]);" +
            "}" +
            "if (initialEvoMsg) {" +
            "  setTimeout(function() { playEvolutionEffect(initialEvoMsg); }, 120);" +
            "} else if (!isSleeping) {" +
            "  setTimeout(function() { showSpeech(); }, 600);" +
            "}" +
            "</script></body></html>";

        webView.loadDataWithBaseURL("file:///android_asset/public/", html, "text/html", "utf-8", null);
    }

    private int dpToPx(int dp) {
        return (int) (dp * getResources().getDisplayMetrics().density);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isRunning = false;
        physicsStarted = false;
        physicsHandler.removeCallbacksAndMessages(null);
        if (chatContainer != null && windowManager != null) {
            try {
                windowManager.removeView(chatContainer);
            } catch (Exception ignored) {
                // safe ignore
            }
            chatContainer = null;
        }
        if (hudButtonsContainer != null && windowManager != null) {
            try {
                windowManager.removeView(hudButtonsContainer);
            } catch (Exception ignored) {
                // safe ignore
            }
            hudButtonsContainer = null;
        }
        if (hudStatsContainer != null && windowManager != null) {
            try {
                windowManager.removeView(hudStatsContainer);
            } catch (Exception ignored) {
                // safe ignore
            }
            hudStatsContainer = null;
        }
        if (dismissContainer != null && windowManager != null) {
            try {
                windowManager.removeView(dismissContainer);
            } catch (Exception ignored) {
                // safe ignore
            }
            dismissContainer = null;
        }
        if (bubbleContainer != null && windowManager != null) {
            try {
                windowManager.removeView(bubbleContainer);
            } catch (Exception ignored) {
                // safe ignore
            }
            bubbleContainer = null;
        }
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
