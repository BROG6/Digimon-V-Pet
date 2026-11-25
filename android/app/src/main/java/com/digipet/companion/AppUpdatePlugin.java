package com.digipet.companion;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

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
