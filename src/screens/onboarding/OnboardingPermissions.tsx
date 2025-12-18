import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    StatusBar,
    Animated,
    Easing,
    AppState,
    AppStateStatus,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius, shadows, tapTargets } from '../../theme/theme';
import { Text, GlassCard } from '../../components';
import { Permissions } from '../../native/Permissions';

const { width, height } = Dimensions.get('window');

// ============================================
// ANIMATED ENTRANCE HOOK
// ============================================

const useEntranceAnimation = (delay: number = 0) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current;
    const scale = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 400,
                delay,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 500,
                delay,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                tension: 50,
                friction: 10,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return { opacity, translateY, scale };
};

// ============================================
// PERMISSION STATUS INDICATOR
// ============================================

interface PermissionStatusProps {
    granted: boolean;
}

const PermissionStatus: React.FC<PermissionStatusProps> = ({ granted }) => {
    const { theme, isDark } = useTheme();

    return (
        <View style={[
            styles.statusBadge,
            {
                backgroundColor: granted
                    ? isDark ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.15)'
                    : isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)',
            }
        ]}>
            <Text
                variant="caption"
                weight="semibold"
                color={granted ? colors.success : colors.error}
            >
                {granted ? '✓ Granted' : '○ Required'}
            </Text>
        </View>
    );
};

// ============================================
// PROGRESS RING
// ============================================

interface ProgressRingProps {
    current: number;
    total: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ current, total }) => {
    const { theme } = useTheme();

    return (
        <View style={styles.progressRingContainer}>
            {Array.from({ length: total }).map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.progressDot,
                        {
                            backgroundColor: index < current
                                ? colors.primary[400]
                                : theme.colors.border,
                            width: index === current - 1 ? 24 : 8,
                        },
                    ]}
                />
            ))}
        </View>
    );
};

// ============================================
// BACK BUTTON
// ============================================

interface BackButtonProps {
    onPress: () => void;
    isDark: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({ onPress, isDark }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.9, duration: 50, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }),
        ]).start(() => onPress());
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.backButton} activeOpacity={1}>
            <Animated.View style={[
                styles.backButtonCircle,
                {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                    transform: [{ scale: scaleAnim }],
                }
            ]}>
                <Text variant="body" weight="medium">←</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

// ============================================
// SCREEN 1: USAGE STATS PERMISSION
// ============================================

interface UsageStatsScreenProps {
    onNext: () => void;
    onBack: () => void;
}

export const OnboardingUsageStats: React.FC<UsageStatsScreenProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const [granted, setGranted] = useState(false);
    const buttonScale = useRef(new Animated.Value(1)).current;
    const anim1 = useEntranceAnimation(0);
    const anim2 = useEntranceAnimation(200);

    const checkPermission = async () => {
        const result = await Permissions.checkUsageStatsPermission();
        setGranted(result);
    };

    useEffect(() => {
        checkPermission();

        const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
            if (state === 'active') {
                checkPermission();
            }
        });

        return () => subscription.remove();
    }, []);

    const handleRequestPermission = async () => {
        await Permissions.requestUsageStatsPermission();
    };

    const handlePressIn = () => {
        Animated.spring(buttonScale, { toValue: 0.96, tension: 300, friction: 10, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(buttonScale, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }).start();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

            <LinearGradient
                colors={theme.gradients.background}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <View style={[styles.decorCircle1, { backgroundColor: isDark ? 'rgba(119,141,118,0.08)' : 'rgba(119,141,118,0.06)' }]} />

            <BackButton onPress={onBack} isDark={isDark} />

            <View style={styles.permissionContent}>
                <Animated.View style={{ opacity: anim1.opacity, transform: [{ translateY: anim1.translateY }] }}>
                    <View style={styles.iconContainer}>
                        <LinearGradient colors={colors.gradients.sage1} style={styles.iconCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text variant="h2" color="#FFFFFF">📊</Text>
                        </LinearGradient>
                    </View>

                    <Text variant="h2" weight="bold" align="center" style={styles.permissionTitle}>
                        Usage Access
                    </Text>
                    <PermissionStatus granted={granted} />
                </Animated.View>

                <Animated.View style={{ opacity: anim2.opacity, transform: [{ translateY: anim2.translateY }] }}>
                    <GlassCard intensity="medium" padding="xl" style={styles.explanationCard}>
                        <Text variant="body" color={theme.colors.textSecondary} style={{ lineHeight: 24 }}>
                            Blockd needs to track which apps you use to help you manage your screen time effectively.
                        </Text>
                        <View style={styles.bulletPoints}>
                            <Text variant="bodySmall" color={theme.colors.textSecondary}>• See which apps are currently active</Text>
                            <Text variant="bodySmall" color={theme.colors.textSecondary}>• Track time spent in each app</Text>
                            <Text variant="bodySmall" color={theme.colors.textSecondary}>• Enforce your limits automatically</Text>
                        </View>
                    </GlassCard>
                </Animated.View>
            </View>

            <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScale }] }]}>
                {!granted ? (
                    <TouchableOpacity
                        onPress={handleRequestPermission}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={1}
                        style={styles.buttonWrapper}
                    >
                        <LinearGradient
                            colors={colors.gradients.sage1}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.button, shadows.primaryGlow]}
                        >
                            <Text variant="body" weight="semibold" color="#FFFFFF">Grant Permission</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={onNext}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={1}
                        style={styles.buttonWrapper}
                    >
                        <LinearGradient
                            colors={colors.gradients.premium2}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.button, shadows.primaryGlow]}
                        >
                            <Text variant="body" weight="semibold" color="#FFFFFF">Continue</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </Animated.View>

            <ProgressRing current={1} total={3} />
        </View>
    );
};

