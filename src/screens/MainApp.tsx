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
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { spacing } from '../theme/theme';
import { Text } from '../components';
import { AppPickerModal } from '../components/AppPickerModal';
import { LimitSetupModal } from '../components/LimitSetupModal';
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
// NAV BAR ICONS - CLEAN MINIMAL
// ============================================

const DashboardIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => (
    <View style={[navStyles.iconContainer, { opacity: active ? 1 : 0.4 }]}>
        <View style={navStyles.dashGrid}>
            <View style={[navStyles.dashSquare, { backgroundColor: color }]} />
            <View style={[navStyles.dashSquare, { backgroundColor: color }]} />
            <View style={[navStyles.dashSquare, { backgroundColor: color }]} />
            <View style={[navStyles.dashSquare, { backgroundColor: color }]} />
        </View>
    </View>
);

const LimitsIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => (
    <View style={[navStyles.iconContainer, { opacity: active ? 1 : 0.4 }]}>
        <View style={[navStyles.shieldOuter, { borderColor: color }]}>
            <View style={[navStyles.shieldInner, { backgroundColor: color }]} />
        </View>
    </View>
);

const SettingsIcon: React.FC<{ active: boolean; color: string }> = ({ active, color }) => (
    <View style={[navStyles.iconContainer, { opacity: active ? 1 : 0.4 }]}>
        <View style={[navStyles.gearOuter, { borderColor: color }]}>
            <View style={[navStyles.gearDot, { backgroundColor: color, top: -3 }]} />
            <View style={[navStyles.gearDot, { backgroundColor: color, bottom: -3 }]} />
            <View style={[navStyles.gearDot, { backgroundColor: color, left: -3 }]} />
            <View style={[navStyles.gearDot, { backgroundColor: color, right: -3 }]} />
        </View>
    </View>
);

