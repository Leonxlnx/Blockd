import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    ScrollView,
    Image,
    TouchableOpacity,
    NativeModules,
    Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/theme';
import { Text, Button } from '../../components';

const { width, height } = Dimensions.get('window');
const { PermissionsModule } = NativeModules;

interface AppData {
    packageName: string;
    appName: string;
    usageMinutes: number;
    icon?: string;
}

interface ScreenProps {
    onNext: () => void;
    onBack?: () => void;
    userName?: string;
}

// ============================================
// APP ANALYSIS SCREEN
// ============================================

export const AppAnalysisScreen: React.FC<ScreenProps & { setApps: (apps: AppData[]) => void }> = ({ onNext, setApps }) => {
    const { theme, isDark } = useTheme();
    const [progress] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
        }).start();

        const loadApps = async () => {
            try {
                const apps = await PermissionsModule.getTodayUsage();
                if (apps && apps.length > 0) {
                    setApps(apps);
                }
            } catch (e) {
                console.log('Load apps error:', e);
            }
            setTimeout(onNext, 3500);
        };
        loadApps();
    }, []);

    const progressWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F'] : ['#FAFAFA', '#F5F5F7']} style={StyleSheet.absoluteFillObject} />
            <View style={styles.content}>
                <Text variant="h2" weight="bold" align="center">Analyzing Your Apps</Text>
                <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ marginTop: spacing[3] }}>
                    This won't take long...
                </Text>
                <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', marginTop: spacing[8] }]}>
                    <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: isDark ? '#FFF' : '#000' }]} />
                </View>
            </View>
        </View>
    );
};

// ============================================
// APP SELECTION SCREEN
// ============================================

