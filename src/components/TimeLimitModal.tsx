import React, { useState } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '../components'; // Assuming Text component exists
import { useTheme } from '../theme';
import { spacing } from '../theme/theme';

interface TimeLimitModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (minutes: number) => void;
    appName: string;
    initialMinutes?: number;
}

export const TimeLimitModal: React.FC<TimeLimitModalProps> = ({ visible, onClose, onSave, appName, initialMinutes = 30 }) => {
    const { theme, isDark } = useTheme();

    // Convert initial minutes to hours/minutes for picker
    const [hours, setHours] = useState(Math.floor(initialMinutes / 60));
    const [minutes, setMinutes] = useState(initialMinutes % 60);

    const handleSave = () => {
        const total = hours * 60 + minutes;
        onSave(total);
        onClose();
    };

    const NumberPicker: React.FC<{ value: number; max: number; onChange: (v: number) => void; label: string }> = ({ value, max, onChange, label }) => (
        <View style={styles.pickerColumn}>
            <Text variant="caption" color={theme.colors.textSecondary} style={{ marginBottom: 8 }}>{label}</Text>
            <View style={[styles.pickerContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F0F0F0' }]}>
                <TouchableOpacity onPress={() => onChange(value < max ? value + 1 : 0)} style={styles.pickerBtn}>
                    <Text variant="h3" color={theme.colors.primary}>▲</Text>
                </TouchableOpacity>
                <View style={styles.pickerValue}>
                    <Text variant="h1" weight="bold">{value.toString().padStart(2, '0')}</Text>
                </View>
                <TouchableOpacity onPress={() => onChange(value > 0 ? value - 1 : max)} style={styles.pickerBtn}>
                    <Text variant="h3" color={theme.colors.textSecondary}>▼</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: isDark ? '#1A1A20' : '#FFFFFF' }]}>
                    <Text variant="h3" weight="bold" align="center" style={{ marginBottom: spacing[2] }}>Set Limit for {appName}</Text>
                    <Text variant="body" color={theme.colors.textSecondary} align="center" style={{ marginBottom: spacing[6] }}>
                        How long do you want to use this app per day?
                    </Text>

                    <View style={styles.pickers}>
                        <NumberPicker value={hours} max={23} onChange={setHours} label="HOURS" />
                        <Text variant="h2" weight="bold" style={{ marginTop: 30 }}>:</Text>
                        <NumberPicker value={minutes} max={59} onChange={setMinutes} label="MINUTES" />
                    </View>

                    <View style={styles.buttons}>
                        <TouchableOpacity onPress={onClose} style={[styles.button, { backgroundColor: 'transparent' }]}>
                            <Text variant="body" color={theme.colors.textSecondary}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSave} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
                            <Text variant="body" weight="bold" color="#FFF">Set Limit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: spacing[4] },
    card: { width: '100%', maxWidth: 340, padding: spacing[6], borderRadius: 24, elevation: 5 },
    pickers: { flexDirection: 'row', justifyContent: 'center', gap: spacing[4], marginBottom: spacing[6] },
    pickerColumn: { alignItems: 'center' },
    pickerContainer: { borderRadius: 12, alignItems: 'center', padding: spacing[2] },
    pickerBtn: { padding: spacing[2] },
    pickerValue: { paddingVertical: spacing[2], minWidth: 60, alignItems: 'center' },
    buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing[2] },
    button: { flex: 1, alignItems: 'center', padding: spacing[3], borderRadius: 12 },
});
