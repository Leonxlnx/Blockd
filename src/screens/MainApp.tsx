import React, { useState, useEffect } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    NativeModules,
    Linking,
    Modal,
    Alert,
    TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { spacing } from '../theme/theme';
import { Text } from '../components';
import { limitsService, AppLimit } from '../services/limitsService';
import auth from '@react-native-firebase/auth';

const { width, height } = Dimensions.get('window');
const { PermissionsModule, BlockingModule } = NativeModules;

type Tab = 'dashboard' | 'limits' | 'settings';

interface AppData {
    packageName: string;
    appName: string;
    usageMinutes: number;
    icon?: string;
}

// ============================================
// SIMPLE ICONS (View-based)
// ============================================

const HomeIcon: React.FC<{ size: number; color: string; filled?: boolean }> = ({ size, color, filled }) => (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.6, height: size * 0.5, borderWidth: filled ? 0 : 2, borderColor: color, backgroundColor: filled ? color : 'transparent', borderRadius: 3 }} />
        <View style={{ width: size * 0.3, height: size * 0.35, backgroundColor: filled ? 'transparent' : color, position: 'absolute', bottom: 0, borderRadius: 2 }} />
    </View>
);

const ShieldIcon: React.FC<{ size: number; color: string; filled?: boolean }> = ({ size, color, filled }) => (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.6, height: size * 0.7, borderWidth: filled ? 0 : 2, borderColor: color, backgroundColor: filled ? color : 'transparent', borderRadius: 3, borderBottomLeftRadius: size * 0.3, borderBottomRightRadius: size * 0.3 }} />
    </View>
);

const GearIcon: React.FC<{ size: number; color: string; filled?: boolean }> = ({ size, color, filled }) => (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.5, height: size * 0.5, borderWidth: filled ? 0 : 2, borderColor: color, backgroundColor: filled ? color : 'transparent', borderRadius: size * 0.25 }} />
    </View>
);

const PlusIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.6, height: 2, backgroundColor: color, position: 'absolute' }} />
        <View style={{ width: 2, height: size * 0.6, backgroundColor: color, position: 'absolute' }} />
    </View>
);

const XIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.7, height: 2, backgroundColor: color, transform: [{ rotate: '45deg' }], position: 'absolute' }} />
        <View style={{ width: size * 0.7, height: 2, backgroundColor: color, transform: [{ rotate: '-45deg' }], position: 'absolute' }} />
    </View>
);

const ChevronIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.4, height: size * 0.4, borderRightWidth: 2, borderBottomWidth: 2, borderColor: color, transform: [{ rotate: '-45deg' }] }} />
    </View>
);

const LockIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.4, height: size * 0.25, borderWidth: 2, borderColor: color, borderTopLeftRadius: size * 0.2, borderTopRightRadius: size * 0.2, borderBottomWidth: 0, marginBottom: -1 }} />
        <View style={{ width: size * 0.5, height: size * 0.4, backgroundColor: color, borderRadius: 3 }} />
    </View>
);

// ============================================
// GLASS CARD
// ============================================

const GlassCard: React.FC<{ children: React.ReactNode; style?: object }> = ({ children, style }) => {
    const { isDark } = useTheme();
    return (
        <View style={[styles.glassCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }, style]}>
            {children}
        </View>
    );
};

// ============================================
// TAB BAR
// ============================================

const TabBar: React.FC<{ activeTab: Tab; onTabPress: (tab: Tab) => void; isDark: boolean }> = ({ activeTab, onTabPress, isDark }) => {
    const accent = isDark ? '#FFFFFF' : '#1A1A1A';
    const inactive = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';

    return (
        <View style={[styles.tabBar, { backgroundColor: isDark ? 'rgba(10,10,15,0.95)' : 'rgba(250,250,250,0.95)', borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
            <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('dashboard')} activeOpacity={0.7}>
                <HomeIcon size={22} color={activeTab === 'dashboard' ? accent : inactive} filled={activeTab === 'dashboard'} />
                <Text variant="caption" weight={activeTab === 'dashboard' ? 'bold' : 'medium'} color={activeTab === 'dashboard' ? accent : inactive} style={{ marginTop: 4, fontSize: 10 }}>Overview</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('limits')} activeOpacity={0.7}>
                <ShieldIcon size={22} color={activeTab === 'limits' ? accent : inactive} filled={activeTab === 'limits'} />
                <Text variant="caption" weight={activeTab === 'limits' ? 'bold' : 'medium'} color={activeTab === 'limits' ? accent : inactive} style={{ marginTop: 4, fontSize: 10 }}>Limits</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => onTabPress('settings')} activeOpacity={0.7}>
                <GearIcon size={22} color={activeTab === 'settings' ? accent : inactive} filled={activeTab === 'settings'} />
                <Text variant="caption" weight={activeTab === 'settings' ? 'bold' : 'medium'} color={activeTab === 'settings' ? accent : inactive} style={{ marginTop: 4, fontSize: 10 }}>Settings</Text>
            </TouchableOpacity>
        </View>
    );
};

// ============================================
// SIMPLE BAR CHART
// ============================================

