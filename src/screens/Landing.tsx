import React, { useEffect, useRef } from 'react';
import {
    View,
    Text as RNText,
    StyleSheet,
    Image,
    Dimensions,
    TouchableOpacity,
    Animated,
    Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { colors, spacing, borderRadius, shadows, tapTargets } from '../theme/theme';

const { width, height } = Dimensions.get('window');

interface LandingProps {
    onNavigateToOnboarding?: () => void;
}

const Landing: React.FC<LandingProps> = ({ onNavigateToOnboarding }) => {
    const { theme, isDark } = useTheme();

    // Animation refs
    const heroOpacity = useRef(new Animated.Value(0)).current;
    const heroScale = useRef(new Animated.Value(0.9)).current;
    const heroTranslateY = useRef(new Animated.Value(-20)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const taglineTranslateY = useRef(new Animated.Value(20)).current;
    const buttonOpacity = useRef(new Animated.Value(0)).current;
    const buttonTranslateY = useRef(new Animated.Value(30)).current;
    const decorCircle1 = useRef(new Animated.Value(0)).current;
    const decorCircle2 = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Hero image entrance first
        Animated.parallel([
            Animated.timing(heroOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(heroScale, {
                toValue: 1,
                tension: 40,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(heroTranslateY, {
                toValue: 0,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();

        // Staggered entrance animations
        Animated.sequence([
            Animated.delay(300),
            // Logo entrance with bounce
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
            // Tagline slide up
            Animated.parallel([
                Animated.timing(taglineOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(taglineTranslateY, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]),
            // Button entrance
            Animated.parallel([
                Animated.timing(buttonOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(buttonTranslateY, {
                    toValue: 0,
                    tension: 60,
                    friction: 12,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // Decorative circles fade in
        Animated.parallel([
            Animated.timing(decorCircle1, {
                toValue: 1,
                duration: 800,
                delay: 200,
                useNativeDriver: true,
            }),
            Animated.timing(decorCircle2, {
                toValue: 1,
                duration: 800,
                delay: 400,
                useNativeDriver: true,
            }),
        ]).start();

        // Subtle pulse on button
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.02,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();

        // Shimmer animation for button
        const shimmer = Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        shimmer.start();

        return () => {
            pulse.stop();
            shimmer.stop();
        };
    }, []);

    // Button press animation
    const buttonScale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.96,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(buttonScale, {
            toValue: 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Background Gradient */}
            <LinearGradient
                colors={theme.gradients.background}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Decorative 2.5D Circles with parallax feel */}
            <Animated.View style={[
                styles.decorCircle1,
                {
                    backgroundColor: isDark
                        ? 'rgba(119, 141, 118, 0.08)'
                        : 'rgba(119, 141, 118, 0.06)',
                    opacity: decorCircle1,
                    transform: [{ scale: decorCircle1 }],
                }
            ]} />
            <Animated.View style={[
                styles.decorCircle2,
                {
                    backgroundColor: isDark
                        ? 'rgba(119, 141, 118, 0.06)'
                        : 'rgba(119, 141, 118, 0.04)',
                    opacity: decorCircle2,
                    transform: [{ scale: decorCircle2 }],
                }
            ]} />
            <Animated.View style={[
                styles.decorCircle3,
                {
                    backgroundColor: isDark
                        ? 'rgba(119, 141, 118, 0.04)'
                        : 'rgba(119, 141, 118, 0.03)',
                    opacity: decorCircle1,
                }
            ]} />

            {/* Hero Illustration - Floating above */}
            <Animated.View style={[
                styles.heroContainer,
                {
                    opacity: heroOpacity,
                    transform: [
                        { scale: heroScale },
                        { translateY: heroTranslateY },
                    ],
                }
            ]}>
                <Image
                    source={require('../../assets/images/hero-focus.png')}
                    style={styles.heroImage}
                    resizeMode="contain"
                />
            </Animated.View>

            {/* Content */}
            <View style={styles.content}>
                {/* Logo with theme-aware switching */}
                <Animated.View style={[
                    styles.logoContainer,
                    {
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }],
                    }
                ]}>
                    <Image
                        source={isDark
                            ? require('../../assets/images/logo-dark.png')
                            : require('../../assets/images/logo-light.png')
                        }
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>

                {/* Tagline */}
                <Animated.View style={{
                    opacity: taglineOpacity,
                    transform: [{ translateY: taglineTranslateY }],
                }}>
                    <RNText style={[styles.tagline, { color: theme.colors.text }]}>
                        Blockd removes the noise.
                    </RNText>
                    <RNText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        Reclaim your focus. One block at a time.
                    </RNText>
                </Animated.View>
            </View>

            {/* Primary CTA Button - Full width, premium gradient */}
            {onNavigateToOnboarding && (
                <Animated.View style={[
                    styles.buttonContainer,
                    {
                        opacity: buttonOpacity,
                        transform: [
                            { translateY: buttonTranslateY },
                            { scale: Animated.multiply(buttonScale, pulseAnim) },
                        ],
                    }
                ]}>
                    <TouchableOpacity
                        onPress={onNavigateToOnboarding}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={1}
                        style={styles.buttonTouchable}
                    >
                        <LinearGradient
                            colors={['#5B7A5A', '#4A6849', '#3D5A3C']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                                styles.primaryButton,
                                {
                                    // Premium colored shadow
                                    shadowColor: colors.primary[400],
                                    shadowOffset: { width: 0, height: 12 },
                                    shadowOpacity: 0.45,
                                    shadowRadius: 20,
                                    elevation: 16,
                                },
                            ]}
                        >
                            <View style={styles.buttonContent}>
                                <RNText style={styles.primaryButtonText}>Get Started</RNText>
                                <View style={styles.arrowContainer}>
                                    <RNText style={styles.arrowIcon}>→</RNText>
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Hero illustration
    heroContainer: {
        position: 'absolute',
        top: height * 0.08,
        alignItems: 'center',
        width: '100%',
    },
    heroImage: {
        width: width * 0.75,
        height: width * 0.75,
    },

    // 2.5D Decorative elements
    decorCircle1: {
        position: 'absolute',
        width: 350,
        height: 350,
        borderRadius: 175,
        top: -80,
        right: -120,
    },
    decorCircle2: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        bottom: 120,
        left: -100,
    },
    decorCircle3: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        top: height * 0.4,
        right: -60,
    },

    content: {
        alignItems: 'center',
        zIndex: 1,
        paddingHorizontal: spacing[8],
        marginTop: height * 0.35,
    },

    logoContainer: {
        marginBottom: spacing[6],
    },

    logo: {
        width: 100,
        height: 100,
    },

    tagline: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
        textAlign: 'center',
        marginBottom: spacing[2],
    },

    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        textAlign: 'center',
        letterSpacing: 0.2,
    },

    buttonContainer: {
        position: 'absolute',
        bottom: height * 0.08,
        width: '100%',
        paddingHorizontal: spacing[6],
        alignItems: 'center',
    },

    buttonTouchable: {
        width: '100%',
    },

    primaryButton: {
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing[8],
    },

    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[3],
    },

    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    arrowContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    arrowIcon: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Landing;
