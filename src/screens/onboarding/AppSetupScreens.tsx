import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Animated,
    Easing,
    ScrollView,
    NativeModules,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/theme';
import { Text } from '../../components';
import { Check, Clock, Smartphone } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const { PermissionsModule } = NativeModules;

// App Usage Interface
export interface AppUsage {
    packageName: string;
    appName: string;
    usageMinutes: number;
    icon?: string;
}

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
const ProgressBar: React.FC<{ step: number; totalSteps: number; isDark: boolean }> = ({ step, totalSteps, isDark }) => (
    <View style={[styles.progressContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
        <Animated.View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%`, backgroundColor: isDark ? '#FFF' : '#1A1A1A' }]} />
    </View>
);

// ============================================
// BUTTON COMPONENTS
// ============================================
const FullWidthButton: React.FC<{ title: string; onPress: () => void; isDark: boolean; disabled?: boolean }> = ({ title, onPress, isDark, disabled }) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.85}
        style={[styles.fullButton, { backgroundColor: isDark ? '#FFF' : '#1A1A1A', opacity: disabled ? 0.5 : 1 }]}
    >
        <Text variant="body" weight="bold" color={isDark ? '#1A1A1A' : '#FFF'}>{title}</Text>
    </TouchableOpacity>
);

// ============================================
// APP ANALYSIS SCREEN - Loading Animation
// ============================================
export const AppAnalysisScreen: React.FC<{ onComplete: (apps: AppUsage[]) => void }> = ({ onComplete }) => {
    const { theme, isDark } = useTheme();
    const [stage, setStage] = useState(0);
    const spinAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Start spinning animation
        Animated.loop(
            Animated.timing(spinAnim, { toValue: 1, duration: 1500, easing: Easing.linear, useNativeDriver: true })
        ).start();

        // Progress through stages
        const stages = [
            { delay: 800, text: 'Scanning installed apps...' },
            { delay: 1600, text: 'Analyzing usage patterns...' },
            { delay: 2400, text: 'Calculating statistics...' },
        ];

        stages.forEach((s, i) => {
            setTimeout(() => setStage(i + 1), s.delay);
        });

        // Animate progress bar
        Animated.timing(progressAnim, { toValue: 1, duration: 3000, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();

        // Fetch real data and complete
        const fetchApps = async () => {
            try {
                const data = await PermissionsModule.getAppUsageStats(7); // Get 7 days for better average
                if (data && data.length > 0) {
                    const sorted = data.sort((a: AppUsage, b: AppUsage) => b.usageMinutes - a.usageMinutes);
                    setTimeout(() => onComplete(sorted), 3200);
                } else {
                    setTimeout(() => onComplete([]), 3200);
                }
            } catch (e) {
                console.log('Error:', e);
                setTimeout(() => onComplete([]), 3200);
            }
        };
        fetchApps();
    }, []);

    const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

    const stageTexts = ['Initializing...', 'Scanning installed apps...', 'Analyzing usage patterns...', 'Calculating statistics...'];

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#050508' : '#FAFAFA' }]}>
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F'] : ['#F8F8FA', '#F0F0F2']} style={StyleSheet.absoluteFillObject} />

            <View style={styles.analysisContent}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Smartphone size={64} color={isDark ? '#FFF' : '#1A1A1A'} />
                </Animated.View>

                <Text variant="h2" weight="bold" align="center" style={{ marginTop: spacing[6] }}>Analyzing Your Apps</Text>
                <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ marginTop: spacing[2] }}>
                    {stageTexts[stage]}
                </Text>

                <View style={[styles.analysisProgress, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                    <Animated.View style={[styles.analysisProgressFill, { width: progressWidth, backgroundColor: isDark ? '#FFF' : '#1A1A1A' }]} />
                </View>
            </View>
        </View>
    );
};

// ============================================
// APP SELECTION SCREEN - ALL APPS SHOWN
// ============================================
export const AppSelectionScreen: React.FC<{
    apps: AppUsage[];
    onNext: (selected: AppUsage[]) => void;
    onBack: () => void;
}> = ({ apps, onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
    const titleAnim = useEntranceAnimation(0);
    const listAnim = useEntranceAnimation(150);

    const toggleApp = (packageName: string) => {
        const newSet = new Set(selectedApps);
        if (newSet.has(packageName)) {
            newSet.delete(packageName);
        } else {
            newSet.add(packageName);
        }
        setSelectedApps(newSet);
    };

    const handleNext = () => {
        const selected = apps.filter(app => selectedApps.has(app.packageName));
        onNext(selected);
    };

    const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    // Show ALL apps - no slicing/limiting
    const allApps = apps;

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#050508' : '#FAFAFA' }]}>
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F'] : ['#F8F8FA', '#F0F0F2']} style={StyleSheet.absoluteFillObject} />

            <ProgressBar step={2} totalSteps={4} isDark={isDark} />

            <View style={styles.content}>
                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h2" weight="bold">Select Apps to Focus On</Text>
                    <Text variant="body" color={theme.colors.textSecondary} style={{ marginTop: spacing[2] }}>
                        Choose the apps you want to limit ({selectedApps.size} selected)
                    </Text>
                </Animated.View>

                <Animated.View style={[styles.appListContainer, { opacity: listAnim.opacity, transform: [{ translateY: listAnim.translateY }] }]}>
                    <ScrollView style={styles.appList} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                        {allApps.map((app, i) => {
                            const isSelected = selectedApps.has(app.packageName);
                            return (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => toggleApp(app.packageName)}
                                    activeOpacity={0.7}
                                    style={[styles.appItem, {
                                        backgroundColor: isSelected
                                            ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)')
                                            : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'),
                                        borderColor: isSelected
                                            ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)')
                                            : 'transparent',
                                    }]}
                                >
                                    {app.icon ? (
                                        <Image source={{ uri: `data:image/png;base64,${app.icon}` }} style={styles.appIcon} />
                                    ) : (
                                        <View style={[styles.appIconPlaceholder, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                                            <Text variant="caption" weight="bold">{app.appName.charAt(0)}</Text>
                                        </View>
                                    )}
                                    <View style={{ flex: 1, marginLeft: spacing[3] }}>
                                        <Text variant="body" weight="medium" numberOfLines={1}>{app.appName}</Text>
                                        <Text variant="caption" color={theme.colors.textSecondary}>{formatTime(app.usageMinutes)} / week</Text>
                                    </View>
                                    <View style={[styles.checkbox, {
                                        backgroundColor: isSelected ? (isDark ? '#FFF' : '#1A1A1A') : 'transparent',
                                        borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                                    }]}>
                                        {isSelected && <Check size={14} color={isDark ? '#1A1A1A' : '#FFF'} strokeWidth={3} />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </Animated.View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Text variant="body" weight="medium" color={theme.colors.textSecondary}>Back</Text>
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginLeft: spacing[3] }}>
                        <FullWidthButton title="Continue" onPress={handleNext} isDark={isDark} disabled={selectedApps.size === 0} />
                    </View>
                </View>
            </View>
        </View>
    );
};

// ============================================
// TIME CALCULATION SCREEN
// ============================================
export const TimeCalculationScreen: React.FC<{
    selectedApps: AppUsage[];
    onNext: () => void;
    onBack: () => void;
}> = ({ selectedApps, onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const titleAnim = useEntranceAnimation(0);
    const statsAnim = useEntranceAnimation(200);
    const buttonAnim = useEntranceAnimation(400);

    const totalMinutes = selectedApps.reduce((sum, app) => sum + app.usageMinutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const dailyAvg = Math.round(totalMinutes / 7);
    const dailyHours = Math.floor(dailyAvg / 60);
    const dailyMins = dailyAvg % 60;

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#050508' : '#FAFAFA' }]}>
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F'] : ['#F8F8FA', '#F0F0F2']} style={StyleSheet.absoluteFillObject} />

            <ProgressBar step={3} totalSteps={4} isDark={isDark} />

            <View style={styles.content}>
                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }], alignItems: 'center' }}>
                    <Clock size={48} color={theme.colors.textSecondary} />
                    <Text variant="h2" weight="bold" align="center" style={{ marginTop: spacing[4] }}>Your Weekly Usage</Text>
                </Animated.View>

                <Animated.View style={[styles.statsContainer, { opacity: statsAnim.opacity, transform: [{ translateY: statsAnim.translateY }] }]}>
                    <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }]}>
                        <Text variant="h1" weight="bold" style={{ fontSize: 48 }}>{hours}h {minutes}m</Text>
                        <Text variant="body" color={theme.colors.textSecondary}>Total this week on {selectedApps.length} apps</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', marginTop: spacing[3] }]}>
                        <Text variant="h2" weight="bold">{dailyHours}h {dailyMins}m</Text>
                        <Text variant="body" color={theme.colors.textSecondary}>Daily average</Text>
                    </View>
                </Animated.View>

                <Animated.View style={[styles.buttonContainer, { opacity: buttonAnim.opacity, transform: [{ translateY: buttonAnim.translateY }] }]}>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <Text variant="body" weight="medium" color={theme.colors.textSecondary}>Back</Text>
                        </TouchableOpacity>
                        <View style={{ flex: 1, marginLeft: spacing[3] }}>
                            <FullWidthButton title="I'm Ready to Change" onPress={onNext} isDark={isDark} />
                        </View>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
};

// ============================================
// COMMITMENT SCREEN
// ============================================
export const CommitmentScreen: React.FC<{
    onComplete: () => void;
    onBack: () => void;
}> = ({ onComplete, onBack }) => {
    const { theme, isDark } = useTheme();
    const titleAnim = useEntranceAnimation(0);
    const contentAnim = useEntranceAnimation(200);
    const buttonAnim = useEntranceAnimation(400);

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#050508' : '#FAFAFA' }]}>
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F'] : ['#F8F8FA', '#F0F0F2']} style={StyleSheet.absoluteFillObject} />

            <ProgressBar step={4} totalSteps={4} isDark={isDark} />

            <View style={styles.content}>
                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }], alignItems: 'center' }}>
                    <Text variant="h1" weight="bold" align="center" style={{ fontSize: 42 }}>You've Got This</Text>
                </Animated.View>

                <Animated.View style={[styles.commitmentContent, { opacity: contentAnim.opacity, transform: [{ translateY: contentAnim.translateY }] }]}>
                    <View style={[styles.commitmentCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }]}>
                        <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ lineHeight: 24 }}>
                            Taking control of your screen time is a journey.{'\n\n'}
                            Blockd will help you build healthier habits one day at a time.{'\n\n'}
                            Let's start with a simple commitment: be mindful of how you spend your time.
                        </Text>
                    </View>
                </Animated.View>

                <Animated.View style={[styles.buttonContainer, { opacity: buttonAnim.opacity, transform: [{ translateY: buttonAnim.translateY }] }]}>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <Text variant="body" weight="medium" color={theme.colors.textSecondary}>Back</Text>
                        </TouchableOpacity>
                        <View style={{ flex: 1, marginLeft: spacing[3] }}>
                            <FullWidthButton title="I Commit" onPress={onComplete} isDark={isDark} />
                        </View>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, paddingHorizontal: spacing[5], paddingTop: spacing[4] },

    // Progress
    progressContainer: { height: 3, marginHorizontal: spacing[5], marginTop: 50, borderRadius: 2 },
    progressFill: { height: 3, borderRadius: 2 },

    // Buttons
    fullButton: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    buttonRow: { flexDirection: 'row', alignItems: 'center', marginTop: 'auto', paddingBottom: spacing[6] },
    backButton: { paddingVertical: spacing[4], paddingHorizontal: spacing[4] },
    buttonContainer: { marginTop: 'auto' },

    // Analysis
    analysisContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[5] },
    analysisProgress: { width: '80%', height: 6, borderRadius: 3, marginTop: spacing[6], overflow: 'hidden' },
    analysisProgressFill: { height: 6, borderRadius: 3 },

    // App List
    appListContainer: { flex: 1, marginTop: spacing[4] },
    appList: { flex: 1 },
    appItem: { flexDirection: 'row', alignItems: 'center', padding: spacing[3], borderRadius: 14, marginBottom: spacing[2], borderWidth: 1.5 },
    appIcon: { width: 44, height: 44, borderRadius: 12 },
    appIconPlaceholder: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },

    // Stats
    statsContainer: { flex: 1, justifyContent: 'center' },
    statCard: { padding: spacing[5], borderRadius: 20, alignItems: 'center' },

    // Commitment
    commitmentContent: { flex: 1, justifyContent: 'center' },
    commitmentCard: { padding: spacing[6], borderRadius: 24 },
});
