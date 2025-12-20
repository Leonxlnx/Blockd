import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    StatusBar,
    ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { spacing } from '../theme/theme';
import { Text } from '../components';

const { width, height } = Dimensions.get('window');

type Tab = 'dashboard' | 'limits' | 'settings';

// ============================================
// TAB BAR
// ============================================

interface TabBarProps {
    activeTab: Tab;
    onTabPress: (tab: Tab) => void;
    isDark: boolean;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress, isDark }) => {
    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: 'dashboard', label: 'Dashboard', icon: '📊' },
        { key: 'limits', label: 'Limits', icon: '⏰' },
        { key: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <View style={[styles.tabBar, { backgroundColor: isDark ? '#0A0A0F' : '#FAFAFA', borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab.key}
                    onPress={() => onTabPress(tab.key)}
                    style={styles.tabItem}
                    activeOpacity={0.7}
                >
                    <Text variant="h3" align="center" style={{ opacity: activeTab === tab.key ? 1 : 0.5 }}>{tab.icon}</Text>
                    <Text
                        variant="caption"
                        weight={activeTab === tab.key ? 'bold' : 'medium'}
                        color={activeTab === tab.key ? (isDark ? '#FFFFFF' : '#1A1A1A') : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')}
                    >
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

// ============================================
// DASHBOARD TAB
// ============================================

const DashboardTab: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const { theme } = useTheme();

    return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner}>
            <Text variant="h1" weight="bold" style={styles.tabTitle}>Dashboard</Text>
            <Text variant="body" color={theme.colors.textSecondary}>Your focus stats will appear here.</Text>

            {/* Stats Cards Placeholder */}
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                    <Text variant="h2" weight="bold">0h</Text>
                    <Text variant="caption" color={theme.colors.textSecondary}>Saved today</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                    <Text variant="h2" weight="bold">0</Text>
                    <Text variant="caption" color={theme.colors.textSecondary}>Day streak</Text>
                </View>
            </View>

            {/* Weekly Chart Placeholder */}
            <View style={[styles.chartCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                <Text variant="body" weight="semibold" style={{ marginBottom: spacing[3] }}>Weekly Progress</Text>
                <View style={styles.chartBars}>
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <View key={i} style={styles.chartBarContainer}>
                            <View style={[styles.chartBar, { height: 20 + Math.random() * 60, backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]} />
                            <Text variant="caption" color={theme.colors.textTertiary}>{day}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

// ============================================
// LIMITS TAB
// ============================================

const LimitsTab: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const { theme } = useTheme();

    const apps = [
        { name: 'Instagram', limit: '30 min', used: '12 min' },
        { name: 'TikTok', limit: '20 min', used: '5 min' },
        { name: 'YouTube', limit: '45 min', used: '30 min' },
    ];

    return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner}>
            <Text variant="h1" weight="bold" style={styles.tabTitle}>App Limits</Text>
            <Text variant="body" color={theme.colors.textSecondary}>Manage your daily app limits.</Text>

            {/* App Limits List */}
            <View style={styles.limitsList}>
                {apps.map((app, i) => (
                    <View key={i} style={[styles.limitItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                        <View style={styles.limitItemLeft}>
                            <View style={[styles.appIconPlaceholder, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]}>
                                <Text variant="body" weight="bold">{app.name.charAt(0)}</Text>
                            </View>
                            <View>
                                <Text variant="body" weight="semibold">{app.name}</Text>
                                <Text variant="caption" color={theme.colors.textTertiary}>{app.used} / {app.limit}</Text>
                            </View>
                        </View>
                        <Text variant="caption" weight="semibold" color={theme.colors.textSecondary}>Edit</Text>
                    </View>
                ))}
            </View>

            {/* Add Limit Button */}
            <TouchableOpacity style={[styles.addButton, { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]} activeOpacity={0.7}>
                <Text variant="body" weight="semibold">+ Add App Limit</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

// ============================================
// SETTINGS TAB
// ============================================

const SettingsTab: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const { theme } = useTheme();

    const settings = [
        { label: 'Notifications', value: 'On' },
        { label: 'Dark Mode', value: 'System' },
        { label: 'Strict Mode', value: 'Off' },
        { label: 'Break Reminders', value: 'Every 30 min' },
    ];

    return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner}>
            <Text variant="h1" weight="bold" style={styles.tabTitle}>Settings</Text>

            {/* Settings List */}
            <View style={styles.settingsList}>
                {settings.map((setting, i) => (
                    <View key={i} style={[styles.settingItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
                        <Text variant="body">{setting.label}</Text>
                        <Text variant="body" color={theme.colors.textSecondary}>{setting.value}</Text>
                    </View>
                ))}
            </View>

            {/* Account Section */}
            <Text variant="body" weight="semibold" style={styles.sectionTitle} color={theme.colors.textSecondary}>Account</Text>
            <View style={styles.settingsList}>
                <View style={[styles.settingItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
                    <Text variant="body">Email</Text>
                    <Text variant="body" color={theme.colors.textSecondary}>demo@blockd.app</Text>
                </View>
                <TouchableOpacity style={styles.settingItem}>
                    <Text variant="body" color="#FF4444">Log Out</Text>
                </TouchableOpacity>
            </View>

            {/* Version */}
            <Text variant="caption" color={theme.colors.textTertiary} align="center" style={{ marginTop: spacing[6] }}>
                Blockd v1.0.0
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

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient
                colors={isDark ? ['#050508', '#0A0A0F', '#101018', '#0C0C12', '#050508'] : ['#FAFAFA', '#F2F2F5', '#E8E8EC', '#F0F0F4', '#FAFAFA']}
                locations={[0, 0.25, 0.5, 0.75, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            {activeTab === 'dashboard' && <DashboardTab isDark={isDark} />}
            {activeTab === 'limits' && <LimitsTab isDark={isDark} />}
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

    tabBar: {
        flexDirection: 'row',
        paddingBottom: 30,
        paddingTop: spacing[3],
        borderTopWidth: 1,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },

    tabContent: { flex: 1 },
    tabContentInner: { padding: spacing[5], paddingTop: 60 },
    tabTitle: { marginBottom: spacing[2] },

    statsGrid: {
        flexDirection: 'row',
        gap: spacing[4],
        marginTop: spacing[5],
    },
    statCard: {
        flex: 1,
        padding: spacing[4],
        borderRadius: 16,
        alignItems: 'center',
    },

    chartCard: {
        marginTop: spacing[5],
        padding: spacing[4],
        borderRadius: 16,
    },
    chartBars: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 100,
    },
    chartBarContainer: {
        alignItems: 'center',
        gap: 4,
    },
    chartBar: {
        width: 28,
        borderRadius: 4,
    },

    limitsList: {
        marginTop: spacing[5],
        gap: spacing[3],
    },
    limitItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing[4],
        borderRadius: 16,
    },
    limitItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    appIconPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButton: {
        marginTop: spacing[4],
        padding: spacing[4],
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
    },

    settingsList: {
        marginTop: spacing[4],
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing[4],
        borderBottomWidth: 1,
    },
    sectionTitle: {
        marginTop: spacing[6],
        marginBottom: spacing[2],
    },
});

export default MainApp;
