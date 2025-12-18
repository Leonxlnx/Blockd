import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { colors, spacing, borderRadius } from '../theme/theme';

// ============================================
// PROGRESS BAR COMPONENT
// ============================================

interface ProgressBarProps {
    progress: number; // 0-100
    height?: number;
    showGradient?: boolean;
    gradientIndex?: 1 | 2 | 3;
    backgroundColor?: string;
    style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    height = 8,
    showGradient = true,
    gradientIndex = 1,
    backgroundColor,
    style,
}) => {
    const { theme, isDark } = useTheme();

    const clampedProgress = Math.min(100, Math.max(0, progress));

    const gradientColors = {
        1: colors.gradients.sage1,
        2: colors.gradients.sage2,
        3: colors.gradients.premium1,
    };

    return (
        <View
            style={[
                styles.container,
                {
                    height,
                    backgroundColor: backgroundColor || theme.colors.surfaceSecondary,
                    borderRadius: height / 2,
                },
                style,
            ]}
        >
            {showGradient ? (
                <LinearGradient
                    colors={gradientColors[gradientIndex]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                        styles.progress,
                        {
                            width: `${clampedProgress}%`,
                            height,
                            borderRadius: height / 2,
                        },
                    ]}
                />
            ) : (
                <View
                    style={[
                        styles.progress,
                        {
                            width: `${clampedProgress}%`,
                            height,
                            borderRadius: height / 2,
                            backgroundColor: colors.primary[400],
                        },
                    ]}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        overflow: 'hidden',
    },
    progress: {
        position: 'absolute',
        left: 0,
        top: 0,
    },
});

export default ProgressBar;
