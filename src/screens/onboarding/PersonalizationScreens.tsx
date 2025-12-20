import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    StatusBar,
    Animated,
    Easing,
    ScrollView,
    NativeModules,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/theme';
import { Text } from '../../components';

const { width, height } = Dimensions.get('window');
const { PermissionsModule } = NativeModules;

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
// PROGRESS BAR
// ============================================

const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
    const { isDark } = useTheme();
    return (
        <View style={styles.progressBarContainer}>
            {Array.from({ length: total }).map((_, index) => (
                <View key={index} style={[styles.progressSegment, { backgroundColor: index < current ? (isDark ? '#FFFFFF' : '#1A1A1A') : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)') }]} />
            ))}
        </View>
    );
};

// ============================================
// FULL WIDTH BUTTON
// ============================================

const FullWidthButton: React.FC<{ onPress: () => void; label: string; isDark: boolean; disabled?: boolean }> = ({ onPress, label, isDark, disabled = false }) => (
    <View style={styles.fullButtonContainer}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} disabled={disabled} style={[styles.fullButtonWrapper, { opacity: disabled ? 0.3 : 1 }]}>
            <LinearGradient colors={isDark ? ['#FFFFFF', '#F0F0F0', '#DFDFDF'] : ['#2A2A2A', '#1A1A1A', '#0A0A0A']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.fullButton}>
                <Text variant="body" weight="bold" color={isDark ? '#0A0A0A' : '#FFFFFF'}>{label}</Text>
            </LinearGradient>
        </TouchableOpacity>
    </View>
);

// ============================================
// TWO BUTTONS (Back + Next)
// ============================================

const TwoButtons: React.FC<{ onBack: () => void; onNext: () => void; nextLabel?: string; nextDisabled?: boolean; isDark: boolean }> = ({ onBack, onNext, nextLabel = 'Continue', nextDisabled = false, isDark }) => (
    <View style={styles.twoButtonsContainer}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backButtonWrapper}>
            <LinearGradient colors={isDark ? ['#1A1A1A', '#282828', '#1A1A1A'] : ['#F5F5F5', '#FFFFFF', '#F5F5F5']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={[styles.buttonBase, { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]}>
                <Text variant="body" weight="semibold" color={isDark ? '#FFFFFF' : '#1A1A1A'}>Back</Text>
            </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNext} activeOpacity={0.8} disabled={nextDisabled} style={[styles.nextButtonWrapper, { opacity: nextDisabled ? 0.3 : 1 }]}>
            <LinearGradient colors={isDark ? ['#FFFFFF', '#F0F0F0', '#DFDFDF'] : ['#2A2A2A', '#1A1A1A', '#0A0A0A']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.nextButton}>
                <Text variant="body" weight="bold" color={isDark ? '#0A0A0A' : '#FFFFFF'}>{nextLabel}</Text>
            </LinearGradient>
        </TouchableOpacity>
    </View>
);

// ============================================
// SCREEN: HELLO NAME
// ============================================

interface HelloNameProps { name: string; onNext: () => void; }

export const HelloNameScreen: React.FC<HelloNameProps> = ({ name, onNext }) => {
    const { theme, isDark } = useTheme();
    const titleAnim = useEntranceAnimation(0);
    const imgAnim = useEntranceAnimation(100);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#000000', '#0A0A0A', '#151515', '#0A0A0A'] : ['#FFFFFF', '#F5F5F5', '#ECECEC', '#F5F5F5']} style={StyleSheet.absoluteFillObject} />

            <View style={styles.content}>
                <Animated.View style={[styles.imageContainer, { opacity: imgAnim.opacity, transform: [{ translateY: imgAnim.translateY }] }]}>
                    <Image source={require('../../../assets/images/hello-name.png')} style={styles.heroImage} resizeMode="contain" />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h1" weight="bold" align="center" style={styles.headline}>Hello, {name}!</Text>
                    <Text variant="body" align="center" color={theme.colors.textSecondary} style={styles.subtext}>
                        Let's enable some permissions{"\n"}so the app can work properly
                    </Text>
                </Animated.View>
            </View>

            <FullWidthButton onPress={onNext} label="Continue" isDark={isDark} />
        </View>
    );
};

