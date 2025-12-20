import React, { useEffect, useRef } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    TouchableWithoutFeedback,
    StatusBar,
    Animated,
    Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { Text } from '../components';

const { width, height } = Dimensions.get('window');
const LOGO_SIZE = 80;

// ============================================
// SPLASH SCREEN
// ============================================

interface SplashScreenProps {
    onContinue: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
    const { theme, isDark } = useTheme();

    // Animation values
    const logoScale = useRef(new Animated.Value(0)).current;
    const phase = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const tapOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animation sequence
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

    // Logo starts at screen center, ends 60px left of center
    const logoTranslateX = phase.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -60],
    });

    // Logo starts at 2x, shrinks to 1x
    const finalLogoScale = phase.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.5],
    });

    // Combined scale (initial animation * phase animation)
    const combinedScale = Animated.multiply(logoScale, finalLogoScale);

    return (
        <TouchableWithoutFeedback onPress={onContinue}>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

                {/* Gradient Background - Stronger */}
                <LinearGradient
                    colors={isDark
                        ? ['#000000', '#0A0A0A', '#151515', '#0A0A0A', '#000000']
                        : ['#FFFFFF', '#F5F5F5', '#ECECEC', '#F5F5F5', '#FFFFFF']}
                    locations={[0, 0.25, 0.5, 0.75, 1]}
                    style={StyleSheet.absoluteFillObject}
                />

                {/* Content Container - absolutely centered */}
                <View style={styles.centerContainer}>
                    {/* Logo - starts at exact center */}
                    <Animated.View
                        style={[
                            styles.logoWrapper,
                            {
                                transform: [
                                    { translateX: logoTranslateX },
                                    { scale: combinedScale },
                                ],
                            },
                        ]}
                    >
                        <Image
                            source={isDark
                                ? require('../../assets/images/logo-dark.png')
                                : require('../../assets/images/logo-light.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </Animated.View>

                    {/* Text - appears to the right of logo */}
                    <Animated.View
                        style={[
                            styles.textWrapper,
                            {
                                opacity: textOpacity,
                            },
                        ]}
                    >
                        <Text
                            variant="h1"
                            weight="bold"
                            color={theme.colors.text}
                            style={styles.brandText}
                        >
                            lockd
                        </Text>
                    </Animated.View>
                </View>

                {/* Tap indicator */}
                <Animated.View style={[styles.tapIndicator, { opacity: tapOpacity }]}>
                    <Text variant="caption" color={theme.colors.textTertiary}>
                        tap to continue
                    </Text>
                </Animated.View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    logoWrapper: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        position: 'absolute',
        // Centered by default, logo itself is positioned here
    },
    logo: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
    },
    textWrapper: {
        marginLeft: LOGO_SIZE / 2 + 10, // Offset to appear next to scaled-down logo
    },
    brandText: {
        fontSize: 42,
        letterSpacing: 2,
    },
    tapIndicator: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
});

export default SplashScreen;