// ============================================
// SCREEN 2: OVERLAY PERMISSION
// ============================================

interface OverlayScreenProps {
    onNext: () => void;
    onBack: () => void;
}

export const OnboardingOverlay: React.FC<OverlayScreenProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const [granted, setGranted] = useState(false);
    const buttonScale = useRef(new Animated.Value(1)).current;
    const anim1 = useEntranceAnimation(0);
    const anim2 = useEntranceAnimation(200);

    const checkPermission = async () => {
        const result = await Permissions.checkOverlayPermission();
        setGranted(result);
    };

    useEffect(() => {
        checkPermission();

        const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
            if (state === 'active') {
                checkPermission();
            }
        });

        return () => subscription.remove();
    }, []);

    const handleRequestPermission = async () => {
        await Permissions.requestOverlayPermission();
    };

    const handlePressIn = () => {
        Animated.spring(buttonScale, { toValue: 0.96, tension: 300, friction: 10, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(buttonScale, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }).start();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

            <LinearGradient
                colors={theme.gradients.background}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <View style={[styles.decorCircle2, { backgroundColor: isDark ? 'rgba(119,141,118,0.08)' : 'rgba(119,141,118,0.05)' }]} />

            <BackButton onPress={onBack} isDark={isDark} />

            <View style={styles.permissionContent}>
                <Animated.View style={{ opacity: anim1.opacity, transform: [{ translateY: anim1.translateY }] }}>
                    <View style={styles.iconContainer}>
                        <LinearGradient colors={colors.gradients.premium2} style={styles.iconCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text variant="h2" color="#FFFFFF">🛡️</Text>
                        </LinearGradient>
                    </View>

                    <Text variant="h2" weight="bold" align="center" style={styles.permissionTitle}>
                        Overlay Access
                    </Text>
                    <PermissionStatus granted={granted} />
                </Animated.View>

                <Animated.View style={{ opacity: anim2.opacity, transform: [{ translateY: anim2.translateY }] }}>
                    <GlassCard intensity="medium" padding="xl" style={styles.explanationCard}>
                        <Text variant="body" color={theme.colors.textSecondary} style={{ lineHeight: 24 }}>
                            This allows Blockd to display a blocking screen when you've reached your limit.
                        </Text>
                        <View style={styles.bulletPoints}>
                            <Text variant="bodySmall" color={theme.colors.textSecondary}>• Block distracting apps when time is up</Text>
                            <Text variant="bodySmall" color={theme.colors.textSecondary}>• Show gentle reminders before limits</Text>
                            <Text variant="bodySmall" color={theme.colors.textSecondary}>• Keep you focused on what matters</Text>
                        </View>
                    </GlassCard>
                </Animated.View>
            </View>

            <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScale }] }]}>
                {!granted ? (
                    <TouchableOpacity
                        onPress={handleRequestPermission}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={1}
                        style={styles.buttonWrapper}
                    >
                        <LinearGradient
                            colors={colors.gradients.sage1}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.button, shadows.primaryGlow]}
                        >
                            <Text variant="body" weight="semibold" color="#FFFFFF">Grant Permission</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={onNext}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={1}
                        style={styles.buttonWrapper}
                    >
                        <LinearGradient
                            colors={colors.gradients.premium2}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.button, shadows.primaryGlow]}
                        >
                            <Text variant="body" weight="semibold" color="#FFFFFF">Continue</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </Animated.View>

            <ProgressRing current={2} total={3} />
        </View>
    );
};

// ============================================
// SCREEN 3: BATTERY OPTIMIZATION
// ============================================

interface BatteryScreenProps {
    onComplete: () => void;
    onBack: () => void;
}

