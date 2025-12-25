import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    StatusBar,
    Animated,
    Easing,
    AppState,
    AppStateStatus,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/theme';
import { Text } from '../../components';
import { Permissions } from '../../native/Permissions';
import { NativeModules } from 'react-native';

const { width, height } = Dimensions.get('window');

// Pure gradient background only (no animated blobs)
const FlowingBackground: React.FC<{ isDark: boolean }> = () => null;


// ============================================
// ENTRANCE ANIMATION
// ============================================

const useEntranceAnimation = (delay: number = 0) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(35)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 400, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 500, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
    }, []);

    return { opacity, translateY };
};

// ============================================
// PROGRESS BAR (TOP)
// ============================================

const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
    const { isDark } = useTheme();
    return (
        <View style={styles.progressBarContainer}>
            {Array.from({ length: total }).map((_, index) => (
                <View key={index} style={[styles.progressSegment, { backgroundColor: index < current ? (isDark ? '#FFFFFF' : '#1A1A1A') : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') }]} />
            ))}
        </View>
    );
};

// ============================================
// STATUS BADGE
// ============================================

const StatusBadge: React.FC<{ granted: boolean; isDark: boolean }> = ({ granted, isDark }) => (
    <View style={[styles.statusBadge, { backgroundColor: granted ? 'rgba(76, 175, 80, 0.12)' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
        <View style={[styles.statusDot, { backgroundColor: granted ? '#4CAF50' : isDark ? '#555' : '#AAA' }]} />
        <Text variant="caption" weight="semibold" color={granted ? '#4CAF50' : isDark ? '#888' : '#777'}>{granted ? 'Granted' : 'Required'}</Text>
    </View>
);

// ============================================
// PREMIUM BUTTONS
// ============================================

interface BottomButtonsProps {
    onBack: () => void;
    onPrimary: () => void;
    primaryLabel: string;
    isDark: boolean;
}

const BottomButtons: React.FC<BottomButtonsProps> = ({ onBack, onPrimary, primaryLabel, isDark }) => (
    <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backButtonWrapper}>
            <LinearGradient colors={isDark ? ['#1A1A1A', '#282828', '#1A1A1A'] : ['#F5F5F5', '#FFFFFF', '#F5F5F5']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[styles.buttonBase, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }]}>
                <Text variant="body" weight="semibold" color={isDark ? '#FFFFFF' : '#1A1A1A'}>Back</Text>
            </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={onPrimary} activeOpacity={0.8} style={styles.nextButtonWrapper}>
            <LinearGradient colors={isDark ? ['#FFFFFF', '#F0F0F0', '#DFDFDF'] : ['#2A2A2A', '#1A1A1A', '#0A0A0A']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.nextButtonBase}>
                <Text variant="body" weight="bold" color={isDark ? '#0A0A0A' : '#FFFFFF'}>{primaryLabel}</Text>
            </LinearGradient>
        </TouchableOpacity>
    </View>
);

// ============================================
// LARGE ICONS
// ============================================

const LargeIcon: React.FC<{ type: 'usage' | 'overlay' | 'battery' | 'accessibility'; isDark: boolean }> = ({ type, isDark }) => {
    const color = isDark ? '#FFFFFF' : '#1A1A1A';
    const secondaryColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';

    if (type === 'usage') {
        // Usage Stats Icon: Bar chart with clock
        return (
            <View style={styles.iconBox}>
                <View style={styles.usageIconContainer}>
                    {/* Chart bars */}
                    <View style={styles.chartBarsRow}>
                        <View style={[styles.modernBar, { height: 24, backgroundColor: secondaryColor }]} />
                        <View style={[styles.modernBar, { height: 40, backgroundColor: color }]} />
                        <View style={[styles.modernBar, { height: 32, backgroundColor: secondaryColor }]} />
                        <View style={[styles.modernBar, { height: 48, backgroundColor: color }]} />
                    </View>
                    {/* Small clock overlay */}
                    <View style={[styles.miniClock, { borderColor: color, backgroundColor: isDark ? '#0A0A0F' : '#FAFAFA' }]}>
                        <View style={[styles.miniClockHand, { backgroundColor: color }]} />
                    </View>
                </View>
            </View>
        );
    }
    if (type === 'overlay') {
        // Overlay Icon: Layered screens/windows
        return (
            <View style={styles.iconBox}>
                <View style={styles.overlayIconContainer}>
                    <View style={[styles.overlayScreen, styles.overlayScreenBack, { borderColor: secondaryColor }]} />
                    <View style={[styles.overlayScreen, styles.overlayScreenMid, { borderColor: secondaryColor }]} />
                    <View style={[styles.overlayScreen, styles.overlayScreenFront, { borderColor: color }]}>
                        <View style={[styles.overlayDot, { backgroundColor: color }]} />
                    </View>
                </View>
            </View>
        );
    }
    if (type === 'accessibility') {
        // Accessibility Icon: Eye with person
        return (
            <View style={styles.iconBox}>
                <View style={styles.accessibilityIconContainer}>
                    {/* Eye outline */}
                    <View style={[styles.eyeOuter, { borderColor: color }]}>
                        <View style={[styles.eyeInner, { backgroundColor: color }]} />
                    </View>
                    {/* Person icon below */}
                    <View style={[styles.personHead, { backgroundColor: color }]} />
                    <View style={[styles.personBody, { borderColor: color }]} />
                </View>
            </View>
        );
    }
    // Battery Icon: Battery with infinity symbol
    return (
        <View style={styles.iconBox}>
            <View style={styles.batteryIconContainer}>
                <View style={[styles.modernBattery, { borderColor: color }]}>
                    <View style={[styles.modernBatteryFill, { backgroundColor: color }]} />
                </View>
                <View style={[styles.modernBatteryTop, { backgroundColor: color }]} />
                {/* Infinity symbol overlay */}
                <View style={styles.infinityContainer}>
                    <View style={[styles.infinityLoop, { borderColor: color }]} />
                    <View style={[styles.infinityLoop, styles.infinityLoopRight, { borderColor: color }]} />
                </View>
            </View>
        </View>
    );
};

// ============================================
// RESTRICTED SETTINGS INTRO (NEW - FIRST SCREEN)
// ============================================

interface RestrictedIntroProps {
    onNext: () => void;
    onBack?: () => void;
}

export const OnboardingRestrictedIntro: React.FC<RestrictedIntroProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const iconAnim = useEntranceAnimation(0);
    const titleAnim = useEntranceAnimation(100);
    const cardAnim = useEntranceAnimation(200);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F', '#101018', '#0C0C12', '#050508'] : ['#FAFAFA', '#F2F2F5', '#E8E8EC', '#F0F0F4', '#FAFAFA']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
            <FlowingBackground isDark={isDark} />
            <ProgressBar current={1} total={5} />

            <View style={styles.permissionContent}>
                <Animated.View style={{ opacity: iconAnim.opacity, transform: [{ translateY: iconAnim.translateY }] }}>
                    {/* Info Icon */}
                    <View style={styles.iconBox}>
                        <View style={[styles.infoIcon, { borderColor: isDark ? '#FFF' : '#1A1A1A' }]}>
                            <View style={[styles.infoIconDot, { backgroundColor: isDark ? '#FFF' : '#1A1A1A' }]} />
                            <View style={[styles.infoIconLine, { backgroundColor: isDark ? '#FFF' : '#1A1A1A' }]} />
                        </View>
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h1" weight="bold" align="center" style={styles.title}>Important Setup</Text>
                </Animated.View>

                <Animated.View style={{ opacity: cardAnim.opacity, transform: [{ translateY: cardAnim.translateY }] }}>
                    <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                        <Text variant="body" weight="semibold" align="center" style={{ marginBottom: spacing[3] }}>
                            Android 13+ requires extra steps
                        </Text>
                        <Text variant="body" color={theme.colors.textSecondary} align="left" style={{ lineHeight: 28 }}>
                            Before we begin, please:{"\n\n"}
                            1. Open Settings{"\n"}
                            2. Go to Apps{"\n"}
                            3. Find and tap Blockd{"\n"}
                            4. Enable "Allow restricted settings"{"\n"}
                            5. Return here and continue
                        </Text>
                    </View>
                </Animated.View>
            </View>

            <BottomButtons onBack={onBack || (() => { })} onPrimary={onNext} primaryLabel="I Understand" isDark={isDark} />
        </View>
    );
};

// ============================================
// USAGE STATS PERMISSION
// ============================================

interface UsageStatsScreenProps {
    onNext: () => void;
    onBack: () => void;
}

export const OnboardingUsageStats: React.FC<UsageStatsScreenProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const [granted, setGranted] = useState(false);
    const iconAnim = useEntranceAnimation(0);
    const titleAnim = useEntranceAnimation(100);
    const cardAnim = useEntranceAnimation(200);

    const checkPermission = async () => { setGranted(await Permissions.checkUsageStatsPermission()); };

    useEffect(() => {
        checkPermission();
        const sub = AppState.addEventListener('change', (s: AppStateStatus) => { if (s === 'active') checkPermission(); });
        return () => sub.remove();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F', '#101018', '#0C0C12', '#050508'] : ['#FAFAFA', '#F2F2F5', '#E8E8EC', '#F0F0F4', '#FAFAFA']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
            <FlowingBackground isDark={isDark} />
            <ProgressBar current={2} total={5} />

            <View style={styles.permissionContent}>
                <Animated.View style={{ opacity: iconAnim.opacity, transform: [{ translateY: iconAnim.translateY }] }}>
                    <LargeIcon type="usage" isDark={isDark} />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h1" weight="bold" align="center" style={styles.title}>Usage Access</Text>
                    <StatusBadge granted={granted} isDark={isDark} />
                </Animated.View>

                <Animated.View style={{ opacity: cardAnim.opacity, transform: [{ translateY: cardAnim.translateY }] }}>
                    <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                        <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ lineHeight: 26 }}>See which apps you use to help manage your screen time.</Text>
                    </View>
                </Animated.View>
            </View>

            <BottomButtons onBack={onBack} onPrimary={granted ? onNext : () => Permissions.requestUsageStatsPermission()} primaryLabel={granted ? 'Continue' : 'Grant Access'} isDark={isDark} />
        </View>
    );
};

