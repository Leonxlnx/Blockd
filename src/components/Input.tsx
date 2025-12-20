import React, { useState } from 'react';
import {
    TextInput as RNTextInput,
    View,
    StyleSheet,
    TextInputProps as RNTextInputProps,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { colors, spacing, borderRadius, typography } from '../theme/theme';
import { Text } from './Text';

// ============================================
// INPUT COMPONENT
// ============================================

interface InputProps extends RNTextInputProps {
    label?: string;
    error?: string;
    hint?: string;
    variant?: 'default' | 'filled';
    containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    hint,
    variant = 'default',
    containerStyle,
    ...props
}) => {
    const { theme, isDark } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const variantStyles = {
        default: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: error
                ? colors.error
                : isFocused
                    ? colors.primary[400]
                    : theme.colors.border,
        },
        filled: {
            backgroundColor: theme.colors.surface2,
            borderWidth: 0,
        },
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text
                    variant="bodySmall"
                    weight="medium"
                    style={styles.label}
                    color={error ? colors.error : theme.colors.textSecondary}
                >
                    {label}
                </Text>
            )}
            <RNTextInput
                {...props}
                onFocus={(e) => {
                    setIsFocused(true);
                    props.onFocus?.(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    props.onBlur?.(e);
                }}
                placeholderTextColor={theme.colors.textTertiary}
                style={[
                    styles.input,
                    variantStyles[variant],
                    {
                        color: theme.colors.text,
                        borderRadius: borderRadius.lg,
                    },
                    props.style,
                ]}
            />
            {error && (
                <Text variant="caption" color={colors.error} style={styles.hint}>
                    {error}
                </Text>
            )}
            {hint && !error && (
                <Text variant="caption" color={theme.colors.textTertiary} style={styles.hint}>
                    {hint}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        marginBottom: spacing.xs,
    },
    input: {
        fontSize: typography.fontSize.base,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
    },
    hint: {
        marginTop: spacing.xs,
    },
});

export default Input;
