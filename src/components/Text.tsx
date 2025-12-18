import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { typography } from '../theme/theme';

// ============================================
// TEXT COMPONENT
// ============================================

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption' | 'label';
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

interface TextProps {
    children: React.ReactNode;
    variant?: TextVariant;
    weight?: TextWeight;
    color?: string;
    align?: 'left' | 'center' | 'right';
    style?: TextStyle;
    numberOfLines?: number;
}

export const Text: React.FC<TextProps> = ({
    children,
    variant = 'body',
    weight = 'regular',
    color,
    align = 'left',
    style,
    numberOfLines,
}) => {
    const { theme } = useTheme();

    const variantStyles: Record<TextVariant, TextStyle> = {
        h1: {
            fontSize: typography.fontSize['4xl'],
            lineHeight: typography.fontSize['4xl'] * typography.lineHeight.tight,
            letterSpacing: typography.letterSpacing.tight,
        },
        h2: {
            fontSize: typography.fontSize['3xl'],
            lineHeight: typography.fontSize['3xl'] * typography.lineHeight.tight,
            letterSpacing: typography.letterSpacing.tight,
        },
        h3: {
            fontSize: typography.fontSize['2xl'],
            lineHeight: typography.fontSize['2xl'] * typography.lineHeight.normal,
        },
        h4: {
            fontSize: typography.fontSize.xl,
            lineHeight: typography.fontSize.xl * typography.lineHeight.normal,
        },
        body: {
            fontSize: typography.fontSize.base,
            lineHeight: typography.fontSize.base * typography.lineHeight.normal,
        },
        bodySmall: {
            fontSize: typography.fontSize.md,
            lineHeight: typography.fontSize.md * typography.lineHeight.normal,
        },
        caption: {
            fontSize: typography.fontSize.sm,
            lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
        },
        label: {
            fontSize: typography.fontSize.xs,
            lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
            letterSpacing: typography.letterSpacing.wide,
            textTransform: 'uppercase',
        },
    };

    const weightStyles: Record<TextWeight, TextStyle> = {
        regular: { fontWeight: '400' },
        medium: { fontWeight: '500' },
        semibold: { fontWeight: '600' },
        bold: { fontWeight: '700' },
    };

    return (
        <RNText
            numberOfLines={numberOfLines}
            style={[
                variantStyles[variant],
                weightStyles[weight],
                { color: color || theme.colors.text, textAlign: align },
                style,
            ]}
        >
            {children}
        </RNText>
    );
};

export default Text;