// ============================================
// OVERLAY PERMISSION
// ============================================

interface OverlayScreenProps {
    onNext: () => void;
    onBack: () => void;
}

export const OnboardingOverlay: React.FC<OverlayScreenProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const [granted, setGranted] = useState(false);
    const iconAnim = useEntranceAnimation(0);
    const titleAnim = useEntranceAnimation(100);
    const cardAnim = useEntranceAnimation(200);

    const checkPermission = async () => { setGranted(await Permissions.checkOverlayPermission()); };

    useEffect(() => {
        checkPermission();
        const sub = AppState.addEventListener('change', (s: AppStateStatus) => { if (s === 'active') checkPermission(); });
        return () => sub.remove();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F', '#101018', '#0C0C12', '#050508'] : ['#FAFAFA', '#F2F2F5', '#E8E8EC', '#F0F0F4', '#FAFAFA']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
            <FlowingBackground isDark={isDark} />
            <ProgressBar current={3} total={5} />

            <View style={styles.permissionContent}>
                <Animated.View style={{ opacity: iconAnim.opacity, transform: [{ translateY: iconAnim.translateY }] }}>
                    <LargeIcon type="overlay" isDark={isDark} />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h1" weight="bold" align="center" style={styles.title}>Overlay Access</Text>
                    <StatusBadge granted={granted} isDark={isDark} />
                </Animated.View>

                <Animated.View style={{ opacity: cardAnim.opacity, transform: [{ translateY: cardAnim.translateY }] }}>
                    <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                        <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ lineHeight: 26 }}>Display a blocking screen when you've reached your limit.</Text>
                    </View>
                </Animated.View>
            </View>

            <BottomButtons onBack={onBack} onPrimary={granted ? onNext : () => Permissions.requestOverlayPermission()} primaryLabel={granted ? 'Continue' : 'Grant Access'} isDark={isDark} />
        </View>
    );
};

