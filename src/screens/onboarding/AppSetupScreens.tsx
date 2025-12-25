import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    ScrollView,
    Image,
    TouchableOpacity,
    NativeModules,
    Animated,
    Easing,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/theme';
import { Text } from '../../components';

const { width, height } = Dimensions.get('window');
const { PermissionsModule } = NativeModules;

interface AppData {
    packageName: string;
    appName: string;
    usageMinutes: number;
    icon?: string;
}

// ============================================
// SHARED COMPONENTS (Same style as Permissions)
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

const BottomButtons: React.FC<{ onBack?: () => void; onPrimary: () => void; primaryLabel: string; isDark: boolean; disabled?: boolean }> = ({ onBack, onPrimary, primaryLabel, isDark, disabled }) => (
    <View style={styles.bottomButtonsContainer}>
        {onBack && (
            <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backButtonWrapper}>
                <LinearGradient colors={isDark ? ['#1A1A1A', '#282828', '#1A1A1A'] : ['#F5F5F5', '#FFFFFF', '#F5F5F5']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[styles.buttonBase, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }]}>
                    <Text variant="body" weight="semibold" color={isDark ? '#FFFFFF' : '#1A1A1A'}>Back</Text>
                </LinearGradient>
            </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onPrimary} activeOpacity={0.8} style={[onBack ? styles.nextButtonWrapper : styles.fullButtonWrapper, { opacity: disabled ? 0.4 : 1 }]} disabled={disabled}>
            <LinearGradient colors={isDark ? ['#FFFFFF', '#F0F0F0', '#DFDFDF'] : ['#2A2A2A', '#1A1A1A', '#0A0A0A']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.nextButtonBase}>
                <Text variant="body" weight="bold" color={isDark ? '#0A0A0A' : '#FFFFFF'}>{primaryLabel}</Text>
            </LinearGradient>
        </TouchableOpacity>
    </View>
);

// ============================================
// APP ANALYSIS SCREEN
// ============================================

export const AppAnalysisScreen: React.FC<{ onNext: (apps: AppData[]) => void; onBack?: () => void }> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const [progress] = useState(new Animated.Value(0));
    const titleAnim = useEntranceAnimation(0);
    const cardAnim = useEntranceAnimation(200);

    useEffect(() => {
        Animated.timing(progress, { toValue: 1, duration: 3000, useNativeDriver: false }).start();

        const loadApps = async () => {
            let loadedApps: AppData[] = [];
            try {
                const apps = await PermissionsModule.getTodayUsage();
                if (apps && apps.length > 0) loadedApps = apps;
            } catch (e) {
                console.log('Load apps error:', e);
            }
            setTimeout(() => onNext(loadedApps), 3500);
        };
        loadApps();
    }, []);

    const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F', '#101018', '#0C0C12', '#050508'] : ['#FAFAFA', '#F2F2F5', '#E8E8EC', '#F0F0F4', '#FAFAFA']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
            <ProgressBar current={1} total={4} />

            <View style={styles.centerContent}>
                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    {/* Loading Icon */}
                    <View style={styles.iconBox}>
                        <View style={[styles.searchIcon, { borderColor: isDark ? '#FFF' : '#1A1A1A' }]}>
                            <View style={[styles.searchHandle, { backgroundColor: isDark ? '#FFF' : '#1A1A1A' }]} />
                        </View>
                    </View>
                    <Text variant="h1" weight="bold" align="center" style={styles.title}>Analyzing Your Apps</Text>
                </Animated.View>

                <Animated.View style={{ opacity: cardAnim.opacity, transform: [{ translateY: cardAnim.translateY }] }}>
                    <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                        <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ lineHeight: 26 }}>
                            We're scanning your apps to show you where your time goes.
                        </Text>
                        <View style={[styles.progressBar, { marginTop: spacing[5] }]}>
                            <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: isDark ? '#FFF' : '#000' }]} />
                        </View>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
};

// ============================================
// APP SELECTION SCREEN
// ============================================

