package com.digipet.companion;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.provider.Settings;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
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

    private final Handler physicsHandler = new Handler(Looper.getMainLooper());
    private final Random random = new Random();

    // Display & Viewport metrics
    private int viewW;
    private int viewH;
    private int footOffsetPx;
    private int screenW = 1080;
    private int screenH = 2200;
    private int topSystemOffsetPx = 0;
    private boolean topOffsetCalibrated = false;

    // Pet & Grid Configuration
    private boolean isFlyingPet = false;
    private double[] rowRatios = new double[] { 0.34, 0.48, 0.62, 0.76, 0.92 };
    private int[] rowYs = new int[] { 740, 1050, 1360, 1670, 2020 };
    private int currentRowIndex = 4; // Start at bottom dock
    private int petHunger = 80;
    private int petHappiness = 80;

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

    // Timers & Phases
    private long stateUntilMs = 0L;
    private long offScreenWakeMs = 0L;
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
        if (intent == null) return;
        isFlyingPet = intent.getBooleanExtra("isFlying", false);
        petHunger = intent.getIntExtra("hunger", 80);
        petHappiness = intent.getIntExtra("happiness", 80);

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
                if (measured >= 0 && measured <= dpToPx(68) && params.y > 0) {
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

        // Compact hitbox window so launcher taps pass straight through to icons underneath
        viewW = dpToPx(150);
        viewH = dpToPx(154);
        footOffsetPx = dpToPx(6);

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
        posX = Math.max(dpToPx(8), (screenW - viewW) * 0.5f);
        if (isFlyingPet) {
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

        loadWebViewFromIntent(intent, pendingEvolvedMessage);
        pendingEvolvedMessage = "";

        rootLayout.addView(webView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));

        // Dragging & Tapping Touch Listener (pauses state machine during drag & snaps to nearest row on release)
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
                        return true;

                    case MotionEvent.ACTION_MOVE:
                        int dx = (int) (event.getRawX() - initialTouchX);
                        int dy = (int) (event.getRawY() - initialTouchY);
                        if (!isDragging && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
                            isDragging = true;
                            syncVisualState("walk", dx >= 0, carriedItem, null);
                        }
                        if (isDragging) {
                            params.x = initialX + dx;
                            params.y = initialY + dy;
                            posX = params.x;
                            posY = params.y;
                            safeUpdateWindowLayout();
                        }
                        return true;

                    case MotionEvent.ACTION_UP:
                    case MotionEvent.ACTION_CANCEL:
                        isUserDragging = false;
                        long duration = System.currentTimeMillis() - touchStartTime;
                        int diffX = (int) Math.abs(event.getRawX() - initialTouchX);
                        int diffY = (int) Math.abs(event.getRawY() - initialTouchY);

                        if (!isDragging && duration < 350 && diffX < 20 && diffY < 20) {
                            if (webView != null) {
                                webView.evaluateJavascript("window.onPetTapped && window.onPetTapped();", null);
                            }
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
        scheduleTopOffsetCalibration();
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
            if (offScreenPhase == OffScreenPhase.HIDDEN && hasEvoMessage) {
                setOverlayHidden(false);
                offScreenPhase = OffScreenPhase.NONE;
            }
            if (isFlyingPet && petState != PetState.OFF_SCREEN) {
                petState = PetState.FLYING;
                pickNextFlyWaypoint();
            } else if (!isFlyingPet && petState == PetState.FLYING) {
                snapGroundedToNearestRow();
                petState = PetState.IDLE;
                stateUntilMs = System.currentTimeMillis() + 1400L;
            }
        } else if (!isFlyingPet && petState != PetState.OFF_SCREEN && petState != PetState.JUMPING) {
            // Grid preset ratios may have updated
            currentRowIndex = Math.max(0, Math.min(currentRowIndex, rowYs.length - 1));
            posY = getTopYForFootY(rowYs[currentRowIndex]);
            applyWindowPosition();
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

            if (!targetSpeciesId.isEmpty()) {
                SharedPreferences prefs = getSharedPreferences("digipet_overlay_sync", MODE_PRIVATE);
                prefs.edit()
                    .putString("pendingSpeciesId", targetSpeciesId)
                    .putLong("pendingEvolvedAt", nowMs)
                    .apply();
            }

            isFlyingPet = nextFlying;
            lastJsAnimMode = "";
            loadedSpeciesKey = targetName + "|" + spriteUrl;

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
                obj.optString("quotesJson", "[]"),
                evolvedMsg
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

            if (isFlyingPet) {
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
        if (isUserDragging) return;

        // Check autonomous natural evolution timer even when main app is backgrounded
        if (nextEvoTriggerMs > 0L && nowMs >= nextEvoTriggerMs && nextEvoPayloadJson != null && !nextEvoPayloadJson.isEmpty()) {
            performNativeBackgroundEvolution(nowMs);
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
        boolean shouldForage = false;
        if (petHunger < 45 && cyclesSinceForage >= 3 && random.nextFloat() < 0.45f) {
            shouldForage = true;
            pendingForageKind = "meat";
        } else if (petHappiness < 50 && cyclesSinceForage >= 3 && random.nextFloat() < 0.40f) {
            shouldForage = true;
            pendingForageKind = "friends";
        } else if (cyclesSinceForage >= 7 && random.nextFloat() < 0.30f) {
            shouldForage = true;
            pendingForageKind = random.nextFloat() < 0.6f ? "meat" : "friends";
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
                    offScreenWakeMs = nowMs + 30000L + random.nextInt(30001);
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
        if (!carriedItem.isEmpty()) {
            clearItemAtMs = nowMs + 6500L;
        }
        petState = PetState.IDLE;
        stateUntilMs = nowMs + 2200L;
        syncVisualState("idle", facingRight, carriedItem, null);
    }

    private void setOverlayHidden(boolean hidden) {
        if (floatingView == null || params == null) return;
        if (hidden) {
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
            intent != null && intent.getStringExtra("quotesJson") != null
                ? intent.getStringExtra("quotesJson")
                : "[]",
            evolvedMessage
        );
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
        String quotesJson,
        String evolvedMessage
    ) {
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
            "#carryBadge { display:none; position:absolute; top:-16px; right:-18px; z-index:20; background:#1e1b4b; border:1.5px solid #fbbf24; border-radius:8px; padding:2px; box-shadow:0 2px 6px rgba(0,0,0,0.5); }" +
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
            "var standingFrames = [];" +
            "var walkingFrames = [];" +
            "var quotes = [];" +
            "try { standingFrames = " + standingFramesJson + "; } catch(e){}" +
            "try { walkingFrames = " + walkingFramesJson + "; } catch(e){}" +
            "try { quotes = " + quotesJson + "; } catch(e){}" +
            "if (!standingFrames || standingFrames.length === 0) standingFrames = [fallbackFrame];" +
            "if (!walkingFrames || walkingFrames.length === 0) walkingFrames = standingFrames;" +
            "if (!quotes || quotes.length === 0) quotes = ['Exploring your home screen!', 'Ready to train!', 'Together forever, Tamer!'];" +

            "var petWrap = document.getElementById('petWrap');" +
            "var spriteBox = document.getElementById('spriteBox');" +
            "var frameClip = document.getElementById('frameClip');" +
            "var innerBox = document.getElementById('innerBox');" +
            "var sheetImg = document.getElementById('sheetImg');" +
            "var bubble = document.getElementById('bubble');" +
            "var carryBadge = document.getElementById('carryBadge');" +

            "var scale = 1.22;" +
            "var facingRight = true;" +
            "var isWalking = false;" +
            "var walkFrameIdx = 0;" +
            "var standFrameIdx = 0;" +
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
            "  var dw = (isRot ? frame.h : frame.w) * scale;" +
            "  var dh = (isRot ? frame.w : frame.h) * scale;" +
            "  if (stageBoxW > 0 && stageBoxH > 0) {" +
            "    spriteBox.style.width = (stageBoxW * scale) + 'px';" +
            "    spriteBox.style.height = (stageBoxH * scale) + 'px';" +
            "    spriteBox.style.transform = 'scaleX(' + (facingRight ? 1 : -1) + ')';" +
            "    frameClip.style.position = 'absolute';" +
            "    frameClip.style.left = ((frame.offsetX || 0) * scale) + 'px';" +
            "    frameClip.style.top = (((frame.offsetY || 0) + groundOffset) * scale) + 'px';" +
            "    frameClip.style.width = dw + 'px';" +
            "    frameClip.style.height = dh + 'px';" +
            "  } else {" +
            "    var effOffset = ((frame.offsetY || 0) + groundOffset) * scale;" +
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
            "  bubble.innerText = text;" +
            "  bubble.classList.add('show');" +
            "  if (bubbleTimeout) clearTimeout(bubbleTimeout);" +
            "  bubbleTimeout = setTimeout(function() { bubble.classList.remove('show'); }, ms || 3500);" +
            "}" +

            "function playEvolutionEffect(msg) {" +
            "  petWrap.classList.remove('evolving');" +
            "  void petWrap.offsetWidth;" +
            "  petWrap.classList.add('evolving');" +
            "  showSpeech(msg, 4800);" +
            "  setTimeout(function() { petWrap.classList.remove('evolving'); }, 1400);" +
            "}" +

            "window.onPetTapped = function() {" +
            "  showSpeech();" +
            "  petWrap.classList.remove('hopping');" +
            "  void petWrap.offsetWidth;" +
            "  petWrap.classList.add('hopping');" +
            "};" +

            "window.setPetVisualState = function(mode, right, carried, speech) {" +
            "  facingRight = !!right;" +
            "  isWalking = (mode === 'walk');" +
            "  if (carried === 'meat') carryBadge.classList.add('show'); else carryBadge.classList.remove('show');" +
            "  if (speech) showSpeech(speech);" +
            "  renderFrame(isWalking ? walkingFrames[walkFrameIdx] : standingFrames[standFrameIdx]);" +
            "};" +

            "setInterval(function() {" +
            "  if (isWalking) {" +
            "    walkFrameIdx = (walkFrameIdx + 1) % walkingFrames.length;" +
            "    renderFrame(walkingFrames[walkFrameIdx]);" +
            "  } else {" +
            "    standFrameIdx = (standFrameIdx + 1) % standingFrames.length;" +
            "    renderFrame(standingFrames[standFrameIdx]);" +
            "  }" +
            "}, 62);" +

            "renderFrame(standingFrames[0]);" +
            "if (initialEvoMsg) {" +
            "  setTimeout(function() { playEvolutionEffect(initialEvoMsg); }, 120);" +
            "} else {" +
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
