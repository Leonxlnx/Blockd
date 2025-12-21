import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    StatusBar,
    TextInput,
    Animated,
    Easing,
    ScrollView,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/theme';
import { Text } from '../../components';

const { width, height } = Dimensions.get('window');

// Pure gradient background only (no animated blobs)
const FlowingBackground: React.FC<{ isDark: boolean }> = () => null;


// ============================================
// ENTRANCE ANIMATION
// ============================================

const useEntranceAnimation = (delay: number = 0) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(35)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 400, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 500, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
    }, []);

    return { opacity, translateY };
};

// ============================================
// PROGRESS BAR (TOP)
// ============================================

interface ProgressBarProps {
    current: number;
    total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
    const { isDark } = useTheme();

    return (
        <View style={styles.progressBarContainer}>
            {Array.from({ length: total }).map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.progressSegment,
                        {
                            backgroundColor: index < current
                                ? (isDark ? '#FFFFFF' : '#1A1A1A')
                                : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'),
                        },
                    ]}
                />
            ))}
        </View>
    );
};

// ============================================
// PREMIUM 2.5D BUTTONS
// ============================================

interface BottomButtonsProps {
    onBack?: () => void;
    onNext: () => void;
    nextLabel?: string;
    nextDisabled?: boolean;
    showBack?: boolean;
    isDark: boolean;
}

const BottomButtons: React.FC<BottomButtonsProps> = ({
    onBack,
    onNext,
    nextLabel = 'Continue',
    nextDisabled = false,
    showBack = true,
    isDark,
}) => (
    <View style={styles.bottomButtonsContainer}>
        {showBack && onBack ? (
            <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backButtonWrapper}>
                <LinearGradient
                    colors={isDark ? ['#1A1A1A', '#282828', '#1A1A1A'] : ['#F5F5F5', '#FFFFFF', '#F5F5F5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[styles.buttonBase, { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }]}
                >
                    <Text variant="body" weight="semibold" color={isDark ? '#FFFFFF' : '#1A1A1A'}>
                        Back
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        ) : (
            <View style={styles.backButtonWrapper} />
        )}

        <TouchableOpacity
            onPress={onNext}
            activeOpacity={0.8}
            disabled={nextDisabled}
            style={[styles.nextButtonWrapper, { opacity: nextDisabled ? 0.3 : 1 }]}
        >
            <LinearGradient
                colors={isDark ? ['#FFFFFF', '#F0F0F0', '#DFDFDF'] : ['#2A2A2A', '#1A1A1A', '#0A0A0A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.nextButtonBase}
            >
                <Text variant="body" weight="bold" color={isDark ? '#0A0A0A' : '#FFFFFF'}>
                    {nextLabel}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    </View>
);

// ============================================
// SCREEN 1: WELCOME
// ============================================

interface OnboardingWelcomeProps {
    onNext: () => void;
    onBack: () => void;
}

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const imgAnim = useEntranceAnimation(0);
    const titleAnim = useEntranceAnimation(120);
    const subAnim = useEntranceAnimation(220);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F', '#101018', '#0C0C12', '#050508'] : ['#FAFAFA', '#F2F2F5', '#E8E8EC', '#F0F0F4', '#FAFAFA']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
            <FlowingBackground isDark={isDark} />

            <ProgressBar current={1} total={6} />

            <View style={styles.content}>
                <Animated.View style={[styles.imageWrap, { opacity: imgAnim.opacity, transform: [{ translateY: imgAnim.translateY }] }]}>
                    <Image source={require('../../../assets/images/mascot-placeholder.png')} style={[styles.imageXL, { tintColor: isDark ? undefined : '#1A1A1A' }]} resizeMode="contain" />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h1" weight="bold" align="center" style={styles.headline}>We live in an{'\n'}over-stimulating world</Text>
                </Animated.View>

                <Animated.View style={{ opacity: subAnim.opacity, transform: [{ translateY: subAnim.translateY }] }}>
                    <Text variant="body" align="center" color={theme.colors.textSecondary} style={styles.subtext}>It makes us tired, stressed,{'\n'}and unable to focus</Text>
                </Animated.View>
            </View>

            <BottomButtons onBack={onBack} onNext={onNext} isDark={isDark} />
        </View>
    );
};

// ============================================
// SCREEN 2: PROBLEM
// ============================================

interface OnboardingProblemProps {
    onNext: () => void;
    onBack: () => void;
}

export const OnboardingProblem: React.FC<OnboardingProblemProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const imgAnim = useEntranceAnimation(0);
    const titleAnim = useEntranceAnimation(120);
    const subAnim = useEntranceAnimation(220);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F', '#101018', '#0C0C12', '#050508'] : ['#FAFAFA', '#F2F2F5', '#E8E8EC', '#F0F0F4', '#FAFAFA']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
            <FlowingBackground isDark={isDark} />

            <ProgressBar current={2} total={6} />

            <View style={styles.content}>
                <Animated.View style={[styles.imageWrap, { opacity: imgAnim.opacity, transform: [{ translateY: imgAnim.translateY }] }]}>
                    <Image source={require('../../../assets/images/onboarding-overwhelmed.png')} style={[styles.imageXL, { tintColor: isDark ? undefined : '#1A1A1A' }]} resizeMode="contain" />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h1" weight="bold" align="center" style={styles.headline}>A new world needs{'\n'}new solutions</Text>
                </Animated.View>

                <Animated.View style={{ opacity: subAnim.opacity, transform: [{ translateY: subAnim.translateY }] }}>
                    <Text variant="body" align="center" color={theme.colors.textSecondary} style={styles.subtext}>Technology that helps us{'\n'}reclaim control</Text>
                </Animated.View>
            </View>

            <BottomButtons onBack={onBack} onNext={onNext} isDark={isDark} />
        </View>
    );
};

