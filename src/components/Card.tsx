import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { colors, spacing, borderRadius, shadows } from '../theme/theme';

// ============================================
// CARD COMPONENT
// ============================================

type CardVariant = 'elevated' | 'outlined' | 'filled' | 'gradient';

interface CardProps {
    children: React.ReactNode;
    variant?: CardVariant;
    padding?: keyof typeof spacing;
    borderRadiusSize?: keyof typeof borderRadius;
    gradientIndex?: 1 | 2 | 3;
    style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'elevated',
    padding = 'base',
    borderRadiusSize = 'lg',
    gradientIndex = 1,
    style,
}) => {
    const { theme, isDark } = useTheme();

    const gradientColors = {
        1: isDark ? colors.gradients.dark2 : colors.gradients.subtle1,
        2: isDark ? colors.gradients.dark3 : colors.gradients.subtle2,
        3: isDark ? colors.gradients.dark1 : colors.gradients.subtle3,
    };

    if (variant === 'gradient') {
        return (
            <LinearGradient
                colors={gradientColors[gradientIndex]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    {
                        padding: spacing[padding],
                        borderRadius: borderRadius[borderRadiusSize],
                    },
                    shadows.sm,
                    style,
                ]}
            >
                {children}
            </LinearGradient>
        );
    }

    const variantStyles: Record<Exclude<CardVariant, 'gradient'>, ViewStyle> = {
        elevated: {
            backgroundColor: theme.colors.surface,
            ...shadows.md,
        },
        outlined: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        filled: {
            backgroundColor: theme.colors.surfaceSecondary,
        },
    };

    return (
        <View
            style={[
                {
                    padding: spacing[padding],
                    borderRadius: borderRadius[borderRadiusSize],
                },
                variantStyles[variant],
                style,
            ]}
        >
            {children}
        </View>
    );
};

export default Card;
