import React, { useEffect, useRef } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    StatusBar,
    TextInput,
    Animated,
    Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import { colors, spacing, borderRadius, shadows, tapTargets } from '../../theme/theme';
import { Text, GlassCard } from '../../components';

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
// BACK BUTTON COMPONENT
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
// PROGRESS RING COMPONENT
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
// STAR RATING COMPONENT
// ============================================

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
            <Text
                key={star}
                variant="body"
                style={{ ...styles.star, opacity: star <= rating ? 1 : 0.25 }}
            >
                ★
            </Text>
        ))}
    </View>
);

// ============================================
// ONBOARDING SCREEN 1: VALUE PROPOSITION
// ============================================

interface OnboardingValueProps {
    onNext: () => void;
}

export const OnboardingValue: React.FC<OnboardingValueProps> = ({ onNext }) => {
    const { theme, isDark } = useTheme();
    const anim1 = useEntranceAnimation(0);
    const anim2 = useEntranceAnimation(200);
    const anim3 = useEntranceAnimation(400);
    const buttonScale = useRef(new Animated.Value(1)).current;

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

            {/* 2.5D Decorative circles */}
            <View style={[styles.decorCircle1, { backgroundColor: isDark ? 'rgba(119,141,118,0.1)' : 'rgba(119,141,118,0.08)' }]} />
            <View style={[styles.decorCircle2, { backgroundColor: isDark ? 'rgba(119,141,118,0.06)' : 'rgba(119,141,118,0.04)' }]} />

            <View style={styles.content}>
                <Animated.View style={[styles.imageContainer, { opacity: anim1.opacity, transform: [{ scale: anim1.scale }] }]}>
                    <Image
                        source={require('../../../assets/images/onboarding-zen.png')}
                        style={styles.heroImage}
                        resizeMode="contain"
                    />
                </Animated.View>

                <Animated.View style={{ opacity: anim2.opacity, transform: [{ translateY: anim2.translateY }] }}>
                    <GlassCard intensity="medium" padding="xl" style={styles.glassCard}>
                        <Text variant="h2" weight="bold" align="center" style={styles.title}>
                            Blockd removes{'\n'}the noise.
                        </Text>
                        <Text variant="body" align="center" color={theme.colors.textSecondary} style={styles.subtitle}>
                            Reclaim your focus. Take back your time.{'\n'}One block at a time.
                        </Text>
                    </GlassCard>
                </Animated.View>
            </View>

            <Animated.View style={[styles.buttonContainer, { opacity: anim3.opacity, transform: [{ translateY: anim3.translateY }, { scale: buttonScale }] }]}>
                <TouchableOpacity
                    onPress={onNext}
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
                        <Text variant="body" weight="semibold" color="#FFFFFF">Continue</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>

            <ProgressRing current={1} total={3} />
        </View>
    );
};

// ============================================
// ONBOARDING SCREEN 2: SOCIAL PROOF
// ============================================

interface OnboardingSocialProofProps {
    onNext: () => void;
    onBack: () => void;
}

export const OnboardingSocialProof: React.FC<OnboardingSocialProofProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const buttonScale = useRef(new Animated.Value(1)).current;

    const testimonials = [
        { quote: "Reclaimed 400 hours last year. That's like getting 2 extra weeks back.", author: "Alex M.", role: "Software Engineer", rating: 5 },
        { quote: "Finally stopped doom-scrolling. My anxiety has decreased significantly.", author: "Sarah K.", role: "Designer", rating: 5 },
        { quote: "The high-friction design works. I think twice before opening apps.", author: "Michael T.", role: "Student", rating: 5 },
    ];

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

            <View style={[styles.decorCircle3, { backgroundColor: isDark ? 'rgba(119,141,118,0.1)' : 'rgba(119,141,118,0.05)' }]} />

            <BackButton onPress={onBack} isDark={isDark} />

            <View style={styles.header}>
                <Text variant="h3" weight="bold" align="center">People are reclaiming{'\n'}their time.</Text>
            </View>

            <View style={styles.testimonialsContainer}>
                {testimonials.map((testimonial, index) => {
                    const anim = useEntranceAnimation(index * 150);
                    return (
                        <Animated.View
                            key={index}
                            style={{ opacity: anim.opacity, transform: [{ translateY: anim.translateY }] }}
                        >
                            <GlassCard intensity={index === 1 ? 'strong' : 'medium'} padding="lg" style={styles.testimonialCard}>
                                <StarRating rating={testimonial.rating} />
                                <Text variant="body" style={styles.quoteText}>"{testimonial.quote}"</Text>
                                <View style={styles.authorRow}>
                                    <LinearGradient colors={colors.gradients.sage1} style={styles.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                        <Text variant="bodySmall" weight="bold" color="#FFFFFF">{testimonial.author[0]}</Text>
                                    </LinearGradient>
                                    <View>
                                        <Text variant="bodySmall" weight="semibold">{testimonial.author}</Text>
                                        <Text variant="caption" color={theme.colors.textTertiary}>{testimonial.role}</Text>
                                    </View>
                                </View>
                            </GlassCard>
                        </Animated.View>
                    );
                })}
            </View>

            <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScale }] }]}>
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
            </Animated.View>

            <ProgressRing current={2} total={3} />
        </View>
    );
};

