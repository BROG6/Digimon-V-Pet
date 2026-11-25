package com.digipet.companion;

import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageInfo;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.atomic.AtomicBoolean;

@CapacitorPlugin(name = "AppUpdatePlugin")
public class AppUpdatePlugin extends Plugin {
    private static final String DEFAULT_HOST = "https://ais-dev-hwfiiqh77iufzd3mdqoptd-750449911930.asia-northeast1.run.app";

    private static String rewriteLocalhost(String rawUrl) {
        if (rawUrl == null) return DEFAULT_HOST;
        if (rawUrl.contains("localhost") || rawUrl.contains("127.0.0.1")) {
            return rawUrl
                .replace("https://localhost", DEFAULT_HOST)
                .replace("http://localhost", DEFAULT_HOST)
                .replace("https://127.0.0.1", DEFAULT_HOST)
                .replace("http://127.0.0.1", DEFAULT_HOST);
        }
        return rawUrl;
    }

    private static String sanitizeApkFileName(String rawName) {
        String name = (rawName == null ? "" : rawName).replaceAll("[^a-zA-Z0-9._-]", "_");
        if (name.isEmpty() || name.startsWith(".")) {
            name = "digipet-update.apk";
        }
        if (!name.toLowerCase().endsWith(".apk")) {
            name = name + ".apk";
        }
        return name;
    }

