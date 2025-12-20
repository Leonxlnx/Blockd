import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    StatusBar,
    Animated,
    Easing,
    ScrollView,
    NativeModules,
    Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/theme';
import { Text } from '../../components';

const { width, height } = Dimensions.get('window');
const { PermissionsModule } = NativeModules;

// ============================================
// PROFESSIONAL FLOWING BACKGROUND
// ============================================

const FlowingBackground: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const wave1 = useRef(new Animated.Value(0)).current;
    const wave2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(Animated.timing(wave1, { toValue: 1, duration: 12000, easing: Easing.linear, useNativeDriver: true })).start();
        Animated.loop(Animated.timing(wave2, { toValue: 1, duration: 15000, easing: Easing.linear, useNativeDriver: true })).start();
    }, []);

    const translateX1 = wave1.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.5, width * 0.5] });
    const translateX2 = wave2.interpolate({ inputRange: [0, 1], outputRange: [width * 0.3, -width * 0.3] });

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <Animated.View style={[styles.waveBlob, { top: height * 0.1, left: -width * 0.3, width: width * 1.2, height: width * 1.2, borderRadius: width * 0.6, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', transform: [{ translateX: translateX1 }] }]} />
            <Animated.View style={[styles.waveBlob, { top: height * 0.5, right: -width * 0.4, width: width * 0.9, height: width * 0.9, borderRadius: width * 0.45, backgroundColor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)', transform: [{ translateX: translateX2 }] }]} />
        </View>
    );
};

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
// PROGRESS BAR
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
// PREMIUM BUTTONS
// ============================================

interface BottomButtonsProps {
    onBack?: () => void;
    onNext: () => void;
    nextLabel?: string;
    nextDisabled?: boolean;
    showBack?: boolean;
    isDark: boolean;
}

const BottomButtons: React.FC<BottomButtonsProps> = ({ onBack, onNext, nextLabel = 'Continue', nextDisabled = false, showBack = true, isDark }) => (
    <View style={styles.bottomButtonsContainer}>
        {showBack && onBack ? (
            <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backButtonWrapper}>
                <LinearGradient colors={isDark ? ['#1A1A1A', '#282828', '#1A1A1A'] : ['#F5F5F5', '#FFFFFF', '#F5F5F5']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[styles.buttonBase, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }]}>
                    <Text variant="body" weight="semibold" color={isDark ? '#FFFFFF' : '#1A1A1A'}>Back</Text>
                </LinearGradient>
            </TouchableOpacity>
        ) : (
            <View style={styles.backButtonWrapper} />
        )}
        <TouchableOpacity onPress={onNext} activeOpacity={0.8} disabled={nextDisabled} style={[styles.nextButtonWrapper, { opacity: nextDisabled ? 0.3 : 1 }]}>
            <LinearGradient colors={isDark ? ['#FFFFFF', '#F0F0F0', '#DFDFDF'] : ['#2A2A2A', '#1A1A1A', '#0A0A0A']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.nextButtonBase}>
                <Text variant="body" weight="bold" color={isDark ? '#0A0A0A' : '#FFFFFF'}>{nextLabel}</Text>
            </LinearGradient>
        </TouchableOpacity>
    </View>
);

// ============================================
// APP TYPE WITH USAGE DATA
// ============================================

interface AppUsage {
    packageName: string;
    appName: string;
    usageMinutes: number;
}

// ============================================
// SCREEN 1: APP ANALYSIS (Real)
// ============================================

interface AppAnalysisProps {
    onNext: (apps: AppUsage[]) => void;
    onBack: () => void;
}

export const AppAnalysisScreen: React.FC<AppAnalysisProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [apps, setApps] = useState<AppUsage[]>([]);
    const titleAnim = useEntranceAnimation(0);

    // Animated dots
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animate loading dots
        [dot1, dot2, dot3].forEach((dot, i) => {
            Animated.loop(Animated.sequence([
                Animated.timing(dot, { toValue: 1, duration: 400, delay: i * 150, useNativeDriver: true }),
                Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: true }),
            ])).start();
        });

        // Fetch real app usage data
        const fetchApps = async () => {
            try {
                const usageData = await PermissionsModule.getAppUsageStats(14); // Last 14 days

                if (usageData && usageData.length > 0) {
                    // Sort by usage and take top 15
                    const sorted = usageData
                        .filter((a: any) => a.usageMinutes > 10)
                        .sort((a: any, b: any) => b.usageMinutes - a.usageMinutes)
                        .slice(0, 15);
                    setApps(sorted);
                } else {
                    // Fallback to common apps if no data
                    setApps([
                        { packageName: 'com.instagram.android', appName: 'Instagram', usageMinutes: 120 },
                        { packageName: 'com.zhiliaoapp.musically', appName: 'TikTok', usageMinutes: 90 },
                        { packageName: 'com.google.android.youtube', appName: 'YouTube', usageMinutes: 60 },
                        { packageName: 'com.twitter.android', appName: 'X', usageMinutes: 45 },
                        { packageName: 'com.facebook.katana', appName: 'Facebook', usageMinutes: 30 },
                    ]);
                }
            } catch (e) {
                // Fallback apps
                setApps([
                    { packageName: 'com.instagram.android', appName: 'Instagram', usageMinutes: 120 },
                    { packageName: 'com.zhiliaoapp.musically', appName: 'TikTok', usageMinutes: 90 },
                    { packageName: 'com.google.android.youtube', appName: 'YouTube', usageMinutes: 60 },
                ]);
            }

            setTimeout(() => {
                setLoading(false);
                onNext(apps.length > 0 ? apps : []);
            }, 2000);
        };

        fetchApps();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#000', '#050505', '#0A0A0A'] : ['#FFF', '#FAFAFA', '#F5F5F5']} style={StyleSheet.absoluteFillObject} />
            <FlowingBackground isDark={isDark} />

            <View style={styles.content}>
                <View style={styles.iconBox}>
                    <View style={[styles.searchIcon, { borderColor: isDark ? '#FFF' : '#1A1A1A' }]}>
                        <View style={[styles.searchHandle, { backgroundColor: isDark ? '#FFF' : '#1A1A1A' }]} />
                    </View>
                </View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h1" weight="bold" align="center" style={styles.headline}>Analyzing your apps</Text>
                </Animated.View>

                <View style={styles.loadingDots}>
                    {[dot1, dot2, dot3].map((dot, i) => (
                        <Animated.View key={i} style={[styles.loadingDot, { backgroundColor: isDark ? '#FFF' : '#1A1A1A', opacity: dot }]} />
                    ))}
                </View>

                <Text variant="body" align="center" color={theme.colors.textSecondary} style={{ marginTop: spacing[4] }}>
                    Finding your most used apps...
                </Text>
            </View>
        </View>
    );
};

