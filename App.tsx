import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ThemeProvider, useTheme } from './src/theme';
import SplashScreen from './src/screens/SplashScreen';
import {
  OnboardingWelcome,
  OnboardingProblem,
  OnboardingSolution,
  OnboardingBenefits,
  OnboardingHowHeard,
  OnboardingName,
} from './src/screens/onboarding/OnboardingScreens';
import {
  OnboardingUsageStats,
  OnboardingOverlay,
  OnboardingBattery,
} from './src/screens/onboarding/OnboardingPermissions';
import {
  AppAnalysisScreen,
  AppSelectionScreen,
  TimeCalculationScreen,
  CommitmentScreen,
  AppUsage,
} from './src/screens/onboarding/AppSetupScreens';
import {
  HelloNameScreen,
  LetsPersonalizeScreen,
  AgeSelectionScreen,
  GenderSelectionScreen,
  ConcentrationScaleScreen,
  PhoneStatsScreen,
  StudyScreen,
  RewireScreen,
  FiveDaysScreen,
  ReadyScreen,
  AuthScreen,
  WelcomeFirstTimeScreen,
} from './src/screens/onboarding/PersonalizationScreens';
import MainApp from './src/screens/MainApp';

type Screen =
  | 'splash'
  | 'onboarding-welcome'
  | 'onboarding-problem'
  | 'onboarding-solution'
  | 'onboarding-benefits'
  | 'onboarding-howheard'
  | 'onboarding-name'
  | 'hello-name'
  | 'permissions-usage'
  | 'permissions-overlay'
  | 'permissions-battery'
  | 'app-analysis'
  | 'app-selection'
  | 'time-calculation'
  | 'commitment'
  | 'lets-personalize'
  | 'personalize-age'
  | 'personalize-gender'
  | 'personalize-concentration'
  | 'personalize-phonestats'
  | 'personalize-study'
  | 'personalize-rewire'
  | 'personalize-fivedays'
  | 'personalize-ready'
  | 'auth'
  | 'welcome-first'
  | 'main';

// ============================================
// PREMIUM FADE TRANSITION
// ============================================

const FadeTransition: React.FC<{ children: React.ReactNode; screenKey: string }> = ({ children, screenKey }) => {
  const [currentChild, setCurrentChild] = useState(children);
  const [prevChild, setPrevChild] = useState<React.ReactNode | null>(null);
  const [currentKey, setCurrentKey] = useState(screenKey);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const prevAnim = useRef(new Animated.Value(0)).current;

  if (screenKey !== currentKey) {
    setPrevChild(currentChild);
    setCurrentChild(children);
    setCurrentKey(screenKey);

    fadeAnim.setValue(0);
    prevAnim.setValue(1);

    Animated.parallel([
      Animated.timing(prevAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, delay: 50, useNativeDriver: true }),
    ]).start(() => {
      setPrevChild(null);
    });
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      {prevChild && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: prevAnim, zIndex: 1 }]}>
          {prevChild}
        </Animated.View>
      )}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim, zIndex: 2 }]}>
        {currentChild}
      </Animated.View>
    </View>
  );
};

