import React, { useState, useEffect } from 'react';
import { View, Modal, FlatList, TouchableOpacity, Image, StyleSheet, NativeModules } from 'react-native';
import { Text } from '../components';
import { useTheme } from '../theme';
import { spacing } from '../theme/theme';

const { PermissionsModule } = NativeModules;

interface AppData {
    packageName: string;
    appName: string;
    usageMinutes: number;
    icon?: string;
}

interface AppPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectApp: (app: AppData) => void;
    excludePackages?: string[];
}

export const AppPickerModal: React.FC<AppPickerModalProps> = ({ visible, onClose, onSelectApp, excludePackages = [] }) => {
    const { theme, isDark } = useTheme();
    const [apps, setApps] = useState<AppData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible) {
            loadApps();
        }
    }, [visible]);

    const loadApps = async () => {
        setLoading(true);
        try {
            const data = await PermissionsModule.getAppUsageStats(7);
            if (data && data.length > 0) {
                const filtered = data
                    .filter((a: AppData) => !excludePackages.includes(a.packageName))
                    .sort((a: AppData, b: AppData) => b.usageMinutes - a.usageMinutes);
                setApps(filtered);
            }
        } catch (e) {
            console.log('Error loading apps:', e);
            // Fallback
            setApps([
                { packageName: 'com.instagram.android', appName: 'Instagram', usageMinutes: 120 },
                { packageName: 'com.zhiliaoapp.musically', appName: 'TikTok', usageMinutes: 90 },
                { packageName: 'com.google.android.youtube', appName: 'YouTube', usageMinutes: 75 },
                { packageName: 'com.twitter.android', appName: 'X (Twitter)', usageMinutes: 45 },
                { packageName: 'com.snapchat.android', appName: 'Snapchat', usageMinutes: 40 },
            ]);
        }
        setLoading(false);
    };

    const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m / day avg` : `${m}m / day avg`;
    };

    const renderApp = ({ item }: { item: AppData }) => (
        <TouchableOpacity
            onPress={() => onSelectApp(item)}
            activeOpacity={0.7}
            style={[styles.appItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
        >
            {item.icon ? (
                <Image source={{ uri: `data:image/png;base64,${item.icon}` }} style={styles.appIcon} />
            ) : (
                <View style={[styles.appIconPlaceholder, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
                    <Text variant="body" weight="bold">{item.appName.charAt(0)}</Text>
                </View>
            )}
            <View style={styles.appInfo}>
                <Text variant="body" weight="semibold">{item.appName}</Text>
                <Text variant="caption" color={theme.colors.textSecondary}>{formatTime(item.usageMinutes)}</Text>
            </View>
            <Text variant="caption" color={theme.colors.textTertiary}>→</Text>
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: isDark ? '#131318' : '#FFF' }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text variant="h3" weight="bold">Select App to Limit</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text variant="h3" color={theme.colors.textSecondary}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* App List */}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <Text variant="body" color={theme.colors.textSecondary}>Loading apps...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={apps}
                            renderItem={renderApp}
                            keyExtractor={item => item.packageName}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    container: { height: '85%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: spacing[4] },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[5], paddingBottom: spacing[4], borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.15)' },
    closeBtn: { padding: spacing[2] },
    list: { paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    appItem: { flexDirection: 'row', alignItems: 'center', padding: spacing[4], borderRadius: 14, marginBottom: spacing[2] },
    appIcon: { width: 48, height: 48, borderRadius: 12 },
    appIconPlaceholder: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    appInfo: { flex: 1, marginLeft: spacing[3] },
});