const SimpleBarChart: React.FC<{ data: number[]; isDark: boolean }> = ({ data, isDark }) => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const maxVal = Math.max(...data, 1);

    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, paddingHorizontal: spacing[2] }}>
            {data.map((val, i) => {
                const barHeight = Math.max(10, (val / maxVal) * 100);
                const isToday = i === 6;
                return (
                    <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                        <View style={{ height: barHeight, width: 20, backgroundColor: isToday ? (isDark ? '#FFF' : '#000') : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'), borderRadius: 4 }} />
                        <Text variant="caption" color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} style={{ marginTop: 6, fontSize: 10 }}>{days[i]}</Text>
                    </View>
                );
            })}
        </View>
    );
};

// ============================================
// DASHBOARD TAB (Liquid Metal Redesign)
// ============================================

const DashboardTab: React.FC<{ isDark: boolean; userName?: string }> = ({ isDark, userName = 'User' }) => {
    const { theme } = useTheme();
    const [todayUsage, setTodayUsage] = useState<AppData[]>([]);
    const [unlockCount, setUnlockCount] = useState(0);
    const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
    const [limits, setLimits] = useState<AppLimit[]>([]);
    const [showAllApps, setShowAllApps] = useState(false);

    useEffect(() => {
        loadData();
        limitsService.loadLimits();
        const unsub = limitsService.subscribe(setLimits);
        return unsub;
    }, []);

    const loadData = async () => {
        try {
            const usage = await PermissionsModule.getTodayUsage();
            if (usage) setTodayUsage(usage);

            const unlocks = await PermissionsModule.getUnlockCountToday();
            setUnlockCount(unlocks || 0);

            const weekly = await PermissionsModule.getWeeklyUsage();
            if (weekly && weekly.length === 7) setWeeklyData(weekly);
        } catch (e) {
            console.log('Load data error:', e);
        }
    };

    const totalMinutes = todayUsage.reduce((sum, app) => sum + app.usageMinutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const activeLimits = limits.filter(l => l.isActive && l.mode === 'limit').length;
    const activeDetox = limits.filter(l => l.isActive && l.mode === 'detox').length;
    const avgMinutes = weeklyData.reduce((a, b) => a + b, 0) / 7;
    const avgHours = (avgMinutes / 60).toFixed(1);

    const top3Apps = todayUsage.slice(0, 3);

    const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = new Date().getDay();
    const todayIndex = today === 0 ? 6 : today - 1;
    const maxWeekly = Math.max(...weeklyData, 60);

    return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.dashboardContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.dashboardHeader}>
                <Text variant="caption" weight="semibold" color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} style={{ letterSpacing: 2, textTransform: 'uppercase', fontSize: 10 }}>Dashboard</Text>
                <Text variant="h1" weight="bold" style={styles.liquidText}>{userName}</Text>
            </View>

            {/* Screen Time Card */}
            <View style={[styles.metalCard, { backgroundColor: isDark ? 'rgba(20,20,20,0.8)' : 'rgba(255,255,255,0.9)' }]}>
                <View style={styles.screenTimeBadge}>
                    <View style={[styles.pulsingDot, { backgroundColor: isDark ? '#FFF' : '#000' }]} />
                    <Text variant="caption" weight="bold" color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} style={{ letterSpacing: 1.5, fontSize: 9, textTransform: 'uppercase' }}>Screen Time</Text>
                </View>
                <View style={styles.screenTimeRow}>
                    <Text style={[styles.screenTimeNum, { color: isDark ? '#FFF' : '#000' }]}>{hours}</Text>
                    <Text style={[styles.screenTimeUnit, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>h</Text>
                    <Text style={[styles.screenTimeNum, { color: isDark ? '#FFF' : '#000', marginLeft: 8 }]}>{minutes.toString().padStart(2, '0')}</Text>
                    <Text style={[styles.screenTimeUnit, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>m</Text>
                </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(20,20,20,0.8)' : 'rgba(255,255,255,0.9)' }]}>
                    <View style={[styles.statIconCircle, { backgroundColor: isDark ? '#000' : '#F5F5F5', borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]}>
                        <LockIcon size={18} color={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'} />
                    </View>
                    <Text variant="h3" weight="bold" color={isDark ? '#FFF' : '#000'}>{unlockCount}</Text>
                    <Text variant="caption" weight="bold" color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} style={{ fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 }}>Unlocks</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(20,20,20,0.8)' : 'rgba(255,255,255,0.9)' }]}>
                    <View style={[styles.statIconCircle, { backgroundColor: isDark ? '#000' : '#F5F5F5', borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]}>
                        <ShieldIcon size={18} color={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'} />
                    </View>
                    <Text variant="h3" weight="bold" color={isDark ? '#FFF' : '#000'}>{activeLimits}</Text>
                    <Text variant="caption" weight="bold" color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} style={{ fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 }}>Limits</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(20,20,20,0.8)' : 'rgba(255,255,255,0.9)' }]}>
                    <View style={[styles.statIconCircle, { backgroundColor: isDark ? '#000' : '#F5F5F5', borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]}>
                        <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }} />
                    </View>
                    <Text variant="h3" weight="bold" color={isDark ? '#FFF' : '#000'}>{activeDetox}</Text>
                    <Text variant="caption" weight="bold" color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} style={{ fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 }}>Detox</Text>
                </View>
            </View>

            {/* Most Used Card */}
            <View style={[styles.metalCard, { backgroundColor: isDark ? 'rgba(20,20,20,0.8)' : 'rgba(255,255,255,0.9)' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
                    <Text variant="body" weight="bold" color={isDark ? '#FFF' : '#000'}>Most Used</Text>
                    <TouchableOpacity onPress={() => setShowAllApps(true)} style={[styles.viewAllBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                        <Text variant="caption" weight="bold" color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>View All</Text>
                    </TouchableOpacity>
                </View>
                {top3Apps.map((app, i) => {
                    const maxUsage = top3Apps[0]?.usageMinutes || 1;
                    const barWidth = Math.max(10, (app.usageMinutes / maxUsage) * 100);
                    return (
                        <View key={i} style={[styles.appSlot, { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.03)' }]}>
                            <View style={styles.appSlotLeft}>
                                <View style={[styles.appSlotIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                                    {app.icon ? (
                                        <Image source={{ uri: `data:image/png;base64,${app.icon}` }} style={{ width: 20, height: 20, borderRadius: 4 }} />
                                    ) : (
                                        <Text variant="caption" weight="bold">{app.appName.charAt(0)}</Text>
                                    )}
                                </View>
                                <View>
                                    <Text variant="body" weight="semibold" color={isDark ? '#FFF' : '#000'} numberOfLines={1} style={{ fontSize: 13 }}>{app.appName}</Text>
                                    <Text variant="caption" weight="semibold" color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase' }}>App</Text>
                                </View>
                            </View>
                            <View style={styles.appSlotRight}>
                                <View style={[styles.appProgressBar, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.06)' }]}>
                                    <View style={[styles.appProgressFill, { width: `${barWidth}%`, backgroundColor: i === 0 ? (isDark ? '#FFF' : '#000') : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)') }]} />
                                </View>
                                <Text variant="body" weight="bold" color={isDark ? '#FFF' : '#000'} style={{ fontSize: 12, minWidth: 50, textAlign: 'right' }}>{formatTime(app.usageMinutes)}</Text>
                            </View>
                        </View>
                    );
                })}
                {top3Apps.length === 0 && (
                    <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ padding: spacing[4] }}>No usage data yet</Text>
                )}
            </View>

            {/* Weekly Overview */}
            <View style={[styles.metalCard, { backgroundColor: isDark ? 'rgba(20,20,20,0.8)' : 'rgba(255,255,255,0.9)', marginBottom: spacing[8] }]}>
                <View style={{ marginBottom: spacing[4] }}>
                    <Text variant="body" weight="bold" color={isDark ? '#FFF' : '#000'}>Weekly Overview</Text>
                    <Text variant="caption" color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} style={{ marginTop: 4 }}>Your average is <Text weight="bold" color={isDark ? '#FFF' : '#000'}>{avgHours}h</Text></Text>
                </View>
                <View style={styles.weeklyChart}>
                    <View style={styles.weeklyLabels}>
                        <Text variant="caption" color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} style={{ fontSize: 10 }}>4h</Text>
                        <Text variant="caption" color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} style={{ fontSize: 10 }}>2h</Text>
                        <Text variant="caption" color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} style={{ fontSize: 10 }}>0h</Text>
                    </View>
                    <View style={styles.weeklyBars}>
                        {weeklyData.map((val, i) => {
                            const barHeight = Math.max(8, (val / maxWeekly) * 100);
                            const isToday = i === todayIndex;
                            return (
                                <View key={i} style={styles.weeklyBarContainer}>
                                    <View style={[styles.weeklyBar, { height: `${barHeight}%`, backgroundColor: isToday ? (isDark ? '#FFF' : '#000') : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)') }]} />
                                    <Text variant="caption" weight={isToday ? 'bold' : 'medium'} color={isToday ? (isDark ? '#FFF' : '#000') : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)')} style={{ fontSize: 9, marginTop: 6 }}>{days[i]}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </View>

            {/* All Apps Modal */}
            <Modal visible={showAllApps} animationType="slide" transparent>
                <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.98)' : 'rgba(255,255,255,0.98)' }]}>
                    <View style={styles.modalHeader}>
                        <Text variant="h3" weight="bold">All Apps</Text>
                        <TouchableOpacity onPress={() => setShowAllApps(false)}><XIcon size={24} color={isDark ? '#FFF' : '#000'} /></TouchableOpacity>
                    </View>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing[4] }}>
                        {todayUsage.map((app, i) => (
                            <View key={i} style={[styles.appSlot, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', marginBottom: spacing[2] }]}>
                                <View style={styles.appSlotLeft}>
                                    <View style={[styles.appSlotIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                                        {app.icon ? (
                                            <Image source={{ uri: `data:image/png;base64,${app.icon}` }} style={{ width: 20, height: 20, borderRadius: 4 }} />
                                        ) : (
                                            <Text variant="caption" weight="bold">{app.appName.charAt(0)}</Text>
                                        )}
                                    </View>
                                    <Text variant="body" weight="medium" numberOfLines={1}>{app.appName}</Text>
                                </View>
                                <Text variant="body" weight="semibold" color={theme.colors.textSecondary}>{formatTime(app.usageMinutes)}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
        </ScrollView>
    );
};

// ============================================
// SETTINGS TAB
// ============================================

const SettingsTab: React.FC<{ isDark: boolean; onLogout: () => void }> = ({ isDark, onLogout }) => {
    const { theme } = useTheme();
    const user = auth().currentUser;
    const [privacyVisible, setPrivacyVisible] = useState(false);
    const [termsVisible, setTermsVisible] = useState(false);

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: async () => { await auth().signOut(); onLogout(); } },
        ]);
    };

    const openPermissions = () => Linking.openSettings();

    const privacyText = `Privacy Policy for Blockd

Last updated: December 2024

1. Information We Collect
We collect usage statistics to help you track your screen time. This includes:
- App usage duration
- Screen unlock frequency
- Blocked app attempts

2. How We Use Your Information
Your data is used solely to provide app functionality and is stored securely.

3. Data Storage
All data is stored locally on your device and in your Firebase account.

4. Third-Party Services
We use Firebase for authentication and data sync.

5. Contact
For questions, contact support@blockd.app`;

    const termsText = `Terms of Service for Blockd

Last updated: December 2024

1. Acceptance of Terms
By using Blockd, you agree to these terms.

2. Description of Service
Blockd helps you manage screen time through app limits and detox challenges.

3. User Responsibilities
You are responsible for your own usage of the app.

4. Limitations
Blockd is provided "as is" without warranty.

5. Modifications
We may update these terms at any time.

6. Contact
For questions, contact support@blockd.app`;

    return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner} showsVerticalScrollIndicator={false}>
            <Text variant="caption" weight="semibold" color={theme.colors.textTertiary} style={styles.sectionLabel}>ACCOUNT</Text>
            <GlassCard>
                <View style={styles.settingRow}>
                    <Text variant="body">Email</Text>
                    <Text variant="body" color={theme.colors.textSecondary} numberOfLines={1} style={{ maxWidth: 180 }}>{user?.email || 'Not logged in'}</Text>
                </View>
                <View style={[styles.settingRow, styles.settingRowBorder, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                    <Text variant="body">Member Since</Text>
                    <Text variant="body" color={theme.colors.textSecondary}>{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '-'}</Text>
                </View>
            </GlassCard>

            <Text variant="caption" weight="semibold" color={theme.colors.textTertiary} style={{ ...styles.sectionLabel, marginTop: spacing[5] }}>APP</Text>
            <GlassCard>
                <View style={styles.settingRow}>
                    <Text variant="body">Version</Text>
                    <Text variant="body" color={theme.colors.textSecondary}>1.0.0</Text>
                </View>
            </GlassCard>

            <Text variant="caption" weight="semibold" color={theme.colors.textTertiary} style={{ ...styles.sectionLabel, marginTop: spacing[5] }}>LEGAL</Text>
            <GlassCard>
                <TouchableOpacity style={styles.settingRow} onPress={() => setPrivacyVisible(true)}>
                    <Text variant="body">Privacy Policy</Text>
                    <ChevronIcon size={18} color={theme.colors.textTertiary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.settingRow, styles.settingRowBorder, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]} onPress={() => setTermsVisible(true)}>
                    <Text variant="body">Terms of Service</Text>
                    <ChevronIcon size={18} color={theme.colors.textTertiary} />
                </TouchableOpacity>
            </GlassCard>

            <Text variant="caption" weight="semibold" color={theme.colors.textTertiary} style={{ ...styles.sectionLabel, marginTop: spacing[5] }}>PERMISSIONS</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={openPermissions}>
                <GlassCard>
                    <View style={styles.settingRow}>
                        <Text variant="body">Manage Permissions</Text>
                        <ChevronIcon size={18} color={theme.colors.textTertiary} />
                    </View>
                </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout} style={[styles.logoutBtn, { backgroundColor: isDark ? 'rgba(255,68,68,0.12)' : 'rgba(255,68,68,0.08)', marginTop: spacing[6] }]} activeOpacity={0.7}>
                <Text variant="body" weight="semibold" color="#FF4444">Logout</Text>
            </TouchableOpacity>

            <Modal visible={privacyVisible} animationType="slide" transparent>
                <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.98)' }]}>
                    <View style={styles.modalHeader}>
                        <Text variant="h3" weight="bold">Privacy Policy</Text>
                        <TouchableOpacity onPress={() => setPrivacyVisible(false)}><XIcon size={24} color={isDark ? '#FFF' : '#000'} /></TouchableOpacity>
                    </View>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing[4] }}>
                        <Text variant="body" color={theme.colors.textSecondary} style={{ lineHeight: 24 }}>{privacyText}</Text>
                    </ScrollView>
                </View>
            </Modal>

            <Modal visible={termsVisible} animationType="slide" transparent>
                <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.98)' }]}>
                    <View style={styles.modalHeader}>
                        <Text variant="h3" weight="bold">Terms of Service</Text>
                        <TouchableOpacity onPress={() => setTermsVisible(false)}><XIcon size={24} color={isDark ? '#FFF' : '#000'} /></TouchableOpacity>
                    </View>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing[4] }}>
                        <Text variant="body" color={theme.colors.textSecondary} style={{ lineHeight: 24 }}>{termsText}</Text>
                    </ScrollView>
                </View>
            </Modal>
        </ScrollView>
    );
};

// ============================================
// LIMITS TAB
// ============================================

const LimitsTab: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const { theme } = useTheme();
    const [limits, setLimits] = useState<AppLimit[]>([]);
    const [showPicker, setShowPicker] = useState(false);
    const [allApps, setAllApps] = useState<AppData[]>([]);
    const [selectedApp, setSelectedApp] = useState<AppData | null>(null);
    const [showSetup, setShowSetup] = useState(false);
    const [mode, setMode] = useState<'limit' | 'detox'>('limit');
    const [limitValue, setLimitValue] = useState(30);
    const [detoxDays, setDetoxDays] = useState(7);
    const [showDetail, setShowDetail] = useState(false);
    const [detailLimit, setDetailLimit] = useState<AppLimit | null>(null);

    useEffect(() => {
        limitsService.loadLimits();
        const unsub = limitsService.subscribe(setLimits);
        loadAllApps();
        return unsub;
    }, []);

    const loadAllApps = async () => {
        try {
            const apps = await PermissionsModule.getAllInstalledApps();
            if (apps) setAllApps(apps);
        } catch (e) {
            console.log('Load apps error:', e);
        }
    };

    const handleSelectApp = (app: AppData) => {
        setSelectedApp(app);
        setShowPicker(false);
        setShowSetup(true);
    };

    const handleConfirmLimit = async () => {
        if (!selectedApp) return;
        const newLimit: AppLimit = {
            packageName: selectedApp.packageName,
            appName: selectedApp.appName,
            icon: selectedApp.icon,
            mode,
            dailyLimitMinutes: mode === 'limit' ? limitValue : undefined,
            detoxEndDate: mode === 'detox' ? new Date(Date.now() + detoxDays * 24 * 60 * 60 * 1000).toISOString() : undefined,
            streak: 0,
            startedAt: new Date().toISOString(),
            usedTodayMinutes: 0,
            lastResetDate: new Date().toISOString().split('T')[0],
            isActive: true,
        };
        await limitsService.saveLimit(newLimit);
        if (mode === 'detox') {
            BlockingModule?.addBlockedApp?.(selectedApp.packageName, 'detox', new Date(newLimit.detoxEndDate!).getTime(), 0);
        } else {
            BlockingModule?.addBlockedApp?.(selectedApp.packageName, 'limit', 0, limitValue);
        }
        setSelectedApp(null);
        setShowSetup(false);
    };

    const handleLimitPress = (limit: AppLimit) => {
        setDetailLimit(limit);
        setShowDetail(true);
    };

    const handleRemoveLimit = async () => {
        if (!detailLimit) return;
        await limitsService.deleteLimit(detailLimit.packageName);
        BlockingModule?.removeBlockedApp?.(detailLimit.packageName);
        setShowDetail(false);
        setDetailLimit(null);
    };

    const activeLimits = limits.filter(l => l.isActive);
    const existingPackages = limits.map(l => l.packageName);
    const availableApps = allApps.filter(a => !existingPackages.includes(a.packageName));

    const formatDaysRemaining = (endDate: string) => {
        const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        return `${days}d left`;
    };

    return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner} showsVerticalScrollIndicator={false}>
            {activeLimits.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                    <LockIcon size={48} color={theme.colors.textTertiary} />
                    <Text variant="h3" weight="bold" align="center" style={{ marginTop: spacing[4] }}>No Limits Yet</Text>
                    <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ marginTop: spacing[2] }}>
                        Add your first limit to start{'\n'}controlling your screen time
                    </Text>
                </View>
            ) : (
                <View style={{ gap: spacing[3] }}>
                    {activeLimits.map((limit, i) => (
                        <TouchableOpacity key={i} activeOpacity={0.7} onPress={() => handleLimitPress(limit)}>
                            <GlassCard style={{ flexDirection: 'row', alignItems: 'center', padding: spacing[4] }}>
                                {limit.icon ? (
                                    <Image source={{ uri: `data:image/png;base64,${limit.icon}` }} style={styles.limitIcon} />
                                ) : (
                                    <View style={[styles.limitIconPlaceholder, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                                        <Text variant="body" weight="bold">{limit.appName.charAt(0)}</Text>
                                    </View>
                                )}
                                <View style={{ flex: 1, marginLeft: spacing[4] }}>
                                    <Text variant="body" weight="semibold">{limit.appName}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: 4 }}>
                                        <View style={[styles.modeTag, { backgroundColor: limit.mode === 'detox' ? 'rgba(255,68,68,0.15)' : 'rgba(0,122,255,0.15)' }]}>
                                            <Text variant="caption" weight="bold" color={limit.mode === 'detox' ? '#FF4444' : '#007AFF'}>{limit.mode === 'detox' ? 'DETOX' : 'LIMIT'}</Text>
                                        </View>
                                        <Text variant="caption" color={theme.colors.textSecondary}>{limit.mode === 'detox' ? formatDaysRemaining(limit.detoxEndDate!) : `${limit.dailyLimitMinutes}m/day`}</Text>
                                    </View>
                                </View>
                                {limit.streak > 0 && (
                                    <View style={{ alignItems: 'center' }}>
                                        <Text variant="h3" weight="bold" color="#FFD700">{limit.streak}</Text>
                                        <Text variant="caption" color={theme.colors.textTertiary}>days</Text>
                                    </View>
                                )}
                                <ChevronIcon size={20} color={theme.colors.textTertiary} />
                            </GlassCard>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <TouchableOpacity onPress={() => setShowPicker(true)} style={[styles.addButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]} activeOpacity={0.7}>
                <PlusIcon size={24} color={isDark ? '#FFF' : '#000'} />
                <Text variant="body" weight="semibold" style={{ marginLeft: spacing[3] }}>Add Limit</Text>
            </TouchableOpacity>

            {/* App Picker Modal */}
            <Modal visible={showPicker} animationType="slide" transparent>
                <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.98)' }]}>
                    <View style={styles.modalHeader}>
                        <Text variant="h3" weight="bold">Select App</Text>
                        <TouchableOpacity onPress={() => setShowPicker(false)}><XIcon size={24} color={isDark ? '#FFF' : '#000'} /></TouchableOpacity>
                    </View>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing[4] }}>
                        {availableApps.map((app, i) => (
                            <TouchableOpacity key={i} onPress={() => handleSelectApp(app)} activeOpacity={0.7}>
                                <View style={[styles.appRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: 12, marginBottom: spacing[2], padding: spacing[3] }]}>
                                    {app.icon ? (
                                        <Image source={{ uri: `data:image/png;base64,${app.icon}` }} style={styles.appIcon} />
                                    ) : (
                                        <View style={[styles.appIconPlaceholder, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                                            <Text variant="caption" weight="bold">{app.appName.charAt(0)}</Text>
                                        </View>
                                    )}
                                    <Text variant="body" weight="medium" numberOfLines={1} style={{ flex: 1, marginLeft: spacing[3] }}>{app.appName}</Text>
                                    <ChevronIcon size={18} color={theme.colors.textTertiary} />
                                </View>
                            </TouchableOpacity>
                        ))}
                        {availableApps.length === 0 && <Text variant="body" color={theme.colors.textSecondary} align="center">No apps available</Text>}
                    </ScrollView>
                </View>
            </Modal>

            {/* Setup Modal */}
            <Modal visible={showSetup} animationType="slide" transparent>
                <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.98)' }]}>
                    <View style={styles.modalHeader}>
                        <Text variant="h3" weight="bold">Setup Limit</Text>
                        <TouchableOpacity onPress={() => setShowSetup(false)}><XIcon size={24} color={isDark ? '#FFF' : '#000'} /></TouchableOpacity>
                    </View>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing[4] }}>
                        {selectedApp && (
                            <>
                                <View style={{ alignItems: 'center', marginBottom: spacing[6] }}>
                                    {selectedApp.icon ? (
                                        <Image source={{ uri: `data:image/png;base64,${selectedApp.icon}` }} style={{ width: 64, height: 64, borderRadius: 16 }} />
                                    ) : (
                                        <View style={[styles.limitIconPlaceholder, { width: 64, height: 64, borderRadius: 16 }]}>
                                            <Text variant="h2" weight="bold">{selectedApp.appName.charAt(0)}</Text>
                                        </View>
                                    )}
                                    <Text variant="h3" weight="bold" style={{ marginTop: spacing[3] }}>{selectedApp.appName}</Text>
                                </View>

                                <Text variant="caption" weight="semibold" color={theme.colors.textTertiary} style={{ marginBottom: spacing[2] }}>MODE</Text>
                                <View style={{ flexDirection: 'row', gap: spacing[3], marginBottom: spacing[5] }}>
                                    <TouchableOpacity onPress={() => setMode('limit')} style={[styles.modeButton, { backgroundColor: mode === 'limit' ? 'rgba(0,122,255,0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'), borderColor: mode === 'limit' ? '#007AFF' : 'transparent' }]}>
                                        <Text variant="body" weight="semibold" color={mode === 'limit' ? '#007AFF' : theme.colors.text}>Daily Limit</Text>
                                        <Text variant="caption" color={theme.colors.textSecondary}>Set max time/day</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setMode('detox')} style={[styles.modeButton, { backgroundColor: mode === 'detox' ? 'rgba(255,68,68,0.2)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'), borderColor: mode === 'detox' ? '#FF4444' : 'transparent' }]}>
                                        <Text variant="body" weight="semibold" color={mode === 'detox' ? '#FF4444' : theme.colors.text}>Detox</Text>
                                        <Text variant="caption" color={theme.colors.textSecondary}>Full block</Text>
                                    </TouchableOpacity>
                                </View>

                                {mode === 'limit' ? (
                                    <>
                                        <Text variant="caption" weight="semibold" color={theme.colors.textTertiary} style={{ marginBottom: spacing[2] }}>DAILY LIMIT (minutes)</Text>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[3] }}>
                                            {[15, 30, 60, 120].map(v => (
                                                <TouchableOpacity key={v} onPress={() => setLimitValue(v)} style={[styles.timeButton, { backgroundColor: limitValue === v ? (isDark ? '#FFF' : '#000') : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') }]}>
                                                    <Text variant="body" weight="semibold" color={limitValue === v ? (isDark ? '#000' : '#FFF') : theme.colors.text}>{v}m</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[4] }}>
                                            <Text variant="body" color={theme.colors.textSecondary}>Custom:</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', borderRadius: 12, paddingHorizontal: spacing[3] }}>
                                                <TextInput
                                                    value={String(limitValue)}
                                                    onChangeText={(t) => setLimitValue(parseInt(t) || 0)}
                                                    keyboardType="number-pad"
                                                    style={{ color: isDark ? '#FFF' : '#000', fontSize: 18, fontWeight: '600', paddingVertical: spacing[2], minWidth: 50, textAlign: 'center' }}
                                                />
                                                <Text variant="body" weight="semibold" color={theme.colors.textSecondary}>min</Text>
                                            </View>
                                        </View>
                                    </>
                                ) : (
                                    <>
                                        <Text variant="caption" weight="semibold" color={theme.colors.textTertiary} style={{ marginBottom: spacing[2] }}>DETOX DURATION (days)</Text>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[3] }}>
                                            {[3, 7, 14, 30].map(v => (
                                                <TouchableOpacity key={v} onPress={() => setDetoxDays(v)} style={[styles.timeButton, { backgroundColor: detoxDays === v ? (isDark ? '#FFF' : '#000') : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') }]}>
                                                    <Text variant="body" weight="semibold" color={detoxDays === v ? (isDark ? '#000' : '#FFF') : theme.colors.text}>{v}d</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[4] }}>
                                            <Text variant="body" color={theme.colors.textSecondary}>Custom:</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', borderRadius: 12, paddingHorizontal: spacing[3] }}>
                                                <TextInput
                                                    value={String(detoxDays)}
                                                    onChangeText={(t) => setDetoxDays(parseInt(t) || 0)}
                                                    keyboardType="number-pad"
                                                    style={{ color: isDark ? '#FFF' : '#000', fontSize: 18, fontWeight: '600', paddingVertical: spacing[2], minWidth: 50, textAlign: 'center' }}
                                                />
                                                <Text variant="body" weight="semibold" color={theme.colors.textSecondary}>days</Text>
                                            </View>
                                        </View>
                                    </>
                                )}

                                <TouchableOpacity onPress={handleConfirmLimit} style={[styles.confirmButton, { backgroundColor: isDark ? '#FFF' : '#000' }]} activeOpacity={0.8}>
                                    <Text variant="body" weight="bold" color={isDark ? '#000' : '#FFF'}>Set Limit</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                </View>
            </Modal>

            {/* Detail Modal */}
            <Modal visible={showDetail} animationType="slide" transparent>
                <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.98)' }]}>
                    <View style={styles.modalHeader}>
                        <Text variant="h3" weight="bold">Limit Details</Text>
                        <TouchableOpacity onPress={() => setShowDetail(false)}><XIcon size={24} color={isDark ? '#FFF' : '#000'} /></TouchableOpacity>
                    </View>
                    {detailLimit && (
                        <View style={{ flex: 1, padding: spacing[4] }}>
                            <View style={{ alignItems: 'center', marginBottom: spacing[6] }}>
                                {detailLimit.icon ? (
                                    <Image source={{ uri: `data:image/png;base64,${detailLimit.icon}` }} style={{ width: 64, height: 64, borderRadius: 16 }} />
                                ) : (
                                    <View style={[styles.limitIconPlaceholder, { width: 64, height: 64, borderRadius: 16 }]}>
                                        <Text variant="h2" weight="bold">{detailLimit.appName.charAt(0)}</Text>
                                    </View>
                                )}
                                <Text variant="h3" weight="bold" style={{ marginTop: spacing[3] }}>{detailLimit.appName}</Text>
                                <View style={[styles.modeTag, { backgroundColor: detailLimit.mode === 'detox' ? 'rgba(255,68,68,0.15)' : 'rgba(0,122,255,0.15)', marginTop: spacing[2] }]}>
                                    <Text variant="caption" weight="bold" color={detailLimit.mode === 'detox' ? '#FF4444' : '#007AFF'}>{detailLimit.mode === 'detox' ? 'DETOX MODE' : 'DAILY LIMIT'}</Text>
                                </View>
                            </View>

                            <GlassCard style={{ marginBottom: spacing[4] }}>
                                <View style={styles.settingRow}>
                                    <Text variant="body">Streak</Text>
                                    <Text variant="body" weight="bold" color="#FFD700">{detailLimit.streak} days</Text>
                                </View>
                                <View style={[styles.settingRow, styles.settingRowBorder, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                                    <Text variant="body">{detailLimit.mode === 'detox' ? 'Ends' : 'Limit'}</Text>
                                    <Text variant="body" color={theme.colors.textSecondary}>{detailLimit.mode === 'detox' ? new Date(detailLimit.detoxEndDate!).toLocaleDateString() : `${detailLimit.dailyLimitMinutes}m/day`}</Text>
                                </View>
                            </GlassCard>

                            <TouchableOpacity onPress={handleRemoveLimit} style={[styles.logoutBtn, { backgroundColor: isDark ? 'rgba(255,68,68,0.12)' : 'rgba(255,68,68,0.08)' }]} activeOpacity={0.7}>
                                <Text variant="body" weight="semibold" color="#FF4444">Remove Limit</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Modal>
        </ScrollView>
    );
};

// ============================================
// MAIN APP
// ============================================

const MainApp: React.FC = () => {
    const { theme, isDark } = useTheme();
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');

    useEffect(() => {
        BlockingModule?.startMonitoring?.();
        return () => { BlockingModule?.stopMonitoring?.(); };
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F', '#0C0C12'] : ['#FAFAFA', '#F5F5F7', '#F0F0F2']} style={StyleSheet.absoluteFillObject} />
            {activeTab === 'dashboard' && <DashboardTab isDark={isDark} />}
            {activeTab === 'limits' && <LimitsTab isDark={isDark} />}
            {activeTab === 'settings' && <SettingsTab isDark={isDark} onLogout={() => setActiveTab('dashboard')} />}
            <TabBar activeTab={activeTab} onTabPress={setActiveTab} isDark={isDark} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    tabBar: { flexDirection: 'row', paddingBottom: 28, paddingTop: 12, borderTopWidth: 1 },
    tabItem: { flex: 1, alignItems: 'center' },
    tabContent: { flex: 1 },
    tabContentInner: { paddingHorizontal: spacing[4], paddingTop: 56, paddingBottom: 20 },
    glassCard: { borderRadius: 20, padding: spacing[4], overflow: 'hidden' },
    bentoGrid: { marginBottom: spacing[4] },
    bentoBig: { marginBottom: spacing[3] },
    bentoSmallRow: { flexDirection: 'row', gap: spacing[3] },
    bentoSmall: { flex: 1 },
    section: { marginTop: spacing[4] },
    sectionLabel: { marginBottom: spacing[2], letterSpacing: 0.5 },
    appRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[3] },
    appIcon: { width: 40, height: 40, borderRadius: 10 },
    appIconPlaceholder: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    emptyState: { padding: spacing[6], borderRadius: 20, alignItems: 'center', marginTop: spacing[4] },
    limitIcon: { width: 48, height: 48, borderRadius: 12 },
    limitIconPlaceholder: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
    modeTag: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing[4], borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', marginTop: spacing[4] },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[3] },
    settingRowBorder: { borderTopWidth: 1 },
    logoutBtn: { flexDirection: 'row', padding: spacing[4], borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    modalOverlay: { flex: 1, paddingTop: 50 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[4], borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.2)' },
    modeButton: { flex: 1, padding: spacing[4], borderRadius: 16, borderWidth: 2, alignItems: 'center' },
    timeButton: { paddingVertical: spacing[3], paddingHorizontal: spacing[4], borderRadius: 12 },
    confirmButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing[4], borderRadius: 16, marginTop: spacing[4] },

    // ========== NEW LIQUID METAL DASHBOARD STYLES ==========
    dashboardContent: { paddingHorizontal: spacing[4], paddingTop: 56, paddingBottom: 100 },
    dashboardHeader: { marginBottom: spacing[5] },
    liquidText: { fontSize: 40, letterSpacing: -1 },
    metalCard: { borderRadius: 28, padding: spacing[5], marginBottom: spacing[4], shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.4, shadowRadius: 30, elevation: 10 },
    screenTimeBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing[3] },
    pulsingDot: { width: 6, height: 6, borderRadius: 3 },
    screenTimeRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing[2] },
    screenTimeNum: { fontSize: 72, fontWeight: '600', letterSpacing: -2 },
    screenTimeUnit: { fontSize: 28, fontWeight: '300', marginLeft: 4 },
    statsRow: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[4] },
    statCard: { flex: 1, borderRadius: 24, padding: spacing[4], alignItems: 'center', justifyContent: 'center', height: 140, shadowColor: '#000', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 },
    statIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: spacing[3] },
    viewAllBtn: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: 20, borderWidth: 1 },
    appSlot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[3], borderRadius: 18, marginBottom: spacing[2] },
    appSlotLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], flex: 1 },
    appSlotIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    appSlotRight: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
    appProgressBar: { width: 60, height: 4, borderRadius: 2, overflow: 'hidden' },
    appProgressFill: { height: '100%', borderRadius: 2 },
    weeklyChart: { flexDirection: 'row', height: 140 },
    weeklyLabels: { justifyContent: 'space-between', paddingBottom: 24, paddingRight: spacing[2] },
    weeklyBars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 },
    weeklyBarContainer: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
    weeklyBar: { width: '100%', borderRadius: 3 },
});

export default MainApp;
