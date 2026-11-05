package com.digipet.companion;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "AppUpdatePlugin")
public class AppUpdatePlugin extends Plugin {

    @PluginMethod
    public void getAppInfo(PluginCall call) {
        Context ctx = getContext();
        JSObject ret = new JSObject();
        try {
            PackageInfo pInfo = ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0);
            long versionCode = 1;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                versionCode = pInfo.getLongVersionCode();
            } else {
                versionCode = pInfo.versionCode;
            }
            ret.put("versionName", pInfo.versionName != null ? pInfo.versionName : "1.0.0");
            ret.put("versionCode", versionCode);
            ret.put("packageName", ctx.getPackageName());
            ret.put("isNative", true);
            call.resolve(ret);
        } catch (Exception e) {
            ret.put("versionName", "1.0.0");
            ret.put("versionCode", 1);
            ret.put("packageName", ctx.getPackageName());
            ret.put("isNative", true);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void checkInstallPermission(PluginCall call) {
        Context ctx = getContext();
        boolean granted = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            granted = ctx.getPackageManager().canRequestPackageInstalls();
        }
        JSObject ret = new JSObject();
        ret.put("granted", granted);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestInstallPermission(PluginCall call) {
        Context ctx = getContext();
        boolean prompted = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                intent.setData(Uri.parse("package:" + ctx.getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (getActivity() != null) {
                    getActivity().startActivity(intent);
                } else {
                    ctx.startActivity(intent);
                }
                prompted = true;
            } catch (Exception e) {
                call.reject("Could not open install unknown apps permission: " + e.getMessage());
                return;
            }
        }
        JSObject ret = new JSObject();
        ret.put("success", true);
        ret.put("prompted", prompted);
        call.resolve(ret);
    }

    @PluginMethod
    public void fetchManifest(PluginCall call) {
        String manifestUrl = call.getString("url");
        if (manifestUrl == null || manifestUrl.isEmpty()) {
            manifestUrl = "https://ais-pre-hwfiiqh77iufzd3mdqoptd-750449911930.asia-northeast1.run.app/api/app-version";
        }
        if (manifestUrl.contains("localhost") || manifestUrl.contains("127.0.0.1")) {
            manifestUrl = manifestUrl.replace("https://localhost", "https://ais-pre-hwfiiqh77iufzd3mdqoptd-750449911930.asia-northeast1.run.app")
                                     .replace("http://localhost", "https://ais-pre-hwfiiqh77iufzd3mdqoptd-750449911930.asia-northeast1.run.app");
        }

        final String targetUrl = manifestUrl;
        new Thread(() -> {
            try {
                URL url = new URL(targetUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(15000);
                conn.setReadTimeout(15000);
                conn.setInstanceFollowRedirects(true);
                conn.connect();

                int code = conn.getResponseCode();
                if (code >= 400) {
                    final int errCode = code;
                    final String msg = conn.getResponseMessage();
                    conn.disconnect();
                    new Handler(Looper.getMainLooper()).post(() -> {
                        call.reject("HTTP " + errCode + ": " + msg);
                    });
                    return;
                }

                java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                reader.close();
                conn.disconnect();

                final String result = sb.toString();
                new Handler(Looper.getMainLooper()).post(() -> {
                    JSObject ret = new JSObject();
                    ret.put("data", result);
                    call.resolve(ret);
                });
            } catch (Exception e) {
                new Handler(Looper.getMainLooper()).post(() -> {
                    call.reject("Native connection error: " + e.getMessage());
                });
            }
        }).start();
    }

    @PluginMethod
    public void downloadAndInstallApk(PluginCall call) {
        String apkUrl = call.getString("apkUrl");
        if (apkUrl == null || apkUrl.isEmpty()) {
            call.reject("APK download URL is required");
            return;
        }

        String fileName = call.getString("fileName", "digipet-latest.apk");
        Context ctx = getContext();

        // Check permission on Android 8+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (!ctx.getPackageManager().canRequestPackageInstalls()) {
                JSObject ret = new JSObject();
                ret.put("needsPermission", true);
                ret.put("success", false);
                ret.put("message", "Please allow install unknown apps permission in Settings.");
                call.resolve(ret);
                return;
            }
        }

        // Failsafe: if apkUrl points to localhost/127.0.0.1, rewrite to official Cloud Run host
        if (apkUrl.contains("localhost") || apkUrl.contains("127.0.0.1")) {
            apkUrl = apkUrl.replace("https://localhost", "https://ais-pre-hwfiiqh77iufzd3mdqoptd-750449911930.asia-northeast1.run.app")
                           .replace("http://localhost", "https://ais-pre-hwfiiqh77iufzd3mdqoptd-750449911930.asia-northeast1.run.app")
                           .replace("https://127.0.0.1", "https://ais-pre-hwfiiqh77iufzd3mdqoptd-750449911930.asia-northeast1.run.app")
                           .replace("http://127.0.0.1", "https://ais-pre-hwfiiqh77iufzd3mdqoptd-750449911930.asia-northeast1.run.app");
        }

        final String finalApkUrl = apkUrl;

        // Run background download
        new Thread(() -> {
            try {
                File storageDir = ctx.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (storageDir == null) {
                    storageDir = ctx.getCacheDir();
                }
                if (!storageDir.exists()) {
                    storageDir.mkdirs();
                }

                File destinationFile = new File(storageDir, fileName);
                if (destinationFile.exists()) {
                    destinationFile.delete();
                }

                URL url = new URL(finalApkUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(25000);
                conn.setReadTimeout(30000);
                conn.setInstanceFollowRedirects(true);
                conn.connect();

                // Handle HTTP redirects (301, 302, 307)
                int responseCode = conn.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_MOVED_PERM || 
                    responseCode == HttpURLConnection.HTTP_MOVED_TEMP ||
                    responseCode == 307) {
                    String newUrl = conn.getHeaderField("Location");
                    conn.disconnect();
                    url = new URL(newUrl);
                    conn = (HttpURLConnection) url.openConnection();
                    conn.setConnectTimeout(25000);
                    conn.setReadTimeout(30000);
                    conn.connect();
                    responseCode = conn.getResponseCode();
                }

                if (responseCode >= 400) {
                    final int errCode = responseCode;
                    final String errMsg = conn.getResponseMessage();
                    conn.disconnect();
                    new Handler(Looper.getMainLooper()).post(() -> {
                        call.reject("Server returned HTTP " + errCode + " (" + errMsg + "). The APK binary was not found at this URL.");
                    });
                    return;
                }

                String contentType = conn.getContentType();
                if (contentType != null && (contentType.contains("text/html") || contentType.contains("application/xhtml"))) {
                    conn.disconnect();
                    new Handler(Looper.getMainLooper()).post(() -> {
                        call.reject("Server returned a webpage (HTML) instead of an APK binary. Please check the APK URL in updater settings.");
                    });
                    return;
                }

                InputStream is = conn.getInputStream();
                FileOutputStream fos = new FileOutputStream(destinationFile);
                byte[] buffer = new byte[8192];
                int len;
                while ((len = is.read(buffer)) != -1) {
                    fos.write(buffer, 0, len);
                }
                fos.flush();
                fos.close();
                is.close();
                conn.disconnect();

                // Launch package installer on UI thread
                new Handler(Looper.getMainLooper()).post(() -> {
                    try {
                        Uri apkUri;
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                            apkUri = FileProvider.getUriForFile(
                                ctx,
                                ctx.getPackageName() + ".fileprovider",
                                destinationFile
                            );
                        } else {
                            apkUri = Uri.fromFile(destinationFile);
                        }

                        Intent installIntent = new Intent(Intent.ACTION_VIEW);
                        installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                        installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                        if (getActivity() != null) {
                            getActivity().startActivity(installIntent);
                        } else {
                            ctx.startActivity(installIntent);
                        }

                        JSObject res = new JSObject();
                        res.put("success", true);
                        res.put("installed", true);
                        call.resolve(res);
                    } catch (Exception ex) {
                        call.reject("Failed to trigger APK installer: " + ex.getMessage());
                    }
                });

            } catch (Exception e) {
                new Handler(Looper.getMainLooper()).post(() -> {
                    call.reject("Download error: " + e.getMessage());
                });
            }
        }).start();
    }

    @PluginMethod
    public void openExternalUrl(PluginCall call) {
        String urlString = call.getString("url");
        if (urlString == null || urlString.isEmpty()) {
            call.reject("URL is required");
            return;
        }

        if (urlString.contains("localhost") || urlString.contains("127.0.0.1")) {
            urlString = urlString.replace("https://localhost", "https://ais-pre-hwfiiqh77iufzd3mdqoptd-750449911930.asia-northeast1.run.app")
                                 .replace("http://localhost", "https://ais-pre-hwfiiqh77iufzd3mdqoptd-750449911930.asia-northeast1.run.app")
                                 .replace("https://127.0.0.1", "https://ais-pre-hwfiiqh77iufzd3mdqoptd-750449911930.asia-northeast1.run.app")
                                 .replace("http://127.0.0.1", "https://ais-pre-hwfiiqh77iufzd3mdqoptd-750449911930.asia-northeast1.run.app");
        }

        try {
            Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(urlString));
            browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            Context ctx = getContext();
            if (getActivity() != null) {
                getActivity().startActivity(browserIntent);
            } else {
                ctx.startActivity(browserIntent);
            }
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to open URL: " + e.getMessage());
        }
    }

    @PluginMethod
    public void reloadWebAssets(PluginCall call) {
        if (getActivity() != null && getBridge() != null && getBridge().getWebView() != null) {
            getActivity().runOnUiThread(() -> {
                getBridge().getWebView().reload();
            });
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } else {
            call.reject("WebView not available to reload");
        }
    }
}
