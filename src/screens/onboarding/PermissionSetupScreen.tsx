import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    NativeModules,
    Alert,
    Linking,
} from 'react-native';
import { Text } from '../../components';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/theme';

const { BlockingModule } = NativeModules;

interface PermissionSetupProps {
    onComplete: () => void;
    onSkip?: () => void;
}

const CheckIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.6, height: size * 0.3, borderLeftWidth: 3, borderBottomWidth: 3, borderColor: color, transform: [{ rotate: '-45deg' }], marginTop: -size * 0.1 }} />
    </View>
);

const WarningIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 0, height: 0, borderLeftWidth: size * 0.5, borderRightWidth: size * 0.5, borderBottomWidth: size * 0.8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }} />
        <View style={{ position: 'absolute', width: 3, height: size * 0.25, backgroundColor: '#FFF', top: size * 0.35 }} />
        <View style={{ position: 'absolute', width: 4, height: 4, backgroundColor: '#FFF', borderRadius: 2, top: size * 0.65 }} />
    </View>
);

export const PermissionSetupScreen: React.FC<PermissionSetupProps> = ({ onComplete, onSkip }) => {
    const { theme, isDark } = useTheme();
    const [accessibilityEnabled, setAccessibilityEnabled] = useState(false);
    const [foregroundServiceRunning, setForegroundServiceRunning] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        checkPermissions();
        const interval = setInterval(checkPermissions, 2000);
        return () => clearInterval(interval);
    }, []);

    const checkPermissions = async () => {
        try {
            const a11y = await BlockingModule.isAccessibilityEnabled();
            const fg = await BlockingModule.isForegroundServiceRunning();
            setAccessibilityEnabled(a11y);
            setForegroundServiceRunning(fg);
            setChecking(false);

            // Auto-complete if all permissions are granted
            if (a11y && fg) {
                onComplete();
            }
        } catch (e) {
            console.log('Permission check error:', e);
            setChecking(false);
        }
    };

    const handleOpenAccessibility = () => {
        Alert.alert(
            'Enable Accessibility',
            'On Android 13+, you need to first unlock "Restricted Settings":\n\n' +
            '1. Tap the ⋮ menu (top-right)\n' +
            '2. Select "Allow restricted settings"\n' +
            '3. Then find and enable "Blockd"',
            [
                { text: 'Open App Info First', onPress: () => BlockingModule.openAppSettings() },
                { text: 'Go to Accessibility', onPress: () => BlockingModule.openAccessibilitySettings() },
            ]
        );
    };

    const handleStartForeground = async () => {
        try {
            await BlockingModule.startForegroundService();
            // Check again after a short delay
            setTimeout(checkPermissions, 500);
        } catch (e) {
            console.log('Start service error:', e);
        }
    };

    const allReady = accessibilityEnabled && foregroundServiceRunning;

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
        >
            <View style={styles.header}>
                <Text variant="h1" weight="bold" align="center">
                    Setup Protection
                </Text>
                <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ marginTop: spacing[2] }}>
                    Blockd needs a few permissions to protect you effectively
                </Text>
            </View>

            {/* Warning for Android 13+ */}
            <View style={[styles.warningBox, { backgroundColor: isDark ? 'rgba(255,200,0,0.1)' : 'rgba(255,200,0,0.15)' }]}>
                <WarningIcon size={24} color="#FFB800" />
                <Text variant="caption" color="#FFB800" style={{ flex: 1, marginLeft: spacing[3] }}>
                    Android 13+ blocks these permissions by default. Follow the steps below to enable them.
                </Text>
            </View>

            {/* Step 1: Accessibility Service */}
            <View style={[styles.stepCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }]}>
                <View style={styles.stepHeader}>
                    <View style={[styles.stepNumber, { backgroundColor: accessibilityEnabled ? '#22C55E' : (isDark ? '#333' : '#DDD') }]}>
                        {accessibilityEnabled ? (
                            <CheckIcon size={20} color="#FFF" />
                        ) : (
                            <Text variant="body" weight="bold" color={isDark ? '#FFF' : '#000'}>1</Text>
                        )}
                    </View>
                    <View style={{ flex: 1, marginLeft: spacing[3] }}>
                        <Text variant="body" weight="semibold">
                            Accessibility Service
                        </Text>
                        <Text variant="caption" color={theme.colors.textSecondary}>
                            {accessibilityEnabled ? 'Enabled ✓' : 'Required to detect app launches'}
                        </Text>
                    </View>
                </View>

                {!accessibilityEnabled && (
                    <>
                        <View style={styles.instructions}>
                            <Text variant="caption" color={theme.colors.textSecondary}>
                                <Text weight="semibold">Step 1:</Text> Tap "Open App Info" below{'\n'}
                                <Text weight="semibold">Step 2:</Text> Tap ⋮ (top-right) → "Allow restricted settings"{'\n'}
                                <Text weight="semibold">Step 3:</Text> Go back, tap "Go to Accessibility"{'\n'}
                                <Text weight="semibold">Step 4:</Text> Find "Blockd" and enable it
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: isDark ? '#FFF' : '#000' }]}
                            onPress={handleOpenAccessibility}
                        >
                            <Text variant="body" weight="semibold" color={isDark ? '#000' : '#FFF'}>
                                Setup Accessibility
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Step 2: Foreground Service */}
            <View style={[styles.stepCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }]}>
                <View style={styles.stepHeader}>
                    <View style={[styles.stepNumber, { backgroundColor: foregroundServiceRunning ? '#22C55E' : (isDark ? '#333' : '#DDD') }]}>
                        {foregroundServiceRunning ? (
                            <CheckIcon size={20} color="#FFF" />
                        ) : (
                            <Text variant="body" weight="bold" color={isDark ? '#FFF' : '#000'}>2</Text>
                        )}
                    </View>
                    <View style={{ flex: 1, marginLeft: spacing[3] }}>
                        <Text variant="body" weight="semibold">
                            Background Protection
                        </Text>
                        <Text variant="caption" color={theme.colors.textSecondary}>
                            {foregroundServiceRunning ? 'Running ✓' : 'Keeps Blockd active 24/7'}
                        </Text>
                    </View>
                </View>

                {!foregroundServiceRunning && (
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: isDark ? '#FFF' : '#000', marginTop: spacing[4] }]}
                        onPress={handleStartForeground}
                    >
                        <Text variant="body" weight="semibold" color={isDark ? '#000' : '#FFF'}>
                            Start Background Service
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Status Summary */}
            <View style={[styles.statusBox, {
                backgroundColor: allReady
                    ? (isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)')
                    : (isDark ? 'rgba(255,68,68,0.1)' : 'rgba(255,68,68,0.08)')
            }]}>
                <Text variant="body" weight="semibold" color={allReady ? '#22C55E' : '#FF4444'}>
                    {allReady ? '✓ All permissions granted!' : '⚠ Setup incomplete'}
                </Text>
                <Text variant="caption" color={theme.colors.textSecondary} style={{ marginTop: spacing[1] }}>
                    {allReady
                        ? 'Blockd is now protecting your focus time.'
                        : 'Complete the steps above to enable app blocking.'}
                </Text>
            </View>

            {/* Continue / Skip */}
            <View style={styles.footer}>
                {allReady ? (
                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: '#22C55E' }]}
                        onPress={onComplete}
                    >
                        <Text variant="body" weight="bold" color="#FFF">
                            Continue
                        </Text>
                    </TouchableOpacity>
                ) : onSkip && (
                    <TouchableOpacity onPress={onSkip}>
                        <Text variant="body" color={theme.colors.textSecondary}>
                            Skip for now
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: spacing[4], paddingTop: 60 },
    header: { marginBottom: spacing[5] },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing[4],
        borderRadius: 16,
        marginBottom: spacing[4]
    },
    stepCard: {
        padding: spacing[4],
        borderRadius: 20,
        marginBottom: spacing[3]
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    stepNumber: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center'
    },
    instructions: {
        marginTop: spacing[3],
        marginBottom: spacing[3],
        paddingLeft: spacing[5] + 12
    },
    button: {
        padding: spacing[3],
        borderRadius: 12,
        alignItems: 'center'
    },
    statusBox: {
        padding: spacing[4],
        borderRadius: 16,
        marginTop: spacing[2]
    },
    footer: {
        marginTop: spacing[5],
        alignItems: 'center'
    },
    primaryButton: {
        paddingVertical: spacing[4],
        paddingHorizontal: spacing[6],
        borderRadius: 16
    },
});

export default PermissionSetupScreen;
