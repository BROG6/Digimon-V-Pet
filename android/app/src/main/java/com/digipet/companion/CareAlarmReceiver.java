package com.digipet.companion;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

public class CareAlarmReceiver extends BroadcastReceiver {
    public static final String CHANNEL_ID = "digipet_care_alerts";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (context == null || intent == null) {
            return;
        }

        // Do not pop OS notifications while the player is actively inside the game
        if (OverlayPlugin.isAppInForeground) {
            return;
        }

        if (Build.VERSION.SDK_INT >= 33) {
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
                return;
            }
        }

        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) {
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Digimon Hunger & Toilet Alerts",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Alerts when your Digimon is hungry or needs the toilet.");
            channel.enableVibration(true);
            nm.createNotificationChannel(channel);
        }

        int id = intent.getIntExtra("notifId", 2001);
        String title = intent.getStringExtra("title");
        String body = intent.getStringExtra("body");
        if (title == null || title.isEmpty()) {
            title = "Digivice Care Alert";
        }
        if (body == null || body.isEmpty()) {
            body = "Your Digimon needs attention!";
        }

        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.setFlags(
            Intent.FLAG_ACTIVITY_NEW_TASK |
            Intent.FLAG_ACTIVITY_SINGLE_TOP |
            Intent.FLAG_ACTIVITY_CLEAR_TOP
        );
        int piFlags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
            ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            : PendingIntent.FLAG_UPDATE_CURRENT;
        PendingIntent pendingIntent = PendingIntent.getActivity(context, id, launchIntent, piFlags);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent);

        nm.notify(id, builder.build());
    }
}
