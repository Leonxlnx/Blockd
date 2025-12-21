import React from 'react';
import { View, StyleSheet, TouchableOpacity, BackHandler, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Text } from '../../components';
import { spacing } from '../../theme/theme';

interface DetoxOverlayProps {
    appName: string;
    appIcon?: string;
    daysRemaining: number;
    onExit: () => void;
    onCancel: () => void;
}

export const DetoxOverlay: React.FC<DetoxOverlayProps> = ({ appName, appIcon, daysRemaining, onExit, onCancel }) => {
    // Block back button
    React.useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            onExit();
            return true;
        });
        return () => backHandler.remove();
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0A0A12', '#12121D', '#0D0D15']}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.content}>
                {/* App Icon */}
                {appIcon ? (
                    <Image source={{ uri: `data:image/png;base64,${appIcon}` }} style={styles.appIcon} />
                ) : (
                    <View style={styles.appIconPlaceholder}>
                        <Text variant="h1" weight="bold">{appName.charAt(0)}</Text>
                    </View>
                )}

                {/* Message */}
                <Text variant="h1" weight="bold" color="#FF4444" align="center" style={styles.blockedText}>
                    🚫 BLOCKED
                </Text>

                <Text variant="h2" weight="bold" align="center" style={styles.headline}>
                    You're on a Detox Challenge
                </Text>

                <View style={styles.daysContainer}>
                    <Text variant="h1" weight="bold" style={styles.daysNumber}>{daysRemaining}</Text>
                    <Text variant="body" color="rgba(255,255,255,0.6)">days remaining</Text>
                </View>

                <Text variant="body" color="rgba(255,255,255,0.5)" align="center" style={styles.motivation}>
                    Stay strong! Every hour you resist builds{'\n'}your focus and discipline.
                </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
                <TouchableOpacity onPress={onExit} style={styles.exitButton}>
                    <Text variant="body" weight="bold" color="#FFF">Exit App</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onCancel} style={styles.cancelLink}>
                    <Text variant="caption" color="rgba(255,255,255,0.4)">Cancel challenge</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

interface LimitOverlayStartProps {
    appName: string;
    appIcon?: string;
    minutesRemaining: number;
    onContinue: () => void;
    onExit: () => void;
}

export const LimitOverlayStart: React.FC<LimitOverlayStartProps> = ({ appName, appIcon, minutesRemaining, onContinue, onExit }) => {
    const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0A0A12', '#12121D', '#0D0D15']}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.content}>
                {appIcon ? (
                    <Image source={{ uri: `data:image/png;base64,${appIcon}` }} style={styles.appIcon} />
                ) : (
                    <View style={styles.appIconPlaceholder}>
                        <Text variant="h1" weight="bold">{appName.charAt(0)}</Text>
                    </View>
                )}

                <Text variant="h2" weight="bold" align="center" style={styles.headline}>
                    ⏱️ Time Check
                </Text>

                <Text variant="body" color="rgba(255,255,255,0.7)" align="center">
                    You have
                </Text>

                <View style={styles.timeContainer}>
                    <Text variant="h1" weight="bold" style={styles.timeNumber}>{formatTime(minutesRemaining)}</Text>
                    <Text variant="body" color="rgba(255,255,255,0.6)">remaining today</Text>
                </View>

                <Text variant="body" color="rgba(255,255,255,0.5)" align="center" style={styles.motivation}>
                    Use your time wisely!
                </Text>
            </View>

            <View style={styles.buttons}>
                <TouchableOpacity onPress={onContinue} style={styles.continueButton}>
                    <Text variant="body" weight="bold" color="#000">Continue to {appName}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onExit} style={styles.exitButtonOutline}>
                    <Text variant="body" weight="semibold" color="#FFF">Exit</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

interface LimitOverlayEndProps {
    appName: string;
    appIcon?: string;
    onExit: () => void;
    onCancel: () => void;
}

export const LimitOverlayEnd: React.FC<LimitOverlayEndProps> = ({ appName, appIcon, onExit, onCancel }) => {
    React.useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            onExit();
            return true;
        });
        return () => backHandler.remove();
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0A0A12', '#12121D', '#0D0D15']}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.content}>
                {appIcon ? (
                    <Image source={{ uri: `data:image/png;base64,${appIcon}` }} style={styles.appIcon} />
                ) : (
                    <View style={styles.appIconPlaceholder}>
                        <Text variant="h1" weight="bold">{appName.charAt(0)}</Text>
                    </View>
                )}

                <Text variant="h1" weight="bold" color="#FF8C00" align="center" style={styles.blockedText}>
                    ⏰ TIME'S UP
                </Text>

                <Text variant="h2" weight="bold" align="center" style={styles.headline}>
                    Daily limit reached
                </Text>

                <Text variant="body" color="rgba(255,255,255,0.5)" align="center" style={styles.motivation}>
                    Great job sticking to your limit!{'\n'}Come back tomorrow.
                </Text>
            </View>

            <View style={styles.buttons}>
                <TouchableOpacity onPress={onExit} style={styles.exitButton}>
                    <Text variant="body" weight="bold" color="#FFF">Done for Today</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onCancel} style={styles.cancelLink}>
                    <Text variant="caption" color="rgba(255,255,255,0.4)">Cancel limit</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing[6] },
    appIcon: { width: 80, height: 80, borderRadius: 20, marginBottom: spacing[5] },
    appIconPlaceholder: { width: 80, height: 80, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing[5] },
    blockedText: { fontSize: 32, marginBottom: spacing[2] },
    headline: { color: '#FFF', marginBottom: spacing[4] },
    daysContainer: { alignItems: 'center', marginVertical: spacing[5] },
    daysNumber: { fontSize: 72, color: '#FFF', lineHeight: 82 },
    timeContainer: { alignItems: 'center', marginVertical: spacing[5] },
    timeNumber: { fontSize: 48, color: '#FFF', lineHeight: 58 },
    motivation: { marginTop: spacing[4] },
    buttons: { paddingHorizontal: spacing[5], paddingBottom: spacing[6], width: '100%' },
    exitButton: { backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: spacing[4], borderRadius: 16, alignItems: 'center', marginBottom: spacing[3] },
    exitButtonOutline: { backgroundColor: 'transparent', paddingVertical: spacing[4], borderRadius: 16, alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
    continueButton: { backgroundColor: '#FFF', paddingVertical: spacing[4], borderRadius: 16, alignItems: 'center', marginBottom: spacing[3] },
    cancelLink: { alignItems: 'center', paddingVertical: spacing[3] },
});
