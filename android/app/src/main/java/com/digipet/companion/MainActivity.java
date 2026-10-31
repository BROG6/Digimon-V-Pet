package com.digipet.companion;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(OverlayPlugin.class);
        super.onCreate(savedInstanceState);
    }

    @CapacitorPlugin(name = "OverlayPlugin")
    public static class OverlayPlugin extends Plugin {
        @PluginMethod
        public void checkPermission(PluginCall call) {
            JSObject ret = new JSObject();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                android.content.Context ctx = getActivity() != null ? getActivity() : getContext();
                ret.put("granted", Settings.canDrawOverlays(ctx));
            } else {
                ret.put("granted", true);
            }
            call.resolve(ret);
        }

        @PluginMethod
        public void requestPermission(PluginCall call) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                android.content.Context ctx = getActivity() != null ? getActivity() : getContext();
                if (!Settings.canDrawOverlays(ctx)) {
                    Intent intent = new Intent(
                        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:" + ctx.getPackageName())
                    );
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    ctx.startActivity(intent);
                }
            }
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        }
    }
}