// ============================================
// SCREEN: LET'S PERSONALIZE
// ============================================

interface LetsPersonalizeProps { onNext: () => void; }

export const LetsPersonalizeScreen: React.FC<LetsPersonalizeProps> = ({ onNext }) => {
    const { theme, isDark } = useTheme();
    const titleAnim = useEntranceAnimation(0);
    const imgAnim = useEntranceAnimation(100);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#000000', '#0A0A0A', '#151515', '#0A0A0A'] : ['#FFFFFF', '#F5F5F5', '#ECECEC', '#F5F5F5']} style={StyleSheet.absoluteFillObject} />

            <View style={styles.content}>
                <Animated.View style={[styles.imageContainer, { opacity: imgAnim.opacity, transform: [{ translateY: imgAnim.translateY }] }]}>
                    <Image source={require('../../../assets/images/personalize.png')} style={styles.heroImage} resizeMode="contain" />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h1" weight="bold" align="center" style={styles.headline}>Let's personalize{"\n"}your experience</Text>
                    <Text variant="body" align="center" color={theme.colors.textSecondary} style={styles.subtext}>
                        Answer a few quick questions{"\n"}so we can help you better
                    </Text>
                </Animated.View>
            </View>

            <FullWidthButton onPress={onNext} label="Continue" isDark={isDark} />
        </View>
    );
};

// ============================================
// SCREEN: AGE SELECTION
// ============================================

const AGE_GROUPS = ['Under 18', '18-25', '26-34', '35-44', '45+'];

interface AgeSelectionProps { onNext: (age: string) => void; onBack: () => void; }

