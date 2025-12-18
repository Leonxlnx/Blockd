/**
 * Blockd Design System - Premium Theme Configuration
 * Following modern mobile UI principles:
 * - 8-point grid system
 * - Squircle corners (continuous curvature)
 * - Soft colored shadows
 * - Surface hierarchy
 * - OLED-friendly dark mode
 */

import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;

// ============================================
// COLOR PALETTES
// ============================================

export const colors = {
    // Primary Palette (Sage Green Accent)
    primary: {
        50: '#F0F4F0',
        100: '#D9E5D8',
        200: '#B8CDB7',
        300: '#97B596',
        400: '#778D76', // Main accent
        500: '#5F7A5E',
        600: '#4A6149',
        700: '#384A38',
        800: '#263326',
        900: '#141B14',
    },

    // Neutral Palette (Desaturated with hint of warmth)
    neutral: {
        0: '#FFFFFF',
        50: '#FAF9F7',   // Off-white background
        100: '#F5F4F2',  // Surface 1
        150: '#EFEEEC',  // Surface 2
        200: '#E8E6E3',  // Surface 3
        300: '#D4D2CF',
        400: '#A8A5A0',
        500: '#7C7975',
        600: '#5C5955',
        700: '#3D3B38',
        800: '#2A2927',  // Dark surface
        850: '#1F1E1D',  // Darker surface
        900: '#141312',  // Dark background
        950: '#0A0908',  // OLED black (near pure)
        1000: '#000000', // Pure black
    },

    // Semantic Colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#EF4444',
    info: '#3B82F6',

    // Star rating
    star: '#FFB800',

    // Gradient Presets
    gradients: {
        // Subtle gradients for cards/backgrounds
        subtle1: ['#FAF9F7', '#F5F4F2'],
        subtle2: ['#FFFFFF', '#FAF9F7'],
        subtle3: ['#F0F4F0', '#FAF9F7'],

        // Sage green gradients for buttons/accents
        sage1: ['#8FA88E', '#778D76'],
        sage2: ['#778D76', '#5F7A5E'],
        sage3: ['#97B596', '#778D76'],

        // Premium gradients with slight color shift
        premium1: ['#778D76', '#6B857A'],
        premium2: ['#8FA88E', '#7A9485'],
        premium3: ['#9BB59A', '#778D76'],

        // Dark mode gradients
        dark1: ['#141312', '#0A0908'],
        dark2: ['#1F1E1D', '#141312'],
        dark3: ['#2A2927', '#1F1E1D'],
    },
};

// ============================================
// 8-POINT GRID SPACING SYSTEM
// ============================================

export const spacing = {
    0: 0,
    1: 4,    // Half step
    2: 8,    // Base unit
    3: 12,   // 1.5x
    4: 16,   // 2x
    5: 20,   // 2.5x
    6: 24,   // 3x
    7: 28,   // 3.5x
    8: 32,   // 4x
    10: 40,  // 5x
    12: 48,  // 6x
    14: 56,  // 7x (large tap target)
    16: 64,  // 8x
    20: 80,  // 10x
    24: 96,  // 12x
    // Semantic aliases
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
    '4xl': 64,
};

// ============================================
// TYPOGRAPHY
// ============================================

export const typography = {
    fontFamily: {
        regular: 'System',
        medium: 'System',
        semibold: 'System',
        bold: 'System',
    },

    fontSize: {
        xs: 10,
        sm: 12,
        md: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
    },

    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },

    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 0.5,
        wider: 1,
    },
};

// ============================================
// SQUIRCLE BORDER RADIUS (Continuous Curvature Simulation)
// ============================================

export const borderRadius = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    full: 9999,
    // Squircle-friendly sizes (higher values for smoother curves)
    squircle: {
        sm: 14,     // Small components
        md: 18,     // Medium components
        lg: 24,     // Large cards
        xl: 32,     // Modal/bottom sheets
        button: 16, // Button squircle
    },
};

// ============================================
// PREMIUM SHADOWS (Soft & Colored)
// ============================================

