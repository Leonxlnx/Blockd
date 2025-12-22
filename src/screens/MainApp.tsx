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
    Modal,
    TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { spacing } from '../theme/theme';
import { Text } from '../components';
import { limitsService, AppLimit } from '../services/limitsService';
import auth from '@react-native-firebase/auth';
import { LayoutGrid, Shield, Settings, Plus, ChevronRight, Clock, Flame, X, Check, Trash2, LogOut } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const { PermissionsModule, BlockingModule } = NativeModules;

type Tab = 'dashboard' | 'limits' | 'settings';

interface AppData {
    packageName: string;
    appName: string;
    usageMinutes: number;
    icon?: string;
}

// ============================================
// GLASS CARD COMPONENT
// ============================================
const GlassCard: React.FC<{ isDark: boolean; style?: any; children: React.ReactNode }> = ({ isDark, style, children }) => (
    <View style={[styles.glassCard, {
        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    }, style]}>
        {children}
    </View>
);

// ============================================
// TAB BAR - PREMIUM
// ============================================
interface TabBarProps { activeTab: Tab; onTabPress: (tab: Tab) => void; isDark: boolean; }

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress, isDark }) => {
    const accent = isDark ? '#FFFFFF' : '#1A1A1A';
    const inactive = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';

    const tabs = [
        { key: 'dashboard' as Tab, label: 'Overview', Icon: LayoutGrid },
        { key: 'limits' as Tab, label: 'Limits', Icon: Shield },
        { key: 'settings' as Tab, label: 'Settings', Icon: Settings },
    ];

    return (
        <View style={[styles.tabBar, {
            backgroundColor: isDark ? 'rgba(10,10,15,0.95)' : 'rgba(250,250,250,0.95)',
            borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
        }]}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                    <TouchableOpacity key={tab.key} onPress={() => onTabPress(tab.key)} style={styles.tabItem} activeOpacity={0.7}>
                        <tab.Icon size={22} color={isActive ? accent : inactive} strokeWidth={isActive ? 2.5 : 2} />
                        <Text variant="caption" weight={isActive ? 'bold' : 'medium'} color={isActive ? accent : inactive} style={{ fontSize: 10, marginTop: 4 }}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

// ============================================
// DASHBOARD TAB - BENTO GRID + REAL DATA
// ============================================
const DashboardTab: React.FC<{ isDark: boolean; apps: AppData[]; limits: AppLimit[] }> = ({ isDark, apps, limits }) => {
    const { theme } = useTheme();
    const [showAllApps, setShowAllApps] = useState(false);

    // Real data calculations
    const totalMinutes = apps.reduce((sum, app) => sum + app.usageMinutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const activeLimitsCount = limits.filter(l => l.isActive && l.mode === 'limit').length;
    const activeDetoxCount = limits.filter(l => l.isActive && l.mode === 'detox').length;

    const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const top5Apps = apps.slice(0, 5);
    const maxUsage = apps[0]?.usageMinutes || 1;

    return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Text variant="h2" weight="bold">Today's Focus</Text>
            <Text variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 4, marginBottom: spacing[4] }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>

            {/* Bento Grid */}
            <View style={styles.bentoGrid}>
                {/* Big Card - Screen Time */}
                <GlassCard isDark={isDark} style={styles.bentoBig}>
                    <Clock size={20} color={theme.colors.textSecondary} />
                    <Text variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 8 }}>Screen Time</Text>
                    <Text variant="h1" weight="bold" style={{ fontSize: 48, marginTop: 4 }}>{hours}h {minutes}m</Text>
                </GlassCard>

                {/* Small Cards Row */}
                <View style={styles.bentoSmallRow}>
                    <GlassCard isDark={isDark} style={styles.bentoSmall}>
                        <Shield size={18} color="#007AFF" />
                        <Text variant="h2" weight="bold" style={{ marginTop: 8 }}>{activeLimitsCount}</Text>
                        <Text variant="caption" color={theme.colors.textSecondary}>Limits</Text>
                    </GlassCard>
                    <GlassCard isDark={isDark} style={styles.bentoSmall}>
                        <Flame size={18} color="#FF4444" />
                        <Text variant="h2" weight="bold" style={{ marginTop: 8 }}>{activeDetoxCount}</Text>
                        <Text variant="caption" color={theme.colors.textSecondary}>Detox</Text>
                    </GlassCard>
                </View>
            </View>

            {/* Top Apps */}
            <View style={{ marginTop: spacing[5] }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] }}>
                    <Text variant="body" weight="semibold">App Usage Today</Text>
                    <TouchableOpacity onPress={() => setShowAllApps(true)}>
                        <Text variant="caption" weight="semibold" color="#007AFF">View All</Text>
                    </TouchableOpacity>
                </View>

                <GlassCard isDark={isDark} style={{ padding: 0 }}>
                    {top5Apps.map((app, i) => (
                        <View key={i} style={[styles.appItem, i < top5Apps.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                            {app.icon ? (
                                <Image source={{ uri: `data:image/png;base64,${app.icon}` }} style={styles.appIcon} />
                            ) : (
                                <View style={[styles.appIconPlaceholder, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                                    <Text variant="caption" weight="bold">{app.appName.charAt(0)}</Text>
                                </View>
                            )}
                            <View style={{ flex: 1, marginLeft: spacing[3] }}>
                                <Text variant="body" weight="medium" numberOfLines={1}>{app.appName}</Text>
                                <View style={[styles.usageBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', marginTop: 6 }]}>
                                    <View style={[styles.usageBarFill, { width: `${(app.usageMinutes / maxUsage) * 100}%`, backgroundColor: isDark ? '#FFF' : '#1A1A1A' }]} />
                                </View>
                            </View>
                            <Text variant="caption" weight="semibold" color={theme.colors.textSecondary} style={{ marginLeft: spacing[3] }}>
                                {formatTime(app.usageMinutes)}
                            </Text>
                        </View>
                    ))}
                </GlassCard>
            </View>

            {/* Weekly Overview - Simple Bars */}
            <View style={{ marginTop: spacing[5] }}>
                <Text variant="body" weight="semibold" style={{ marginBottom: spacing[3] }}>This Week</Text>
                <GlassCard isDark={isDark}>
                    <View style={styles.weeklyChart}>
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                            const isToday = i === new Date().getDay() - 1 || (new Date().getDay() === 0 && i === 6);
                            const barHeight = 20 + Math.random() * 50; // TODO: Replace with real weekly data
                            return (
                                <View key={i} style={styles.weeklyBarWrap}>
                                    <View style={[styles.weeklyBar, {
                                        height: barHeight,
                                        backgroundColor: isToday ? (isDark ? '#FFF' : '#1A1A1A') : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'),
                                        borderRadius: 4,
                                    }]} />
                                    <Text variant="caption" color={isToday ? (isDark ? '#FFF' : '#1A1A1A') : theme.colors.textTertiary} style={{ marginTop: 6 }}>{day}</Text>
                                </View>
                            );
                        })}
                    </View>
                </GlassCard>
            </View>

            {/* All Apps Modal */}
            <Modal visible={showAllApps} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#0A0A0F' : '#FAFAFA' }]}>
                        <View style={styles.modalHeader}>
                            <Text variant="h3" weight="bold">All Apps</Text>
                            <TouchableOpacity onPress={() => setShowAllApps(false)}>
                                <X size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                            {apps.map((app, i) => (
                                <View key={i} style={[styles.appItem, { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                                    {app.icon ? (
                                        <Image source={{ uri: `data:image/png;base64,${app.icon}` }} style={styles.appIcon} />
                                    ) : (
                                        <View style={[styles.appIconPlaceholder, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                                            <Text variant="caption" weight="bold">{app.appName.charAt(0)}</Text>
                                        </View>
                                    )}
                                    <View style={{ flex: 1, marginLeft: spacing[3] }}>
                                        <Text variant="body" weight="medium" numberOfLines={1}>{app.appName}</Text>
                                    </View>
                                    <Text variant="caption" weight="semibold" color={theme.colors.textSecondary}>{formatTime(app.usageMinutes)}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

// ============================================
// LIMITS TAB - FULL FUNCTIONALITY
// ============================================
const LimitsTab: React.FC<{ isDark: boolean; apps: AppData[]; limits: AppLimit[]; onLimitsChange: () => void }> = ({ isDark, apps, limits, onLimitsChange }) => {
    const { theme } = useTheme();
    const [showPicker, setShowPicker] = useState(false);
    const [showSetup, setShowSetup] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selectedApp, setSelectedApp] = useState<AppData | null>(null);
    const [editingLimit, setEditingLimit] = useState<AppLimit | null>(null);
    const [mode, setMode] = useState<'limit' | 'detox'>('limit');
    const [limitValue, setLimitValue] = useState(30);
    const [detoxDays, setDetoxDays] = useState(7);
    const [searchQuery, setSearchQuery] = useState('');

    const activeLimits = limits.filter(l => l.isActive);
    const existingPackages = limits.map(l => l.packageName);
    const availableApps = apps.filter(a => !existingPackages.includes(a.packageName));
    const filteredApps = searchQuery
        ? availableApps.filter(a => a.appName.toLowerCase().includes(searchQuery.toLowerCase()))
        : availableApps;

    const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
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
        BlockingModule?.addBlockedApp?.(selectedApp.packageName, mode, mode === 'detox' ? new Date(newLimit.detoxEndDate!).getTime() : 0, mode === 'limit' ? limitValue : 0);

        setShowSetup(false);
        setSelectedApp(null);
        onLimitsChange();
    };

    const handleLimitPress = (limit: AppLimit) => {
        setEditingLimit(limit);
        setShowEdit(true);
    };

    const handleRemoveLimit = async () => {
        if (!editingLimit) return;
        await limitsService.deleteLimit(editingLimit.packageName);
        BlockingModule?.removeBlockedApp?.(editingLimit.packageName);
        setShowEdit(false);
        setEditingLimit(null);
        onLimitsChange();
    };

    const formatDaysRemaining = (endDate: string) => {
        const days = Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
        return `${days} days left`;
    };

    return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner} showsVerticalScrollIndicator={false}>
            <Text variant="h2" weight="bold">App Limits</Text>
            <Text variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 4, marginBottom: spacing[4] }}>
                {activeLimits.length === 0 ? 'Set limits to control usage' : `${activeLimits.length} active`}
            </Text>

            {/* Active Limits */}
            {activeLimits.length > 0 && (
                <View style={{ gap: spacing[3], marginBottom: spacing[4] }}>
                    {activeLimits.map((limit, i) => (
                        <TouchableOpacity key={i} activeOpacity={0.7} onPress={() => handleLimitPress(limit)}>
                            <GlassCard isDark={isDark} style={styles.limitCard}>
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
                                <ChevronRight size={20} color={theme.colors.textTertiary} style={{ marginLeft: spacing[2] }} />
                            </GlassCard>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Empty State */}
            {activeLimits.length === 0 && (
                <GlassCard isDark={isDark} style={styles.emptyState}>
                    <Shield size={40} color={theme.colors.textTertiary} />
                    <Text variant="h3" weight="bold" align="center" style={{ marginTop: spacing[4] }}>No Limits Yet</Text>
                    <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ marginTop: spacing[2] }}>
                        Add your first limit to start
                    </Text>
                </GlassCard>
            )}

            {/* Add Button */}
            <TouchableOpacity onPress={() => setShowPicker(true)} activeOpacity={0.7}>
                <GlassCard isDark={isDark} style={styles.addButton}>
                    <View style={[styles.addIconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                        <Plus size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                    </View>
                    <Text variant="body" weight="semibold" style={{ marginLeft: spacing[3] }}>Add App Limit</Text>
                </GlassCard>
            </TouchableOpacity>

            {/* App Picker Modal */}
            <Modal visible={showPicker} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#0A0A0F' : '#FAFAFA' }]}>
                        <View style={styles.modalHeader}>
                            <Text variant="h3" weight="bold">Select App</Text>
                            <TouchableOpacity onPress={() => setShowPicker(false)}>
                                <X size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            placeholder="Search apps..."
                            placeholderTextColor={theme.colors.textTertiary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={[styles.searchInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: isDark ? '#FFF' : '#1A1A1A' }]}
                        />
                        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                            {filteredApps.map((app, i) => (
                                <TouchableOpacity key={i} onPress={() => handleSelectApp(app)} activeOpacity={0.7}>
                                    <View style={[styles.appItem, { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                                        {app.icon ? (
                                            <Image source={{ uri: `data:image/png;base64,${app.icon}` }} style={styles.appIcon} />
                                        ) : (
                                            <View style={[styles.appIconPlaceholder, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                                                <Text variant="caption" weight="bold">{app.appName.charAt(0)}</Text>
                                            </View>
                                        )}
                                        <View style={{ flex: 1, marginLeft: spacing[3] }}>
                                            <Text variant="body" weight="medium" numberOfLines={1}>{app.appName}</Text>
                                            <Text variant="caption" color={theme.colors.textSecondary}>{formatTime(app.usageMinutes)} today</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Setup Modal */}
            <Modal visible={showSetup} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#0A0A0F' : '#FAFAFA', maxHeight: '70%' }]}>
                        <View style={styles.modalHeader}>
                            <Text variant="h3" weight="bold">{selectedApp?.appName}</Text>
                            <TouchableOpacity onPress={() => { setShowSetup(false); setSelectedApp(null); }}>
                                <X size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                            </TouchableOpacity>
                        </View>

                        {/* Mode Selection */}
                        <View style={{ flexDirection: 'row', gap: spacing[3], marginBottom: spacing[5] }}>
                            <TouchableOpacity
                                onPress={() => setMode('limit')}
                                style={[styles.modeOption, { flex: 1, backgroundColor: mode === 'limit' ? 'rgba(0,122,255,0.15)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'), borderColor: mode === 'limit' ? '#007AFF' : 'transparent' }]}
                            >
                                <Clock size={24} color={mode === 'limit' ? '#007AFF' : theme.colors.textSecondary} />
                                <Text variant="body" weight={mode === 'limit' ? 'bold' : 'medium'} color={mode === 'limit' ? '#007AFF' : theme.colors.text} style={{ marginTop: 8 }}>Daily Limit</Text>
                                <Text variant="caption" color={theme.colors.textSecondary} align="center" style={{ marginTop: 4 }}>Set max time per day</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setMode('detox')}
                                style={[styles.modeOption, { flex: 1, backgroundColor: mode === 'detox' ? 'rgba(255,68,68,0.15)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'), borderColor: mode === 'detox' ? '#FF4444' : 'transparent' }]}
                            >
                                <Flame size={24} color={mode === 'detox' ? '#FF4444' : theme.colors.textSecondary} />
                                <Text variant="body" weight={mode === 'detox' ? 'bold' : 'medium'} color={mode === 'detox' ? '#FF4444' : theme.colors.text} style={{ marginTop: 8 }}>Detox</Text>
                                <Text variant="caption" color={theme.colors.textSecondary} align="center" style={{ marginTop: 4 }}>Block completely</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Value Selection */}
                        {mode === 'limit' ? (
                            <View>
                                <Text variant="body" weight="semibold" style={{ marginBottom: spacing[3] }}>Daily limit (minutes)</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
                                    {[15, 30, 45, 60, 90, 120].map(v => (
                                        <TouchableOpacity key={v} onPress={() => setLimitValue(v)} style={[styles.valueChip, { backgroundColor: limitValue === v ? '#007AFF' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') }]}>
                                            <Text variant="body" weight={limitValue === v ? 'bold' : 'medium'} color={limitValue === v ? '#FFF' : theme.colors.text}>{v}m</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ) : (
                            <View>
                                <Text variant="body" weight="semibold" style={{ marginBottom: spacing[3] }}>Detox duration (days)</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
                                    {[3, 7, 14, 21, 30].map(d => (
                                        <TouchableOpacity key={d} onPress={() => setDetoxDays(d)} style={[styles.valueChip, { backgroundColor: detoxDays === d ? '#FF4444' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') }]}>
                                            <Text variant="body" weight={detoxDays === d ? 'bold' : 'medium'} color={detoxDays === d ? '#FFF' : theme.colors.text}>{d}d</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Confirm Button */}
                        <TouchableOpacity onPress={handleConfirmLimit} style={[styles.confirmButton, { backgroundColor: mode === 'limit' ? '#007AFF' : '#FF4444' }]} activeOpacity={0.8}>
                            <Check size={20} color="#FFF" />
                            <Text variant="body" weight="bold" color="#FFF" style={{ marginLeft: 8 }}>Start {mode === 'limit' ? 'Limit' : 'Detox'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Edit Modal */}
            <Modal visible={showEdit} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#0A0A0F' : '#FAFAFA', maxHeight: '50%' }]}>
                        <View style={styles.modalHeader}>
                            <Text variant="h3" weight="bold">{editingLimit?.appName}</Text>
                            <TouchableOpacity onPress={() => { setShowEdit(false); setEditingLimit(null); }}>
                                <X size={24} color={isDark ? '#FFF' : '#1A1A1A'} />
                            </TouchableOpacity>
                        </View>

                        {editingLimit && (
                            <View>
                                <GlassCard isDark={isDark} style={{ marginBottom: spacing[4] }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text variant="caption" color={theme.colors.textSecondary}>Mode</Text>
                                        <Text variant="body" weight="semibold" color={editingLimit.mode === 'detox' ? '#FF4444' : '#007AFF'}>
                                            {editingLimit.mode === 'detox' ? 'Detox' : 'Daily Limit'}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing[3] }}>
                                        <Text variant="caption" color={theme.colors.textSecondary}>
                                            {editingLimit.mode === 'detox' ? 'Ends' : 'Limit'}
                                        </Text>
                                        <Text variant="body" weight="semibold">
                                            {editingLimit.mode === 'detox' ? new Date(editingLimit.detoxEndDate!).toLocaleDateString() : `${editingLimit.dailyLimitMinutes}m/day`}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing[3] }}>
                                        <Text variant="caption" color={theme.colors.textSecondary}>Streak</Text>
                                        <Text variant="body" weight="semibold" color="#FFD700">{editingLimit.streak} days</Text>
                                    </View>
                                </GlassCard>

                                <TouchableOpacity onPress={handleRemoveLimit} style={styles.removeButton} activeOpacity={0.7}>
                                    <Trash2 size={20} color="#FF4444" />
                                    <Text variant="body" weight="semibold" color="#FF4444" style={{ marginLeft: 8 }}>Remove Limit</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
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
    const [email, setEmail] = useState(user?.email || '');
    const [isEditingEmail, setIsEditingEmail] = useState(false);

    const handleLogout = async () => {
        await auth().signOut();
        onLogout();
    };

    const handleUpdateEmail = async () => {
        if (email && email !== user?.email) {
            try {
                await user?.updateEmail(email);
                setIsEditingEmail(false);
            } catch (e: any) {
                Alert.alert('Error', e.message);
            }
        } else {
            setIsEditingEmail(false);
        }
    };

    return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentInner} showsVerticalScrollIndicator={false}>
            <Text variant="h2" weight="bold">Settings</Text>
            <Text variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 4, marginBottom: spacing[4] }} />

            {/* Account */}
            <Text variant="caption" weight="semibold" color={theme.colors.textTertiary} style={styles.sectionLabel}>ACCOUNT</Text>
            <GlassCard isDark={isDark} style={{ marginBottom: spacing[5] }}>
                <View style={[styles.settingsRow, { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                    <Text variant="body">Email</Text>
                    {isEditingEmail ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                style={[styles.emailInput, { color: isDark ? '#FFF' : '#1A1A1A', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            <TouchableOpacity onPress={handleUpdateEmail} style={{ marginLeft: 8 }}>
                                <Check size={20} color="#007AFF" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => setIsEditingEmail(true)}>
                            <Text variant="body" color="#007AFF">{user?.email || 'Not set'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.settingsRow}>
                    <Text variant="body">Member Since</Text>
                    <Text variant="body" color={theme.colors.textSecondary}>
                        {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '-'}
                    </Text>
                </View>
            </GlassCard>

            {/* Permissions */}
            <Text variant="caption" weight="semibold" color={theme.colors.textTertiary} style={styles.sectionLabel}>PERMISSIONS</Text>
            <TouchableOpacity onPress={() => Linking.openSettings()} activeOpacity={0.7}>
                <GlassCard isDark={isDark} style={{ marginBottom: spacing[5] }}>
                    <View style={styles.settingsRow}>
                        <Text variant="body">Manage Permissions</Text>
                        <ChevronRight size={20} color={theme.colors.textTertiary} />
                    </View>
                </GlassCard>
            </TouchableOpacity>

            {/* Legal */}
            <Text variant="caption" weight="semibold" color={theme.colors.textTertiary} style={styles.sectionLabel}>LEGAL</Text>
            <GlassCard isDark={isDark} style={{ marginBottom: spacing[5] }}>
                <TouchableOpacity style={[styles.settingsRow, { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                    <Text variant="body">Privacy Policy</Text>
                    <ChevronRight size={20} color={theme.colors.textTertiary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsRow}>
                    <Text variant="body">Terms of Service</Text>
                    <ChevronRight size={20} color={theme.colors.textTertiary} />
                </TouchableOpacity>
            </GlassCard>

            {/* Logout */}
            <TouchableOpacity onPress={handleLogout} style={[styles.logoutButton, { backgroundColor: isDark ? 'rgba(255,68,68,0.12)' : 'rgba(255,68,68,0.08)' }]} activeOpacity={0.7}>
                <LogOut size={20} color="#FF4444" />
                <Text variant="body" weight="semibold" color="#FF4444" style={{ marginLeft: 8 }}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

// ============================================
// MAIN APP
// ============================================
const MainApp: React.FC = () => {
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [apps, setApps] = useState<AppData[]>([]);
    const [limits, setLimits] = useState<AppLimit[]>([]);

    const loadData = async () => {
        try {
            const data = await PermissionsModule.getAppUsageStats(1);
            if (data && data.length > 0) {
                const sorted = data.sort((a: AppData, b: AppData) => b.usageMinutes - a.usageMinutes);
                setApps(sorted);
            }
        } catch (e) {
            console.log('Error fetching apps:', e);
        }

        await limitsService.loadLimits();
    };

    useEffect(() => {
        loadData();
        BlockingModule?.startMonitoring?.();
        const unsub = limitsService.subscribe(setLimits);
        return () => {
            unsub();
            BlockingModule?.stopMonitoring?.();
        };
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F'] : ['#F8F8FA', '#F0F0F2']} style={StyleSheet.absoluteFillObject} />

            {activeTab === 'dashboard' && <DashboardTab isDark={isDark} apps={apps} limits={limits} />}
            {activeTab === 'limits' && <LimitsTab isDark={isDark} apps={apps} limits={limits} onLimitsChange={loadData} />}
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
    tabItem: { flex: 1, alignItems: 'center' },
    tabContent: { flex: 1 },
    tabContentInner: { padding: spacing[4], paddingTop: 20, paddingBottom: 20 },

    // Glass Card
    glassCard: { padding: spacing[4], borderRadius: 20, borderWidth: 1 },

    // Bento
    bentoGrid: { gap: spacing[3] },
    bentoBig: { padding: spacing[5] },
    bentoSmallRow: { flexDirection: 'row', gap: spacing[3] },
    bentoSmall: { flex: 1, alignItems: 'center', paddingVertical: spacing[4] },

    // Apps
    appItem: { flexDirection: 'row', alignItems: 'center', padding: spacing[3] },
    appIcon: { width: 40, height: 40, borderRadius: 10 },
    appIconPlaceholder: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    usageBar: { height: 4, borderRadius: 2, width: '100%' },
    usageBarFill: { height: 4, borderRadius: 2 },

    // Weekly
    weeklyChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100, paddingTop: 10 },
    weeklyBarWrap: { alignItems: 'center', flex: 1 },
    weeklyBar: { width: 20 },

    // Limits
    emptyState: { alignItems: 'center', paddingVertical: spacing[6] },
    limitCard: { flexDirection: 'row', alignItems: 'center' },
    limitIcon: { width: 48, height: 48, borderRadius: 12 },
    limitIconPlaceholder: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    modeTag: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
    addButton: { flexDirection: 'row', alignItems: 'center' },
    addIconCircle: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing[4], maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] },
    searchInput: { height: 44, borderRadius: 12, paddingHorizontal: spacing[4], marginBottom: spacing[3] },
    modeOption: { padding: spacing[4], borderRadius: 16, alignItems: 'center', borderWidth: 2 },
    valueChip: { paddingVertical: spacing[2], paddingHorizontal: spacing[4], borderRadius: 12 },
    confirmButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing[4], borderRadius: 14, marginTop: spacing[5] },
    removeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing[4], borderRadius: 14, backgroundColor: 'rgba(255,68,68,0.1)' },

    // Settings
    sectionLabel: { marginBottom: spacing[2], marginLeft: spacing[1], letterSpacing: 0.5 },
    settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing[3] },
    emailInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, width: 180 },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing[4], borderRadius: 14 },
});

export default MainApp;