// ============================================
// SCREEN 3: SOLUTION
// ============================================

interface OnboardingSolutionProps {
    onNext: () => void;
    onBack: () => void;
}

export const OnboardingSolution: React.FC<OnboardingSolutionProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const imgAnim = useEntranceAnimation(0);
    const titleAnim = useEntranceAnimation(120);
    const subAnim = useEntranceAnimation(220);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F', '#101018', '#0C0C12', '#050508'] : ['#FAFAFA', '#F2F2F5', '#E8E8EC', '#F0F0F4', '#FAFAFA']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
            <FlowingBackground isDark={isDark} />

            <ProgressBar current={3} total={6} />

            <View style={styles.content}>
                <Animated.View style={[styles.imageWrap, { opacity: imgAnim.opacity, transform: [{ translateY: imgAnim.translateY }] }]}>
                    <Image source={isDark ? require('../../../assets/images/logo-dark.png') : require('../../../assets/images/logo-light.png')} style={styles.logoXXL} resizeMode="contain" />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h1" weight="bold" align="center" style={styles.headline}>That's why we{'\n'}made Blockd</Text>
                </Animated.View>

                <Animated.View style={{ opacity: subAnim.opacity, transform: [{ translateY: subAnim.translateY }] }}>
                    <Text variant="body" align="center" color={theme.colors.textSecondary} style={styles.subtext}>An antidote to distraction.{'\n'}Powered by intention.</Text>
                </Animated.View>
            </View>

            <BottomButtons onBack={onBack} onNext={onNext} isDark={isDark} />
        </View>
    );
};

// ============================================
// SCREEN 4: BENEFITS (5-Star Image)
// ============================================

interface OnboardingBenefitsProps {
    onNext: () => void;
    onBack: () => void;
}

export const OnboardingBenefits: React.FC<OnboardingBenefitsProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const imgAnim = useEntranceAnimation(0);
    const titleAnim = useEntranceAnimation(180);
    const subAnim = useEntranceAnimation(300);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F', '#101018', '#0C0C12', '#050508'] : ['#FAFAFA', '#F2F2F5', '#E8E8EC', '#F0F0F4', '#FAFAFA']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
            <FlowingBackground isDark={isDark} />

            <ProgressBar current={4} total={6} />

            <View style={styles.content}>
                <Animated.View style={[styles.starsImageWrap, { opacity: imgAnim.opacity, transform: [{ translateY: imgAnim.translateY }] }]}>
                    <Image source={require('../../../assets/images/stars-5-rating.png')} style={[styles.starsImage, { tintColor: isDark ? undefined : '#1A1A1A' }]} resizeMode="contain" />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h1" weight="bold" align="center" style={styles.headline}>Improve your focus{'\n'}and reclaim your time</Text>
                </Animated.View>

                <Animated.View style={{ opacity: subAnim.opacity, transform: [{ translateY: subAnim.translateY }] }}>
                    <Text variant="body" align="center" color={theme.colors.textSecondary} style={styles.subtext}>Focus, relax, and be present.{'\n'}See the magic in everyday life.</Text>
                </Animated.View>
            </View>

            <BottomButtons onBack={onBack} onNext={onNext} isDark={isDark} />
        </View>
    );
};