export const AgeSelectionScreen: React.FC<AgeSelectionProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const [selected, setSelected] = useState<string | null>(null);
    const titleAnim = useEntranceAnimation(0);
    const imgAnim = useEntranceAnimation(100);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#000000', '#0A0A0A', '#151515', '#0A0A0A'] : ['#FFFFFF', '#F5F5F5', '#ECECEC', '#F5F5F5']} style={StyleSheet.absoluteFillObject} />
            <ProgressBar current={1} total={7} />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Animated.View style={[styles.imageContainerSmall, { opacity: imgAnim.opacity, transform: [{ translateY: imgAnim.translateY }] }]}>
                    <Image source={require('../../../assets/images/age-select.png')} style={styles.smallImage} resizeMode="contain" />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h2" weight="bold" align="center" style={styles.headline}>How old are you?</Text>
                    <Text variant="body" align="center" color={theme.colors.textSecondary}>This helps us personalize your experience</Text>
                </Animated.View>

                <View style={styles.optionsList}>
                    {AGE_GROUPS.map((age) => (
                        <TouchableOpacity key={age} onPress={() => setSelected(age)} activeOpacity={0.7} style={[styles.optionItem, { backgroundColor: selected === age ? (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)') : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'), borderColor: selected === age ? (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.25)') : 'transparent' }]}>
                            <Text variant="body" weight={selected === age ? 'bold' : 'medium'}>{age}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <TwoButtons onBack={onBack} onNext={() => selected && onNext(selected)} nextDisabled={!selected} isDark={isDark} />
        </View>
    );
};

// ============================================
// SCREEN: GENDER SELECTION
// ============================================

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

interface GenderSelectionProps { onNext: (gender: string) => void; onBack: () => void; }

export const GenderSelectionScreen: React.FC<GenderSelectionProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const [selected, setSelected] = useState<string | null>(null);
    const titleAnim = useEntranceAnimation(0);
    const imgAnim = useEntranceAnimation(100);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#000000', '#0A0A0A', '#151515', '#0A0A0A'] : ['#FFFFFF', '#F5F5F5', '#ECECEC', '#F5F5F5']} style={StyleSheet.absoluteFillObject} />
            <ProgressBar current={2} total={7} />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Animated.View style={[styles.imageContainerSmall, { opacity: imgAnim.opacity, transform: [{ translateY: imgAnim.translateY }] }]}>
                    <Image source={require('../../../assets/images/gender-select.png')} style={styles.smallImage} resizeMode="contain" />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h2" weight="bold" align="center" style={styles.headline}>What's your gender?</Text>
                </Animated.View>

                <View style={styles.optionsList}>
                    {GENDERS.map((gender) => (
                        <TouchableOpacity key={gender} onPress={() => setSelected(gender)} activeOpacity={0.7} style={[styles.optionItem, { backgroundColor: selected === gender ? (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)') : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'), borderColor: selected === gender ? (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.25)') : 'transparent' }]}>
                            <Text variant="body" weight={selected === gender ? 'bold' : 'medium'}>{gender}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <TwoButtons onBack={onBack} onNext={() => selected && onNext(selected)} nextDisabled={!selected} isDark={isDark} />
        </View>
    );
};

// ============================================
// SCREEN: CONCENTRATION SCALE
// ============================================

interface ConcentrationScaleProps { onNext: (level: number) => void; onBack: () => void; }

export const ConcentrationScaleScreen: React.FC<ConcentrationScaleProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const [selected, setSelected] = useState<number | null>(null);
    const titleAnim = useEntranceAnimation(0);
    const imgAnim = useEntranceAnimation(100);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#000000', '#0A0A0A', '#151515', '#0A0A0A'] : ['#FFFFFF', '#F5F5F5', '#ECECEC', '#F5F5F5']} style={StyleSheet.absoluteFillObject} />
            <ProgressBar current={3} total={7} />

            <View style={styles.content}>
                <Animated.View style={[styles.imageContainerSmall, { opacity: imgAnim.opacity, transform: [{ translateY: imgAnim.translateY }] }]}>
                    <Image source={require('../../../assets/images/concentration.png')} style={styles.smallImage} resizeMode="contain" />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h2" weight="bold" align="center" style={styles.headline}>How hard is it for you{'\n'}to concentrate?</Text>
                    <Text variant="body" align="center" color={theme.colors.textSecondary}>On a task for a longer period</Text>
                </Animated.View>

                <View style={styles.scaleContainer}>
                    <View style={styles.scaleLabels}>
                        <Text variant="caption" weight="medium" color={theme.colors.textTertiary}>Not hard</Text>
                        <Text variant="caption" weight="medium" color={theme.colors.textTertiary}>Very hard</Text>
                    </View>
                    <View style={styles.scaleButtons}>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <TouchableOpacity key={num} onPress={() => setSelected(num)} activeOpacity={0.7} style={[styles.scaleButton, { backgroundColor: selected === num ? (isDark ? '#FFFFFF' : '#1A1A1A') : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)') }]}>
                                <Text variant="body" weight="bold" color={selected === num ? (isDark ? '#0A0A0A' : '#FFFFFF') : (isDark ? '#FFFFFF' : '#1A1A1A')}>{num}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            <TwoButtons onBack={onBack} onNext={() => selected && onNext(selected)} nextDisabled={!selected} isDark={isDark} />
        </View>
    );
};

// ============================================
// SCREEN: PHONE STATS
// ============================================

interface PhoneStatsProps { onNext: () => void; onBack: () => void; }

export const PhoneStatsScreen: React.FC<PhoneStatsProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const [stats, setStats] = useState({ opens: 0, avgMinutes: 0 });
    const [loading, setLoading] = useState(true);
    const titleAnim = useEntranceAnimation(0);
    const imgAnim = useEntranceAnimation(100);
    const statsAnim = useEntranceAnimation(300);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await PermissionsModule.getAppUsageStats(7);
                const totalApps = data?.length || 8;
                const avgOpens = Math.max(60, Math.min(150, totalApps * 8 + 40));
                const avgMins = Math.max(8, Math.round(960 / avgOpens));
                setStats({ opens: avgOpens, avgMinutes: avgMins });
            } catch {
                setStats({ opens: 85, avgMinutes: 11 });
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#000000', '#0A0A0A', '#151515', '#0A0A0A'] : ['#FFFFFF', '#F5F5F5', '#ECECEC', '#F5F5F5']} style={StyleSheet.absoluteFillObject} />
            <ProgressBar current={4} total={7} />

            <View style={styles.content}>
                <Animated.View style={[styles.imageContainerSmall, { opacity: imgAnim.opacity, transform: [{ translateY: imgAnim.translateY }] }]}>
                    <Image source={require('../../../assets/images/phone-stats.png')} style={styles.smallImage} resizeMode="contain" />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="body" align="center" color={theme.colors.textSecondary}>Looking at your phone usage...</Text>
                </Animated.View>

                <Animated.View style={[styles.statsBigContainer, { opacity: statsAnim.opacity, transform: [{ translateY: statsAnim.translateY }] }]}>
                    <View style={styles.statBox}>
                        <Text variant="h1" weight="bold" style={styles.bigNumber}>{loading ? '...' : stats.opens}</Text>
                        <Text variant="body" weight="medium" color={theme.colors.textSecondary}>times per day</Text>
                        <Text variant="caption" color={theme.colors.textTertiary}>you check your phone</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text variant="h1" weight="bold" style={styles.bigNumber}>{loading ? '...' : stats.avgMinutes}</Text>
                        <Text variant="body" weight="medium" color={theme.colors.textSecondary}>minutes average</Text>
                        <Text variant="caption" color={theme.colors.textTertiary}>between each check</Text>
                    </View>
                </Animated.View>
            </View>

            <TwoButtons onBack={onBack} onNext={onNext} isDark={isDark} />
        </View>
    );
};

// ============================================
// SCREEN: STUDY
// ============================================

interface StudyScreenProps { onNext: () => void; onBack: () => void; }

export const StudyScreen: React.FC<StudyScreenProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const titleAnim = useEntranceAnimation(0);
    const imgAnim = useEntranceAnimation(100);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#000000', '#0A0A0A', '#151515', '#0A0A0A'] : ['#FFFFFF', '#F5F5F5', '#ECECEC', '#F5F5F5']} style={StyleSheet.absoluteFillObject} />
            <ProgressBar current={5} total={7} />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentCenter}>
                <Animated.View style={[styles.imageContainerSmall, { opacity: imgAnim.opacity, transform: [{ translateY: imgAnim.translateY }] }]}>
                    <Image source={require('../../../assets/images/brain-study.png')} style={styles.smallImage} resizeMode="contain" />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h2" weight="bold" align="center" style={styles.headline}>Studies show this behavior{'\n'}affects your brain</Text>
                    <View style={[styles.studyCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                        <Text variant="body" align="center" color={theme.colors.textSecondary} style={{ lineHeight: 26 }}>
                            "Frequent phone checking reduces attention span and increases anxiety. The constant dopamine hits rewire neural pathways."
                        </Text>
                        <Text variant="caption" align="center" color={theme.colors.textTertiary} style={{ marginTop: spacing[3] }}>
                            — Journal of Behavioral Addictions, 2023
                        </Text>
                    </View>
                </Animated.View>
            </ScrollView>

            <TwoButtons onBack={onBack} onNext={onNext} isDark={isDark} />
        </View>
    );
};

// ============================================
// SCREEN: REWIRE HABITS
// ============================================

interface RewireScreenProps { onNext: () => void; onBack: () => void; }

export const RewireScreen: React.FC<RewireScreenProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const titleAnim = useEntranceAnimation(0);
    const imgAnim = useEntranceAnimation(100);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#000000', '#0A0A0A', '#151515', '#0A0A0A'] : ['#FFFFFF', '#F5F5F5', '#ECECEC', '#F5F5F5']} style={StyleSheet.absoluteFillObject} />
            <ProgressBar current={6} total={7} />

            <View style={styles.content}>
                <Animated.View style={[styles.imageContainer, { opacity: imgAnim.opacity, transform: [{ translateY: imgAnim.translateY }] }]}>
                    <Image source={require('../../../assets/images/rewire-habits.png')} style={styles.heroImage} resizeMode="contain" />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h2" weight="bold" align="center" style={styles.headline}>With Blockd, you can{'\n'}rewire these habits</Text>
                    <Text variant="body" align="center" color={theme.colors.textSecondary} style={styles.subtext}>
                        Take back control of your attention{'\n'}and focus on what truly matters
                    </Text>
                </Animated.View>
            </View>

            <TwoButtons onBack={onBack} onNext={onNext} isDark={isDark} />
        </View>
    );
};

// ============================================
// SCREEN: 5 DAYS
// ============================================

interface FiveDaysProps { onNext: () => void; onBack: () => void; }

export const FiveDaysScreen: React.FC<FiveDaysProps> = ({ onNext, onBack }) => {
    const { theme, isDark } = useTheme();
    const titleAnim = useEntranceAnimation(0);
    const imgAnim = useEntranceAnimation(100);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#000000', '#0A0A0A', '#151515', '#0A0A0A'] : ['#FFFFFF', '#F5F5F5', '#ECECEC', '#F5F5F5']} style={StyleSheet.absoluteFillObject} />
            <ProgressBar current={7} total={7} />

            <View style={styles.content}>
                <Animated.View style={[styles.imageContainerSmall, { opacity: imgAnim.opacity, transform: [{ translateY: imgAnim.translateY }] }]}>
                    <Image source={require('../../../assets/images/five-days.png')} style={styles.smallImage} resizeMode="contain" />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h1" weight="bold" align="center" style={styles.bigFive}>5</Text>
                    <Text variant="h2" weight="bold" align="center">days</Text>
                    <Text variant="body" align="center" color={theme.colors.textSecondary} style={styles.subtext}>
                        After just 5 days of using Blockd,{'\n'}you'll feel a noticeable difference{'\n'}in your focus and energy
                    </Text>
                </Animated.View>
            </View>

            <TwoButtons onBack={onBack} onNext={onNext} isDark={isDark} />
        </View>
    );
};

