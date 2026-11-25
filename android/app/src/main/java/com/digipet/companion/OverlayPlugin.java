package com.digipet.companion;

import android.Manifest;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.PictureInPictureParams;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.Rational;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.lang.ref.WeakReference;

@CapacitorPlugin(name = "OverlayPlugin")
public class OverlayPlugin extends Plugin {
    public static volatile boolean isAppInForeground = false;
    private static WeakReference<OverlayPlugin> activeInstance = new WeakReference<>(null);

    public static void notifyOverlayStateChanged(final boolean active) {
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            @Override
            public void run() {
                OverlayPlugin plugin = activeInstance.get();
                if (plugin != null) {
                    JSObject data = new JSObject();
                    data.put("active", active);
                    plugin.notifyListeners("overlayStateChanged", data);
                }
            }
        });
    }

    @Override
    public void load() {
        super.load();
        isAppInForeground = true;
        activeInstance = new WeakReference<>(this);
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        isAppInForeground = true;
        activeInstance = new WeakReference<>(this);
    }

    @Override
    protected void handleOnPause() {
        super.handleOnPause();
        isAppInForeground = false;
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        isAppInForeground = false;
        activeInstance.clear();
    }

    private long readLongOption(PluginCall call, String key, long fallback) {
        if (call == null || call.getData() == null || !call.getData().has(key)) {
            return fallback;
        }
        Object val = call.getData().opt(key);
        if (val == null || val == org.json.JSONObject.NULL) {
            return fallback;
        }
        if (val instanceof Number) {
            return ((Number) val).longValue();
        }
        try {
            return Long.parseLong(String.valueOf(val).trim());
        } catch (Exception ignored) {
            return fallback;
        }
    }

    private int readIntOption(PluginCall call, String key, int fallback) {
        if (call == null || call.getData() == null || !call.getData().has(key)) {
            return fallback;
        }
        Object val = call.getData().opt(key);
        if (val == null || val == org.json.JSONObject.NULL) {
            return fallback;
        }
        if (val instanceof Number) {
            return (int) Math.round(((Number) val).doubleValue());
        }
        try {
            return (int) Math.round(Double.parseDouble(String.valueOf(val).trim()));
        } catch (Exception ignored) {
            return fallback;
        }
    }

    @PluginMethod
    public void checkPermission(PluginCall call) {
        JSObject ret = new JSObject();
        boolean granted = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Context ctx = getActivity() != null ? getActivity() : getContext();
            granted = Settings.canDrawOverlays(ctx);
        }
        ret.put("granted", granted);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        Context ctx = getActivity() != null ? getActivity() : getContext();
        boolean prompted = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
                intent.setData(Uri.parse("package:" + ctx.getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (getActivity() != null) {
                    getActivity().startActivity(intent);
                } else {
                    ctx.startActivity(intent);
                }
                prompted = true;
            } catch (Exception e) {
                try {
                    Intent fallbackIntent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
                    fallbackIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    if (getActivity() != null) {
                        getActivity().startActivity(fallbackIntent);
                    } else {
                        ctx.startActivity(fallbackIntent);
                    }
                    prompted = true;
                } catch (Exception ex) {
                    call.reject("Could not open overlay permission settings: " + ex.getMessage());
                    return;
                }
            }
        }
        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("prompted", prompted);
        call.resolve(ret);
    }

    @PluginMethod
    public void startOverlay(PluginCall call) {
        Context ctx = getActivity() != null ? getActivity() : getContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(ctx)) {
            if (Boolean.TRUE.equals(call.getBoolean("promptPermission", false))) {
                requestPermission(call);
            } else {
                call.reject("Display over other apps permission not granted");
            }
            return;
        }

        String speciesName = call.getString("speciesName", "Agumon");
        String spriteUrl = call.getString("spriteUrl", "file:///android_asset/public/assets/digidestined/agumon.png");
        Integer sheetWidth = call.getInt("sheetWidth", 200);
        Integer sheetHeight = call.getInt("sheetHeight", 200);
        Integer stageWidth = call.getInt("stageWidth", 0);
        Integer stageHeight = call.getInt("stageHeight", 0);
        Integer groundOffset = call.getInt("groundOffset", 0);
        String standingFramesJson = call.getString("standingFramesJson", "[]");
        String walkingFramesJson = call.getString("walkingFramesJson", "[]");
        String sleepingFramesJson = call.getString("sleepingFramesJson", "[]");
        String quotesJson = call.getString("quotesJson", "[]");
        Integer frameX = call.getInt("frameX", 2);
        Integer frameY = call.getInt("frameY", 2);
        Integer frameW = call.getInt("frameW", 48);
        Integer frameH = call.getInt("frameH", 48);
        Integer frameRotate = call.getInt("frameRotate", 0);
        Boolean isFlying = call.getBoolean("isFlying", false);
        Boolean isSleeping = call.getBoolean("isSleeping", false);
        String gridRowRatiosJson = call.getString("gridRowRatiosJson", "[0.365,0.497,0.629,0.76,0.92]");
        Integer previewRowIndex = call.getInt("previewRowIndex", -1);
        int hunger = readIntOption(call, "hunger", 75);
        int happiness = readIntOption(call, "happiness", 80);
        int bigMeatStock = readIntOption(call, "bigMeatStock", -1);
        int vitaminStock = readIntOption(call, "vitaminStock", -1);
        String stage = call.getString("stage", "rookie");
        Boolean isFrozen = call.getBoolean("isFrozen", false);
        long hungerHeartMs = readLongOption(call, "hungerHeartMsStr", 3600000L);
        long lastHungerDropAtMs = readLongOption(call, "lastHungerDropAtMsStr", System.currentTimeMillis());
        if (lastHungerDropAtMs <= 0L) {
            lastHungerDropAtMs = System.currentTimeMillis();
        }
        String evolvedMessage = call.getString("evolvedMessage", "");
        String nextEvoTriggerMsStr = call.getString("nextEvoTriggerMsStr", "0");
        String nextEvoPayloadJson = call.getString("nextEvoPayloadJson", "");

        android.content.SharedPreferences syncPrefs = ctx.getSharedPreferences("digipet_overlay_sync", Context.MODE_PRIVATE);
        int pendingMeat = Math.max(0, syncPrefs.getInt("pendingMeatUsed", 0));
        int pendingVit = Math.max(0, syncPrefs.getInt("pendingVitUsed", 0));
        int pendingPraise = Math.max(0, syncPrefs.getInt("pendingPraiseCount", 0));
        long lastOverlayMeatAtMs = syncPrefs.getLong("lastOverlayMeatAtMs", 0L);

        if (bigMeatStock < 0) {
            bigMeatStock = Math.max(0, syncPrefs.getInt("lastKnownMeatStock", 0) - pendingMeat);
        } else {
            bigMeatStock = Math.max(0, bigMeatStock - pendingMeat);
        }
        if (vitaminStock < 0) {
            vitaminStock = Math.max(0, syncPrefs.getInt("lastKnownVitStock", 0) - pendingVit);
        } else {
            vitaminStock = Math.max(0, vitaminStock - pendingVit);
        }
        if (pendingMeat > 0) {
            hunger = Math.min(100, hunger + pendingMeat * 25);
            if (lastOverlayMeatAtMs > lastHungerDropAtMs) {
                lastHungerDropAtMs = lastOverlayMeatAtMs;
            }
        }
        if (pendingMeat > 0 || pendingVit > 0 || pendingPraise > 0) {
            happiness = Math.min(100, happiness + pendingMeat * 10 + pendingVit * 20 + pendingPraise * 15);
        }

        syncPrefs.edit()
            .putInt("lastKnownHunger", hunger)
            .putInt("lastKnownHappiness", happiness)
            .putInt("lastKnownMeatStock", bigMeatStock)
            .putInt("lastKnownVitStock", vitaminStock)
            .putString("petStage", stage != null ? stage : "rookie")
            .putBoolean("isPetFrozen", isFrozen != null ? isFrozen : false)
            .putLong("hungerHeartMs", hungerHeartMs)
            .putLong("lastHungerDropAtMs", lastHungerDropAtMs)
            .apply();

        Intent serviceIntent = new Intent(ctx, FloatingPetService.class);
        serviceIntent.putExtra("speciesName", speciesName);
        serviceIntent.putExtra("spriteUrl", spriteUrl);
        serviceIntent.putExtra("sheetWidth", sheetWidth);
        serviceIntent.putExtra("sheetHeight", sheetHeight);
        serviceIntent.putExtra("stageWidth", stageWidth);
        serviceIntent.putExtra("stageHeight", stageHeight);
        serviceIntent.putExtra("groundOffset", groundOffset);
        serviceIntent.putExtra("standingFramesJson", standingFramesJson);
        serviceIntent.putExtra("walkingFramesJson", walkingFramesJson);
        serviceIntent.putExtra("sleepingFramesJson", sleepingFramesJson);
        serviceIntent.putExtra("quotesJson", quotesJson);
        serviceIntent.putExtra("frameX", frameX);
        serviceIntent.putExtra("frameY", frameY);
        serviceIntent.putExtra("frameW", frameW);
        serviceIntent.putExtra("frameH", frameH);
        serviceIntent.putExtra("frameRotate", frameRotate);
        serviceIntent.putExtra("isFlying", isFlying != null ? isFlying : false);
        serviceIntent.putExtra("isSleeping", isSleeping != null ? isSleeping : false);
        serviceIntent.putExtra("gridRowRatiosJson", gridRowRatiosJson);
        serviceIntent.putExtra("previewRowIndex", previewRowIndex != null ? previewRowIndex : -1);
        serviceIntent.putExtra("hunger", hunger);
        serviceIntent.putExtra("happiness", happiness);
        serviceIntent.putExtra("bigMeatStock", bigMeatStock);
        serviceIntent.putExtra("vitaminStock", vitaminStock);
        serviceIntent.putExtra("stage", stage != null ? stage : "rookie");
        serviceIntent.putExtra("isFrozen", isFrozen != null ? isFrozen : false);
        serviceIntent.putExtra("hungerHeartMs", hungerHeartMs);
        serviceIntent.putExtra("lastHungerDropAtMs", lastHungerDropAtMs);
        serviceIntent.putExtra("evolvedMessage", evolvedMessage != null ? evolvedMessage : "");
        serviceIntent.putExtra("nextEvoTriggerMsStr", nextEvoTriggerMsStr != null ? nextEvoTriggerMsStr : "0");
        serviceIntent.putExtra("nextEvoPayloadJson", nextEvoPayloadJson != null ? nextEvoPayloadJson : "");

        try {
            ctx.startService(serviceIntent);
        } catch (Exception ex) {
            call.reject("Failed to start overlay service: " + ex.getMessage());
            return;
        }

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void stopOverlay(PluginCall call) {
        Context ctx = getActivity() != null ? getActivity() : getContext();
        Intent serviceIntent = new Intent(ctx, FloatingPetService.class);
        ctx.stopService(serviceIntent);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void departForBattle(PluginCall call) {
        Context ctx = getActivity() != null ? getActivity() : getContext();
        if (!FloatingPetService.isRunning) {
            JSObject ret = new JSObject();
            ret.put("started", false);
            call.resolve(ret);
            return;
        }
        String reason = call.getString("reason", "battle");
        Intent serviceIntent = new Intent(ctx, FloatingPetService.class);
        serviceIntent.setAction("DEPART_BATTLE");
        serviceIntent.putExtra("reason", reason != null ? reason : "battle");
        try {
            ctx.startService(serviceIntent);
            JSObject ret = new JSObject();
            ret.put("started", true);
            call.resolve(ret);
        } catch (Exception e) {
            ctx.stopService(new Intent(ctx, FloatingPetService.class));
            JSObject ret = new JSObject();
            ret.put("started", false);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void isOverlayActive(PluginCall call) {
        Context ctx = getActivity() != null ? getActivity() : getContext();
        boolean granted = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            granted = Settings.canDrawOverlays(ctx);
        }
        JSObject ret = new JSObject();
        ret.put("active", FloatingPetService.isRunning);
        ret.put("permissionGranted", granted);
        call.resolve(ret);
    }

    @PluginMethod
    public void consumePendingEvolution(PluginCall call) {
        Context ctx = getActivity() != null ? getActivity() : getContext();
        android.content.SharedPreferences prefs = ctx.getSharedPreferences("digipet_overlay_sync", Context.MODE_PRIVATE);
        String speciesId = prefs.getString("pendingSpeciesId", null);
        long evolvedAt = prefs.getLong("pendingEvolvedAt", 0L);
        if (speciesId != null && !speciesId.isEmpty()) {
            prefs.edit().remove("pendingSpeciesId").remove("pendingEvolvedAt").apply();
        }
        JSObject ret = new JSObject();
        ret.put("speciesId", speciesId);
        ret.put("evolvedAt", evolvedAt);
        call.resolve(ret);
    }

    @PluginMethod
    public void consumePendingCareActions(PluginCall call) {
        Context ctx = getActivity() != null ? getActivity() : getContext();
        android.content.SharedPreferences prefs = ctx.getSharedPreferences("digipet_overlay_sync", Context.MODE_PRIVATE);
        int meatUsed = prefs.getInt("pendingMeatUsed", 0);
        int vitUsed = prefs.getInt("pendingVitUsed", 0);
        int praiseCount = prefs.getInt("pendingPraiseCount", 0);
        long lastMeatAtMs = prefs.getLong("lastOverlayMeatAtMs", 0L);
        if (meatUsed != 0 || vitUsed != 0 || praiseCount != 0 || lastMeatAtMs != 0L) {
            prefs.edit()
                .remove("pendingMeatUsed")
                .remove("pendingVitUsed")
                .remove("pendingPraiseCount")
                .remove("lastOverlayMeatAtMs")
                .apply();
        }
        JSObject ret = new JSObject();
        ret.put("meatUsed", meatUsed);
        ret.put("vitUsed", vitUsed);
        ret.put("praiseCount", praiseCount);
        ret.put("lastMeatAtMs", lastMeatAtMs);
        call.resolve(ret);
    }

    @PluginMethod
    public void enterPip(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && getActivity() != null) {
            try {
                PictureInPictureParams params = new PictureInPictureParams.Builder()
                    .setAspectRatio(new Rational(1, 1))
                    .build();
                boolean entered = getActivity().enterPictureInPictureMode(params);
                JSObject ret = new JSObject();
                ret.put("success", entered);
                call.resolve(ret);
                return;
            } catch (Exception e) {
                call.reject("Could not enter PiP: " + e.getMessage());
                return;
            }
        }
        call.reject("Picture-in-Picture not supported on this Android API level");
    }

    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        Context ctx = getActivity() != null ? getActivity() : getContext();
        if (Build.VERSION.SDK_INT >= 33) {
            boolean granted = ContextCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS)
                == PackageManager.PERMISSION_GRANTED;
            if (!granted && getActivity() != null) {
                ActivityCompat.requestPermissions(
                    getActivity(),
                    new String[] { Manifest.permission.POST_NOTIFICATIONS },
                    4101
                );
            }
            JSObject ret = new JSObject();
            ret.put("granted", granted);
            call.resolve(ret);
            return;
        }
        JSObject ret = new JSObject();
        ret.put("granted", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void showCareNotification(PluginCall call) {
        Context ctx = getActivity() != null ? getActivity() : getContext();
        // Only skip OS notification while the player is actively looking at the unlocked game
        if (isAppInForeground && !CareAlarmReceiver.isScreenLockedOrOff(ctx)) {
            JSObject ret = new JSObject();
            ret.put("success", false);
            call.resolve(ret);
            return;
        }

        if (Build.VERSION.SDK_INT >= 33) {
            if (ContextCompat.checkSelfPermission(ctx, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
                JSObject ret = new JSObject();
                ret.put("success", false);
                call.resolve(ret);
                return;
            }
        }

        int id = readIntOption(call, "id", 2001);
        String title = call.getString("title", "Digivice Care Alert");
        String body = call.getString("body", "Your Digimon needs attention!");
        String channelId = CareAlarmReceiver.CHANNEL_ID;

        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) {
            JSObject ret = new JSObject();
            ret.put("success", false);
            call.resolve(ret);
            return;
        }

        Uri soundUri = Uri.parse("android.resource://" + ctx.getPackageName() + "/" + R.raw.digivice_beep_clean);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                channelId,
                "Digimon Care Alerts",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Digivice alerts when your Digimon is hungry, sleepy, or needs the toilet.");
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0L, 250L, 150L, 250L});
            channel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
            channel.setShowBadge(true);
            AudioAttributes audioAttrs = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();
            channel.setSound(soundUri, audioAttrs);
            nm.createNotificationChannel(channel);
        }

        Intent launchIntent = new Intent(ctx, MainActivity.class);
        launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int piFlags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
            ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            : PendingIntent.FLAG_UPDATE_CURRENT;
        PendingIntent pendingIntent = PendingIntent.getActivity(ctx, id, launchIntent, piFlags);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(ctx, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setDefaults(NotificationCompat.DEFAULT_VIBRATE | NotificationCompat.DEFAULT_LIGHTS)
            .setWhen(System.currentTimeMillis())
            .setShowWhen(true)
            .setSound(soundUri)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent);

        nm.notify(id, builder.build());

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    private static PendingIntent createCareAlarmPendingIntent(Context ctx, int reqCode, int notifId, String title, String body) {
        Intent intent = new Intent(ctx, CareAlarmReceiver.class);
        intent.putExtra("notifId", notifId);
        intent.putExtra("title", title);
        intent.putExtra("body", body);
        int piFlags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
            ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            : PendingIntent.FLAG_UPDATE_CURRENT;
        return PendingIntent.getBroadcast(ctx, reqCode, intent, piFlags);
    }

    private static void scheduleOrCancelAlarm(Context ctx, AlarmManager am, int reqCode, int notifId, long triggerAtMs, String title, String body) {
        if (am == null) return;
        PendingIntent pi = createCareAlarmPendingIntent(ctx, reqCode, notifId, title, body);
        if (triggerAtMs > System.currentTimeMillis() + 1000L) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    if (am.canScheduleExactAlarms()) {
                        am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMs, pi);
                    } else {
                        am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMs, pi);
                    }
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMs, pi);
                } else {
                    am.setExact(AlarmManager.RTC_WAKEUP, triggerAtMs, pi);
                }
            } catch (SecurityException se) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMs, pi);
                } else {
                    am.set(AlarmManager.RTC_WAKEUP, triggerAtMs, pi);
                }
            }
        } else {
            am.cancel(pi);
        }
    }

    public static void rescheduleHungerAlarmsFromOverlay(
        Context ctx,
        int hunger,
        long hungerHeartMs,
        long lastHungerDropAtMs
    ) {
        if (ctx == null || hungerHeartMs <= 0L) return;
        android.content.SharedPreferences syncPrefs = ctx.getSharedPreferences("digipet_overlay_sync", Context.MODE_PRIVATE);
        if (!syncPrefs.getBoolean("careAlertsEnabled", true)) return;
        String petName = syncPrefs.getString("careAlertPetName", "Your Digimon");
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        long nowMs = System.currentTimeMillis();
        long msPerPoint = Math.max(1000L, hungerHeartMs / 25L);
        long anchor = lastHungerDropAtMs > 0L ? lastHungerDropAtMs : nowMs;
        long hungryAtMs = hunger > 25 ? Math.max(nowMs + 5000L, anchor + (long) (hunger - 25) * msPerPoint) : 0L;
        long starvingAtMs = hunger > 0 ? Math.max(nowMs + 5000L, anchor + (long) hunger * msPerPoint) : 0L;
        scheduleOrCancelAlarm(
            ctx,
            am,
            3001,
            2001,
            hungryAtMs,
            "🍖 Hunger Alert: " + petName,
            petName + " is getting hungry (1 heart left)! Time to feed Big Meat."
        );
        scheduleOrCancelAlarm(
            ctx,
            am,
            3002,
            2001,
            starvingAtMs,
            "🚨 " + petName + " is Starving!",
            petName + " hit 0% hunger! Feed within 10 minutes before a Care Mistake."
        );
    }

    @PluginMethod
    public void scheduleCareNotifications(PluginCall call) {
        Context ctx = getActivity() != null ? getActivity() : getContext();
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);

        String petName = call.getString("petName", "Your Digimon");
        ctx.getSharedPreferences("digipet_overlay_sync", Context.MODE_PRIVATE)
            .edit()
            .putBoolean("careAlertsEnabled", true)
            .putString("careAlertPetName", petName)
            .apply();

        long hungryAtMs = readLongOption(call, "hungryAtMs", 0L);
        long starvingAtMs = readLongOption(call, "starvingAtMs", 0L);
        long nextPoopAtMs = readLongOption(call, "nextPoopAtMs", 0L);
        long poop2AtMs = readLongOption(call, "poop2AtMs", 0L);
        long poop3AtMs = readLongOption(call, "poop3AtMs", 0L);
        long poopFullAtMs = readLongOption(call, "poopFullAtMs", 0L);
        long bedtimeAtMs = readLongOption(call, "bedtimeAtMs", 0L);
        int nextPoopCount = Math.max(1, Math.min(4, readIntOption(call, "nextPoopCount", 1)));

        scheduleOrCancelAlarm(
            ctx,
            am,
            3001,
            2001,
            hungryAtMs,
            "🍖 Hunger Alert: " + petName,
            petName + " is getting hungry (1 heart left)! Time to feed Big Meat."
        );
        scheduleOrCancelAlarm(
            ctx,
            am,
            3002,
            2001,
            starvingAtMs,
            "🚨 " + petName + " is Starving!",
            petName + " hit 0% hunger! Feed within 10 minutes before a Care Mistake."
        );
        scheduleOrCancelAlarm(
            ctx,
            am,
            3003,
            2002,
            nextPoopAtMs,
            "💩 Toilet Alert: " + petName,
            nextPoopCount >= 4
                ? petName + " has 4 toilet piles — got sick & +1 Care Mistake! Flush & cure now."
                : petName + " needs the toilet! (" + nextPoopCount + "/4 piles)"
        );
        scheduleOrCancelAlarm(
            ctx,
            am,
            3006,
            2002,
            poop2AtMs,
            "💩 Toilet Alert: " + petName,
            petName + " needs the toilet! (" + Math.min(3, nextPoopCount + 1) + "/4 piles)"
        );
        scheduleOrCancelAlarm(
            ctx,
            am,
            3007,
            2002,
            poop3AtMs,
            "💩 Toilet Alert: " + petName,
            petName + " needs the toilet! (3/4 piles — flush soon!)"
        );
        scheduleOrCancelAlarm(
            ctx,
            am,
            3004,
            2002,
            poopFullAtMs,
            "🚨 Toilet Full Alert: " + petName,
            petName + " hit 4 toilet piles — got sick & +1 Care Mistake! Flush & give medicine right away."
        );
        scheduleOrCancelAlarm(
            ctx,
            am,
            3005,
            2005,
            bedtimeAtMs,
            "🌙 Bedtime Alert: " + petName,
            petName + " is sleepy! Turn the lights off within 10 minutes to avoid a Care Mistake."
        );

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void cancelCareNotifications(PluginCall call) {
        Context ctx = getActivity() != null ? getActivity() : getContext();
        ctx.getSharedPreferences("digipet_overlay_sync", Context.MODE_PRIVATE)
            .edit()
            .putBoolean("careAlertsEnabled", false)
            .apply();
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am != null) {
            am.cancel(createCareAlarmPendingIntent(ctx, 3001, 2001, "", ""));
            am.cancel(createCareAlarmPendingIntent(ctx, 3002, 2001, "", ""));
            am.cancel(createCareAlarmPendingIntent(ctx, 3003, 2002, "", ""));
            am.cancel(createCareAlarmPendingIntent(ctx, 3004, 2002, "", ""));
            am.cancel(createCareAlarmPendingIntent(ctx, 3005, 2005, "", ""));
            am.cancel(createCareAlarmPendingIntent(ctx, 3006, 2002, "", ""));
            am.cancel(createCareAlarmPendingIntent(ctx, 3007, 2002, "", ""));
        }
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }
}
