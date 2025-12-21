import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Text } from '../components';
import { useTheme } from '../theme';
import { spacing } from '../theme/theme';

interface LimitSetupModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (mode: 'detox' | 'limit', value: number) => void;
    appName: string;
    appIcon?: string;
    avgUsage: number;
}

export const LimitSetupModal: React.FC<LimitSetupModalProps> = ({ visible, onClose, onConfirm, appName, appIcon, avgUsage }) => {
    const { theme, isDark } = useTheme();
    const [mode, setMode] = useState<'detox' | 'limit' | null>(null);
    const [detoxDays, setDetoxDays] = useState(7);
    const [limitMinutes, setLimitMinutes] = useState(30);

    const handleConfirm = () => {
        if (mode === 'detox') {
            onConfirm('detox', detoxDays);
        } else if (mode === 'limit') {
            onConfirm('limit', limitMinutes);
        }
        setMode(null);
        onClose();
    };

    const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    // Reset when closed
    React.useEffect(() => {
        if (!visible) setMode(null);
    }, [visible]);

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: isDark ? '#1A1A22' : '#FFF' }]}>
                    {/* App Header */}
                    <View style={styles.appHeader}>
                        {appIcon ? (
                            <Image source={{ uri: `data:image/png;base64,${appIcon}` }} style={styles.appIcon} />
                        ) : (
                            <View style={[styles.appIconPlaceholder, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
                                <Text variant="h2" weight="bold">{appName.charAt(0)}</Text>
                            </View>
                        )}
                        <Text variant="h3" weight="bold" style={{ marginTop: spacing[3] }}>{appName}</Text>
                        <Text variant="caption" color={theme.colors.textSecondary}>Avg: {formatTime(avgUsage)} / day</Text>
                    </View>

                    {!mode ? (
                        <>
                            {/* Mode Selection */}
                            <Text variant="body" weight="semibold" style={{ marginBottom: spacing[3] }}>Choose your approach:</Text>

                            <TouchableOpacity
                                onPress={() => setMode('detox')}
                                style={[styles.modeOption, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text variant="body" weight="bold">🚫 Full Detox</Text>
                                    <Text variant="caption" color={theme.colors.textSecondary}>Completely block this app for a set period</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setMode('limit')}
                                style={[styles.modeOption, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text variant="body" weight="bold">⏱️ Daily Limit</Text>
                                    <Text variant="caption" color={theme.colors.textSecondary}>Set a maximum usage time per day</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={onClose} style={{ marginTop: spacing[4] }}>
                                <Text variant="body" color={theme.colors.textTertiary} align="center">Cancel</Text>
                            </TouchableOpacity>
                        </>
                    ) : mode === 'detox' ? (
                        <>
                            {/* Detox Duration */}
                            <Text variant="body" weight="semibold" style={{ marginBottom: spacing[3] }}>Detox Duration:</Text>

                            <View style={styles.durationPicker}>
                                {[3, 7, 14, 21, 30].map(days => (
                                    <TouchableOpacity
                                        key={days}
                                        onPress={() => setDetoxDays(days)}
                                        style={[
                                            styles.durationOption,
                                            {
                                                backgroundColor: detoxDays === days
                                                    ? (isDark ? '#FFF' : '#1A1A1A')
                                                    : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')
                                            }
                                        ]}
                                    >
                                        <Text
                                            variant="body"
                                            weight="bold"
                                            color={detoxDays === days ? (isDark ? '#000' : '#FFF') : undefined}
                                        >
                                            {days}d
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                onPress={handleConfirm}
                                style={[styles.confirmBtn, { backgroundColor: isDark ? '#FFF' : '#1A1A1A' }]}
                            >
                                <Text variant="body" weight="bold" color={isDark ? '#000' : '#FFF'}>Start {detoxDays}-Day Detox</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setMode(null)} style={{ marginTop: spacing[3] }}>
                                <Text variant="caption" color={theme.colors.textTertiary} align="center">← Back</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {/* Limit Duration */}
                            <Text variant="body" weight="semibold" style={{ marginBottom: spacing[3] }}>Daily Limit:</Text>

                            <View style={styles.durationPicker}>
                                {[15, 30, 45, 60, 90, 120].map(mins => (
                                    <TouchableOpacity
                                        key={mins}
                                        onPress={() => setLimitMinutes(mins)}
                                        style={[
                                            styles.durationOption,
                                            {
                                                backgroundColor: limitMinutes === mins
                                                    ? (isDark ? '#FFF' : '#1A1A1A')
                                                    : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')
                                            }
                                        ]}
                                    >
                                        <Text
                                            variant="caption"
                                            weight="bold"
                                            color={limitMinutes === mins ? (isDark ? '#000' : '#FFF') : undefined}
                                        >
                                            {formatTime(mins)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                onPress={handleConfirm}
                                style={[styles.confirmBtn, { backgroundColor: isDark ? '#FFF' : '#1A1A1A' }]}
                            >
                                <Text variant="body" weight="bold" color={isDark ? '#000' : '#FFF'}>Set {formatTime(limitMinutes)} Limit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setMode(null)} style={{ marginTop: spacing[3] }}>
                                <Text variant="caption" color={theme.colors.textTertiary} align="center">← Back</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: spacing[4] },
    card: { width: '100%', maxWidth: 360, padding: spacing[5], borderRadius: 24, elevation: 8 },
    appHeader: { alignItems: 'center', marginBottom: spacing[5], paddingBottom: spacing[4], borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.15)' },
    appIcon: { width: 64, height: 64, borderRadius: 16 },
    appIconPlaceholder: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    modeOption: { padding: spacing[4], borderRadius: 14, borderWidth: 2, marginBottom: spacing[3] },
    durationPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[5] },
    durationOption: { paddingVertical: spacing[3], paddingHorizontal: spacing[4], borderRadius: 12 },
    confirmBtn: { paddingVertical: spacing[4], borderRadius: 14, alignItems: 'center' },
});