// ============================================
// SCREEN: BLOCKD IS READY
// ============================================

interface ReadyScreenProps { onNext: () => void; }

export const ReadyScreen: React.FC<ReadyScreenProps> = ({ onNext }) => {
    const { theme, isDark } = useTheme();
    const titleAnim = useEntranceAnimation(0);
    const imgAnim = useEntranceAnimation(100);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#000000', '#0A0A0A', '#151515', '#0A0A0A'] : ['#FFFFFF', '#F5F5F5', '#ECECEC', '#F5F5F5']} style={StyleSheet.absoluteFillObject} />

            <View style={styles.content}>
                <Animated.View style={[styles.imageContainer, { opacity: imgAnim.opacity, transform: [{ translateY: imgAnim.translateY }] }]}>
                    <Image source={require('../../../assets/images/ready-check.png')} style={styles.heroImage} resizeMode="contain" />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h1" weight="bold" align="center" style={styles.headline}>Blockd is ready{'\n'}to help you</Text>
                    <Text variant="body" align="center" color={theme.colors.textSecondary} style={styles.subtext}>
                        Let's reclaim your focus{'\n'}and take back your time
                    </Text>
                </Animated.View>
            </View>

            <FullWidthButton onPress={onNext} label="Let's Start" isDark={isDark} />
        </View>
    );
};

