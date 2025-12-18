import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { colors, spacing, borderRadius, shadows, typography } from '../theme/theme';

// ============================================
// BUTTON VARIANTS
// ============================================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    gradientIndex?: 1 | 2 | 3; // Different gradient options
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    gradientIndex = 1,
    style,
    textStyle,
}) => {
    const { theme, isDark } = useTheme();

    const sizeStyles = {
        sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.base },
        md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
        lg: { paddingVertical: spacing.base, paddingHorizontal: spacing['2xl'] },
    };

    const textSizes = {
        sm: typography.fontSize.sm,
        md: typography.fontSize.base,
        lg: typography.fontSize.lg,
    };

    const gradientColors = {
        1: colors.gradients.sage1,
        2: colors.gradients.sage2,
        3: colors.gradients.premium1,
    };

    const isDisabled = disabled || loading;

    if (variant === 'primary') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.8}
                style={[fullWidth && { width: '100%' }, style]}
            >
                <LinearGradient
                    colors={isDisabled ? [colors.neutral[300], colors.neutral[400]] : gradientColors[gradientIndex]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.button,
                        sizeStyles[size],
                        shadows.md,
                        { borderRadius: borderRadius.lg },
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <Text style={[styles.buttonTextPrimary, { fontSize: textSizes[size] }, textStyle]}>
                            {title}
                        </Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    if (variant === 'secondary') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.7}
                style={[
                    styles.button,
                    sizeStyles[size],
                    {
                        backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100],
                        borderRadius: borderRadius.lg,
                    },
                    fullWidth && { width: '100%' },
                    isDisabled && { opacity: 0.5 },
                    style,
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={theme.colors.text} size="small" />
                ) : (
                    <Text style={[
                        styles.buttonTextSecondary,
                        { fontSize: textSizes[size], color: theme.colors.text },
                        textStyle
                    ]}>
                        {title}
                    </Text>
                )}
            </TouchableOpacity>
        );
    }

    if (variant === 'outline') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.7}
                style={[
                    styles.button,
                    sizeStyles[size],
                    {
                        backgroundColor: 'transparent',
                        borderWidth: 1.5,
                        borderColor: colors.primary[400],
                        borderRadius: borderRadius.lg,
                    },
                    fullWidth && { width: '100%' },
                    isDisabled && { opacity: 0.5 },
                    style,
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={colors.primary[400]} size="small" />
                ) : (
                    <Text style={[
                        styles.buttonTextSecondary,
                        { fontSize: textSizes[size], color: colors.primary[400] },
                        textStyle
                    ]}>
                        {title}
                    </Text>
                )}
            </TouchableOpacity>
        );
    }

    // Ghost variant
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.5}
            style={[
                styles.button,
                sizeStyles[size],
                { backgroundColor: 'transparent' },
                fullWidth && { width: '100%' },
                isDisabled && { opacity: 0.5 },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={theme.colors.primary} size="small" />
            ) : (
                <Text style={[
                    styles.buttonTextSecondary,
                    { fontSize: textSizes[size], color: theme.colors.primary },
                    textStyle
                ]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonTextPrimary: {
        color: '#FFFFFF',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    buttonTextSecondary: {
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});

export default Button;
