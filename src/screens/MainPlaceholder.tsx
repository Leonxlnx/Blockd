import React from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { Text } from '../components';
import { spacing } from '../theme/theme';

const MainPlaceholder: React.FC = () => {
    const { theme, isDark } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <LinearGradient
                colors={isDark
                    ? ['#0A0A0A', '#0F0F0F', '#121212']
                    : ['#FAFAFA', '#F7F7F7', '#F5F5F5']
                }
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.content}>
                <Text variant="h1" weight="bold" align="center">
                    Test
                </Text>
                <Text variant="body" align="center" color={theme.colors.textSecondary} style={{ marginTop: spacing[4] }}>
                    Main app placeholder
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing[6],
    },
});

export default MainPlaceholder;
