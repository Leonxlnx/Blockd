import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, Easing } from 'react-native';

// ============================================
// ANIMATED CONTAINER - Using React Native's built-in Animated API
// (More stable than Reanimated for simple animations)
// ============================================

type AnimationType = 'fadeIn' | 'slideUp' | 'slideDown' | 'scale' | 'bounce' | 'fadeSlideUp';

interface AnimatedContainerProps {
    children: React.ReactNode;
    animation?: AnimationType;
    delay?: number;
    duration?: number;
    style?: ViewStyle;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
    children,
    animation = 'fadeIn',
    delay = 0,
    duration = 500,
    style,
}) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = () => {
            if (animation === 'bounce') {
                Animated.sequence([
                    Animated.spring(animatedValue, {
                        toValue: 1.1,
                        useNativeDriver: true,
                        tension: 100,
                        friction: 8,
                    }),
                    Animated.spring(animatedValue, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 100,
                        friction: 10,
                    }),
                ]).start();
            } else {
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }).start();
            }
        };

        if (delay > 0) {
            const timer = setTimeout(animate, delay);
            return () => clearTimeout(timer);
        } else {
            animate();
        }
    }, [animation, delay, duration]);

    const getAnimatedStyle = (): Animated.AnimatedProps<ViewStyle> => {
        switch (animation) {
            case 'fadeIn':
                return {
                    opacity: animatedValue,
                };

            case 'slideUp':
                return {
                    opacity: animatedValue,
                    transform: [
                        {
                            translateY: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [30, 0],
                            }),
                        },
                    ],
                };

            case 'slideDown':
                return {
                    opacity: animatedValue,
                    transform: [
                        {
                            translateY: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-30, 0],
                            }),
                        },
                    ],
                };

            case 'scale':
                return {
                    opacity: animatedValue,
                    transform: [
                        {
                            scale: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1],
                            }),
                        },
                    ],
                };

            case 'bounce':
                return {
                    transform: [
                        {
                            scale: animatedValue,
                        },
                    ],
                };

            case 'fadeSlideUp':
                return {
                    opacity: animatedValue.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0.8, 1],
                    }),
                    transform: [
                        {
                            translateY: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [50, 0],
                            }),
                        },
                    ],
                };

            default:
                return {
                    opacity: animatedValue,
                };
        }
    };

    return (
        <Animated.View style={[style, getAnimatedStyle()]}>
            {children}
        </Animated.View>
    );
};

// ============================================
// PRESSABLE SCALE - Button micro-interaction
// ============================================

interface PressableScaleProps {
    children: React.ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
    scaleValue?: number;
}

export const PressableScale: React.FC<PressableScaleProps> = ({
    children,
    onPress,
    style,
    scaleValue = 0.97,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: scaleValue,
            useNativeDriver: true,
            tension: 300,
            friction: 15,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 15,
        }).start();
    };

    return (
        <Animated.View
            style={[style, { transform: [{ scale: scaleAnim }] }]}
            onTouchStart={handlePressIn}
            onTouchEnd={() => {
                handlePressOut();
                onPress?.();
            }}
            onTouchCancel={handlePressOut}
        >
            {children}
        </Animated.View>
    );
};

export default AnimatedContainer;