// ============================================
// BATTERY PERMISSION
// ============================================

interface BatteryScreenProps {
    onComplete: () => void;
    onBack: () => void;
}

export const OnboardingBattery: React.FC<BatteryScreenProps> = ({ onComplete, onBack }) => {
    const { theme, isDark } = useTheme();
    const [granted, setGranted] = useState(false);
    const iconAnim = useEntranceAnimation(0);
    const titleAnim = useEntranceAnimation(100);
    const cardAnim = useEntranceAnimation(200);

    const checkPermission = async () => { setGranted(await Permissions.checkBatteryOptimization()); };

    useEffect(() => {
        checkPermission();
        const sub = AppState.addEventListener('change', (s: AppStateStatus) => { if (s === 'active') checkPermission(); });
        return () => sub.remove();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F', '#101018', '#0C0C12', '#050508'] : ['#FAFAFA', '#F2F2F5', '#E8E8EC', '#F0F0F4', '#FAFAFA']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
            <FlowingBackground isDark={isDark} />
            <ProgressBar current={4} total={5} />

            <View style={styles.permissionContent}>
                <Animated.View style={{ opacity: iconAnim.opacity, transform: [{ translateY: iconAnim.translateY }] }}>
                    <LargeIcon type="battery" isDark={isDark} />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h1" weight="bold" align="center" style={styles.title}>Background Access</Text>
                    <StatusBadge granted={granted} isDark={isDark} />
                </Animated.View>

                <Animated.View style={{ opacity: cardAnim.opacity, transform: [{ translateY: cardAnim.translateY }] }}>
                    <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                        <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ lineHeight: 26 }}>Run reliably in the background to enforce your limits 24/7.</Text>
                    </View>
                </Animated.View>
            </View>

            <BottomButtons onBack={onBack} onPrimary={granted ? onComplete : () => Permissions.requestIgnoreBatteryOptimization()} primaryLabel={granted ? 'Complete' : 'Grant Access'} isDark={isDark} />
        </View>
    );
};