// ============================================
// ONBOARDING SCREEN 3: NAME INPUT
// ============================================

interface OnboardingIdentityProps {
    onNext: (name: string) => void;
    onBack: () => void;
}

export const OnboardingIdentity: React.FC<OnboardingIdentityProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const [name, setName] = React.useState('');
    const [isFocused, setIsFocused] = React.useState(false);
    const buttonScale = useRef(new Animated.Value(1)).current;
    const inputScale = useRef(new Animated.Value(1)).current;
    const anim1 = useEntranceAnimation(0);
    const anim2 = useEntranceAnimation(200);

    const handleFocus = () => {
        setIsFocused(true);
        Animated.spring(inputScale, { toValue: 1.02, tension: 300, friction: 15, useNativeDriver: true }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.spring(inputScale, { toValue: 1, tension: 300, friction: 15, useNativeDriver: true }).start();
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

            <View style={[styles.decorCircle1, { backgroundColor: isDark ? 'rgba(119,141,118,0.08)' : 'rgba(119,141,118,0.06)', top: '25%' }]} />
            <View style={[styles.decorCircle2, { backgroundColor: isDark ? 'rgba(119,141,118,0.05)' : 'rgba(119,141,118,0.03)' }]} />

            <BackButton onPress={onBack} isDark={isDark} />

            <View style={styles.identityContent}>
                <Animated.View style={{ opacity: anim1.opacity, transform: [{ translateY: anim1.translateY }] }}>
                    <Text variant="h2" weight="bold" align="center" style={styles.identityTitle}>
                        What should we{'\n'}call you?
                    </Text>
                    <Text variant="body" align="center" color={theme.colors.textSecondary} style={{ marginBottom: spacing[8] }}>
                        Let's personalize your experience
                    </Text>
                </Animated.View>

                <Animated.View style={{ opacity: anim2.opacity, transform: [{ translateY: anim2.translateY }, { scale: inputScale }] }}>
                    <View style={[
                        styles.modernInputContainer,
                        {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.95)',
                            borderColor: isFocused || name.length > 0 ? colors.primary[400] : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                            ...shadows.card,
                        },
                    ]}>
                        <LinearGradient
                            colors={name.length > 0 ? colors.gradients.sage1 : [colors.neutral[400], colors.neutral[500]]}
                            style={styles.inputIcon}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text variant="body" color="#FFFFFF" weight="bold">
                                {name.length > 0 ? name[0].toUpperCase() : '?'}
                            </Text>
                        </LinearGradient>
                        <TextInput
                            style={[styles.modernTextInput, { color: theme.colors.text }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor={theme.colors.textTertiary}
                            autoCapitalize="words"
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                        {name.length > 0 && (
                            <TouchableOpacity onPress={() => setName('')} style={styles.clearButton}>
                                <Text variant="caption" color={theme.colors.textTertiary}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {name.length > 0 && (
                        <Text variant="body" align="center" color={theme.colors.textSecondary} style={{ marginTop: spacing[6] }}>
                            Hey {name}! Ready to focus? 🧘
                        </Text>
                    )}
                </Animated.View>
            </View>

            <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScale }], opacity: name.length > 0 ? 1 : 0.5 }]}>
                <TouchableOpacity
                    onPress={() => name.length > 0 && onNext(name)}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={1}
                    style={styles.buttonWrapper}
                    disabled={name.length === 0}
                >
                    <LinearGradient
                        colors={name.length > 0 ? colors.gradients.sage2 : [colors.neutral[400], colors.neutral[500]]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.button, name.length > 0 ? shadows.primaryGlow : {}]}
                    >
                        <Text variant="body" weight="semibold" color="#FFFFFF">Continue</Text>
                    </LinearGradient>
                </TouchableOpacity>
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
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing[6],
    },
    header: {
        paddingTop: height * 0.12,
        paddingHorizontal: spacing[6],
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: spacing[6],
    },
    heroImage: {
        width: width * 0.55,
        height: width * 0.55,
    },
    glassCard: {
        marginTop: spacing[4],
    },
    title: {
        marginBottom: spacing[3],
    },
    subtitle: {
        lineHeight: 24,
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
    starContainer: {
        flexDirection: 'row',
        marginBottom: spacing[2],
    },
    star: {
        fontSize: 16,
        color: colors.star,
        marginRight: 2,
    },
    decorCircle1: {
        position: 'absolute',
        width: 320,
        height: 320,
        borderRadius: 160,
        top: -60,
        right: -100,
    },
    decorCircle2: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        bottom: 100,
        left: -80,
    },
    decorCircle3: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        top: '38%',
        right: -100,
    },
    testimonialsContainer: {
        flex: 1,
        paddingHorizontal: spacing[6],
        paddingTop: spacing[4],
        gap: spacing[3],
    },
    testimonialCard: {
        marginBottom: spacing[1],
    },
    quoteText: {
        fontStyle: 'italic',
        marginBottom: spacing[3],
        lineHeight: 22,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[3],
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    identityContent: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing[6],
    },
    identityTitle: {
        marginBottom: spacing[2],
    },
    modernInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderRadius: borderRadius.squircle.lg,
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
    },
    inputIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing[4],
    },
    modernTextInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        padding: 0,
    },
    clearButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default OnboardingValue;
