package com.digipet.companion;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.PictureInPictureParams;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
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

@CapacitorPlugin(name = "OverlayPlugin")
public class OverlayPlugin extends Plugin {

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
            requestPermission(call);
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
        String evolvedMessage = call.getString("evolvedMessage", "");
        String nextEvoTriggerMsStr = call.getString("nextEvoTriggerMsStr", "0");
        String nextEvoPayloadJson = call.getString("nextEvoPayloadJson", "");

        android.content.SharedPreferences syncPrefs = ctx.getSharedPreferences("digipet_overlay_sync", Context.MODE_PRIVATE);
        if (bigMeatStock < 0) {
            bigMeatStock = syncPrefs.getInt("lastKnownMeatStock", 0);
        } else {
            syncPrefs.edit().putInt("lastKnownMeatStock", bigMeatStock).apply();
        }
        if (vitaminStock < 0) {
            vitaminStock = syncPrefs.getInt("lastKnownVitStock", 0);
        } else {
            syncPrefs.edit().putInt("lastKnownVitStock", vitaminStock).apply();
        }
        syncPrefs.edit()
            .putInt("lastKnownHunger", hunger)
            .putInt("lastKnownHappiness", happiness)
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
        serviceIntent.putExtra("evolvedMessage", evolvedMessage != null ? evolvedMessage : "");
        serviceIntent.putExtra("nextEvoTriggerMsStr", nextEvoTriggerMsStr != null ? nextEvoTriggerMsStr : "0");
        serviceIntent.putExtra("nextEvoPayloadJson", nextEvoPayloadJson != null ? nextEvoPayloadJson : "");

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                ctx.startForegroundService(serviceIntent);
            } else {
                ctx.startService(serviceIntent);
            }
        } catch (Exception e) {
            try {
                ctx.startService(serviceIntent);
            } catch (Exception ex) {
                call.reject("Failed to start overlay service: " + ex.getMessage());
                return;
            }
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
    public void isOverlayActive(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("active", FloatingPetService.isRunning);
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
        if (meatUsed != 0 || vitUsed != 0 || praiseCount != 0) {
            prefs.edit()
                .remove("pendingMeatUsed")
                .remove("pendingVitUsed")
                .remove("pendingPraiseCount")
                .apply();
        }
        JSObject ret = new JSObject();
        ret.put("meatUsed", meatUsed);
        ret.put("vitUsed", vitUsed);
        ret.put("praiseCount", praiseCount);
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
        String channelId = "digipet_care_alerts";

        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) {
            JSObject ret = new JSObject();
            ret.put("success", false);
            call.resolve(ret);
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                channelId,
                "Digimon Hunger & Toilet Alerts",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Alerts when your Digimon is hungry or needs the toilet.");
            channel.enableVibration(true);
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
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent);

        nm.notify(id, builder.build());

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }
}