// ============================================
// ACCESSIBILITY PERMISSION (NEW - STEP 4)
// ============================================

const { BlockingModule } = NativeModules;

interface AccessibilityScreenProps {
    onComplete: () => void;
    onBack: () => void;
}

export const OnboardingAccessibility: React.FC<AccessibilityScreenProps> = ({ onComplete, onBack }) => {
    const { theme, isDark } = useTheme();
    const [granted, setGranted] = useState(false);
    const iconAnim = useEntranceAnimation(0);
    const titleAnim = useEntranceAnimation(100);
    const cardAnim = useEntranceAnimation(200);

    const checkPermission = async () => {
        try {
            const enabled = await BlockingModule.isAccessibilityEnabled();
            setGranted(enabled);
        } catch (e) {
            console.log('Accessibility check error:', e);
            setGranted(false);
        }
    };

    useEffect(() => {
        checkPermission();
        const sub = AppState.addEventListener('change', (s: AppStateStatus) => { if (s === 'active') checkPermission(); });
        return () => sub.remove();
    }, []);

    const handleGrantAccess = () => {
        // Open Accessibility Settings directly
        BlockingModule.openAccessibilitySettings();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F', '#101018', '#0C0C12', '#050508'] : ['#FAFAFA', '#F2F2F5', '#E8E8EC', '#F0F0F4', '#FAFAFA']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
            <FlowingBackground isDark={isDark} />
            <ProgressBar current={5} total={5} />

            <View style={styles.permissionContent}>
                <Animated.View style={{ opacity: iconAnim.opacity, transform: [{ translateY: iconAnim.translateY }] }}>
                    <LargeIcon type="accessibility" isDark={isDark} />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h1" weight="bold" align="center" style={styles.title}>Accessibility</Text>
                    <StatusBadge granted={granted} isDark={isDark} />
                </Animated.View>

                <Animated.View style={{ opacity: cardAnim.opacity, transform: [{ translateY: cardAnim.translateY }] }}>
                    <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                        <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ lineHeight: 26 }}>
                            Detect app launches instantly to block distractions in real-time.
                        </Text>
                        {!granted && (
                            <Text variant="caption" color={theme.colors.textTertiary} align="center" style={{ marginTop: spacing[3], lineHeight: 20 }}>
                                Under Downloaded Apps, find Blockd and enable it.
                            </Text>
                        )}
                    </View>
                </Animated.View>
            </View>

            <BottomButtons onBack={onBack} onPrimary={granted ? onComplete : handleGrantAccess} primaryLabel={granted ? 'Complete Setup' : 'Open Settings'} isDark={isDark} />
        </View>
    );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    container: { flex: 1 },
    waveBlob: { position: 'absolute' },
    permissionContent: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing[5] },

    progressBarContainer: { position: 'absolute', top: 16, left: spacing[5], right: spacing[5], flexDirection: 'row', gap: 6, zIndex: 10 },
    progressSegment: { flex: 1, height: 3, borderRadius: 1.5 },

    title: { marginBottom: spacing[2], fontSize: 32 },
    statusBadge: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: 50, marginBottom: spacing[5], gap: spacing[2] },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    card: { padding: spacing[5], borderRadius: 20 },

    iconBox: { alignItems: 'center', marginBottom: spacing[5], height: 120, justifyContent: 'center' },

    // Usage Icon (Bar Chart + Clock)
    usageIconContainer: { position: 'relative', width: 100, height: 80 },
    chartBarsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 60 },
    modernBar: { width: 14, borderRadius: 4 },
    miniClock: { position: 'absolute', bottom: -8, right: -8, width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    miniClockHand: { width: 2, height: 8, borderRadius: 1, position: 'absolute', top: 5 },

    // Overlay Icon (Layered Screens)
    overlayIconContainer: { position: 'relative', width: 80, height: 90 },
    overlayScreen: { position: 'absolute', width: 55, height: 70, borderWidth: 2, borderRadius: 8 },
    overlayScreenBack: { top: 0, left: 0 },
    overlayScreenMid: { top: 10, left: 12 },
    overlayScreenFront: { top: 20, left: 24, alignItems: 'center', justifyContent: 'center' },
    overlayDot: { width: 12, height: 12, borderRadius: 6 },

    // Battery Icon (with Infinity)
    batteryIconContainer: { position: 'relative', alignItems: 'center' },
    modernBattery: { width: 55, height: 85, borderWidth: 3, borderRadius: 10, padding: 6 },
    modernBatteryFill: { width: '100%', height: '65%', borderRadius: 4, marginTop: 'auto' },
    modernBatteryTop: { position: 'absolute', top: -10, width: 20, height: 10, borderTopLeftRadius: 5, borderTopRightRadius: 5 },
    infinityContainer: { position: 'absolute', bottom: 18, flexDirection: 'row' },
    infinityLoop: { width: 14, height: 14, borderWidth: 2, borderRadius: 7 },
    infinityLoopRight: { marginLeft: -4 },

    // Legacy (keep for compatibility)
    chartIcon: { width: 90, height: 75, borderBottomWidth: 3, borderLeftWidth: 3, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-evenly', paddingBottom: 8, paddingLeft: 8 },
    chartBar: { width: 18, borderRadius: 4 },
    shieldIcon: { width: 75, height: 95, borderWidth: 3, borderRadius: 38, borderBottomLeftRadius: 48, borderBottomRightRadius: 48 },
    batteryIcon: { width: 65, height: 95, borderWidth: 3, borderRadius: 12, padding: 8 },
    batteryFill: { width: '100%', height: '70%', borderRadius: 6, marginTop: 'auto' },
    batteryTop: { position: 'absolute', top: -12, left: '50%', marginLeft: -12, width: 24, height: 12, borderTopLeftRadius: 6, borderTopRightRadius: 6 },

    bottomButtonsContainer: { flexDirection: 'row', paddingHorizontal: spacing[4], paddingBottom: spacing[4], gap: spacing[3] },
    backButtonWrapper: { flex: 1 },
    buttonBase: { height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    nextButtonWrapper: { flex: 2 },
    nextButtonBase: { height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },

    // Accessibility Icon
    accessibilityIconContainer: { alignItems: 'center', justifyContent: 'center' },
    eyeOuter: { width: 70, height: 35, borderWidth: 3, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
    eyeInner: { width: 18, height: 18, borderRadius: 9 },
    personHead: { width: 16, height: 16, borderRadius: 8, marginTop: 12 },
    personBody: { width: 28, height: 18, borderWidth: 3, borderTopWidth: 0, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, marginTop: -2 },

    // Info Icon (for Restricted Settings Intro)
    infoIcon: { width: 60, height: 60, borderWidth: 3, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
    infoIconDot: { width: 8, height: 8, borderRadius: 4, position: 'absolute', top: 12 },
    infoIconLine: { width: 4, height: 20, borderRadius: 2, position: 'absolute', top: 26 },
});

export default OnboardingUsageStats;