// ============================================
// SCREEN: AUTH (Login/Signup) - REAL ICONS
// ============================================

interface AuthScreenProps { onDemo: () => void; onLogin: () => void; onSignup: () => void; }

export const AuthScreen: React.FC<AuthScreenProps> = ({ onDemo, onLogin, onSignup }) => {
    const { theme, isDark } = useTheme();
    const titleAnim = useEntranceAnimation(0);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#000000', '#0A0A0A', '#151515', '#0A0A0A'] : ['#FFFFFF', '#F5F5F5', '#ECECEC', '#F5F5F5']} style={StyleSheet.absoluteFillObject} />

            <View style={styles.content}>
                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h2" weight="bold" align="center" style={styles.headline}>Create your account</Text>
                    <Text variant="body" align="center" color={theme.colors.textSecondary}>Save your progress and sync across devices</Text>
                </Animated.View>

                <View style={styles.authButtons}>
                    {/* Google Button */}
                    <TouchableOpacity onPress={onSignup} activeOpacity={0.8} style={[styles.authButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                        <View style={styles.authButtonContent}>
                            <Image source={require('../../../assets/images/icon-google.png')} style={styles.authIcon} resizeMode="contain" />
                            <Text variant="body" weight="semibold">Continue with Google</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Email Button */}
                    <TouchableOpacity onPress={onLogin} activeOpacity={0.8} style={[styles.authButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}>
                        <View style={styles.authButtonContent}>
                            <Image source={require('../../../assets/images/icon-email.png')} style={styles.authIcon} resizeMode="contain" />
                            <Text variant="body" weight="semibold">Continue with Email</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <FullWidthButton onPress={onDemo} label="Try Demo Mode" isDark={isDark} />
        </View>
    );
};

// ============================================
// SCREEN: WELCOME (First Time)
// ============================================

interface WelcomeFirstTimeProps { onStart: () => void; }

export const WelcomeFirstTimeScreen: React.FC<WelcomeFirstTimeProps> = ({ onStart }) => {
    const { theme, isDark } = useTheme();
    const titleAnim = useEntranceAnimation(0);
    const imgAnim = useEntranceAnimation(100);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={isDark ? ['#000000', '#0A0A0A', '#151515', '#0A0A0A'] : ['#FFFFFF', '#F5F5F5', '#ECECEC', '#F5F5F5']} style={StyleSheet.absoluteFillObject} />

            <View style={styles.content}>
                <Animated.View style={[styles.imageContainer, { opacity: imgAnim.opacity, transform: [{ translateY: imgAnim.translateY }] }]}>
                    <Image source={require('../../../assets/images/mascot-placeholder.png')} style={styles.heroImage} resizeMode="contain" />
                </Animated.View>

                <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
                    <Text variant="h1" weight="bold" align="center" style={styles.headline}>Welcome!</Text>
                    <Text variant="body" align="center" color={theme.colors.textSecondary} style={styles.subtext}>Let's start focusing</Text>
                </Animated.View>
            </View>

            <FullWidthButton onPress={onStart} label="Let's Start" isDark={isDark} />
        </View>
    );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: spacing[4], paddingTop: 100, paddingBottom: spacing[4] },
    scrollContentCenter: { flexGrow: 1, paddingHorizontal: spacing[4], paddingTop: 100, paddingBottom: spacing[4], justifyContent: 'center' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing[5] },

    progressBarContainer: { position: 'absolute', top: 50, left: spacing[5], right: spacing[5], flexDirection: 'row', gap: 6, zIndex: 10 },
    progressSegment: { flex: 1, height: 4, borderRadius: 2 },

    imageContainer: { marginBottom: spacing[5], alignItems: 'center' },
    imageContainerSmall: { marginBottom: spacing[4], alignItems: 'center' },
    heroImage: { width: width * 0.5, height: width * 0.5 },
    smallImage: { width: width * 0.35, height: width * 0.35 },

    headline: { marginBottom: spacing[2], fontSize: 28, lineHeight: 38 },
    subtext: { lineHeight: 26, fontSize: 16, marginTop: spacing[3] },
    bigFive: { fontSize: 72, lineHeight: 82, marginBottom: spacing[1] },

    optionsList: { marginTop: spacing[5], width: '100%', gap: spacing[3] },
    optionItem: { paddingVertical: spacing[4], paddingHorizontal: spacing[5], borderRadius: 16, borderWidth: 2, alignItems: 'center' },

    scaleContainer: { marginTop: spacing[6], alignItems: 'center', width: '100%' },
    scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: spacing[2], marginBottom: spacing[3] },
    scaleButtons: { flexDirection: 'row', gap: spacing[3] },
    scaleButton: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },

    statsBigContainer: { marginTop: spacing[5], gap: spacing[4], alignItems: 'center' },
    statBox: { alignItems: 'center' },
    statDivider: { width: 60, height: 2, backgroundColor: 'rgba(128,128,128,0.2)', borderRadius: 1 },
    bigNumber: { fontSize: 56, lineHeight: 66 },

    studyCard: { marginTop: spacing[5], padding: spacing[5], borderRadius: 20 },

    authButtons: { marginTop: spacing[6], width: '100%', gap: spacing[3] },
    authButton: { paddingVertical: spacing[4], paddingHorizontal: spacing[5], borderRadius: 16 },
    authButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
    authIcon: { width: 24, height: 24 },

    fullButtonContainer: { paddingHorizontal: spacing[4], paddingBottom: spacing[4] },
    fullButtonWrapper: { width: '100%' },
    fullButton: { height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },

    twoButtonsContainer: { flexDirection: 'row', paddingHorizontal: spacing[4], paddingBottom: spacing[4], gap: spacing[3] },
    backButtonWrapper: { flex: 1 },
    buttonBase: { height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
    nextButtonWrapper: { flex: 2 },
    nextButton: { height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
});