export const OnboardingBattery: React.FC<BatteryScreenProps> = ({ onComplete, onBack }) => {
    const { theme, isDark } = useTheme();
    const [granted, setGranted] = useState(false);
    const buttonScale = useRef(new Animated.Value(1)).current;
    const anim1 = useEntranceAnimation(0);
    const anim2 = useEntranceAnimation(200);

    const checkPermission = async () => {
        const result = await Permissions.checkBatteryOptimization();
        setGranted(result);
    };

    useEffect(() => {
        checkPermission();

        const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
            if (state === 'active') {
                checkPermission();
            }
        });

        return () => subscription.remove();
    }, []);

    const handleRequestPermission = async () => {
        await Permissions.requestIgnoreBatteryOptimization();
    };

    const handlePressIn = () => {
        Animated.spring(buttonScale, { toValue: 0.96, tension: 300, friction: 10, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(buttonScale, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }).start();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

            <LinearGradient
                colors={theme.gradients.background}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <View style={[styles.decorCircle3, { backgroundColor: isDark ? 'rgba(119,141,118,0.08)' : 'rgba(119,141,118,0.05)' }]} />

            <BackButton onPress={onBack} isDark={isDark} />

            <View style={styles.permissionContent}>
                <Animated.View style={{ opacity: anim1.opacity, transform: [{ translateY: anim1.translateY }] }}>
                    <View style={styles.iconContainer}>
                        <LinearGradient colors={colors.gradients.sage2} style={styles.iconCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text variant="h2" color="#FFFFFF">🔋</Text>
                        </LinearGradient>
                    </View>

                    <Text variant="h2" weight="bold" align="center" style={styles.permissionTitle}>
                        Background Access
                    </Text>
                    <PermissionStatus granted={granted} />
                </Animated.View>

                <Animated.View style={{ opacity: anim2.opacity, transform: [{ translateY: anim2.translateY }] }}>
                    <GlassCard intensity="medium" padding="xl" style={styles.explanationCard}>
                        <Text variant="body" color={theme.colors.textSecondary} style={{ lineHeight: 24 }}>
                            Allow Blockd to run reliably in the background to enforce your limits.
                        </Text>
                        <View style={styles.bulletPoints}>
                            <Text variant="bodySmall" color={theme.colors.textSecondary}>• Monitor apps even when Blockd is closed</Text>
                            <Text variant="bodySmall" color={theme.colors.textSecondary}>• Ensure limits work 24/7</Text>
                            <Text variant="bodySmall" color={theme.colors.textSecondary}>• Minimal battery impact</Text>
                        </View>
                    </GlassCard>
                </Animated.View>
            </View>

            <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScale }] }]}>
                {!granted ? (
                    <TouchableOpacity
                        onPress={handleRequestPermission}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={1}
                        style={styles.buttonWrapper}
                    >
                        <LinearGradient
                            colors={colors.gradients.sage1}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.button, shadows.primaryGlow]}
                        >
                            <Text variant="body" weight="semibold" color="#FFFFFF">Grant Permission</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={onComplete}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={1}
                        style={styles.buttonWrapper}
                    >
                        <LinearGradient
                            colors={colors.gradients.premium2}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.button, shadows.primaryGlow]}
                        >
                            <Text variant="body" weight="semibold" color="#FFFFFF">Complete Setup</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </Animated.View>

            <ProgressRing current={3} total={3} />
        </View>
    );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    permissionContent: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing[6],
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: spacing[6],
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.primaryGlow,
    },
    permissionTitle: {
        marginBottom: spacing[3],
    },
    statusBadge: {
        alignSelf: 'center',
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[2],
        borderRadius: borderRadius.full,
        marginBottom: spacing[6],
    },
    explanationCard: {
        marginTop: spacing[2],
    },
    bulletPoints: {
        marginTop: spacing[4],
        gap: spacing[2],
    },
    buttonContainer: {
        paddingHorizontal: spacing[6],
        paddingBottom: spacing[6],
    },
    buttonWrapper: {
        width: '100%',
    },
    button: {
        height: tapTargets.large,
        borderRadius: borderRadius.squircle.button,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressRingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing[2],
        paddingBottom: spacing[6],
    },
    progressDot: {
        height: 8,
        borderRadius: 4,
    },
    backButton: {
        position: 'absolute',
        top: spacing[12],
        left: spacing[6],
        zIndex: 10,
    },
    backButtonCircle: {
        width: tapTargets.comfortable,
        height: tapTargets.comfortable,
        borderRadius: tapTargets.comfortable / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    decorCircle1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        top: -60,
        right: -100,
    },
    decorCircle2: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        bottom: 100,
        left: -100,
    },
    decorCircle3: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        top: '40%',
        right: -120,
    },
});

export default OnboardingUsageStats;
