package com.digipet.companion;

import android.app.AppOpsManager;
import android.app.PictureInPictureParams;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Process;
import android.provider.Settings;
import android.util.Rational;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(OverlayPlugin.class);
    }

    @CapacitorPlugin(name = "OverlayPlugin")
    public static class OverlayPlugin extends Plugin {
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
            boolean needPrompt = false;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!Settings.canDrawOverlays(ctx)) {
                    needPrompt = true;
                    try {
                        Intent intent = new Intent(
                            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                            Uri.parse("package:" + ctx.getPackageName())
                        );
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        ctx.startActivity(intent);
                    } catch (Exception e) {
                        try {
                            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            ctx.startActivity(intent);
                        } catch (Exception ex) {
                            // ignore
                        }
                    }
                }
            }
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("prompted", needPrompt);
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
            String spriteUrl = call.getString("spriteUrl", "file:///android_asset/public/assets/aistudio/Copy_of_Agumon_Adventure_04d0832a.png");
            Integer frameX = call.getInt("frameX", 2);
            Integer frameY = call.getInt("frameY", 2);
            Integer frameW = call.getInt("frameW", 48);
            Integer frameH = call.getInt("frameH", 48);

            Intent serviceIntent = new Intent(ctx, FloatingPetService.class);
            serviceIntent.putExtra("speciesName", speciesName);
            serviceIntent.putExtra("spriteUrl", spriteUrl);
            serviceIntent.putExtra("frameX", frameX);
            serviceIntent.putExtra("frameY", frameY);
            serviceIntent.putExtra("frameW", frameW);
            serviceIntent.putExtra("frameH", frameH);

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
}
