export interface DeviceBatteryInfo {
  level: number; // 0 to 100
  charging: boolean;
  supported: boolean;
}

export async function getBatteryStatus(): Promise<DeviceBatteryInfo> {
  try {
    // navigator.getBattery is non-standard but supported in Chromium/Android
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<{
        level: number;
        charging: boolean;
        addEventListener: (event: string, handler: () => void) => void;
      }>;
    };

    if (typeof nav.getBattery === 'function') {
      const battery = await nav.getBattery();
      return {
        level: Math.round(battery.level * 100),
        charging: battery.charging,
        supported: true,
      };
    }
  } catch (err) {
    // Fallback if not supported or denied
  }

  return {
    level: 84, // simulated default
    charging: false,
    supported: false,
  };
}