// ============================================
// SCREEN 5: HOW HEARD (2-Col Grid)
// ============================================

const SOURCES = [
    { id: 'instagram', label: 'Instagram' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'x', label: 'X (Twitter)' },
    { id: 'ads', label: 'Ads' },
    { id: 'friend', label: 'Friend' },
    { id: 'appstore', label: 'App Store' },
    { id: 'other', label: 'Other' },
];

interface OnboardingHowHeardProps {
    onNext: (source: string) => void;
    onBack: () => void;
}

export const OnboardingHowHeard: React.FC<OnboardingHowHeardProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const [selected, setSelected] = useState<string | null>(null);
    const [otherText, setOtherText] = useState('');
    const titleAnim = useEntranceAnimation(0);
    const imgAnim = useEntranceAnimation(80);

    const isValid = selected && (selected !== 'other' || otherText.length > 0);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F', '#101018', '#0C0C12', '#050508'] : ['#FAFAFA', '#F2F2F5', '#E8E8EC', '#F0F0F4', '#FAFAFA']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
            <FlowingBackground isDark={isDark} />

            <ProgressBar current={5} total={6} />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.howHeardScrollContent}>
                <Animated.View style={[styles.howHeardImageWrap, { opacity: imgAnim.opacity, transform: [{ translateY: imgAnim.translateY }] }]}>
                    <Image source={require('../../../assets/images/onboarding-source.png')} style={[styles.howHeardImage, { tintColor: isDark ? undefined : '#1A1A1A' }]} resizeMode="contain" />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h2" weight="bold" align="center" style={styles.headlineSmaller}>Where did you hear{'\n'}about us?</Text>
                </Animated.View>

                <View style={styles.gridContainer}>
                    {SOURCES.map((source) => {
                        const isSelected = selected === source.id;
                        const isOtherSelected = source.id === 'other' && isSelected;

                        return (
                            <TouchableOpacity
                                key={source.id}
                                onPress={() => { setSelected(source.id); if (source.id !== 'other') setOtherText(''); }}
                                activeOpacity={0.7}
                                style={[
                                    styles.gridItem,
                                    {
                                        backgroundColor: isSelected ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                                        borderColor: isSelected ? (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)') : 'transparent',
                                    },
                                ]}
                            >
                                {isOtherSelected ? (
                                    <TextInput
                                        style={[styles.otherInlineInput, { color: theme.colors.text }]}
                                        value={otherText}
                                        onChangeText={setOtherText}
                                        placeholder="Type..."
                                        placeholderTextColor={theme.colors.textTertiary}
                                        autoFocus
                                    />
                                ) : (
                                    <Text variant="bodySmall" weight={isSelected ? 'bold' : 'medium'} align="center">{source.label}</Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <BottomButtons onBack={onBack} onNext={() => isValid && onNext(selected === 'other' ? otherText : selected!)} nextDisabled={!isValid} isDark={isDark} />
        </View>
    );
};

// ============================================
// SCREEN 6: NAME INPUT (Keyboard Aware)
// ============================================

interface OnboardingNameProps {
    onNext: (name: string) => void;
    onBack: () => void;
}

export const OnboardingName: React.FC<OnboardingNameProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const [name, setName] = useState('');
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const titleAnim = useEntranceAnimation(0);
    const imgAnim = useEntranceAnimation(80);
    const inputAnim = useEntranceAnimation(160);

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
        return () => { showSub.remove(); hideSub.remove(); };
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#050508', '#0A0A0F', '#101018', '#0C0C12', '#050508'] : ['#FAFAFA', '#F2F2F5', '#E8E8EC', '#F0F0F4', '#FAFAFA']} locations={[0, 0.25, 0.5, 0.75, 1]} style={StyleSheet.absoluteFillObject} />

            <ProgressBar current={6} total={6} />

            <KeyboardAvoidingView style={styles.nameContent} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                {!keyboardVisible && (
                    <Animated.View style={[styles.imageWrap, { opacity: imgAnim.opacity, transform: [{ translateY: imgAnim.translateY }] }]}>
                        <Image source={require('../../../assets/images/onboarding-name.png')} style={[styles.nameImage, { tintColor: isDark ? undefined : '#1A1A1A' }]} resizeMode="contain" />
                    </Animated.View>
                )}

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h1" weight="bold" align="center" style={styles.headline}>What should we{'\n'}call you?</Text>
                    <Text variant="body" align="center" color={theme.colors.textSecondary} style={{ marginTop: spacing[2] }}>Let's personalize your experience</Text>
                </Animated.View>

                <Animated.View style={[styles.inputWrapper, { opacity: inputAnim.opacity, transform: [{ translateY: inputAnim.translateY }] }]}>
                    <LinearGradient colors={isDark ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)'] : ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.02)']} style={styles.inputCard}>
                        <TextInput
                            style={[styles.nameInput, { color: theme.colors.text }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor={theme.colors.textTertiary}
                            autoCapitalize="words"
                        />
                    </LinearGradient>
                </Animated.View>
            </KeyboardAvoidingView>

            {/* Buttons ALWAYS at fixed bottom - outside KeyboardAvoidingView */}
            <View style={styles.bottomFixed}>
                <BottomButtons onBack={onBack} onNext={() => name.length > 0 && onNext(name)} nextDisabled={name.length === 0} isDark={isDark} />
            </View>
        </View>
    );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    container: { flex: 1 },
    bottomFixed: { position: 'absolute', bottom: 0, left: 0, right: 0 },
    waveBlob: { position: 'absolute' },
    scrollView: { flex: 1 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing[5] },
    nameContent: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing[5] },

    // Progress bar at top
    progressBarContainer: { position: 'absolute', top: 50, left: spacing[5], right: spacing[5], flexDirection: 'row', gap: 6, zIndex: 10 },
    progressSegment: { flex: 1, height: 3, borderRadius: 1.5 },

    // Images
    imageWrap: { marginBottom: spacing[5], alignItems: 'center' },
    imageXL: { width: width * 0.7, height: width * 0.7 },
    logoXXL: { width: 180, height: 180 },
    starsImageWrap: { marginBottom: spacing[5], alignItems: 'center' },
    starsImage: { width: width * 0.6, height: 80 },
    nameImage: { width: width * 0.5, height: width * 0.5 },

    // Text
    headline: { marginBottom: spacing[2], fontSize: 32, lineHeight: 42 },
    headlineSmaller: { marginBottom: spacing[4], fontSize: 26, lineHeight: 34 },
    subtext: { lineHeight: 26, fontSize: 16 },

    // How Heard
    howHeardScrollContent: { paddingHorizontal: spacing[4], paddingTop: 100, paddingBottom: spacing[4] },
    howHeardImageWrap: { alignItems: 'center', marginBottom: spacing[4] },
    howHeardImage: { width: width * 0.55, height: width * 0.4 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing[3], marginTop: spacing[4] },
    gridItem: { width: (width - spacing[4] * 2 - spacing[3]) / 2, paddingVertical: spacing[4], paddingHorizontal: spacing[3], borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, minHeight: 56 },
    otherInlineInput: { fontSize: 15, textAlign: 'center', width: '100%', padding: 0 },

    // Name input
    inputWrapper: { marginTop: spacing[5] },
    inputCard: { borderRadius: 20, paddingHorizontal: spacing[5], paddingVertical: spacing[4] },
    nameInput: { fontSize: 20, fontWeight: '500', textAlign: 'center', padding: spacing[2] },

    // Buttons
    bottomButtonsContainer: { flexDirection: 'row', paddingHorizontal: spacing[4], paddingBottom: spacing[4], gap: spacing[3] },
    backButtonWrapper: { flex: 1 },
    buttonBase: { height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    nextButtonWrapper: { flex: 2 },
    nextButtonBase: { height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
});

export default OnboardingWelcome;
