import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    NativeModules,
    Animated,
    Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { spacing } from '../theme/theme';
import { Text } from '../components';

const { width, height } = Dimensions.get('window');
const { PermissionsModule } = NativeModules;

type Tab = 'dashboard' | 'limits' | 'settings';

interface AppData {
    packageName: string;
    appName: string;
    usageMinutes: number;
    icon?: string;
    limit?: number;
}

// ============================================
// PROFESSIONAL SVG-STYLE ICONS
// ============================================

const DashboardIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => (
    <View style={styles.navIcon}>
        <View style={[styles.iconGrid]}>
            <View style={[styles.iconGridItem, { backgroundColor: color, opacity: active ? 1 : 0.4 }]} />
            <View style={[styles.iconGridItem, { backgroundColor: color, opacity: active ? 1 : 0.4 }]} />
            <View style={[styles.iconGridItem, { backgroundColor: color, opacity: active ? 1 : 0.4 }]} />
            <View style={[styles.iconGridItem, { backgroundColor: color, opacity: active ? 1 : 0.4 }]} />
        </View>
    </View>
);

const LimitsIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => (
    <View style={styles.navIcon}>
        <View style={[styles.iconClock, { borderColor: color, opacity: active ? 1 : 0.4 }]}>
            <View style={[styles.iconClockHand, { backgroundColor: color }]} />
            <View style={[styles.iconClockHandSmall, { backgroundColor: color }]} />
        </View>
    </View>
);

const SettingsIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => (
    <View style={styles.navIcon}>
        <View style={[styles.iconGear, { borderColor: color, opacity: active ? 1 : 0.4 }]}>
            <View style={[styles.iconGearCenter, { backgroundColor: color }]} />
        </View>
    </View>
);

// ============================================
// TAB BAR - PROFESSIONAL
// ============================================

