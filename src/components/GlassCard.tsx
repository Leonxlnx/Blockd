import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { borderRadius, shadows, spacing } from '../theme/theme';

// ============================================
// GLASS CARD - Glassmorphism Effect
// ============================================

interface GlassCardProps {
    children: React.ReactNode;
    padding?: keyof typeof spacing;
    borderRadiusSize?: keyof typeof borderRadius;
    intensity?: 'light' | 'medium' | 'strong';
    style?: ViewStyle;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    padding = 'base',
    borderRadiusSize = 'xl',
    intensity = 'medium',
    style,
}) => {
    const { theme, isDark } = useTheme();

    // Glassmorphism intensity settings
    const intensitySettings = {
        light: {
            opacity: isDark ? 0.1 : 0.6,
            borderOpacity: isDark ? 0.1 : 0.2,
        },
        medium: {
            opacity: isDark ? 0.15 : 0.7,
            borderOpacity: isDark ? 0.15 : 0.3,
        },
        strong: {
            opacity: isDark ? 0.2 : 0.85,
            borderOpacity: isDark ? 0.2 : 0.4,
        },
    };

    const settings = intensitySettings[intensity];

    return (
        <View
            style={[
                styles.container,
                {
                    borderRadius: borderRadius[borderRadiusSize] as number,
                },
                shadows.lg,
                style,
            ]}
        >
            {/* Glass Background */}
            <LinearGradient
                colors={
                    isDark
                        ? [`rgba(45, 45, 45, ${settings.opacity})`, `rgba(35, 35, 35, ${settings.opacity})`]
                        : [`rgba(255, 255, 255, ${settings.opacity})`, `rgba(250, 249, 247, ${settings.opacity})`]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    StyleSheet.absoluteFillObject,
                    {
                        borderRadius: borderRadius[borderRadiusSize] as number,
                    },
                ]}
            />

            {/* Glass Border */}
            <View
                style={[
                    StyleSheet.absoluteFillObject,
                    styles.border,
                    {
                        borderRadius: borderRadius[borderRadiusSize] as number,
                        borderColor: isDark
                            ? `rgba(255, 255, 255, ${settings.borderOpacity})`
                            : `rgba(255, 255, 255, ${settings.borderOpacity + 0.3})`,
                    },
                ]}
            />

            {/* Content */}
            <View style={{ padding: spacing[padding] }}>{children}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        position: 'relative',
    },
    border: {
        borderWidth: 1,
    },
});

export default GlassCard;
