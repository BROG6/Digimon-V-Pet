package com.digipet.companion;

import android.app.PictureInPictureParams;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Rational;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "OverlayPlugin")
public class OverlayPlugin extends Plugin {

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
        String quotesJson = call.getString("quotesJson", "[]");
        Integer frameX = call.getInt("frameX", 2);
        Integer frameY = call.getInt("frameY", 2);
        Integer frameW = call.getInt("frameW", 48);
        Integer frameH = call.getInt("frameH", 48);
        Integer frameRotate = call.getInt("frameRotate", 0);
        Boolean isFlying = call.getBoolean("isFlying", false);
        String gridRowRatiosJson = call.getString("gridRowRatiosJson", "[0.365,0.497,0.629,0.76,0.92]");
        Integer previewRowIndex = call.getInt("previewRowIndex", -1);
        Integer hunger = call.getInt("hunger", 75);
        Integer happiness = call.getInt("happiness", 80);
        String evolvedMessage = call.getString("evolvedMessage", "");
        String nextEvoTriggerMsStr = call.getString("nextEvoTriggerMsStr", "0");
        String nextEvoPayloadJson = call.getString("nextEvoPayloadJson", "");

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
        serviceIntent.putExtra("quotesJson", quotesJson);
        serviceIntent.putExtra("frameX", frameX);
        serviceIntent.putExtra("frameY", frameY);
        serviceIntent.putExtra("frameW", frameW);
        serviceIntent.putExtra("frameH", frameH);
        serviceIntent.putExtra("frameRotate", frameRotate);
        serviceIntent.putExtra("isFlying", isFlying != null ? isFlying : false);
        serviceIntent.putExtra("gridRowRatiosJson", gridRowRatiosJson);
        serviceIntent.putExtra("previewRowIndex", previewRowIndex != null ? previewRowIndex : -1);
        serviceIntent.putExtra("hunger", hunger != null ? hunger : 75);
        serviceIntent.putExtra("happiness", happiness != null ? happiness : 80);
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
}
