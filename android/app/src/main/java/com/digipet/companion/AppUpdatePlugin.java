package com.digipet.companion;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "AppUpdatePlugin")
public class AppUpdatePlugin extends Plugin {
    private static final String DEFAULT_HOST = "https://ais-dev-hwfiiqh77iufzd3mdqoptd-750449911930.asia-northeast1.run.app";

    private volatile File pendingApkFile = null;
    private volatile boolean waitingForInstallPermission = false;

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

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        if (waitingForInstallPermission && pendingApkFile != null && pendingApkFile.exists()) {
            Context ctx = getContext();
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || ctx.getPackageManager().canRequestPackageInstalls()) {
                waitingForInstallPermission = false;
                File apkToInstall = pendingApkFile;
                pendingApkFile = null;
                try {
                    launchApkInstaller(apkToInstall);
                } catch (Exception ignored) {}
            }
        }
    }

    private void launchApkInstaller(File apkFile) throws Exception {
        Context ctx = getContext();
        Uri contentUri = FileProvider.getUriForFile(ctx, ctx.getPackageName() + ".fileprovider", apkFile);
        Intent installIntent = new Intent(Intent.ACTION_VIEW);
        installIntent.setDataAndType(contentUri, "application/vnd.android.package-archive");
        installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        if (getActivity() != null) {
            getActivity().startActivity(installIntent);
        } else {
            ctx.startActivity(installIntent);
        }
    }

    private static String sanitizeFileName(String rawName) {
        String name = (rawName == null || rawName.trim().isEmpty()) ? "digipet-latest.apk" : rawName.trim();
        name = name.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (!name.toLowerCase().endsWith(".apk")) {
            name = name + ".apk";
        }
        return name;
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
    public void downloadAndInstall(PluginCall call) {
        String rawUrl = call.getString("url");
        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            call.reject("Download URL is required");
            return;
        }
        final String targetUrl = rewriteLocalhost(rawUrl.trim());
        final String safeFileName = sanitizeFileName(call.getString("fileName"));
        final Context ctx = getContext();

        new Thread(() -> {
            HttpURLConnection conn = null;
            File tempFile = null;
            try {
                String currentUrl = targetUrl;
                int redirects = 0;
                int code = 0;

                while (redirects <= 8) {
                    URL url = new URL(currentUrl);
                    conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("GET");
                    conn.setRequestProperty("Accept", "application/vnd.android.package-archive, application/octet-stream, */*");
                    conn.setRequestProperty("User-Agent", "DigiPet-Android-Updater/1.2");
                    conn.setInstanceFollowRedirects(false);
                    conn.setConnectTimeout(20000);
                    conn.setReadTimeout(60000);
                    conn.connect();

                    code = conn.getResponseCode();
                    if (code == HttpURLConnection.HTTP_MOVED_PERM
                        || code == HttpURLConnection.HTTP_MOVED_TEMP
                        || code == HttpURLConnection.HTTP_SEE_OTHER
                        || code == 307
                        || code == 308) {
                        String location = conn.getHeaderField("Location");
                        conn.disconnect();
                        conn = null;
                        if (location == null || location.trim().isEmpty()) {
                            throw new Exception("Redirect without Location header");
                        }
                        if (location.contains("cookie_check") || location.contains("accounts.google.com") || location.contains("ServiceLogin")) {
                            throw new Exception("Server requires sign-in cookies to download APK. Try GitHub Release APK or public URL.");
                        }
                        currentUrl = new URL(new URL(currentUrl), location).toString();
                        redirects++;
                        continue;
                    }
                    break;
                }

                if (conn == null || code >= 400) {
                    throw new Exception("Download server returned HTTP " + code);
                }

                String contentType = conn.getContentType();
                if (contentType != null && contentType.toLowerCase().contains("text/html")) {
                    throw new Exception("Download link returned a webpage instead of an APK file.");
                }

                File updatesDir = new File(ctx.getCacheDir(), "updates");
                if (!updatesDir.exists()) {
                    updatesDir.mkdirs();
                }
                File[] oldFiles = updatesDir.listFiles();
                if (oldFiles != null) {
                    for (File old : oldFiles) {
                        if (old.isFile() && old.getName().endsWith(".apk")) {
                            old.delete();
                        }
                    }
                }

                File finalApk = new File(updatesDir, safeFileName);
                tempFile = new File(updatesDir, safeFileName + ".part");
                if (tempFile.exists()) {
                    tempFile.delete();
                }

                long totalBytes = conn.getContentLengthLong();
                long downloadedBytes = 0;
                int lastReportedPct = -1;

                try (InputStream is = new BufferedInputStream(conn.getInputStream());
                     FileOutputStream fos = new FileOutputStream(tempFile)) {
                    byte[] buffer = new byte[16384];
                    int bytesRead;
                    boolean checkedMagic = false;

                    while ((bytesRead = is.read(buffer)) != -1) {
                        if (!checkedMagic && bytesRead >= 2) {
                            checkedMagic = true;
                            if (buffer[0] != 'P' || buffer[1] != 'K') {
                                throw new Exception("Downloaded file is not a valid Android APK archive.");
                            }
                        }
                        fos.write(buffer, 0, bytesRead);
                        downloadedBytes += bytesRead;

                        int pct = totalBytes > 0 ? (int) Math.min(99, (downloadedBytes * 100L) / totalBytes) : -1;
                        if (pct != lastReportedPct && (pct == -1 || pct % 4 == 0)) {
                            lastReportedPct = pct;
                            final int emitPct = pct;
                            final long emitDone = downloadedBytes;
                            final long emitTotal = totalBytes;
                            new Handler(Looper.getMainLooper()).post(() -> {
                                JSObject prog = new JSObject();
                                prog.put("progress", emitPct);
                                prog.put("downloadedBytes", emitDone);
                                prog.put("totalBytes", emitTotal);
                                notifyListeners("downloadProgress", prog);
                            });
                        }
                    }
                    fos.flush();
                }

                if (downloadedBytes < 100_000) {
                    throw new Exception("Downloaded APK appears incomplete (" + downloadedBytes + " bytes).");
                }

                if (finalApk.exists()) {
                    finalApk.delete();
                }
                if (!tempFile.renameTo(finalApk)) {
                    throw new Exception("Could not finalize downloaded APK in app cache.");
                }
                tempFile = null;

                final long finalSize = downloadedBytes;
                new Handler(Looper.getMainLooper()).post(() -> {
                    JSObject doneProg = new JSObject();
                    doneProg.put("progress", 100);
                    doneProg.put("downloadedBytes", finalSize);
                    doneProg.put("totalBytes", finalSize);
                    notifyListeners("downloadProgress", doneProg);

                    try {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !ctx.getPackageManager().canRequestPackageInstalls()) {
                            pendingApkFile = finalApk;
                            waitingForInstallPermission = true;
                            Intent permIntent = new Intent(
                                Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                                Uri.parse("package:" + ctx.getPackageName())
                            );
                            permIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            if (getActivity() != null) {
                                getActivity().startActivity(permIntent);
                            } else {
                                ctx.startActivity(permIntent);
                            }
                            JSObject ret = new JSObject();
                            ret.put("success", true);
                            ret.put("needsPermission", true);
                            ret.put("installedPrompted", false);
                            ret.put("resolvedUrl", targetUrl);
                            call.resolve(ret);
                            return;
                        }

                        pendingApkFile = null;
                        waitingForInstallPermission = false;
                        launchApkInstaller(finalApk);

                        JSObject ret = new JSObject();
                        ret.put("success", true);
                        ret.put("needsPermission", false);
                        ret.put("installedPrompted", true);
                        ret.put("resolvedUrl", targetUrl);
                        call.resolve(ret);
                    } catch (Exception installErr) {
                        call.reject("Could not start installer: " + installErr.getMessage());
                    }
                });
            } catch (Exception e) {
                if (tempFile != null && tempFile.exists()) {
                    tempFile.delete();
                }
                final String errMsg = e.getMessage() != null ? e.getMessage() : "In-app download failed";
                new Handler(Looper.getMainLooper()).post(() -> {
                    call.reject(errMsg);
                });
            } finally {
                if (conn != null) {
                    conn.disconnect();
                }
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
