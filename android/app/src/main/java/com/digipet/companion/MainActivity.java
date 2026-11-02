package com.digipet.companion;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // In Capacitor, register custom plugins before super.onCreate to ensure registration
        registerPlugin(OverlayPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