const AppContent: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [userName, setUserName] = useState<string>('');
  const [heardFrom, setHeardFrom] = useState<string>('');
  const [analyzedApps, setAnalyzedApps] = useState<AppUsage[]>([]);
  const [selectedApps, setSelectedApps] = useState<AppUsage[]>([]);
  const [userAge, setUserAge] = useState<string>('');
  const [userGender, setUserGender] = useState<string>('');
  const [concentrationLevel, setConcentrationLevel] = useState<number>(0);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onContinue={() => setCurrentScreen('onboarding-welcome')} />;

      case 'onboarding-welcome':
        return <OnboardingWelcome onNext={() => setCurrentScreen('onboarding-problem')} onBack={() => setCurrentScreen('splash')} />;
      case 'onboarding-problem':
        return <OnboardingProblem onNext={() => setCurrentScreen('onboarding-solution')} onBack={() => setCurrentScreen('onboarding-welcome')} />;
      case 'onboarding-solution':
        return <OnboardingSolution onNext={() => setCurrentScreen('onboarding-benefits')} onBack={() => setCurrentScreen('onboarding-problem')} />;
      case 'onboarding-benefits':
        return <OnboardingBenefits onNext={() => setCurrentScreen('onboarding-howheard')} onBack={() => setCurrentScreen('onboarding-solution')} />;
      case 'onboarding-howheard':
        return <OnboardingHowHeard onNext={(source) => { setHeardFrom(source); setCurrentScreen('onboarding-name'); }} onBack={() => setCurrentScreen('onboarding-benefits')} />;
      case 'onboarding-name':
        return (
          <OnboardingName
            onNext={(name) => {
              setUserName(name);
              setCurrentScreen('hello-name');
            }}
            onBack={() => setCurrentScreen('onboarding-howheard')}
          />
        );

      case 'hello-name':
        return <HelloNameScreen name={userName} onNext={() => setCurrentScreen('lets-personalize')} />;

      case 'lets-personalize':
        return <LetsPersonalizeScreen onNext={() => setCurrentScreen('personalize-age')} />;
      case 'personalize-age':
        return (
          <AgeSelectionScreen
            onNext={(age) => { setUserAge(age); setCurrentScreen('personalize-gender'); }}
            onBack={() => setCurrentScreen('lets-personalize')}
          />
        );
      case 'personalize-gender':
        return (
          <GenderSelectionScreen
            onNext={(gender) => { setUserGender(gender); setCurrentScreen('personalize-concentration'); }}
            onBack={() => setCurrentScreen('personalize-age')}
          />
        );
      case 'personalize-concentration':
        return (
          <ConcentrationScaleScreen
            onNext={(level) => { setConcentrationLevel(level); setCurrentScreen('permissions-usage'); }}
            onBack={() => setCurrentScreen('personalize-gender')}
          />
        );

      case 'permissions-usage':
        // Changed onComplete -> onNext
        return <OnboardingUsageStats onNext={() => setCurrentScreen('app-analysis')} onBack={() => setCurrentScreen('personalize-concentration')} />;

      case 'app-analysis':
        return <AppAnalysisScreen onNext={(apps) => { setAnalyzedApps(apps); setCurrentScreen('app-selection'); }} onBack={() => setCurrentScreen('permissions-usage')} />;

      case 'app-selection':
        // Changed initialApps -> apps
        return (
          <AppSelectionScreen
            apps={analyzedApps}
            onNext={(selected) => { setSelectedApps(selected); setCurrentScreen('time-calculation'); }}
            onBack={() => setCurrentScreen('app-analysis')}
          />
        );

      case 'time-calculation':
        return (
          <TimeCalculationScreen
            selectedApps={selectedApps}
            onNext={() => setCurrentScreen('personalize-phonestats')}
            onBack={() => setCurrentScreen('app-selection')}
          />
        );

      case 'personalize-phonestats':
        return <PhoneStatsScreen onNext={() => setCurrentScreen('permissions-overlay')} onBack={() => setCurrentScreen('time-calculation')} />;

      case 'permissions-overlay':
        // Changed onComplete -> onNext
        return <OnboardingOverlay onNext={() => setCurrentScreen('personalize-study')} onBack={() => setCurrentScreen('personalize-phonestats')} />;

      case 'personalize-study':
        return <StudyScreen onNext={() => setCurrentScreen('permissions-battery')} onBack={() => setCurrentScreen('permissions-overlay')} />;

      case 'permissions-battery':
        return <OnboardingBattery onComplete={() => setCurrentScreen('personalize-rewire')} onBack={() => setCurrentScreen('personalize-study')} />;

      case 'personalize-rewire':
        return <RewireScreen onNext={() => setCurrentScreen('personalize-fivedays')} onBack={() => setCurrentScreen('permissions-battery')} />;

      case 'personalize-fivedays':
        return <FiveDaysScreen onNext={() => setCurrentScreen('commitment')} onBack={() => setCurrentScreen('personalize-rewire')} />;

      case 'commitment':
        // Changed onNext -> onComplete
        return <CommitmentScreen onComplete={() => setCurrentScreen('personalize-ready')} onBack={() => setCurrentScreen('personalize-fivedays')} />;

      case 'personalize-ready':
        // Removed onBack
        return <ReadyScreen onNext={() => setCurrentScreen('auth')} />;

      case 'auth':
        // Mapped onDemo, onLogin, onSignup -> next step
        return (
          <AuthScreen
            onDemo={() => setCurrentScreen('welcome-first')}
            onLogin={() => setCurrentScreen('welcome-first')}
            onSignup={() => setCurrentScreen('welcome-first')}
          />
        );
      case 'welcome-first':
        // Changed onNext -> onStart
        return <WelcomeFirstTimeScreen onStart={() => setCurrentScreen('main')} />;

      case 'main':
        return <MainApp />;
    }
  };

  return (
    <ThemeProvider>
      <View style={{ flex: 1, backgroundColor: isDark ? '#050508' : '#FAFAFA' }}>
        <FadeTransition screenKey={currentScreen}>
          {renderScreen()}
        </FadeTransition>
      </View>
    </ThemeProvider>
  );
};

export default AppContent;
