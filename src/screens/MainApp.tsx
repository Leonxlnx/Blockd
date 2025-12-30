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
    Text as RNText,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../theme';
import { spacing } from '../theme/theme';
import { Text } from '../components';
import { limitsService, AppLimit } from '../services/limitsService';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

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
// FLOATING TAB BAR (Premium Glass)
// ============================================

const TabBar: React.FC<{ activeTab: Tab; onTabPress: (tab: Tab) => void; isDark: boolean }> = ({ activeTab, onTabPress, isDark }) => {
    return (
        <View style={styles.floatingNavContainer}>
            <View style={[styles.floatingNavBar, {
                backgroundColor: isDark ? 'rgba(15,15,20,0.9)' : 'rgba(255,255,255,0.95)',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            }]}>
                <TouchableOpacity
                    style={[styles.floatingNavItem, activeTab === 'dashboard' && styles.floatingNavItemActive, activeTab === 'dashboard' && { backgroundColor: isDark ? '#FFF' : '#000' }]}
                    onPress={() => onTabPress('dashboard')}
                    activeOpacity={0.7}
                >
                    <Icon name="home" size={22} color={activeTab === 'dashboard' ? (isDark ? '#000' : '#FFF') : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.floatingNavItem, activeTab === 'limits' && styles.floatingNavItemActive, activeTab === 'limits' && { backgroundColor: isDark ? '#FFF' : '#000' }]}
                    onPress={() => onTabPress('limits')}
                    activeOpacity={0.7}
                >
                    <Icon name="shield" size={22} color={activeTab === 'limits' ? (isDark ? '#000' : '#FFF') : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.floatingNavItem, activeTab === 'settings' && styles.floatingNavItemActive, activeTab === 'settings' && { backgroundColor: isDark ? '#FFF' : '#000' }]}
                    onPress={() => onTabPress('settings')}
                    activeOpacity={0.7}
                >
                    <Icon name="settings" size={22} color={activeTab === 'settings' ? (isDark ? '#000' : '#FFF') : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')} />
                </TouchableOpacity>
            </View>
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
// DASHBOARD TAB (Premium Metal Design)
// ============================================

const DashboardTab: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const { theme } = useTheme();
    const [todayUsage, setTodayUsage] = useState<AppData[]>([]);
    const [unlockCount, setUnlockCount] = useState(0);
    const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
    const [limits, setLimits] = useState<AppLimit[]>([]);
    const [showAllApps, setShowAllApps] = useState(false);
    const [userName, setUserName] = useState('');
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    useEffect(() => {
        loadData();
        loadUserName();
        limitsService.loadLimits();
        const unsub = limitsService.subscribe(setLimits);
        return unsub;
    }, []);

    const loadUserName = async () => {
        try {
            const user = auth().currentUser;
            if (user) {
                const doc = await firestore().collection('users').doc(user.uid).get();
                if (doc.exists()) {
                    const data = doc.data();
                    setUserName(data?.name || data?.displayName || 'User');
                }
            }
        } catch (e) {
            console.log('Load user name error:', e);
        }
    };

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

    // Weekly chart - reorder so today is always rightmost
    const dayLabels = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
    const today = new Date().getDay();
    const todayIdx = today === 0 ? 6 : today - 1;

    // Reorder data so today is last
    const reorderedData: number[] = [];
    const reorderedLabels: string[] = [];
    for (let i = 0; i < 7; i++) {
        const idx = (todayIdx + 1 + i) % 7;
        reorderedData.push(weeklyData[idx] || 0);
        reorderedLabels.push(dayLabels[idx]);
    }
    const maxWeekly = Math.max(...reorderedData, 60);

    // Metal card gradient component with metallic edge
    const MetalCard: React.FC<{ children: React.ReactNode; style?: object }> = ({ children, style }) => (
        <View style={[styles.premiumCardOuter, style]}>
            <LinearGradient
                colors={isDark
                    ? ['rgba(60,60,70,1)', 'rgba(30,30,35,1)', 'rgba(20,20,25,1)']
                    : ['rgba(255,255,255,1)', 'rgba(240,240,245,1)', 'rgba(230,230,235,1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.premiumCardBorder}
            >
                <LinearGradient
                    colors={isDark
                        ? ['rgba(25,25,30,0.98)', 'rgba(15,15,18,0.99)']
                        : ['rgba(252,252,255,0.99)', 'rgba(245,245,250,0.98)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.premiumCardInner}
                >
                    {children}
                </LinearGradient>
            </LinearGradient>
        </View>
    );

    return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.dashboardContent} showsVerticalScrollIndicator={false}>
            {/* Header - Hello {Name} */}
            <View style={styles.dashboardHeader}>
                <Text variant="h1" weight="bold" style={{ fontSize: 34 }}>Hello, {userName || 'User'}</Text>
            </View>

            {/* Screen Time Card - CENTERED ALIGNMENT FIX */}
            <MetalCard>
                <View style={{ alignItems: 'center' }}>
                    <View style={styles.screenTimeBadge}>
                        <View style={[styles.pulsingDot, { backgroundColor: isDark ? '#FFF' : '#000' }]} />
                        <Text variant="caption" weight="bold" color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} style={{ letterSpacing: 1.5, fontSize: 10, textTransform: 'uppercase' }}>Screen Time</Text>
                    </View>
                    <View style={[styles.screenTimeRow, { justifyContent: 'center' }]}>
                        <RNText style={{ fontSize: 64, fontWeight: '700', color: isDark ? '#FFF' : '#000' }}>{hours}</RNText>
                        <RNText style={{ fontSize: 28, fontWeight: '300', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginLeft: 2, marginBottom: 8 }}>h</RNText>
                        <RNText style={{ fontSize: 64, fontWeight: '700', color: isDark ? '#FFF' : '#000', marginLeft: 12 }}>{minutes.toString().padStart(2, '0')}</RNText>
                        <RNText style={{ fontSize: 28, fontWeight: '300', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', marginLeft: 2, marginBottom: 8 }}>m</RNText>
                    </View>
                </View>
            </MetalCard>

            {/* Stats Row - CLEANER DESIGN */}
            <View style={styles.statsRow}>
                <MetalCard style={{ flex: 1, marginRight: spacing[2] }}>
                    <View style={styles.statContent}>
                        <Icon name="unlock" size={24} color={isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'} style={{ marginBottom: 4 }} />
                        <Text variant="h2" weight="bold" style={{ fontSize: 28 }}>{unlockCount}</Text>
                        <Text variant="caption" weight="bold" color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>Unlocks</Text>
                    </View>
                </MetalCard>
                <MetalCard style={{ flex: 1, marginHorizontal: spacing[1] }}>
                    <View style={styles.statContent}>
                        <Icon name="shield" size={24} color={isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'} style={{ marginBottom: 4 }} />
                        <Text variant="h2" weight="bold" style={{ fontSize: 28 }}>{activeLimits}</Text>
                        <Text variant="caption" weight="bold" color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>Limits</Text>
                    </View>
                </MetalCard>
                <MetalCard style={{ flex: 1, marginLeft: spacing[2] }}>
                    <View style={styles.statContent}>
                        <Icon name="zap" size={24} color={isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'} style={{ marginBottom: 4 }} />
                        <Text variant="h2" weight="bold" style={{ fontSize: 28 }}>{activeDetox}</Text>
                        <Text variant="caption" weight="bold" color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>Detox</Text>
                    </View>
                </MetalCard>
            </View>

            {/* Most Used Card */}
            <MetalCard>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
                    <Text variant="body" weight="bold">Most Used</Text>
                    <TouchableOpacity onPress={() => setShowAllApps(true)} style={[styles.viewAllBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                        <Text variant="caption" weight="bold" color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>View All</Text>
                    </TouchableOpacity>
                </View>
                {top3Apps.map((app, i) => {
                    const maxUsage = top3Apps[0]?.usageMinutes || 1;
                    const barWidth = Math.max(10, (app.usageMinutes / maxUsage) * 100);
                    return (
                        <View key={i} style={[styles.appSlot, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)' }]}>
                            <View style={styles.appSlotLeft}>
                                <View style={[styles.appSlotIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                                    {app.icon ? (
                                        <Image source={{ uri: `data:image/png;base64,${app.icon}` }} style={{ width: 22, height: 22, borderRadius: 5 }} />
                                    ) : (
                                        <Text variant="caption" weight="bold">{app.appName.charAt(0)}</Text>
                                    )}
                                </View>
                                <View>
                                    <Text variant="body" weight="semibold" numberOfLines={1} style={{ fontSize: 14 }}>{app.appName}</Text>
                                    <Text variant="caption" color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>App</Text>
                                </View>
                            </View>
                            <View style={styles.appSlotRight}>
                                <View style={[styles.appProgressBar, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.08)' }]}>
                                    <View style={[styles.appProgressFill, { width: `${barWidth}%`, backgroundColor: isDark ? '#FFF' : '#000' }]} />
                                </View>
                                <Text variant="body" weight="bold" style={{ fontSize: 13, minWidth: 55, textAlign: 'right' }}>{formatTime(app.usageMinutes)}</Text>
                            </View>
                        </View>
                    );
                })}
                {top3Apps.length === 0 && (
                    <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ padding: spacing[4] }}>No usage data yet</Text>
                )}
            </MetalCard>

            {/* Weekly Overview - LOGIC FIX: ONLY WHITE WHEN SELECTED */}
            <MetalCard style={{ marginBottom: 120 }}>
                <View style={{ marginBottom: spacing[4] }}>
                    <Text variant="body" weight="bold">Weekly Overview</Text>
                    <Text variant="caption" color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} style={{ marginTop: 4 }}>
                        Your average is <Text weight="bold" color={isDark ? '#FFF' : '#000'}>{avgHours}h</Text>
                    </Text>
                </View>
                <View style={styles.weeklyChart}>
                    <View style={styles.weeklyLabels}>
                        <Text variant="caption" color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} style={{ fontSize: 10 }}>4h</Text>
                        <Text variant="caption" color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} style={{ fontSize: 10 }}>2h</Text>
                        <Text variant="caption" color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} style={{ fontSize: 10 }}>0h</Text>
                    </View>
                    <View style={styles.weeklyBars}>
                        {reorderedData.map((val, i) => {
                            const barHeight = Math.max(8, (val / maxWeekly) * 100);
                            const isSelected = selectedDay === i;
                            const isToday = i === 6;

                            // Highlight: ONLY if selected. If not selected, use standard 'today' highlight or default.
                            // User request: "alles neutral erst wenn man anklickt weiß"
                            // So: All neutral. Only SELECTED is white. Today is just marked differently maybe?
                            // Let's make "Today" have slightly higher opacity but not full white unless selected.

                            return (
                                <TouchableOpacity
                                    key={i}
                                    style={styles.weeklyBarContainer}
                                    onPress={() => setSelectedDay(isSelected ? null : i)}
                                    activeOpacity={0.7}
                                >
                                    {isSelected && (
                                        <View style={[styles.weeklyTooltip, { backgroundColor: isDark ? '#FFF' : '#000' }]}>
                                            <Text variant="caption" weight="bold" color={isDark ? '#000' : '#FFF'} style={{ fontSize: 10 }}>
                                                {formatTime(val)}
                                            </Text>
                                        </View>
                                    )}
                                    <LinearGradient
                                        colors={isSelected
                                            ? ['#FFFFFF', '#CCCCCC'] // Selected = Bright White
                                            : isToday
                                                ? (isDark ? ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)'] : ['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.15)']) // Today = Slightly brighter
                                                : (isDark ? ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)'] : ['rgba(0,0,0,0.12)', 'rgba(0,0,0,0.06)']) // Others = Dim
                                        }
                                        style={[styles.weeklyBar, { height: `${barHeight}%` }]}
                                    />
                                    <Text
                                        variant="caption"
                                        weight={isSelected ? 'bold' : 'medium'}
                                        color={isSelected ? (isDark ? '#FFF' : '#000') : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')}
                                        style={{ fontSize: 9, marginTop: 6 }}
                                    >
                                        {reorderedLabels[i]}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </MetalCard>

            {/* All Apps Modal */}
            <Modal visible={showAllApps} animationType="slide" transparent>
                <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.98)' : 'rgba(255,255,255,0.98)' }]}>
                    <View style={styles.modalHeader}>
                        <Text variant="h3" weight="bold">All Apps</Text>
                        <TouchableOpacity onPress={() => setShowAllApps(false)}>
                            <Icon name="x" size={24} color={isDark ? '#FFF' : '#000'} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing[4] }}>
                        {todayUsage.map((app, i) => (
                            <View key={i} style={[styles.appSlot, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', marginBottom: spacing[2] }]}>
                                <View style={styles.appSlotLeft}>
                                    <View style={[styles.appSlotIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                                        {app.icon ? (
                                            <Image source={{ uri: `data:image/png;base64,${app.icon}` }} style={{ width: 22, height: 22, borderRadius: 5 }} />
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
// SETTINGS TAB (Premium Metal Design)
// ============================================

const SettingsTab: React.FC<{ isDark: boolean; onLogout: () => void }> = ({ isDark, onLogout }) => {
    const { theme } = useTheme();
    const user = auth().currentUser;
    const [privacyVisible, setPrivacyVisible] = useState(false);
    const [termsVisible, setTermsVisible] = useState(false);
    const [userName, setUserName] = useState('');
    const [editingName, setEditingName] = useState(false);
    const [tempName, setTempName] = useState('');
    const [logoutVisible, setLogoutVisible] = useState(false);

    useEffect(() => {
        loadUserName();
    }, []);

    const loadUserName = async () => {
        try {
            if (user) {
                const doc = await firestore().collection('users').doc(user.uid).get();
                if (doc.exists()) {
                    const data = doc.data();
                    setUserName(data?.name || data?.displayName || '');
                }
            }
        } catch (e) {
            console.log('Load user name error:', e);
        }
    };

    const saveName = async () => {
        try {
            if (user && tempName.trim()) {
                await firestore().collection('users').doc(user.uid).set({ name: tempName.trim() }, { merge: true });
                setUserName(tempName.trim());
            }
            setEditingName(false);
        } catch (e) {
            console.log('Save name error:', e);
        }
    };

    const handleLogout = async () => {
        setLogoutVisible(true);
    };

    const confirmLogout = async () => {
        try {
            await auth().signOut();
            setLogoutVisible(false);
            onLogout();
        } catch (e) {
            console.error("Logout failed", e);
            setLogoutVisible(false);
            onLogout();
        }
    };

    const openPermissions = () => Linking.openSettings();

    const privacyText = `Privacy Policy for Blockd
    
Last updated: December 2025

1. INFORMATION WE COLLECT
We collect minimal data to provide our services:
- Account Data: Email and name for authentication.
- Usage Stats: App usage time to track limits (stored locally and synced).
- Device Info: Model and OS version for debugging.

2. HOW WE USE YOUR INFORMATION
- To block apps when limits are reached.
- To display your usage statistics.
- To sync your preferences across devices.

3. DATA STORAGE & SECURITY
- Your data is encrypted in transit and at rest.
- We use Google Firebase for secure cloud storage.
- You can request data deletion at any time.

4. USER RIGHTS
You have the right to access, correct, or delete your data.

5. CONTACT
For privacy questions, please contact privacy@blockd.app`;

    const termsText = `Terms of Service for Blockd

Last updated: December 2025

1. ACCEPTANCE OF TERMS
By downloading and using Blockd, you agree to these terms.

2. SERVICE DESCRIPTION
Blockd provides tools to manage screen time and block apps. We are not responsible for missed notifications or restricted access during active blocks.

3. USAGE RULES
- You must be 13 years or older.
- You may not attempt to reverse engineer the app.
- You are responsible for your account security.

4. DISCLAIMER
The app is provided "as is". We do not guarantee 100% blocking if system restrictions change.

5. TERMINATION
We reserve the right to terminate accounts that violate these terms.`;

    // MetalCard component for settings - REDUCED PADDING
    const SettingsCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <View style={{ marginBottom: spacing[2], shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 }}>
            <LinearGradient
                colors={isDark ? ['rgba(50,50,55,1)', 'rgba(30,30,35,1)'] : ['rgba(255,255,255,1)', 'rgba(245,245,250,1)']}
                style={{ borderRadius: 20, padding: 1 }}
            >
                <LinearGradient
                    colors={isDark ? ['rgba(25,25,30,0.98)', 'rgba(18,18,22,0.99)'] : ['rgba(252,252,255,0.99)', 'rgba(248,248,252,0.98)']}
                    style={{ borderRadius: 19, padding: spacing[3] }}
                >
                    {children}
                </LinearGradient>
            </LinearGradient>
        </View>
    );

    return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.dashboardContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.dashboardHeader}>
                <Text variant="h1" weight="bold" style={{ fontSize: 34 }}>Settings</Text>
            </View>

            {/* Profile Section */}
            <Text variant="caption" weight="bold" color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} style={{ letterSpacing: 1.5, fontSize: 10, textTransform: 'uppercase', marginBottom: spacing[2] }}>PROFILE</Text>
            <SettingsCard>
                <View style={[styles.settingRow, { paddingVertical: spacing[2] }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
                        <Icon name="user" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
                        <Text variant="body" weight="medium">Name</Text>
                    </View>
                    {editingName ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
                            <TextInput
                                value={tempName}
                                onChangeText={setTempName}
                                placeholder="Enter name"
                                placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                                style={{
                                    color: isDark ? '#FFF' : '#000',
                                    minWidth: 100,
                                    maxWidth: 150,
                                    textAlign: 'right',
                                    paddingVertical: 8,
                                    paddingHorizontal: 12,
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                                    borderRadius: 8,
                                    fontSize: 14,
                                }}
                                autoFocus
                                returnKeyType="done"
                                onSubmitEditing={saveName}
                            />
                            <TouchableOpacity onPress={saveName} style={{ padding: 4 }}>
                                <Icon name="check" size={18} color="#22C55E" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setEditingName(false)} style={{ padding: 4 }}>
                                <Icon name="x" size={18} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => { setTempName(userName); setEditingName(true); }} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
                            <Text variant="body" color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}>{userName || 'Set name'}</Text>
                            <Icon name="edit-2" size={16} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} />
                        </TouchableOpacity>
                    )}
                </View>
                <View style={[styles.settingRow, styles.settingRowBorder, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', paddingVertical: spacing[2] }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
                        <Icon name="mail" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
                        <Text variant="body" weight="medium">Email</Text>
                    </View>
                    <Text variant="body" color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} numberOfLines={1} style={{ maxWidth: 160 }}>{user?.email || 'Not logged in'}</Text>
                </View>
            </SettingsCard>

            {/* App Section */}
            <Text variant="caption" weight="bold" color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} style={{ letterSpacing: 1.5, fontSize: 10, textTransform: 'uppercase', marginBottom: spacing[2], marginTop: spacing[3] }}>APP</Text>
            <SettingsCard>
                <TouchableOpacity style={[styles.settingRow, { paddingVertical: spacing[2] }]} onPress={openPermissions}>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
                        <Icon name="shield" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
                        <Text variant="body" weight="medium">Permissions</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} />
                </TouchableOpacity>
                <View style={[styles.settingRow, styles.settingRowBorder, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
                        <Icon name="info" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
                        <Text variant="body" weight="medium">Version</Text>
                    </View>
                    <Text variant="body" color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}>1.0.0</Text>
                </View>
            </SettingsCard>

            {/* Legal Section */}
            <Text variant="caption" weight="bold" color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} style={{ letterSpacing: 1.5, fontSize: 10, textTransform: 'uppercase', marginBottom: spacing[2], marginTop: spacing[3] }}>LEGAL</Text>
            <SettingsCard>
                <TouchableOpacity style={styles.settingRow} onPress={() => setPrivacyVisible(true)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
                        <Icon name="lock" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
                        <Text variant="body" weight="medium">Privacy Policy</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.settingRow, styles.settingRowBorder, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]} onPress={() => setTermsVisible(true)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
                        <Icon name="file-text" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} />
                        <Text variant="body" weight="medium">Terms of Service</Text>
                    </View>
                    <Icon name="chevron-right" size={20} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} />
                </TouchableOpacity>
            </SettingsCard>

            {/* Logout Button */}
            <TouchableOpacity onPress={handleLogout} activeOpacity={0.7} style={{ marginTop: spacing[4], marginBottom: 120 }}>
                <LinearGradient
                    colors={['rgba(255,68,68,0.15)', 'rgba(255,68,68,0.08)']}
                    style={{ height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Text variant="body" weight="bold" color="#FF4444">Logout</Text>
                </LinearGradient>
            </TouchableOpacity>

            {/* Modals */}
            <Modal visible={privacyVisible} animationType="slide" transparent>
                <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.98)' }]}>
                    <View style={styles.modalHeader}>
                        <Text variant="h3" weight="bold">Privacy Policy</Text>
                        <TouchableOpacity onPress={() => setPrivacyVisible(false)}><Icon name="x" size={24} color={isDark ? '#FFF' : '#000'} /></TouchableOpacity>
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
                        <TouchableOpacity onPress={() => setTermsVisible(false)}><Icon name="x" size={24} color={isDark ? '#FFF' : '#000'} /></TouchableOpacity>
                    </View>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing[4] }}>
                        <Text variant="body" color={theme.colors.textSecondary} style={{ lineHeight: 24 }}>{termsText}</Text>
                    </ScrollView>
                </View>
            </Modal>

            {/* Custom Logout Modal */}
            <Modal visible={logoutVisible} animationType="fade" transparent>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: spacing[4] }}>
                    <View style={{ backgroundColor: isDark ? '#1A1A1F' : '#FFFFFF', borderRadius: 24, padding: spacing[5], width: '100%', maxWidth: 320, alignItems: 'center' }}>
                        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,68,68,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing[4] }}>
                            <Icon name="log-out" size={28} color="#FF4444" />
                        </View>
                        <Text variant="h3" weight="bold" align="center" style={{ marginBottom: spacing[2] }}>Logout?</Text>
                        <Text variant="body" color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} align="center" style={{ marginBottom: spacing[5] }}>Are you sure you want to logout? You'll need to sign in again.</Text>
                        <View style={{ flexDirection: 'row', gap: spacing[3], width: '100%' }}>
                            <TouchableOpacity onPress={() => setLogoutVisible(false)} style={{ flex: 1, paddingVertical: spacing[3], backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', borderRadius: 12, alignItems: 'center' }}>
                                <Text variant="body" weight="semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={confirmLogout} style={{ flex: 1, paddingVertical: spacing[3], backgroundColor: '#FF4444', borderRadius: 12, alignItems: 'center' }}>
                                <Text variant="body" weight="bold" color="#FFF">Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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

    // Premium LimitCard component
    const LimitCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <View style={{ marginBottom: spacing[2], shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 }}>
            <LinearGradient
                colors={isDark ? ['rgba(50,50,55,1)', 'rgba(30,30,35,1)'] : ['rgba(255,255,255,1)', 'rgba(245,245,250,1)']}
                style={{ borderRadius: 18, padding: 1 }}
            >
                <LinearGradient
                    colors={isDark ? ['rgba(25,25,30,0.98)', 'rgba(18,18,22,0.99)'] : ['rgba(252,252,255,0.99)', 'rgba(248,248,252,0.98)']}
                    style={{ borderRadius: 17, padding: spacing[3], flexDirection: 'row', alignItems: 'center' }}
                >
                    {children}
                </LinearGradient>
            </LinearGradient>
        </View>
    );

    return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.dashboardContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.dashboardHeader}>
                <Text variant="h1" weight="bold" style={{ fontSize: 34 }}>Limits</Text>
                <Text variant="body" color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} style={{ marginTop: spacing[1] }}>
                    {activeLimits.length} active {activeLimits.length === 1 ? 'limit' : 'limits'}
                </Text>
            </View>

            {activeLimits.length === 0 ? (
                <View style={{ marginBottom: spacing[3], shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 6 }}>
                    <LinearGradient
                        colors={isDark ? ['rgba(40,40,45,1)', 'rgba(25,25,30,1)'] : ['rgba(255,255,255,1)', 'rgba(248,248,252,1)']}
                        style={{ borderRadius: 20, padding: spacing[6], alignItems: 'center' }}
                    >
                        <Icon name="lock" size={44} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'} />
                        <Text variant="h3" weight="bold" align="center" style={{ marginTop: spacing[3] }}>No Limits Yet</Text>
                        <Text variant="body" color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'} align="center" style={{ marginTop: spacing[2] }}>
                            Add your first limit to start{'\n'}controlling your screen time
                        </Text>
                    </LinearGradient>
                </View>
            ) : (
                <View style={{ gap: spacing[2] }}>
                    {activeLimits.map((limit, i) => (
                        <TouchableOpacity key={i} activeOpacity={0.7} onPress={() => handleLimitPress(limit)}>
                            <LimitCard>
                                {limit.icon ? (
                                    <Image source={{ uri: `data:image/png;base64,${limit.icon}` }} style={{ width: 44, height: 44, borderRadius: 12 }} />
                                ) : (
                                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text variant="body" weight="bold">{limit.appName.charAt(0)}</Text>
                                    </View>
                                )}
                                <View style={{ flex: 1, marginLeft: spacing[3] }}>
                                    <Text variant="body" weight="semibold">{limit.appName}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: 4 }}>
                                        <View style={{ paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4, backgroundColor: limit.mode === 'detox' ? 'rgba(255,68,68,0.15)' : 'rgba(0,122,255,0.15)' }}>
                                            <Text variant="caption" weight="bold" color={limit.mode === 'detox' ? '#FF4444' : '#007AFF'} style={{ fontSize: 9 }}>
                                                {limit.mode === 'detox' ? 'DETOX' : 'LIMIT'}
                                            </Text>
                                        </View>
                                        <Text variant="caption" color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}>
                                            {limit.mode === 'detox' ? formatDaysRemaining(limit.detoxEndDate!) : `${limit.dailyLimitMinutes}m/day`}
                                        </Text>
                                    </View>
                                </View>
                                {limit.streak > 0 && (
                                    <View style={{ alignItems: 'center', marginRight: spacing[2] }}>
                                        <Text variant="h3" weight="bold" color="#FFD700">{limit.streak}</Text>
                                        <Text variant="caption" color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'} style={{ fontSize: 9 }}>days</Text>
                                    </View>
                                )}
                                <Icon name="chevron-right" size={18} color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'} />
                            </LimitCard>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Add Limit Button */}
            <TouchableOpacity onPress={() => setShowPicker(true)} activeOpacity={0.7} style={{ marginTop: spacing[3] }}>
                <LinearGradient
                    colors={isDark ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)'] : ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.02)']}
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing[4], borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }}
                >
                    <Icon name="plus" size={22} color={isDark ? '#FFF' : '#000'} />
                    <Text variant="body" weight="semibold" style={{ marginLeft: spacing[2] }}>Add Limit</Text>
                </LinearGradient>
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

                            <TouchableOpacity onPress={handleRemoveLimit} activeOpacity={0.7} style={{ marginTop: spacing[2] }}>
                                <LinearGradient
                                    colors={['rgba(255,68,68,0.15)', 'rgba(255,68,68,0.08)']}
                                    style={{ height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2] }}
                                >
                                    <Icon name="trash-2" size={18} color="#FF4444" />
                                    <Text variant="body" weight="bold" color="#FF4444">Remove Limit</Text>
                                </LinearGradient>
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
            <LinearGradient colors={isDark ? ['#050508', '#080810', '#0A0A12', '#080810', '#050508'] : ['#FAFAFA', '#F5F5F7', '#F0F0F2']} locations={isDark ? [0, 0.25, 0.5, 0.75, 1] : undefined} style={StyleSheet.absoluteFillObject} />
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
    screenTimeRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing[1] },
    screenTimeNum: { fontSize: 72, fontWeight: '600', letterSpacing: -2 },
    screenTimeUnit: { fontSize: 28, fontWeight: '300', marginLeft: 4 },
    statsRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[4] },
    statCard: { flex: 1, borderRadius: 24, padding: spacing[4], alignItems: 'center', justifyContent: 'center', height: 140, shadowColor: '#000', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 },
    statIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: spacing[3] },
    viewAllBtn: { paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: 20, borderWidth: 1 },
    appSlot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[3], borderRadius: 18, marginBottom: spacing[2] },
    appSlotLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], flex: 1 },
    appSlotIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    appSlotRight: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
    appProgressBar: { width: 60, height: 4, borderRadius: 2, overflow: 'hidden' },
    appProgressFill: { height: '100%', borderRadius: 2 },
    weeklyChart: { flexDirection: 'row', height: 140, marginTop: spacing[4] },
    weeklyLabels: { justifyContent: 'space-between', paddingBottom: 24, paddingRight: spacing[2] },
    weeklyBars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 },
    weeklyBarContainer: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
    weeklyBar: { width: '100%', borderRadius: 4 },
    weeklyTooltip: { position: 'absolute', top: -28, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, zIndex: 10 },

    // Premium Cards with Metallic Edge
    premiumCardOuter: { marginBottom: spacing[2], shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 8 },
    premiumCardBorder: { borderRadius: 20, padding: 1 },
    premiumCardInner: { borderRadius: 19, padding: spacing[3] },
    premiumCard: { borderRadius: 20, padding: spacing[3], marginBottom: spacing[2], shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 6 },
    cardInnerBorder: { borderWidth: 1, borderRadius: 18, padding: spacing[3], margin: -spacing[3] },
    statContent: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[1] },

    // Floating Nav
    floatingNavContainer: { position: 'absolute', bottom: 24, left: 24, right: 24 },
    floatingNavBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, borderRadius: 24, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.4, shadowRadius: 30, elevation: 15 },
    floatingNavItem: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    floatingNavItemActive: { shadowColor: '#FFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 10 },
});

export default MainApp;
