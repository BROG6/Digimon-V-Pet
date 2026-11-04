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
    private WebView webView;
    private TextView closeBtn;

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
        } else {
            updateFloatingView(intent);
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

        int viewW = dpToPx(190);
        int viewH = dpToPx(160);
        params = new WindowManager.LayoutParams(
            viewW,
            viewH,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        );

        params.gravity = Gravity.TOP | Gravity.START;
        params.x = dpToPx(40);
        params.y = dpToPx(160);

        // Subclass FrameLayout to intercept all touches before the inner WebView consumes them
        FrameLayout rootLayout = new FrameLayout(this) {
            @Override
            public boolean onInterceptTouchEvent(MotionEvent ev) {
                if (closeBtn != null) {
                    int[] loc = new int[2];
                    closeBtn.getLocationOnScreen(loc);
                    float x = ev.getRawX();
                    float y = ev.getRawY();
                    if (x >= loc[0] && x <= loc[0] + closeBtn.getWidth() &&
                        y >= loc[1] && y <= loc[1] + closeBtn.getHeight()) {
                        return false; // Let close button receive its click
                    }
                }
                return true; // Intercept for smooth drag & pet tap
            }
        };
        rootLayout.setBackgroundColor(Color.TRANSPARENT);

        // WebView for animated walking, talking, and upright pixel-rendered Digimon
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
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);

        loadWebViewHtml(intent);

        rootLayout.addView(webView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));

        // Close button at top right
        closeBtn = new TextView(this);
        closeBtn.setText("✕");
        closeBtn.setTextColor(Color.WHITE);
        closeBtn.setTextSize(11);
        closeBtn.setGravity(Gravity.CENTER);
        closeBtn.setBackgroundColor(Color.argb(200, 220, 38, 38));
        
        FrameLayout.LayoutParams closeParams = new FrameLayout.LayoutParams(dpToPx(24), dpToPx(24));
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

        // Dragging & Tapping Touch Listener
        rootLayout.setOnTouchListener(new View.OnTouchListener() {
            private int initialX;
            private int initialY;
            private float initialTouchX;
            private float initialTouchY;
            private long touchStartTime;
            private boolean isDragging = false;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
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
                        }
                        if (isDragging) {
                            params.x = initialX + dx;
                            params.y = initialY + dy;
                            if (windowManager != null && floatingView != null) {
                                windowManager.updateViewLayout(floatingView, params);
                            }
                        }
                        return true;

                    case MotionEvent.ACTION_UP:
                        long duration = System.currentTimeMillis() - touchStartTime;
                        int diffX = (int) Math.abs(event.getRawX() - initialTouchX);
                        int diffY = (int) Math.abs(event.getRawY() - initialTouchY);

                        // If user tapped without dragging: make pet talk & hop!
                        if (!isDragging && duration < 350 && diffX < 20 && diffY < 20) {
                            if (webView != null) {
                                webView.evaluateJavascript("window.onPetTapped && window.onPetTapped();", null);
                            }
                        }
                        return true;
                }
                return false;
            }
        });

        floatingView = rootLayout;
        windowManager.addView(floatingView, params);
    }

    private void updateFloatingView(Intent intent) {
        if (webView != null) {
            loadWebViewHtml(intent);
        }
    }

    private void loadWebViewHtml(Intent intent) {
        String speciesName = intent != null && intent.getStringExtra("speciesName") != null
            ? intent.getStringExtra("speciesName")
            : "Digimon";
        String spriteUrl = intent != null && intent.getStringExtra("spriteUrl") != null
            ? intent.getStringExtra("spriteUrl")
            : "file:///android_asset/public/assets/aistudio/Copy_of_Agumon_Adventure_04d0832a.png";
        
        if (spriteUrl.startsWith("/")) {
            spriteUrl = "file:///android_asset/public" + spriteUrl;
        }

        int sheetWidth = intent != null ? intent.getIntExtra("sheetWidth", 200) : 200;
        int sheetHeight = intent != null ? intent.getIntExtra("sheetHeight", 200) : 200;
        int groundOffset = intent != null ? intent.getIntExtra("groundOffset", 0) : 0;
        int frameX = intent != null ? intent.getIntExtra("frameX", 2) : 2;
        int frameY = intent != null ? intent.getIntExtra("frameY", 2) : 2;
        int frameW = intent != null ? intent.getIntExtra("frameW", 48) : 48;
        int frameH = intent != null ? intent.getIntExtra("frameH", 48) : 48;
        int frameRotate = intent != null ? intent.getIntExtra("frameRotate", 0) : 0;

        String standingFramesJson = intent != null && intent.getStringExtra("standingFramesJson") != null
            ? intent.getStringExtra("standingFramesJson")
            : "[]";
        String walkingFramesJson = intent != null && intent.getStringExtra("walkingFramesJson") != null
            ? intent.getStringExtra("walkingFramesJson")
            : "[]";
        String quotesJson = intent != null && intent.getStringExtra("quotesJson") != null
            ? intent.getStringExtra("quotesJson")
            : "[]";

        String html = "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<style>" +
            "html, body { margin:0; padding:0; background:transparent; overflow:hidden; width:100%; height:100%; user-select:none; -webkit-user-select:none; pointer-events:none; font-family:sans-serif; }" +
            "#stage { position:relative; width:100%; height:100%; overflow:hidden; }" +
            
            // Speech Bubble with cartoon tail and animated scale/fade
            "#bubble { position:absolute; top:6px; left:50%; transform:translateX(-50%) scale(0); opacity:0; max-width:140px; background:#ffffff; color:#0f172a; border:2px solid #0f172a; border-radius:12px; padding:3px 8px; font-size:10px; font-weight:bold; font-family:monospace; text-align:center; box-shadow:0 4px 12px rgba(0,0,0,0.45); transition:transform 0.22s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.2s ease; z-index:30; pointer-events:none; }" +
            "#bubble.show { transform:translateX(-50%) scale(1); opacity:1; }" +
            "#bubble::after { content:''; position:absolute; bottom:-6px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:6px solid #ffffff; }" +
            "#bubble::before { content:''; position:absolute; bottom:-8px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:7px solid transparent; border-right:7px solid transparent; border-top:7px solid #0f172a; z-index:-1; }" +

            // Pet wrap & upright sprite box
            "#petWrap { position:absolute; bottom:16px; left:55px; display:flex; flex-direction:column; align-items:center; transition:none; }" +
            "#spriteBox { position:relative; overflow:hidden; }" +
            "#innerBox { position:absolute; top:50%; left:50%; transform-origin:center center; overflow:hidden; }" +
            "#sheetImg { position:absolute; max-width:none; image-rendering:pixelated; }" +
            "#shadow { width:34px; height:5px; background:rgba(0,0,0,0.38); border-radius:50%; margin-top:2px; }" +
            "#badge { font-family:monospace; font-size:8.5px; font-weight:bold; color:#38bdf8; background:rgba(15,23,42,0.88); border:1px solid rgba(56,189,248,0.5); padding:1px 6px; border-radius:9999px; margin-top:3px; text-shadow:0 1px 2px #000; letter-spacing:0.5px; white-space:nowrap; }" +

            // Jump / Hop animation on tap or cheerful talk
            "@keyframes hopAnim { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }" +
            ".hopping { animation: hopAnim 0.35s ease-in-out; }" +
            "</style></head><body>" +
            "<div id='stage'>" +
            "  <div id='bubble'>Hello Tamer!</div>" +
            "  <div id='petWrap'>" +
            "    <div id='spriteBox'>" +
            "      <div id='innerBox'>" +
            "        <img id='sheetImg' src='" + spriteUrl + "' />" +
            "      </div>" +
            "    </div>" +
            "    <div id='shadow'></div>" +
            "    <div id='badge'>" + speciesName.toUpperCase() + "</div>" +
            "  </div>" +
            "</div>" +
            "<script>" +
            "var sheetW = " + sheetWidth + ";" +
            "var sheetH = " + sheetHeight + ";" +
            "var groundOffset = " + groundOffset + ";" +
            "var fallbackFrame = { x: " + frameX + ", y: " + frameY + ", w: " + frameW + ", h: " + frameH + ", rotate: " + frameRotate + " };" +
            "var standingFrames = [];" +
            "var walkingFrames = [];" +
            "var quotes = [];" +
            "try { standingFrames = " + standingFramesJson + "; } catch(e){}" +
            "try { walkingFrames = " + walkingFramesJson + "; } catch(e){}" +
            "try { quotes = " + quotesJson + "; } catch(e){}" +
            "if (!standingFrames || standingFrames.length === 0) standingFrames = [fallbackFrame];" +
            "if (!walkingFrames || walkingFrames.length === 0) walkingFrames = standingFrames;" +
            "if (!quotes || quotes.length === 0) quotes = ['Let\\'s explore!', 'Digi-Armor Energize!', 'Roar! Ready to train!', 'Together forever, Tamer!', 'Keeping watch while you work!'];" +

            "var petWrap = document.getElementById('petWrap');" +
            "var spriteBox = document.getElementById('spriteBox');" +
            "var innerBox = document.getElementById('innerBox');" +
            "var sheetImg = document.getElementById('sheetImg');" +
            "var bubble = document.getElementById('bubble');" +
            "var stage = document.getElementById('stage');" +

            "var scale = 1.85;" +
            "var facingRight = true;" +
            "var posX = 55;" +
            "var targetX = 55;" +
            "var isWalking = false;" +
            "var walkFrameIdx = 0;" +
            "var standFrameIdx = 0;" +
            "var bubbleTimeout = null;" +

            // Upright sprite frame rendering: mirrors DigimonSprite.tsx!
            "function renderFrame(frame) {" +
            "  if (!frame) return;" +
            "  var rot = frame.rotate || 0;" +
            "  var isRot = (rot === 90 || rot === -90 || rot === 270);" +
            "  var dw = (isRot ? frame.h : frame.w) * scale;" +
            "  var dh = (isRot ? frame.w : frame.h) * scale;" +
            "  var effOffset = ((frame.offsetY || 0) + groundOffset) * scale;" +
            "  spriteBox.style.width = dw + 'px';" +
            "  spriteBox.style.height = dh + 'px';" +
            "  spriteBox.style.transform = 'translateY(' + effOffset + 'px) scaleX(' + (facingRight ? 1 : -1) + ')';" +
            "  innerBox.style.width = (frame.w * scale) + 'px';" +
            "  innerBox.style.height = (frame.h * scale) + 'px';" +
            "  innerBox.style.transform = 'translate(-50%, -50%) ' + (rot ? 'rotate(' + rot + 'deg)' : '');" +
            "  sheetImg.style.width = (sheetW * scale) + 'px';" +
            "  sheetImg.style.height = (sheetH * scale) + 'px';" +
            "  sheetImg.style.left = '-' + (frame.x * scale) + 'px';" +
            "  sheetImg.style.top = '-' + (frame.y * scale) + 'px';" +
            "}" +

            // Speech Bubble display
            "function showSpeech(text) {" +
            "  if (!text) text = quotes[Math.floor(Math.random() * quotes.length)];" +
            "  bubble.innerText = text;" +
            "  bubble.classList.add('show');" +
            "  if (bubbleTimeout) clearTimeout(bubbleTimeout);" +
            "  bubbleTimeout = setTimeout(function() {" +
            "    bubble.classList.remove('show');" +
            "  }, 4200);" +
            "}" +

            // Tapped callback from native touch listener
            "window.onPetTapped = function() {" +
            "  showSpeech();" +
            "  petWrap.classList.remove('hopping');" +
            "  void petWrap.offsetWidth;" +
            "  petWrap.classList.add('hopping');" +
            "};" +

            // Autonomous roaming
            "function startWalk() {" +
            "  if (isWalking) return;" +
            "  var minX = 15;" +
            "  var maxX = Math.max(35, (stage.clientWidth || 190) - 75);" +
            "  targetX = minX + Math.random() * (maxX - minX);" +
            "  facingRight = (targetX > posX);" +
            "  isWalking = true;" +
            "}" +

            // Physics step
            "setInterval(function() {" +
            "  if (isWalking) {" +
            "    var dx = targetX - posX;" +
            "    if (Math.abs(dx) < 2) {" +
            "      posX = targetX;" +
            "      isWalking = false;" +
            "      renderFrame(standingFrames[0]);" +
            "    } else {" +
            "      posX += dx > 0 ? 1.5 : -1.5;" +
            "    }" +
            "    petWrap.style.left = posX + 'px';" +
            "  }" +
            "}, 25);" +

            // Frame animation step
            "setInterval(function() {" +
            "  if (isWalking) {" +
            "    walkFrameIdx = (walkFrameIdx + 1) % walkingFrames.length;" +
            "    renderFrame(walkingFrames[walkFrameIdx]);" +
            "  } else {" +
            "    standFrameIdx = (standFrameIdx + 1) % standingFrames.length;" +
            "    renderFrame(standingFrames[standFrameIdx]);" +
            "  }" +
            "}, 140);" +

            // AI Behavior Decision
            "setInterval(function() {" +
            "  var r = Math.random();" +
            "  if (r < 0.45) {" +
            "    startWalk();" +
            "  } else if (r < 0.72) {" +
            "    showSpeech();" +
            "  }" +
            "}, 5500);" +

            // Initial frame & greeting
            "renderFrame(standingFrames[0]);" +
            "setTimeout(function() { showSpeech(); }, 700);" +
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