export const AppSelectionScreen: React.FC<{ onNext: () => void; onBack?: () => void; apps: AppData[]; selectedApps: string[]; setSelectedApps: (apps: string[]) => void }> = ({ onNext, onBack, apps, selectedApps, setSelectedApps }) => {
    const { theme, isDark } = useTheme();
    const safeApps = apps || [];
    const safeSelectedApps = selectedApps || [];

    const toggleApp = (packageName: string) => {
        if (safeSelectedApps.includes(packageName)) {
            setSelectedApps(safeSelectedApps.filter(p => p !== packageName));
        } else {
            setSelectedApps([...safeSelectedApps, packageName]);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F', '#101018', '#0C0C12', '#050508'] : ['#FAFAFA', '#F2F2F5', '#E8E8EC', '#F0F0F4', '#FAFAFA']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
            <ProgressBar current={2} total={4} />

            <View style={styles.headerSection}>
                <Text variant="h1" weight="bold" align="center">Select Apps to Limit</Text>
                <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ marginTop: spacing[2] }}>
                    Choose which apps you want Blockd to help you with
                </Text>
            </View>

            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {safeApps.length === 0 ? (
                    <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                        <Text variant="body" color={theme.colors.textSecondary} align="center">
                            No apps found. Make sure you granted usage stats permission.
                        </Text>
                    </View>
                ) : (
                    safeApps.map((app, i) => {
                        const isSelected = safeSelectedApps.includes(app.packageName);
                        return (
                            <TouchableOpacity key={i} onPress={() => toggleApp(app.packageName)} activeOpacity={0.7}>
                                <View style={[styles.appItem, {
                                    backgroundColor: isSelected ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)') : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'),
                                    borderColor: isSelected ? (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')
                                }]}>
                                    {app.icon ? (
                                        <Image source={{ uri: `data:image/png;base64,${app.icon}` }} style={styles.appIcon} />
                                    ) : (
                                        <View style={[styles.appIconPlaceholder, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                                            <Text variant="body" weight="bold">{app.appName.charAt(0)}</Text>
                                        </View>
                                    )}
                                    <View style={styles.appInfo}>
                                        <Text variant="body" weight="medium">{app.appName}</Text>
                                        <Text variant="caption" color={theme.colors.textSecondary}>{app.usageMinutes}m/day</Text>
                                    </View>
                                    <View style={[styles.checkbox, {
                                        backgroundColor: isSelected ? (isDark ? '#FFF' : '#000') : 'transparent',
                                        borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'
                                    }]}>
                                        {isSelected && <Text variant="caption" weight="bold" color={isDark ? '#000' : '#FFF'}>✓</Text>}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            <BottomButtons onBack={onBack} onPrimary={onNext} primaryLabel={`Continue (${safeSelectedApps.length})`} isDark={isDark} disabled={safeSelectedApps.length === 0} />
        </View>
    );
};

// ============================================
// TIME CALCULATION SCREEN
// ============================================

export const TimeCalculationScreen: React.FC<{ onNext: () => void; onBack?: () => void; apps: AppData[]; selectedApps: string[] }> = ({ onNext, onBack, apps, selectedApps }) => {
    const { theme, isDark } = useTheme();
    const titleAnim = useEntranceAnimation(0);
    const cardAnim = useEntranceAnimation(200);

    const safeApps = apps || [];
    const safeSelectedApps = selectedApps || [];
    const selectedAppData = safeApps.filter(a => safeSelectedApps.includes(a.packageName));
    const totalMinutes = selectedAppData.reduce((sum, app) => sum + app.usageMinutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const yearlyHours = Math.round(totalMinutes * 365 / 60);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F', '#101018', '#0C0C12', '#050508'] : ['#FAFAFA', '#F2F2F5', '#E8E8EC', '#F0F0F4', '#FAFAFA']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
            <ProgressBar current={3} total={4} />

            <View style={styles.centerContent}>
                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    {/* Clock Icon */}
                    <View style={styles.iconBox}>
                        <View style={[styles.clockIcon, { borderColor: isDark ? '#FFF' : '#1A1A1A' }]}>
                            <View style={[styles.clockHand, { backgroundColor: isDark ? '#FFF' : '#1A1A1A' }]} />
                            <View style={[styles.clockHandShort, { backgroundColor: isDark ? '#FFF' : '#1A1A1A' }]} />
                        </View>
                    </View>
                    <Text variant="h1" weight="bold" align="center" style={styles.title}>Your Time</Text>
                </Animated.View>

                <Animated.View style={{ opacity: cardAnim.opacity, transform: [{ translateY: cardAnim.translateY }] }}>
                    <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                        <Text variant="caption" color={theme.colors.textSecondary}>Daily on selected apps</Text>
                        <Text variant="h1" weight="bold" style={{ marginTop: spacing[2], fontSize: 48 }}>{hours}h {mins}m</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', marginTop: spacing[3] }]}>
                        <Text variant="caption" color={theme.colors.textSecondary}>Yearly projection</Text>
                        <Text variant="h2" weight="bold" color="#FF4444" style={{ marginTop: spacing[2] }}>{yearlyHours} hours</Text>
                        <Text variant="caption" color={theme.colors.textTertiary} style={{ marginTop: spacing[1] }}>That's {Math.round(yearlyHours / 24)} full days</Text>
                    </View>
                </Animated.View>
            </View>

            <BottomButtons onBack={onBack} onPrimary={onNext} primaryLabel="Continue" isDark={isDark} />
        </View>
    );
};

// ============================================
// COMMITMENT SCREEN - HOLD TO COMMIT (CENTER)
// ============================================

export const CommitmentScreen: React.FC<{ onNext: () => void; onBack?: () => void }> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const [holdProgress, setHoldProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const holdTimer = useRef<any>(null);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const titleAnim = useEntranceAnimation(0);
    const cardAnim = useEntranceAnimation(200);

    const startHold = () => {
        setIsHolding(true);
        Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();

        let progress = 0;
        holdTimer.current = setInterval(() => {
            progress += 2;
            setHoldProgress(progress);
            if (progress >= 100) {
                clearInterval(holdTimer.current);
                onNext();
            }
        }, 60);
    };

    const endHold = () => {
        setIsHolding(false);
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
        if (holdTimer.current) {
            clearInterval(holdTimer.current);
            setHoldProgress(0);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F', '#101018', '#0C0C12', '#050508'] : ['#FAFAFA', '#F2F2F5', '#E8E8EC', '#F0F0F4', '#FAFAFA']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
            <ProgressBar current={4} total={4} />

            <View style={styles.centerContent}>
                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h1" weight="bold" align="center" style={styles.title}>Your Commitment</Text>
                </Animated.View>

                <Animated.View style={{ opacity: cardAnim.opacity, transform: [{ translateY: cardAnim.translateY }] }}>
                    <View style={[styles.commitmentCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                        <Text variant="body" weight="semibold" align="center" style={{ lineHeight: 28, fontSize: 18 }}>
                            "I commit to reducing{'\n'}my screen time and{'\n'}taking control of my life."
                        </Text>
                    </View>

                    {/* HOLD BUTTON - CENTER */}
                    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginTop: spacing[8] }}>
                        <TouchableOpacity
                            onPressIn={startHold}
                            onPressOut={endHold}
                            activeOpacity={0.9}
                            style={styles.holdButtonOuter}
                        >
                            <View style={[styles.holdButtonInner, { backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5' }]}>
                                {/* Progress ring */}
                                <View style={[styles.holdProgress, {
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                }]}>
                                    <View style={[styles.holdProgressFill, {
                                        backgroundColor: isDark ? '#FFF' : '#000',
                                        height: `${holdProgress}%`
                                    }]} />
                                </View>
                                <View style={styles.holdButtonContent}>
                                    <Text variant="h2" weight="bold" align="center">{isHolding ? `${holdProgress}%` : '🤝'}</Text>
                                    <Text variant="caption" color={theme.colors.textSecondary} align="center" style={{ marginTop: spacing[1] }}>
                                        {isHolding ? 'Keep holding...' : 'Hold to Commit'}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </View>

            {onBack && (
                <TouchableOpacity onPress={onBack} style={styles.backLinkContainer}>
                    <Text variant="body" color={theme.colors.textSecondary}>Go back</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

// ============================================
// APP USAGE (Legacy export)
// ============================================

export const AppUsage: React.FC<{ onNext: () => void }> = ({ onNext }) => {
    const { theme, isDark } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F'] : ['#FAFAFA', '#F5F5F7']} style={StyleSheet.absoluteFillObject} />
            <View style={styles.centerContent}>
                <Text variant="h2" weight="bold" align="center">Ready to Start</Text>
            </View>
        </View>
    );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContent: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing[5] },
    headerSection: { paddingTop: 80, paddingHorizontal: spacing[5], marginBottom: spacing[3] },
    scrollContainer: { flex: 1 },
    scrollContent: { padding: spacing[4], paddingTop: 0 },

    progressBarContainer: { position: 'absolute', top: 16, left: spacing[5], right: spacing[5], flexDirection: 'row', gap: 6, zIndex: 10 },
    progressSegment: { flex: 1, height: 3, borderRadius: 1.5 },

    title: { marginBottom: spacing[5], fontSize: 32 },
    card: { padding: spacing[5], borderRadius: 20 },
    statCard: { padding: spacing[5], borderRadius: 20, alignItems: 'center' },
    commitmentCard: { padding: spacing[6], borderRadius: 24 },

    iconBox: { alignItems: 'center', marginBottom: spacing[5], height: 100, justifyContent: 'center' },
    searchIcon: { width: 50, height: 50, borderWidth: 3, borderRadius: 25 },
    searchHandle: { width: 3, height: 18, position: 'absolute', bottom: -12, right: -5, transform: [{ rotate: '45deg' }], borderRadius: 2 },
    clockIcon: { width: 60, height: 60, borderWidth: 3, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
    clockHand: { width: 2, height: 20, position: 'absolute', top: 12, borderRadius: 1 },
    clockHandShort: { width: 2, height: 12, position: 'absolute', left: 20, transform: [{ rotate: '90deg' }], borderRadius: 1 },

    progressBar: { width: '100%', height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3 },

    appItem: { flexDirection: 'row', alignItems: 'center', padding: spacing[4], borderRadius: 16, marginBottom: spacing[2], borderWidth: 2 },
    appIcon: { width: 48, height: 48, borderRadius: 14 },
    appIconPlaceholder: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    appInfo: { flex: 1, marginLeft: spacing[3] },
    checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },

    // Hold Button
    holdButtonOuter: { alignItems: 'center' },
    holdButtonInner: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    holdProgress: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%', borderWidth: 0 },
    holdProgressFill: { position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.2 },
    holdButtonContent: { alignItems: 'center', zIndex: 1 },
    backLinkContainer: { alignItems: 'center', paddingBottom: spacing[8] },

    // Bottom Buttons
    bottomButtonsContainer: { flexDirection: 'row', paddingHorizontal: spacing[4], paddingBottom: spacing[4], gap: spacing[3] },
    backButtonWrapper: { flex: 1 },
    buttonBase: { height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
    nextButtonWrapper: { flex: 2 },
    fullButtonWrapper: { flex: 1 },
    nextButtonBase: { height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
});