const navStyles = StyleSheet.create({
    iconContainer: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
    dashGrid: { width: 18, height: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
    dashSquare: { width: 7, height: 7, borderRadius: 2 },
    shieldOuter: { width: 16, height: 18, borderWidth: 2, borderRadius: 3, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, justifyContent: 'center', alignItems: 'center' },
    shieldInner: { width: 4, height: 4, borderRadius: 2 },
    gearOuter: { width: 16, height: 16, borderWidth: 2, borderRadius: 8, position: 'relative' },
    gearDot: { position: 'absolute', width: 4, height: 4, borderRadius: 2 },
});

// ============================================
// TAB BAR
// ============================================

interface TabBarProps {
    activeTab: Tab;
    onTabPress: (tab: Tab) => void;
    isDark: boolean;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress, isDark }) => {
    const accent = isDark ? '#FFFFFF' : '#1A1A1A';

    const tabs = [
        { key: 'dashboard' as Tab, label: 'Overview', Icon: DashboardIcon },
        { key: 'limits' as Tab, label: 'Limits', Icon: LimitsIcon },
        { key: 'settings' as Tab, label: 'Settings', Icon: SettingsIcon },
    ];

    return (
        <View style={[styles.tabBar, {
            backgroundColor: isDark ? 'rgba(10,10,15,0.98)' : 'rgba(250,250,250,0.98)',
            borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
        }]}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        onPress={() => onTabPress(tab.key)}
                        style={styles.tabItem}
                        activeOpacity={0.7}
                    >
                        <tab.Icon active={isActive} color={accent} />
                        <Text
                            variant="caption"
                            weight={isActive ? 'bold' : 'medium'}
                            color={isActive ? accent : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)')}
                            style={{ fontSize: 10, marginTop: 4 }}
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
// DASHBOARD TAB - REAL DATA ONLY
// ============================================

const DashboardTab: React.FC<{ isDark: boolean; apps: AppData[] }> = ({ isDark, apps }) => {
    const { theme } = useTheme();
    const [limits, setLimits] = useState<AppLimit[]>([]);

    useEffect(() => {
        limitsService.loadLimits();
        const unsub = limitsService.subscribe(setLimits);
        return unsub;
    }, []);

    // Real calculations
    const totalMinutes = apps.reduce((sum, app) => sum + app.usageMinutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const activeLimits = limits.filter(l => l.isActive).length;
    const totalStreak = limits.filter(l => l.isActive).reduce((s, l) => s + l.streak, 0);

    const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    // Show ALL apps
    const allApps = apps;
    const maxUsage = allApps[0]?.usageMinutes || 1;

    return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <Text variant="h2" weight="bold">Overview</Text>
                <Text variant="caption" color={theme.colors.textSecondary}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </Text>
            </View>

            {/* Main Stats */}
            <View style={[styles.mainStatCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                <Text variant="caption" color={theme.colors.textSecondary}>Today's Screen Time</Text>
                <Text variant="h1" weight="bold" style={{ fontSize: 42, marginTop: 8 }}>{hours}h {minutes}m</Text>
                <View style={{ flexDirection: 'row', gap: spacing[4], marginTop: spacing[4] }}>
                    <View style={{ flex: 1 }}>
                        <Text variant="caption" color={theme.colors.textTertiary}>Active Limits</Text>
                        <Text variant="h3" weight="bold" style={{ marginTop: 2 }}>{activeLimits}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text variant="caption" color={theme.colors.textTertiary}>Apps Tracked</Text>
                        <Text variant="h3" weight="bold" style={{ marginTop: 2 }}>{apps.length}</Text>
                    </View>
                    {totalStreak > 0 && (
                        <View style={{ flex: 1 }}>
                            <Text variant="caption" color={theme.colors.textTertiary}>Total Streak</Text>
                            <Text variant="h3" weight="bold" color="#FFD700" style={{ marginTop: 2 }}>{totalStreak}d</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* All Apps List */}
            <View style={styles.section}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] }}>
                    <Text variant="body" weight="semibold">App Usage Today</Text>
                    <Text variant="caption" color={theme.colors.textTertiary}>{allApps.length} apps</Text>
                </View>
                {allApps.map((app, i) => (
                    <View key={i} style={[styles.appRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}>
                        {app.icon ? (
                            <Image source={{ uri: `data:image/png;base64,${app.icon}` }} style={styles.appIcon} />
                        ) : (
                            <View style={[styles.appIconPlaceholder, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                                <Text variant="caption" weight="bold">{app.appName.charAt(0)}</Text>
                            </View>
                        )}
                        <View style={{ flex: 1, marginLeft: spacing[3] }}>
                            <Text variant="body" weight="medium" numberOfLines={1}>{app.appName}</Text>
                            <View style={[styles.usageBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', marginTop: 6 }]}>
                                <View style={[styles.usageBarFill, { width: `${Math.min(100, (app.usageMinutes / maxUsage) * 100)}%`, backgroundColor: isDark ? '#FFF' : '#1A1A1A' }]} />
                            </View>
                        </View>
                        <Text variant="caption" weight="semibold" color={theme.colors.textSecondary} style={{ marginLeft: spacing[3] }}>
                            {formatTime(app.usageMinutes)}
                        </Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

// ============================================
// LIMITS TAB - FULLY FUNCTIONAL
// ============================================

const LimitsTab: React.FC<{ isDark: boolean; apps: AppData[] }> = ({ isDark, apps }) => {
    const { theme } = useTheme();
    const [limits, setLimits] = useState<AppLimit[]>([]);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [setupVisible, setSetupVisible] = useState(false);
    const [selectedApp, setSelectedApp] = useState<{ packageName: string; appName: string; usageMinutes: number; icon?: string } | null>(null);
    const [editingLimit, setEditingLimit] = useState<AppLimit | null>(null);

    useEffect(() => {
        limitsService.loadLimits();
        const unsub = limitsService.subscribe(setLimits);
        return unsub;
    }, []);

    const handleSelectApp = (app: { packageName: string; appName: string; usageMinutes: number; icon?: string }) => {
        setSelectedApp(app);
        setPickerVisible(false);
        setSetupVisible(true);
    };

    const handleConfirmLimit = async (mode: 'detox' | 'limit', value: number) => {
        if (!selectedApp) return;

        const newLimit: AppLimit = {
            packageName: selectedApp.packageName,
            appName: selectedApp.appName,
            icon: selectedApp.icon,
            mode,
            dailyLimitMinutes: mode === 'limit' ? value : undefined,
            detoxEndDate: mode === 'detox' ? new Date(Date.now() + value * 24 * 60 * 60 * 1000).toISOString() : undefined,
            streak: 0,
            startedAt: new Date().toISOString(),
            usedTodayMinutes: 0,
            lastResetDate: new Date().toISOString().split('T')[0],
            isActive: true,
        };

        await limitsService.saveLimit(newLimit);

        // Register with BlockingModule
        if (mode === 'detox') {
            BlockingModule?.addBlockedApp?.(selectedApp.packageName, 'detox', new Date(newLimit.detoxEndDate!).getTime(), 0);
        } else {
            BlockingModule?.addBlockedApp?.(selectedApp.packageName, 'limit', 0, value);
        }

        setSelectedApp(null);
        setSetupVisible(false);
    };

    const handleLimitPress = (limit: AppLimit) => {
        Alert.alert(
            limit.appName,
            `Mode: ${limit.mode === 'detox' ? 'Detox' : 'Daily Limit'}\n${limit.mode === 'detox' ? `Ends: ${new Date(limit.detoxEndDate!).toLocaleDateString()}` : `Limit: ${limit.dailyLimitMinutes}m/day`}\nStreak: ${limit.streak} days`,
            [
                { text: 'Keep', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => handleRemoveLimit(limit) },
            ]
        );
    };

    const handleRemoveLimit = async (limit: AppLimit) => {
        await limitsService.deleteLimit(limit.packageName);
        BlockingModule?.removeBlockedApp?.(limit.packageName);
    };

    const formatDaysRemaining = (endDate: string) => {
        const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        return `${days}d left`;
    };

    const existingPackages = limits.map(l => l.packageName);
    const activeLimits = limits.filter(l => l.isActive);

    return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text variant="h2" weight="bold">App Limits</Text>
                <Text variant="caption" color={theme.colors.textSecondary}>
                    {activeLimits.length === 0 ? 'Set limits to control usage' : `${activeLimits.length} active`}
                </Text>
            </View>

            {activeLimits.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                    <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
                        <View style={{ width: 24, height: 24, borderWidth: 3, borderRadius: 12, borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)' }} />
                    </View>
                    <Text variant="h3" weight="bold" align="center" style={{ marginTop: spacing[4] }}>No Limits Yet</Text>
                    <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ marginTop: spacing[2] }}>
                        Tap the button below to set{'\n'}your first app limit
                    </Text>
                </View>
            ) : (
                <View style={{ gap: spacing[3] }}>
                    {activeLimits.map((limit, i) => (
                        <TouchableOpacity
                            key={i}
                            activeOpacity={0.7}
                            onPress={() => handleLimitPress(limit)}
                            style={[styles.limitCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
                        >
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
                                        <Text variant="caption" weight="bold" color={limit.mode === 'detox' ? '#FF4444' : '#007AFF'}>
                                            {limit.mode === 'detox' ? 'DETOX' : 'LIMIT'}
                                        </Text>
                                    </View>
                                    <Text variant="caption" color={theme.colors.textSecondary}>
                                        {limit.mode === 'detox' ? formatDaysRemaining(limit.detoxEndDate!) : `${limit.dailyLimitMinutes}m/day`}
                                    </Text>
                                </View>
                            </View>
                            {limit.streak > 0 && (
                                <View style={{ alignItems: 'center' }}>
                                    <Text variant="h3" weight="bold" color="#FFD700">{limit.streak}</Text>
                                    <Text variant="caption" color={theme.colors.textTertiary}>days</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Add Button */}
            <TouchableOpacity
                onPress={() => setPickerVisible(true)}
                style={[styles.addButton, {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
                }]}
                activeOpacity={0.7}
            >
                <View style={[styles.addIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }]}>
                    <Text variant="h3" weight="bold">+</Text>
                </View>
                <Text variant="body" weight="semibold" style={{ marginLeft: spacing[3] }}>Add App Limit</Text>
            </TouchableOpacity>

            {/* Modals */}
            <AppPickerModal
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                onSelectApp={handleSelectApp}
                excludePackages={existingPackages}
            />

            {selectedApp && (
                <LimitSetupModal
                    visible={setupVisible}
                    onClose={() => { setSetupVisible(false); setSelectedApp(null); }}
                    onConfirm={handleConfirmLimit}
                    appName={selectedApp.appName}
                    appIcon={selectedApp.icon}
                    avgUsage={selectedApp.usageMinutes}
                />
            )}
        </ScrollView>
    );
};

// ============================================
// SETTINGS TAB - ONLY USEFUL BUTTONS
// ============================================

const SettingsTab: React.FC<{ isDark: boolean; onLogout: () => void }> = ({ isDark, onLogout }) => {
    const { theme } = useTheme();
    const user = auth().currentUser;

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await auth().signOut();
                    onLogout();
                }
            },
        ]);
    };

    const openPermissions = () => {
        Linking.openSettings();
    };

    return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text variant="h2" weight="bold">Settings</Text>
            </View>

            {/* Account */}
            <View style={styles.settingsSection}>
                <Text variant="caption" weight="semibold" color={theme.colors.textTertiary} style={styles.sectionLabel}>ACCOUNT</Text>
                <View style={[styles.settingsCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}>
                    <View style={styles.settingsRow}>
                        <Text variant="body">Email</Text>
                        <Text variant="body" color={theme.colors.textSecondary} numberOfLines={1} style={{ maxWidth: 180 }}>{user?.email || 'Not logged in'}</Text>
                    </View>
                    <View style={[styles.settingsRow, styles.settingsRowBorder, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                        <Text variant="body">Member Since</Text>
                        <Text variant="body" color={theme.colors.textSecondary}>
                            {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '-'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Permissions */}
            <View style={styles.settingsSection}>
                <Text variant="caption" weight="semibold" color={theme.colors.textTertiary} style={styles.sectionLabel}>PERMISSIONS</Text>
                <TouchableOpacity
                    style={[styles.settingsCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}
                    onPress={openPermissions}
                    activeOpacity={0.7}
                >
                    <View style={styles.settingsRow}>
                        <Text variant="body">Manage Permissions</Text>
                        <Text variant="body" color={theme.colors.textTertiary}>→</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* About */}
            <View style={styles.settingsSection}>
                <Text variant="caption" weight="semibold" color={theme.colors.textTertiary} style={styles.sectionLabel}>ABOUT</Text>
                <View style={[styles.settingsCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)' }]}>
                    <View style={styles.settingsRow}>
                        <Text variant="body">Version</Text>
                        <Text variant="body" color={theme.colors.textSecondary}>1.0.0</Text>
                    </View>
                    <TouchableOpacity style={[styles.settingsRow, styles.settingsRowBorder, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                        <Text variant="body">Privacy Policy</Text>
                        <Text variant="body" color={theme.colors.textTertiary}>→</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.settingsRow, styles.settingsRowBorder, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                        <Text variant="body">Terms of Service</Text>
                        <Text variant="body" color={theme.colors.textTertiary}>→</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Logout */}
            <TouchableOpacity
                onPress={handleLogout}
                style={[styles.logoutBtn, { backgroundColor: isDark ? 'rgba(255,68,68,0.12)' : 'rgba(255,68,68,0.08)' }]}
                activeOpacity={0.7}
            >
                <Text variant="body" weight="semibold" color="#FF4444">Logout</Text>
            </TouchableOpacity>

            <Text variant="caption" color={theme.colors.textTertiary} align="center" style={{ marginTop: spacing[6] }}>
                Blockd v1.0.0
            </Text>
        </ScrollView>
    );
};

// ============================================
// MAIN APP
// ============================================

const MainApp: React.FC = () => {
    const { theme, isDark } = useTheme();
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [apps, setApps] = useState<AppData[]>([]);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const data = await PermissionsModule.getAppUsageStats(1);
                if (data && data.length > 0) {
                    const sorted = data.sort((a: AppData, b: AppData) => b.usageMinutes - a.usageMinutes);
                    setApps(sorted);
                }
            } catch (e) {
                console.log('Error fetching apps:', e);
            }
        };
        fetchApps();

        // Start blocking service
        BlockingModule?.startMonitoring?.();

        return () => {
            BlockingModule?.stopMonitoring?.();
        };
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient
                colors={isDark ? ['#050508', '#0A0A0F', '#0C0C12'] : ['#FAFAFA', '#F5F5F7', '#F0F0F2']}
                style={StyleSheet.absoluteFillObject}
            />

            {activeTab === 'dashboard' && <DashboardTab isDark={isDark} apps={apps} />}
            {activeTab === 'limits' && <LimitsTab isDark={isDark} apps={apps} />}
            {activeTab === 'settings' && <SettingsTab isDark={isDark} onLogout={() => setActiveTab('dashboard')} />}

            <TabBar activeTab={activeTab} onTabPress={setActiveTab} isDark={isDark} />
        </View>
    );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    container: { flex: 1 },
    tabBar: { flexDirection: 'row', paddingBottom: 28, paddingTop: 12, borderTopWidth: 1 },
    tabItem: { flex: 1, alignItems: 'center', gap: 2 },
    tabContent: { flex: 1 },
    tabContentInner: { padding: spacing[4], paddingTop: 50, paddingBottom: 20 },

    header: { marginBottom: spacing[5] },
    section: { marginTop: spacing[4] },
    sectionLabel: { marginBottom: spacing[2], letterSpacing: 0.5 },

    // Stats
    mainStatCard: { padding: spacing[5], borderRadius: 20, marginBottom: spacing[4] },

    // Apps
    appRow: { flexDirection: 'row', alignItems: 'center', padding: spacing[3], borderRadius: 14, marginBottom: spacing[2] },
    appIcon: { width: 40, height: 40, borderRadius: 10 },
    appIconPlaceholder: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    usageBarBg: { height: 4, borderRadius: 2, width: '100%' },
    usageBarFill: { height: 4, borderRadius: 2 },

    // Limits
    emptyState: { padding: spacing[6], borderRadius: 20, alignItems: 'center', marginBottom: spacing[4] },
    emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
    limitCard: { flexDirection: 'row', alignItems: 'center', padding: spacing[4], borderRadius: 16 },
    limitIcon: { width: 48, height: 48, borderRadius: 12 },
    limitIconPlaceholder: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    modeTag: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
    addButton: { flexDirection: 'row', alignItems: 'center', padding: spacing[4], borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', marginTop: spacing[4] },
    addIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

    // Settings
    settingsSection: { marginBottom: spacing[5] },
    settingsCard: { borderRadius: 14, overflow: 'hidden' },
    settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing[4] },
    settingsRowBorder: { borderTopWidth: 1 },
    logoutBtn: { padding: spacing[4], borderRadius: 14, alignItems: 'center' },
});

export default MainApp;