export const AppSelectionScreen: React.FC<ScreenProps & { apps: AppData[]; selectedApps: string[]; setSelectedApps: (apps: string[]) => void }> = ({ onNext, onBack, apps, selectedApps, setSelectedApps }) => {
    const { theme, isDark } = useTheme();

    const toggleApp = (packageName: string) => {
        if (selectedApps.includes(packageName)) {
            setSelectedApps(selectedApps.filter(p => p !== packageName));
        } else {
            setSelectedApps([...selectedApps, packageName]);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F'] : ['#FAFAFA', '#F5F5F7']} style={StyleSheet.absoluteFillObject} />
            <View style={styles.headerPadding}>
                <Text variant="h2" weight="bold" align="center">Choose Apps to Track</Text>
                <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ marginTop: spacing[2] }}>
                    Select the apps you want to limit
                </Text>
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing[4] }} showsVerticalScrollIndicator={false}>
                {apps.map((app, i) => {
                    const isSelected = selectedApps.includes(app.packageName);
                    return (
                        <TouchableOpacity key={i} onPress={() => toggleApp(app.packageName)} activeOpacity={0.7}>
                            <View style={[styles.appItem, { backgroundColor: isSelected ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'), borderColor: isSelected ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)') : 'transparent' }]}>
                                {app.icon ? (
                                    <Image source={{ uri: `data:image/png;base64,${app.icon}` }} style={styles.appIcon} />
                                ) : (
                                    <View style={[styles.appIconPlaceholder, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                                        <Text variant="caption" weight="bold">{app.appName.charAt(0)}</Text>
                                    </View>
                                )}
                                <View style={{ flex: 1, marginLeft: spacing[3] }}>
                                    <Text variant="body" weight="medium">{app.appName}</Text>
                                    <Text variant="caption" color={theme.colors.textSecondary}>{app.usageMinutes}m/day</Text>
                                </View>
                                <View style={[styles.checkbox, { backgroundColor: isSelected ? (isDark ? '#FFF' : '#000') : 'transparent', borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }]}>
                                    {isSelected && <Text variant="caption" weight="bold" color={isDark ? '#000' : '#FFF'}>✓</Text>}
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
            <View style={styles.bottomButtons}>
                <Button variant="primary" onPress={onNext} disabled={selectedApps.length === 0} title={`Continue (${selectedApps.length} selected)`} />
            </View>
        </View>
    );
};

// ============================================
// TIME CALCULATION SCREEN
// ============================================

export const TimeCalculationScreen: React.FC<ScreenProps & { apps: AppData[]; selectedApps: string[] }> = ({ onNext, apps, selectedApps }) => {
    const { theme, isDark } = useTheme();

    const selectedAppData = apps.filter(a => selectedApps.includes(a.packageName));
    const totalMinutes = selectedAppData.reduce((sum, app) => sum + app.usageMinutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const yearlyHours = Math.round(totalMinutes * 365 / 60);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F'] : ['#FAFAFA', '#F5F5F7']} style={StyleSheet.absoluteFillObject} />
            <View style={styles.content}>
                <Text variant="h2" weight="bold" align="center">Your Time Investment</Text>
                <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', marginTop: spacing[6] }]}>
                    <Text variant="caption" color={theme.colors.textSecondary}>Daily on selected apps</Text>
                    <Text variant="h1" weight="bold" style={{ marginTop: spacing[2] }}>{hours}h {mins}m</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', marginTop: spacing[3] }]}>
                    <Text variant="caption" color={theme.colors.textSecondary}>Yearly projection</Text>
                    <Text variant="h2" weight="bold" color="#FF4444" style={{ marginTop: spacing[2] }}>{yearlyHours} hours</Text>
                    <Text variant="caption" color={theme.colors.textTertiary}>That's {Math.round(yearlyHours / 24)} full days</Text>
                </View>
            </View>
            <View style={styles.bottomButtons}>
                <Button variant="primary" onPress={onNext} title="I'm Ready to Change" />
            </View>
        </View>
    );
};

// ============================================
// COMMITMENT SCREEN
// ============================================

export const CommitmentScreen: React.FC<ScreenProps> = ({ onNext }) => {
    const { theme, isDark } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F'] : ['#FAFAFA', '#F5F5F7']} style={StyleSheet.absoluteFillObject} />
            <View style={styles.content}>
                <Text variant="h2" weight="bold" align="center">Your Commitment</Text>
                <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ marginTop: spacing[3] }}>
                    Blockd will help you stay focused and break free from phone addiction.
                </Text>
                <View style={[styles.commitmentBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', marginTop: spacing[6] }]}>
                    <Text variant="body" weight="semibold" align="center" style={{ lineHeight: 28 }}>
                        "I commit to reducing{'\n'}my screen time and{'\n'}taking control of my life."
                    </Text>
                </View>
            </View>
            <View style={styles.bottomButtons}>
                <Button variant="primary" onPress={onNext} title="I Commit" />
            </View>
        </View>
    );
};

// ============================================
// APP USAGE (Export for compatibility)
// ============================================

export const AppUsage: React.FC<ScreenProps> = ({ onNext }) => {
    const { theme, isDark } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F'] : ['#FAFAFA', '#F5F5F7']} style={StyleSheet.absoluteFillObject} />
            <View style={styles.content}>
                <Text variant="h2" weight="bold" align="center">App Usage</Text>
                <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ marginTop: spacing[3] }}>
                    You're all set! Let's start your journey.
                </Text>
            </View>
            <View style={styles.bottomButtons}>
                <Button variant="primary" onPress={onNext} title="Continue" />
            </View>
        </View>
    );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing[4] },
    headerPadding: { paddingTop: 60, paddingHorizontal: spacing[4] },
    bottomButtons: { padding: spacing[4], paddingBottom: spacing[8] },

    progressBar: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3 },

    appItem: { flexDirection: 'row', alignItems: 'center', padding: spacing[4], borderRadius: 16, marginBottom: spacing[2], borderWidth: 2 },
    appIcon: { width: 44, height: 44, borderRadius: 12 },
    appIconPlaceholder: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },

    statCard: { padding: spacing[5], borderRadius: 20, width: '100%', alignItems: 'center' },
    commitmentBox: { padding: spacing[6], borderRadius: 20 },
});
