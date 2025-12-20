import React, { useEffect, useRef } from 'react';
import {
    View,
    Text as RNText,
    StyleSheet,
    Image,
    Dimensions,
    TouchableWithoutFeedback,
    Animated,
    Easing,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';

const { width, height } = Dimensions.get('window');

// ============================================
// PROFESSIONAL FLOWING BACKGROUND
// ============================================

const FlowingBackground: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const wave1 = useRef(new Animated.Value(0)).current;
    const wave2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Subtle flowing wave animation
        Animated.loop(
            Animated.timing(wave1, {
                toValue: 1,
                duration: 12000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        Animated.loop(
            Animated.timing(wave2, {
                toValue: 1,
                duration: 15000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const translateX1 = wave1.interpolate({
        inputRange: [0, 1],
        outputRange: [-width * 0.5, width * 0.5],
    });

    const translateX2 = wave2.interpolate({
        inputRange: [0, 1],
        outputRange: [width * 0.3, -width * 0.3],
    });

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            {/* Wave 1 - Large subtle gradient blob */}
            <Animated.View
                style={[
                    styles.waveBlob,
                    {
                        top: height * 0.15,
                        left: -width * 0.3,
                        width: width * 1.2,
                        height: width * 1.2,
                        borderRadius: width * 0.6,
                        backgroundColor: isDark
                            ? 'rgba(255,255,255,0.015)'
                            : 'rgba(0,0,0,0.015)',
                        transform: [{ translateX: translateX1 }],
                    },
                ]}
            />
            {/* Wave 2 - Smaller accent blob */}
            <Animated.View
                style={[
                    styles.waveBlob,
                    {
                        top: height * 0.5,
                        right: -width * 0.4,
                        width: width * 0.9,
                        height: width * 0.9,
                        borderRadius: width * 0.45,
                        backgroundColor: isDark
                            ? 'rgba(255,255,255,0.02)'
                            : 'rgba(0,0,0,0.02)',
                        transform: [{ translateX: translateX2 }],
                    },
                ]}
            />
        </View>
    );
};

// ============================================
// SPLASH SCREEN
// ============================================

interface SplashScreenProps {
    onContinue: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
    const { theme, isDark } = useTheme();

    // Animation phases
    const phase = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const tapOpacity = useRef(new Animated.Value(0)).current;

    // Interpolated values for logo position
    const logoTranslateX = phase.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -50],
    });

    const logoScaleValue = Animated.add(
        logoScale,
        phase.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -0.6], // Scale down from 2.0 to 1.4
        })
    );

    useEffect(() => {
        Animated.sequence([
            // Phase 1: Logo appears BIG in CENTER
            Animated.spring(logoScale, {
                toValue: 2.0,
                tension: 35,
                friction: 6,
                useNativeDriver: true,
            }),
            // Brief pause
            Animated.delay(400),
            // Phase 2: Logo shrinks and moves left, text appears
            Animated.parallel([
                Animated.spring(phase, {
                    toValue: 1,
                    tension: 40,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(textOpacity, {
                    toValue: 1,
                    duration: 400,
                    delay: 150,
                    useNativeDriver: true,
                }),
            ]),
            // Phase 3: Tap indicator
            Animated.timing(tapOpacity, {
                toValue: 0.5,
                duration: 500,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <TouchableWithoutFeedback onPress={onContinue}>
            <View style={styles.container}>
                <StatusBar
                    barStyle={isDark ? 'light-content' : 'dark-content'}
                    backgroundColor="transparent"
                    translucent
                />

                {/* Base gradient */}
                <LinearGradient
                    colors={isDark
                        ? ['#000000', '#050505', '#0A0A0A']
                        : ['#FFFFFF', '#FAFAFA', '#F5F5F5']
                    }
                    style={StyleSheet.absoluteFillObject}
                />

                {/* Flowing background */}
                <FlowingBackground isDark={isDark} />

                {/* Center brand container */}
                <View style={styles.centerContent}>
                    <View style={styles.brandRow}>
                        {/* Logo - starts center, moves left */}
                        <Animated.View
                            style={{
                                transform: [
                                    { translateX: logoTranslateX },
                                    { scale: logoScaleValue },
                                ],
                            }}
                        >
                            <Image
                                source={isDark
                                    ? require('../../assets/images/logo-dark.png')
                                    : require('../../assets/images/logo-light.png')
                                }
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </Animated.View>

                        {/* Text - fades in */}
                        <Animated.View
                            style={{
                                opacity: textOpacity,
                                marginLeft: 8,
                            }}
                        >
                            <RNText style={[styles.brandText, { color: theme.colors.text }]}>
                                lockd
                            </RNText>
                        </Animated.View>
                    </View>
                </View>

                {/* Tap indicator */}
                <Animated.View style={[styles.tapContainer, { opacity: tapOpacity }]}>
                    <RNText style={[styles.tapText, { color: theme.colors.textTertiary }]}>
                        tap
                    </RNText>
                </Animated.View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    waveBlob: {
        position: 'absolute',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 44,
        height: 44,
    },
    brandText: {
        fontSize: 32,
        fontWeight: '300',
        letterSpacing: -1,
    },
    tapContainer: {
        position: 'absolute',
        bottom: height * 0.05,
        width: '100%',
        alignItems: 'center',
    },
    tapText: {
        fontSize: 14,
        fontWeight: '400',
        letterSpacing: 3,
    },
});

export default SplashScreen;