interface TabBarProps {
    activeTab: Tab;
    onTabPress: (tab: Tab) => void;
    isDark: boolean;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress, isDark }) => {
    const color = isDark ? '#FFFFFF' : '#1A1A1A';

    const tabs: { key: Tab; label: string; Icon: React.FC<{ active: boolean; color: string }> }[] = [
        { key: 'dashboard', label: 'Overview', Icon: DashboardIcon },
        { key: 'limits', label: 'Limits', Icon: LimitsIcon },
        { key: 'settings', label: 'Settings', Icon: SettingsIcon },
    ];

    return (
        <View style={[styles.tabBar, { backgroundColor: isDark ? '#0A0A0F' : '#FAFAFA', borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        onPress={() => onTabPress(tab.key)}
                        style={styles.tabItem}
                        activeOpacity={0.7}
                    >
                        <tab.Icon active={isActive} color={color} />
                        <Text
                            variant="caption"
                            weight={isActive ? 'bold' : 'medium'}
                            color={isActive ? color : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')}
                            style={{ fontSize: 11 }}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

// ============================================
// DASHBOARD TAB - REAL DATA
// ============================================

const DashboardTab: React.FC<{ isDark: boolean; apps: AppData[] }> = ({ isDark, apps }) => {
    const { theme } = useTheme();

    // Calculate real stats from app data
    const totalDailyMinutes = apps.reduce((sum, app) => sum + app.usageMinutes, 0);
    const hours = Math.floor(totalDailyMinutes / 60);
    const minutes = totalDailyMinutes % 60;

    // Simulated streak (would come from storage in real app)
    const streak = 3;

    // Top 3 apps
    const topApps = apps.slice(0, 3);

    return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner}>
            {/* Header */}
            <View style={styles.header}>
                <Text variant="h2" weight="bold">Overview</Text>
                <Text variant="caption" color={theme.colors.textSecondary}>Your focus journey</Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                    <Text variant="caption" color={theme.colors.textSecondary}>Daily Screen Time</Text>
                    <Text variant="h2" weight="bold" style={{ marginTop: 4 }}>{hours}h {minutes}m</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                    <Text variant="caption" color={theme.colors.textSecondary}>Focus Streak</Text>
                    <Text variant="h2" weight="bold" style={{ marginTop: 4 }}>{streak} days</Text>
                </View>
            </View>

            {/* Top Apps Section */}
            <View style={styles.section}>
                <Text variant="body" weight="semibold" style={styles.sectionTitle}>Most Used Today</Text>
                {topApps.map((app, i) => (
                    <View key={i} style={[styles.appRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                        {app.icon ? (
                            <Image source={{ uri: `data:image/png;base64,${app.icon}` }} style={styles.appRowIcon} />
                        ) : (
                            <View style={[styles.appRowIconPlaceholder, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
                                <Text variant="caption" weight="bold">{app.appName.charAt(0)}</Text>
                            </View>
                        )}
                        <View style={styles.appRowInfo}>
                            <Text variant="body" weight="medium">{app.appName}</Text>
                            <Text variant="caption" color={theme.colors.textTertiary}>{Math.floor(app.usageMinutes / 60)}h {app.usageMinutes % 60}m</Text>
                        </View>
                        <View style={[styles.usageBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                            <View style={[styles.usageBarFill, { width: `${Math.min(100, (app.usageMinutes / (topApps[0]?.usageMinutes || 1)) * 100)}%`, backgroundColor: isDark ? '#FFFFFF' : '#1A1A1A' }]} />
                        </View>
                    </View>
                ))}
            </View>

            {/* Weekly Progress */}
            <View style={styles.section}>
                <Text variant="body" weight="semibold" style={styles.sectionTitle}>Weekly Progress</Text>
                <View style={[styles.chartCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                    <View style={styles.chartBars}>
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                            const barHeight = 20 + Math.random() * 60;
                            return (
                                <View key={i} style={styles.chartBarContainer}>
                                    <View style={[styles.chartBar, { height: barHeight, backgroundColor: i === 6 ? (isDark ? '#FFFFFF' : '#1A1A1A') : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)') }]} />
                                    <Text variant="caption" color={theme.colors.textTertiary} style={{ fontSize: 10 }}>{day}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

// ============================================
// LIMITS TAB - REAL DATA
// ============================================

const LimitsTab: React.FC<{ isDark: boolean; apps: AppData[] }> = ({ isDark, apps }) => {
    const { theme } = useTheme();

    // Show all apps with limits (up to 20)
    const limitApps = apps.slice(0, 20);

    return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner}>
            <View style={styles.header}>
                <Text variant="h2" weight="bold">App Limits</Text>
                <Text variant="caption" color={theme.colors.textSecondary}>Set daily time limits</Text>
            </View>

            {/* App Limits List */}
            <View style={styles.limitsList}>
                {limitApps.map((app, i) => {
                    const limit = app.limit || Math.round(app.usageMinutes * 0.5);
                    const progress = Math.min(100, (app.usageMinutes / limit) * 100);
                    const isOver = app.usageMinutes > limit;

                    return (
                        <TouchableOpacity key={i} activeOpacity={0.8} style={[styles.limitItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                            {app.icon ? (
                                <Image source={{ uri: `data:image/png;base64,${app.icon}` }} style={styles.limitIcon} />
                            ) : (
                                <View style={[styles.limitIconPlaceholder, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
                                    <Text variant="body" weight="bold">{app.appName.charAt(0)}</Text>
                                </View>
                            )}
                            <View style={styles.limitInfo}>
                                <View style={styles.limitHeader}>
                                    <Text variant="body" weight="semibold">{app.appName}</Text>
                                    <Text variant="caption" color={isOver ? '#FF4444' : theme.colors.textSecondary}>
                                        {app.usageMinutes}m / {limit}m
                                    </Text>
                                </View>
                                <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                                    <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: isOver ? '#FF4444' : (isDark ? '#FFFFFF' : '#1A1A1A') }]} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Add Limit Button */}
            <TouchableOpacity style={[styles.addButton, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]} activeOpacity={0.7}>
                <Text variant="body" weight="medium" color={theme.colors.textSecondary}>+ Add App Limit</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

// ============================================
// SETTINGS TAB - PROFESSIONAL
// ============================================

const SettingsTab: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const { theme } = useTheme();

    const settingsGroups = [
        {
            title: 'Focus Mode',
            items: [
                { label: 'Strict Mode', value: 'Off', type: 'toggle' },
                { label: 'Break Reminders', value: 'Every 25m', type: 'select' },
                { label: 'Focus Sessions', value: '45 min', type: 'select' },
            ],
        },
        {
            title: 'Notifications',
            items: [
                { label: 'Daily Summary', value: 'On', type: 'toggle' },
                { label: 'Limit Warnings', value: 'On', type: 'toggle' },
                { label: 'Milestone Alerts', value: 'On', type: 'toggle' },
            ],
        },
        {
            title: 'Account',
            items: [
                { label: 'Email', value: 'demo@blockd.app', type: 'info' },
                { label: 'Sync Data', value: '', type: 'action' },
            ],
        },
    ];

    return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner}>
            <View style={styles.header}>
                <Text variant="h2" weight="bold">Settings</Text>
            </View>

            {settingsGroups.map((group, gi) => (
                <View key={gi} style={styles.settingsGroup}>
                    <Text variant="caption" weight="semibold" color={theme.colors.textTertiary} style={styles.settingsGroupTitle}>
                        {group.title.toUpperCase()}
                    </Text>
                    <View style={[styles.settingsCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                        {group.items.map((item, ii) => (
                            <View key={ii} style={[styles.settingsItem, ii < group.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                                <Text variant="body">{item.label}</Text>
                                <Text variant="body" color={theme.colors.textSecondary}>{item.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ))}

            {/* Log Out */}
            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: isDark ? 'rgba(255,68,68,0.1)' : 'rgba(255,68,68,0.08)' }]} activeOpacity={0.7}>
                <Text variant="body" weight="medium" color="#FF4444">Log Out</Text>
            </TouchableOpacity>

            {/* Version */}
            <Text variant="caption" color={theme.colors.textTertiary} align="center" style={{ marginTop: spacing[6] }}>
                Blockd v1.0.0 • Made with focus
            </Text>
        </ScrollView>
    );
};

// ============================================
// MAIN APP SCREEN
// ============================================

const MainApp: React.FC = () => {
    const { theme, isDark } = useTheme();
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [apps, setApps] = useState<AppData[]>([]);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const data = await PermissionsModule.getAppUsageStats(7);
                if (data && data.length > 0) {
                    setApps(data);
                }
            } catch (e) {
                // Fallback data
                setApps([
                    { packageName: 'com.instagram', appName: 'Instagram', usageMinutes: 120 },
                    { packageName: 'com.tiktok', appName: 'TikTok', usageMinutes: 90 },
                    { packageName: 'com.youtube', appName: 'YouTube', usageMinutes: 75 },
                    { packageName: 'com.twitter', appName: 'X', usageMinutes: 45 },
                    { packageName: 'com.facebook', appName: 'Facebook', usageMinutes: 30 },
                ]);
            }
        };
        fetchApps();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient
                colors={isDark ? ['#050508', '#0A0A0F', '#101018', '#0C0C12', '#050508'] : ['#FAFAFA', '#F2F2F5', '#E8E8EC', '#F0F0F4', '#FAFAFA']}
                locations={[0, 0.25, 0.5, 0.75, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            {activeTab === 'dashboard' && <DashboardTab isDark={isDark} apps={apps} />}
            {activeTab === 'limits' && <LimitsTab isDark={isDark} apps={apps} />}
            {activeTab === 'settings' && <SettingsTab isDark={isDark} />}

            <TabBar activeTab={activeTab} onTabPress={setActiveTab} isDark={isDark} />
        </View>
    );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Nav Bar
    tabBar: {
        flexDirection: 'row',
        paddingBottom: 30,
        paddingTop: spacing[2],
        borderTopWidth: 1,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        gap: 2,
    },
    navIcon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },

    // Icon styles
    iconGrid: { width: 18, height: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
    iconGridItem: { width: 7, height: 7, borderRadius: 2 },
    iconClock: { width: 18, height: 18, borderWidth: 2, borderRadius: 9, position: 'relative' },
    iconClockHand: { position: 'absolute', width: 2, height: 5, top: 3, left: 6, borderRadius: 1 },
    iconClockHandSmall: { position: 'absolute', width: 4, height: 2, top: 6, left: 6, borderRadius: 1 },
    iconGear: { width: 18, height: 18, borderWidth: 2, borderRadius: 9 },
    iconGearCenter: { position: 'absolute', width: 6, height: 6, top: 4, left: 4, borderRadius: 3 },

    // Tab Content
    tabContent: { flex: 1 },
    tabContentInner: { padding: spacing[4], paddingTop: 30, paddingBottom: 20 },

    header: { marginBottom: spacing[5] },
    section: { marginTop: spacing[5] },
    sectionTitle: { marginBottom: spacing[3] },

    // Stats
    statsGrid: { flexDirection: 'row', gap: spacing[3] },
    statCard: { flex: 1, padding: spacing[4], borderRadius: 16 },

    // App Rows
    appRow: { flexDirection: 'row', alignItems: 'center', padding: spacing[3], borderRadius: 12, marginBottom: spacing[2] },
    appRowIcon: { width: 40, height: 40, borderRadius: 10 },
    appRowIconPlaceholder: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    appRowInfo: { flex: 1, marginLeft: spacing[3] },
    usageBar: { width: 60, height: 4, borderRadius: 2 },
    usageBarFill: { height: 4, borderRadius: 2 },

    // Chart
    chartCard: { padding: spacing[4], borderRadius: 16 },
    chartBars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 80 },
    chartBarContainer: { alignItems: 'center', gap: 4 },
    chartBar: { width: 24, borderRadius: 4 },

    // Limits
    limitsList: { gap: spacing[3] },
    limitItem: { flexDirection: 'row', alignItems: 'center', padding: spacing[4], borderRadius: 16 },
    limitIcon: { width: 48, height: 48, borderRadius: 12 },
    limitIconPlaceholder: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    limitInfo: { flex: 1, marginLeft: spacing[4] },
    limitHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] },
    progressBar: { height: 6, borderRadius: 3 },
    progressFill: { height: 6, borderRadius: 3 },
    addButton: { marginTop: spacing[4], padding: spacing[4], borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center' },

    // Settings
    settingsGroup: { marginBottom: spacing[5] },
    settingsGroupTitle: { marginBottom: spacing[2], letterSpacing: 1 },
    settingsCard: { borderRadius: 16, overflow: 'hidden' },
    settingsItem: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing[4] },
    logoutButton: { padding: spacing[4], borderRadius: 16, alignItems: 'center', marginTop: spacing[2] },
});

export default MainApp;