    private static boolean isValidApkArchive(File file) {
        if (file == null || !file.exists() || file.length() < 102400L) {
            return false;
        }
        try (FileInputStream fis = new FileInputStream(file)) {
            int b0 = fis.read();
            int b1 = fis.read();
            // APK files are ZIP archives starting with 'PK' (0x50, 0x4B)
            return b0 == 0x50 && b1 == 0x4B;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean hasInstallPackagesPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Context ctx = getContext();
            return ctx != null && ctx.getPackageManager().canRequestPackageInstalls();
        }
        return true;
    }

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
            ret.put("versionName", pInfo.versionName != null ? pInfo.versionName : "1.2.4");
            ret.put("versionCode", versionCode);
            ret.put("packageName", ctx.getPackageName());
            ret.put("isNative", true);
            call.resolve(ret);
        } catch (Exception e) {
            ret.put("versionName", "1.2.4");
            ret.put("versionCode", 124);
            ret.put("packageName", ctx.getPackageName());
            ret.put("isNative", true);
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void canRequestPackageInstalls(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", hasInstallPackagesPermission());
        call.resolve(ret);
    }

    @PluginMethod
    public void openInstallPermissionSettings(PluginCall call) {
        Context ctx = getContext();
        if (ctx == null) {
            call.reject("Context unavailable");
            return;
        }
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                Intent intent = new Intent(
                    Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:" + ctx.getPackageName())
                );
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (getActivity() != null) {
                    getActivity().startActivity(intent);
                } else {
                    ctx.startActivity(intent);
                }
            }
            JSObject ret = new JSObject();
            ret.put("opened", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Could not open install permission settings: " + e.getMessage());
        }
    }

    @PluginMethod
    public void downloadAndInstallApk(PluginCall call) {
        Context ctx = getContext();
        if (ctx == null) {
            call.reject("Android context unavailable");
            return;
        }

        String rawUrl = call.getString("url");
        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            call.reject("Download URL is required");
            return;
        }

        String resolvedUrl = rewriteLocalhost(rawUrl.trim());
        if (!resolvedUrl.startsWith("https://")) {
            call.reject("Only secure HTTPS APK download URLs are permitted.");
            return;
        }

        if (!hasInstallPackagesPermission()) {
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("needsInstallPermission", true);
            ret.put("message", "Allow 'Install unknown apps' for DigiPet in Android Settings, then tap Download & Install again.");
            call.resolve(ret);
            return;
        }

        DownloadManager dm = (DownloadManager) ctx.getSystemService(Context.DOWNLOAD_SERVICE);
        if (dm == null) {
            call.reject("Android DownloadManager service is unavailable.");
            return;
        }

        final String safeFileName = sanitizeApkFileName(call.getString("fileName", "digipet-latest.apk"));
        final File downloadsDir = ctx.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        if (downloadsDir == null) {
            call.reject("App download storage directory is unavailable.");
            return;
        }
        if (!downloadsDir.exists()) {
            downloadsDir.mkdirs();
        }

        final File targetApkFile = new File(downloadsDir, safeFileName);
        if (targetApkFile.exists()) {
            // Remove previous copy so DownloadManager writes cleanly to exact target path
            //noinspection ResultOfMethodCallIgnored
            targetApkFile.delete();
        }

        try {
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(resolvedUrl));
            request.setTitle("DigiPet Update (" + safeFileName + ")");
            request.setDescription("Downloading signed DigiPet APK update...");
            request.setMimeType("application/vnd.android.package-archive");
            // Visible system notification during and after download (no DOWNLOAD_WITHOUT_NOTIFICATION)
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setDestinationInExternalFilesDir(ctx, Environment.DIRECTORY_DOWNLOADS, safeFileName);
            request.setAllowedOverMetered(true);
            request.setAllowedOverRoaming(true);

            final long downloadId = dm.enqueue(request);
            final Handler mainHandler = new Handler(Looper.getMainLooper());
            final AtomicBoolean finished = new AtomicBoolean(false);
            final Context appCtx = ctx.getApplicationContext();

            final BroadcastReceiver[] receiverHolder = new BroadcastReceiver[1];
            final Runnable[] pollHolder = new Runnable[1];

            final Runnable cleanup = () -> {
                if (pollHolder[0] != null) {
                    mainHandler.removeCallbacks(pollHolder[0]);
                }
                if (receiverHolder[0] != null) {
                    try {
                        appCtx.unregisterReceiver(receiverHolder[0]);
                    } catch (Exception ignored) {}
                    receiverHolder[0] = null;
                }
            };

            final Runnable inspectAndInstall = () -> {
                if (finished.get()) return;
                DownloadManager.Query q = new DownloadManager.Query().setFilterById(downloadId);
                try (Cursor cursor = dm.query(q)) {
                    if (cursor != null && cursor.moveToFirst()) {
                        int statusIdx = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS);
                        int reasonIdx = cursor.getColumnIndex(DownloadManager.COLUMN_REASON);
                        int status = statusIdx >= 0 ? cursor.getInt(statusIdx) : DownloadManager.STATUS_PENDING;
                        int reason = reasonIdx >= 0 ? cursor.getInt(reasonIdx) : 0;

                        if (status == DownloadManager.STATUS_SUCCESSFUL) {
                            if (!finished.compareAndSet(false, true)) return;
                            cleanup.run();

                            if (!isValidApkArchive(targetApkFile)) {
                                if (targetApkFile.exists()) {
                                    //noinspection ResultOfMethodCallIgnored
                                    targetApkFile.delete();
                                }
                                mainHandler.post(() -> call.reject(
                                    "Downloaded file is not a valid APK package (server may require browser login or returned an HTML page). Try Open in Browser."
                                ));
                                return;
                            }

                            mainHandler.post(() -> {
                                try {
                                    Uri apkUri = FileProvider.getUriForFile(
                                        appCtx,
                                        appCtx.getPackageName() + ".fileprovider",
                                        targetApkFile
                                    );
                                    Intent installIntent = new Intent(Intent.ACTION_VIEW);
                                    installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                                    installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);

                                    if (getActivity() != null) {
                                        getActivity().startActivity(installIntent);
                                    } else {
                                        appCtx.startActivity(installIntent);
                                    }

                                    JSObject ret = new JSObject();
                                    ret.put("success", true);
                                    ret.put("usedDownloadManager", true);
                                    ret.put("filePath", targetApkFile.getAbsolutePath());
                                    call.resolve(ret);
                                } catch (Exception installEx) {
                                    call.reject("Could not launch Android package installer: " + installEx.getMessage());
                                }
                            });
                        } else if (status == DownloadManager.STATUS_FAILED) {
                            if (!finished.compareAndSet(false, true)) return;
                            cleanup.run();
                            if (targetApkFile.exists()) {
                                //noinspection ResultOfMethodCallIgnored
                                targetApkFile.delete();
                            }
                            final int failReason = reason;
                            mainHandler.post(() -> call.reject(
                                "APK download failed (DownloadManager code " + failReason + "). You can tap Open in Browser as fallback."
                            ));
                        }
                    }
                } catch (Exception queryEx) {
                    if (finished.compareAndSet(false, true)) {
                        cleanup.run();
                        mainHandler.post(() -> call.reject("Failed checking download status: " + queryEx.getMessage()));
                    }
                }
            };

            receiverHolder[0] = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    long completedId = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1L);
                    if (completedId == downloadId) {
                        inspectAndInstall.run();
                    }
                }
            };

            ContextCompat.registerReceiver(
                appCtx,
                receiverHolder[0],
                new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
                ContextCompat.RECEIVER_EXPORTED
            );

            final long startedAt = System.currentTimeMillis();
            pollHolder[0] = new Runnable() {
                @Override
                public void run() {
                    if (finished.get()) return;
                    inspectAndInstall.run();
                    if (!finished.get()) {
                        if (System.currentTimeMillis() - startedAt > 180_000L) {
                            if (finished.compareAndSet(false, true)) {
                                cleanup.run();
                                call.reject("APK download timed out. Check your connection or tap Open in Browser.");
                            }
                            return;
                        }
                        mainHandler.postDelayed(this, 650L);
                    }
                }
            };
            mainHandler.postDelayed(pollHolder[0], 700L);
        } catch (Exception e) {
            call.reject("Failed to start APK download: " + e.getMessage());
        }
    }

    @PluginMethod
    public void fetchManifest(PluginCall call) {
        String manifestUrl = call.getString("url");
        if (manifestUrl == null || manifestUrl.isEmpty()) {
            manifestUrl = DEFAULT_HOST + "/api/app-version";
        }
        manifestUrl = rewriteLocalhost(manifestUrl);

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
    public void openExternalUrl(PluginCall call) {
        String urlString = call.getString("url");
        if (urlString == null || urlString.isEmpty()) {
            call.reject("URL is required");
            return;
        }

        urlString = rewriteLocalhost(urlString);

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
    public void httpPost(PluginCall call) {
        String rawUrl = call.getString("url");
        String body = call.getString("body", "{}");
        if (rawUrl == null || rawUrl.isEmpty()) {
            call.reject("URL is required");
            return;
        }
        final String targetUrl = rewriteLocalhost(rawUrl);
        new Thread(() -> {
            HttpURLConnection conn = null;
            try {
                String currentUrl = targetUrl;
                int redirects = 0;
                int code = 0;
                while (redirects <= 2) {
                    URL url = new URL(currentUrl);
                    conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("POST");
                    conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                    conn.setRequestProperty("Accept", "application/json");
                    conn.setRequestProperty("User-Agent", "DigiPet-Android/1.2");
                    conn.setInstanceFollowRedirects(false);
                    conn.setConnectTimeout(15000);
                    conn.setReadTimeout(35000);
                    conn.setDoOutput(true);
                    byte[] outBytes = (body != null ? body : "{}").getBytes("UTF-8");
                    conn.setFixedLengthStreamingMode(outBytes.length);
                    try (java.io.OutputStream os = conn.getOutputStream()) {
                        os.write(outBytes);
                        os.flush();
                    }

                    code = conn.getResponseCode();
                    if (code >= 300 && code < 400) {
                        final String location = conn.getHeaderField("Location");
                        conn.disconnect();
                        conn = null;
                        boolean isAuthRedirect = location == null
                            || location.contains("cookie_check")
                            || location.contains("accounts.google.com")
                            || location.contains("ServiceLogin");
                        if (!isAuthRedirect && (code == 307 || code == 308) && redirects < 2) {
                            currentUrl = location.startsWith("http")
                                ? location
                                : new URL(new URL(currentUrl), location).toString();
                            redirects++;
                            continue;
                        }
                        final String redirectErr = "{\"success\":false,\"error\":\"Host requires Google login cookies (" + code + "). Publish/Share the app publicly or set your Server URL.\"}";
                        new Handler(Looper.getMainLooper()).post(() -> {
                            JSObject ret = new JSObject();
                            ret.put("ok", false);
                            ret.put("status", 401);
                            ret.put("data", redirectErr);
                            call.resolve(ret);
                        });
                        return;
                    }
                    break;
                }

                InputStream stream = code >= 400 ? conn.getErrorStream() : conn.getInputStream();
                StringBuilder sb = new StringBuilder();
                if (stream != null) {
                    java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(stream, "UTF-8"));
                    String line;
                    while ((line = reader.readLine()) != null) {
                        sb.append(line);
                    }
                    reader.close();
                }
                final int statusCode;
                final String result;
                final String rawBody = sb.toString();
                final boolean isHtml = (conn.getContentType() != null && conn.getContentType().toLowerCase().contains("text/html"))
                    || rawBody.trim().startsWith("<");
                if (code == 404) {
                    statusCode = 404;
                    result = "{\"success\":false,\"error\":\"Server endpoint returned 404 (host not published or route unavailable). Share the app or set a Server URL.\"}";
                } else if (isHtml) {
                    statusCode = 401;
                    result = "{\"success\":false,\"error\":\"Host returned an HTML login gate instead of JSON. Use a public Shared App URL or custom Server URL.\"}";
                } else {
                    statusCode = code;
                    result = rawBody;
                }

                new Handler(Looper.getMainLooper()).post(() -> {
                    JSObject ret = new JSObject();
                    ret.put("ok", statusCode >= 200 && statusCode < 300);
                    ret.put("status", statusCode);
                    ret.put("data", result);
                    call.resolve(ret);
                });
            } catch (Exception e) {
                new Handler(Looper.getMainLooper()).post(() -> {
                    call.reject("Native connection failed: " + e.getMessage());
                });
            } finally {
                if (conn != null) {
                    conn.disconnect();
                }
            }
        }).start();
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
