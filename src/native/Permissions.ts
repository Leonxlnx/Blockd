import { NativeModules, Platform } from 'react-native';

interface PermissionsModuleType {
    checkUsageStatsPermission: () => Promise<boolean>;
    requestUsageStatsPermission: () => Promise<boolean>;
    checkOverlayPermission: () => Promise<boolean>;
    requestOverlayPermission: () => Promise<boolean>;
    checkBatteryOptimization: () => Promise<boolean>;
    requestIgnoreBatteryOptimization: () => Promise<boolean>;
    checkAllPermissions: () => Promise<{
        usageStats: boolean;
        overlay: boolean;
        battery: boolean;
    }>;
}

const { PermissionsModule } = NativeModules;

// Type-safe wrapper for permissions module
export const Permissions: PermissionsModuleType = {
    checkUsageStatsPermission: async () => {
        if (Platform.OS !== 'android') return true;
        return PermissionsModule.checkUsageStatsPermission();
    },

    requestUsageStatsPermission: async () => {
        if (Platform.OS !== 'android') return true;
        return PermissionsModule.requestUsageStatsPermission();
    },

    checkOverlayPermission: async () => {
        if (Platform.OS !== 'android') return true;
        return PermissionsModule.checkOverlayPermission();
    },

    requestOverlayPermission: async () => {
        if (Platform.OS !== 'android') return true;
        return PermissionsModule.requestOverlayPermission();
    },

    checkBatteryOptimization: async () => {
        if (Platform.OS !== 'android') return true;
        return PermissionsModule.checkBatteryOptimization();
    },

    requestIgnoreBatteryOptimization: async () => {
        if (Platform.OS !== 'android') return true;
        return PermissionsModule.requestIgnoreBatteryOptimization();
    },

    checkAllPermissions: async () => {
        if (Platform.OS !== 'android') {
            return { usageStats: true, overlay: true, battery: true };
        }
        return PermissionsModule.checkAllPermissions();
    },
};

export default Permissions;
