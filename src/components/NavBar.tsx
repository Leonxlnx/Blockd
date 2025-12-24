import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../theme';
import { spacing } from '../theme/theme';

type Tab = 'dashboard' | 'limits' | 'settings';

const HomeIcon: React.FC<{ size: number; color: string; filled?: boolean }> = ({ size, color, filled }) => (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.6, height: size * 0.5, borderWidth: filled ? 0 : 2.5, borderColor: color, backgroundColor: filled ? color : 'transparent', borderRadius: 4 }} />
        <View style={{ width: size * 0.3, height: size * 0.35, backgroundColor: filled ? 'transparent' : color, position: 'absolute', bottom: 1, borderRadius: 2 }} />
    </View>
);

const ShieldIcon: React.FC<{ size: number; color: string; filled?: boolean }> = ({ size, color, filled }) => (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.6, height: size * 0.7, borderWidth: filled ? 0 : 2.5, borderColor: color, backgroundColor: filled ? color : 'transparent', borderRadius: 4, borderBottomLeftRadius: size * 0.3, borderBottomRightRadius: size * 0.3 }} />
    </View>
);

const GearIcon: React.FC<{ size: number; color: string; filled?: boolean }> = ({ size, color, filled }) => (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.5, height: size * 0.5, borderWidth: filled ? 0 : 2.5, borderColor: color, backgroundColor: filled ? color : 'transparent', borderRadius: size * 0.25 }} />
    </View>
);

export const NavBar: React.FC<{ activeTab: Tab; onTabPress: (tab: Tab) => void; isDark: boolean }> = ({ activeTab, onTabPress, isDark }) => {
    const { theme } = useTheme();

    // Animations for individual tabs could be added here

    const activeColor = isDark ? '#FFFFFF' : '#000000';
    const inactiveColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

    return (
        <View style={[styles.container, {
            backgroundColor: isDark ? 'rgba(20,20,25,0.85)' : 'rgba(255,255,255,0.85)',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        }]}>
            <TabItem
                icon={<HomeIcon size={24} color={activeTab === 'dashboard' ? activeColor : inactiveColor} filled={activeTab === 'dashboard'} />}
                label="Overview"
                isActive={activeTab === 'dashboard'}
                onPress={() => onTabPress('dashboard')}
                color={activeColor}
            />
            <TabItem
                icon={<ShieldIcon size={24} color={activeTab === 'limits' ? activeColor : inactiveColor} filled={activeTab === 'limits'} />}
                label="Limits"
                isActive={activeTab === 'limits'}
                onPress={() => onTabPress('limits')}
                color={activeColor}
            />
            <TabItem
                icon={<GearIcon size={24} color={activeTab === 'settings' ? activeColor : inactiveColor} filled={activeTab === 'settings'} />}
                label="Settings"
                isActive={activeTab === 'settings'}
                onPress={() => onTabPress('settings')}
                color={activeColor}
            />
        </View>
    );
};

const TabItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onPress: () => void; color: string }> = ({ icon, label, isActive, onPress, color }) => {
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(scale, {
            toValue: isActive ? 1.1 : 1,
            useNativeDriver: true,
            friction: 5
        }).start();
    }, [isActive]);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.tabItem}
        >
            <Animated.View style={{ transform: [{ scale }] }}>
                {icon}
            </Animated.View>
            {isActive && (
                <Text variant="caption" weight="bold" color={color} style={{ fontSize: 10, marginTop: 4 }}>
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 30 : 20,
        left: 20,
        right: 20,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'space-around',
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        paddingHorizontal: spacing[2],
        backdropFilter: 'blur(20px)', // Works on some versions, ignored on others
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        width: 60,
    }
});