// ============================================
// SCREEN 2: APP SELECTION
// ============================================

interface AppSelectionProps {
    apps: AppUsage[];
    onNext: (selectedApps: AppUsage[]) => void;
    onBack: () => void;
}

export const AppSelectionScreen: React.FC<AppSelectionProps> = ({ apps, onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const [selected, setSelected] = useState<string[]>([]);
    const titleAnim = useEntranceAnimation(0);

    const toggleApp = (pkg: string) => {
        setSelected(prev => prev.includes(pkg) ? prev.filter(p => p !== pkg) : [...prev, pkg]);
    };

    const selectedApps = apps.filter(a => selected.includes(a.packageName));

    const formatTime = (mins: number) => {
        if (mins < 60) return `${mins}m`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#000', '#050505', '#0A0A0A'] : ['#FFF', '#FAFAFA', '#F5F5F5']} style={StyleSheet.absoluteFillObject} />
            <FlowingBackground isDark={isDark} />
            <ProgressBar current={1} total={3} />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h2" weight="bold" align="center" style={styles.headlineSmaller}>Which apps distract{'\n'}you the most?</Text>
                    <Text variant="body" align="center" color={theme.colors.textSecondary}>Select apps you want to limit</Text>
                </Animated.View>

                <View style={styles.appsList}>
                    {apps.map((app) => {
                        const isSelected = selected.includes(app.packageName);

                        return (
                            <TouchableOpacity
                                key={app.packageName}
                                onPress={() => toggleApp(app.packageName)}
                                activeOpacity={0.7}
                                style={[
                                    styles.appItem,
                                    {
                                        backgroundColor: isSelected ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                                        borderColor: isSelected ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)') : 'transparent',
                                    },
                                ]}
                            >
                                <View style={styles.appInfo}>
                                    <View style={[styles.appIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                                        <Text variant="body">{app.appName.charAt(0)}</Text>
                                    </View>
                                    <View>
                                        <Text variant="body" weight={isSelected ? 'bold' : 'medium'}>{app.appName}</Text>
                                        <Text variant="caption" color={theme.colors.textTertiary}>{formatTime(app.usageMinutes)}/day avg</Text>
                                    </View>
                                </View>
                                {isSelected && (
                                    <View style={[styles.checkmark, { backgroundColor: isDark ? '#FFF' : '#1A1A1A' }]}>
                                        <Text variant="caption" color={isDark ? '#0A0A0A' : '#FFF'}>✓</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <BottomButtons onBack={onBack} onNext={() => onNext(selectedApps)} nextLabel={selected.length > 0 ? `Continue (${selected.length})` : 'Skip'} isDark={isDark} />
        </View>
    );
};

// ============================================
// SCREEN 3: TIME CALCULATION
// ============================================

interface TimeCalculationProps {
    selectedApps: AppUsage[];
    onNext: () => void;
    onBack: () => void;
}

export const TimeCalculationScreen: React.FC<TimeCalculationProps> = ({ selectedApps, onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const titleAnim = useEntranceAnimation(0);
    const numberAnim = useEntranceAnimation(200);
    const subAnim = useEntranceAnimation(350);

    // Calculate time saved if using 25% less
    const totalDailyMinutes = selectedApps.reduce((sum, app) => sum + app.usageMinutes, 0);
    const savedDailyMinutes = Math.round(totalDailyMinutes * 0.25);
    const savedYearlyHours = Math.round((savedDailyMinutes * 365) / 60);
    const savedYearlyDays = Math.round(savedYearlyHours / 24);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#000', '#050505', '#0A0A0A'] : ['#FFF', '#FAFAFA', '#F5F5F5']} style={StyleSheet.absoluteFillObject} />
            <FlowingBackground isDark={isDark} />
            <ProgressBar current={2} total={3} />

            <View style={styles.content}>
                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="body" align="center" color={theme.colors.textSecondary}>If you reduce just 25%...</Text>
                </Animated.View>

                <Animated.View style={[styles.bigNumberWrap, { opacity: numberAnim.opacity, transform: [{ translateY: numberAnim.translateY }] }]}>
                    <Text variant="h1" weight="bold" align="center" style={styles.bigNumber}>{savedYearlyDays}</Text>
                    <Text variant="h3" weight="semibold" align="center" color={theme.colors.textSecondary}>days per year</Text>
                </Animated.View>

                <Animated.View style={{ opacity: subAnim.opacity, transform: [{ translateY: subAnim.translateY }] }}>
                    <Text variant="body" align="center" color={theme.colors.textSecondary} style={styles.subtext}>
                        That's {savedYearlyHours} hours you could spend on what truly matters.
                    </Text>
                </Animated.View>
            </View>

            <BottomButtons onBack={onBack} onNext={onNext} nextLabel="Let's do this" isDark={isDark} />
        </View>
    );
};

// ============================================
// SCREEN 4: COMMITMENT (Hold to Promise)
// ============================================

interface CommitmentProps {
    onComplete: () => void;
    onBack: () => void;
}

export const CommitmentScreen: React.FC<CommitmentProps> = ({ onComplete, onBack }) => {
    const { theme, isDark } = useTheme();
    const [progress, setProgress] = useState(0);
    const [holding, setHolding] = useState(false);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const titleAnim = useEntranceAnimation(0);

    const handlePressIn = () => {
        setHolding(true);
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                onComplete();
            }
        });
    };

    const handlePressOut = () => {
        setHolding(false);
        progressAnim.stopAnimation();
        Animated.timing(progressAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const buttonWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#000', '#050505', '#0A0A0A'] : ['#FFF', '#FAFAFA', '#F5F5F5']} style={StyleSheet.absoluteFillObject} />
            <FlowingBackground isDark={isDark} />
            <ProgressBar current={3} total={3} />

            <View style={styles.content}>
                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h1" weight="bold" align="center" style={styles.headline}>Make a promise{'\n'}to yourself</Text>
                    <Text variant="body" align="center" color={theme.colors.textSecondary} style={{ marginTop: spacing[3] }}>
                        Hold the button to commit to{'\n'}reclaiming your time
                    </Text>
                </Animated.View>

                <View style={styles.holdButtonWrap}>
                    <TouchableOpacity
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={1}
                        style={styles.holdButtonOuter}
                    >
                        <LinearGradient
                            colors={isDark ? ['#1A1A1A', '#282828'] : ['#F5F5F5', '#E8E8E8']}
                            style={[styles.holdButton, { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]}
                        >
                            <Animated.View style={[styles.holdProgress, { width: buttonWidth, backgroundColor: isDark ? '#FFFFFF' : '#1A1A1A' }]} />
                            <Text variant="body" weight="bold" color={isDark ? '#FFFFFF' : '#1A1A1A'} style={{ zIndex: 2 }}>
                                {holding ? 'Keep holding...' : 'Hold to commit'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.skipWrap}>
                <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
                    <Text variant="body" color={theme.colors.textTertiary}>Go back</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    container: { flex: 1 },
    waveBlob: { position: 'absolute' },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: spacing[4], paddingTop: 100, paddingBottom: spacing[4] },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing[5] },

    progressBarContainer: { position: 'absolute', top: 50, left: spacing[5], right: spacing[5], flexDirection: 'row', gap: 6, zIndex: 10 },
    progressSegment: { flex: 1, height: 3, borderRadius: 1.5 },

    headline: { marginBottom: spacing[2], fontSize: 32, lineHeight: 42 },
    headlineSmaller: { marginBottom: spacing[2], fontSize: 26, lineHeight: 34 },
    subtext: { lineHeight: 26, fontSize: 16 },

    // App Analysis
    iconBox: { marginBottom: spacing[5], width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
    searchIcon: { width: 70, height: 70, borderWidth: 4, borderRadius: 35 },
    searchHandle: { position: 'absolute', bottom: -20, right: -10, width: 30, height: 4, borderRadius: 2, transform: [{ rotate: '45deg' }] },
    loadingDots: { flexDirection: 'row', justifyContent: 'center', gap: spacing[2], marginTop: spacing[4] },
    loadingDot: { width: 10, height: 10, borderRadius: 5 },

    // App Selection
    appsList: { marginTop: spacing[5], gap: spacing[3] },
    appItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[4], paddingHorizontal: spacing[4], borderRadius: 16, borderWidth: 2 },
    appInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
    appIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    checkmark: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

    // Time Calculation
    bigNumberWrap: { marginVertical: spacing[6] },
    bigNumber: { fontSize: 80, lineHeight: 90 },

    // Commitment
    holdButtonWrap: { marginTop: spacing[8] },
    holdButtonOuter: { width: width * 0.7 },
    holdButton: { height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', borderWidth: 2, overflow: 'hidden' },
    holdProgress: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 35 },
    skipWrap: { paddingBottom: spacing[6], alignItems: 'center' },

    // Buttons
    bottomButtonsContainer: { flexDirection: 'row', paddingHorizontal: spacing[4], paddingBottom: spacing[4], gap: spacing[3] },
    backButtonWrapper: { flex: 1 },
    buttonBase: { height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    nextButtonWrapper: { flex: 2 },
    nextButtonBase: { height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
});