export const shadows = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },

    // Standard shadows
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 10,
    },
    '2xl': {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 32,
        elevation: 15,
    },

    // Soft colored shadows (for primary buttons)
    primaryGlow: {
        shadowColor: colors.primary[400],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryGlowStrong: {
        shadowColor: colors.primary[400],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },

    // Card shadows with subtle depth
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHover: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 5,
    },
};

// ============================================
// LIGHT THEME
// ============================================

export const lightTheme = {
    mode: 'light' as const,
    colors: {
        // Backgrounds (Surface Hierarchy)
        background: colors.neutral[50],
        surface1: colors.neutral[0],      // Cards on background
        surface2: colors.neutral[100],    // Secondary surfaces
        surface3: colors.neutral[150],    // Tertiary surfaces

        // Text
        text: colors.neutral[800],
        textSecondary: colors.neutral[500],
        textTertiary: colors.neutral[400],

        // Primary
        primary: colors.primary[400],
        primaryLight: colors.primary[100],
        primaryDark: colors.primary[600],

        // Borders
        border: colors.neutral[200],
        borderLight: colors.neutral[100],

        // Others
        overlay: 'rgba(0, 0, 0, 0.5)',
        glass: 'rgba(255, 255, 255, 0.7)',
        glassBorder: 'rgba(255, 255, 255, 0.5)',
    },
    gradients: {
        background: colors.gradients.subtle1,
        card: colors.gradients.subtle2,
        accent: colors.gradients.sage1,
        button: colors.gradients.sage2,
        premium: colors.gradients.premium2,
    },
};

// ============================================
// DARK THEME (OLED-Friendly)
// ============================================

export const darkTheme = {
    mode: 'dark' as const,
    colors: {
        // Backgrounds (Surface Hierarchy) - OLED optimized
        background: colors.neutral[950],   // Near pure black
        surface1: colors.neutral[900],     // Cards
        surface2: colors.neutral[850],     // Secondary
        surface3: colors.neutral[800],     // Tertiary

        // Text
        text: colors.neutral[50],
        textSecondary: colors.neutral[400],
        textTertiary: colors.neutral[500],

        // Primary
        primary: colors.primary[400],
        primaryLight: colors.primary[700],
        primaryDark: colors.primary[300],

        // Borders
        border: colors.neutral[700],
        borderLight: colors.neutral[800],

        // Others
        overlay: 'rgba(0, 0, 0, 0.7)',
        glass: 'rgba(30, 30, 30, 0.8)',
        glassBorder: 'rgba(255, 255, 255, 0.1)',
    },
    gradients: {
        background: colors.gradients.dark1,
        card: colors.gradients.dark2,
        accent: colors.gradients.sage1,
        button: colors.gradients.sage2,
        premium: colors.gradients.premium2,
    },
};

export type Theme = typeof lightTheme | typeof darkTheme;

// ============================================
// TAP TARGETS & INTERACTIVE ELEMENTS
// ============================================

export const tapTargets = {
    minimum: 44,    // Absolute minimum
    comfortable: 48,
    large: 56,      // Premium feel
    xlarge: 64,
};

// ============================================
// ANIMATION TIMINGS
// ============================================

export const animation = {
    duration: {
        instant: 100,
        fast: 200,
        normal: 300,
        slow: 500,
        slower: 800,
    },
    easing: {
        // Add string-based easing for reference
        easeOut: 'ease-out',
        easeIn: 'ease-in',
        easeInOut: 'ease-in-out',
    },
};

// ============================================
// RESPONSIVE SCALING
// ============================================

export const scale = (size: number): number => {
    return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

export const verticalScale = (size: number): number => {
    return (SCREEN_HEIGHT / 812) * size;
};

export const moderateScale = (size: number, factor = 0.5): number => {
    return size + (scale(size) - size) * factor;
};

export const normalize = (size: number): number => {
    const newSize = scale(size);
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    lightTheme,
    darkTheme,
    tapTargets,
    animation,
    scale,
    verticalScale,
    moderateScale,
    normalize,
};
