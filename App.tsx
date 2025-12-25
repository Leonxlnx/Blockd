import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
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
  OnboardingAccessibility,
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
import { OverlayManager } from './src/screens/overlays/OverlayManager';
import auth from '@react-native-firebase/auth';

type Screen =
  | 'splash'
  // Onboarding Intro (6 screens)
  | 'onboarding-welcome'
  | 'onboarding-problem'
  | 'onboarding-solution'
  | 'onboarding-benefits'
  | 'onboarding-howheard'
  | 'onboarding-name'
  // Hello Transition
  | 'hello-name'
  // PERMISSIONS (3 screens - all together)
  | 'permissions-usage'
  | 'permissions-overlay'
  | 'permissions-battery'
  | 'permissions-accessibility'
  // App Setup (4 screens)
  | 'app-analysis'
  | 'app-selection'
  | 'time-calculation'
  | 'commitment'
  // Personalization (8 screens)
  | 'lets-personalize'
  | 'personalize-age'
  | 'personalize-gender'
  | 'personalize-concentration'
  | 'personalize-phonestats'
  | 'personalize-study'
  | 'personalize-rewire'
  | 'personalize-fivedays'
  | 'personalize-ready'
  // Auth
  | 'auth'
  | 'welcome-first'
  // Main
  | 'main';

const AppContent: React.FC = () => {
  const { isDark } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Auth state listener
  function onAuthStateChanged(user: any) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  // Auto-redirect if logged in
  useEffect(() => {
    if (!initializing && user && (currentScreen === 'splash' || currentScreen === 'auth')) {
      setCurrentScreen('main');
    }
  }, [initializing, user]);

  // State
  const [userName, setUserName] = useState<string>('');
  const [heardFrom, setHeardFrom] = useState<string>('');
  const [analyzedApps, setAnalyzedApps] = useState<any[]>([]);
  const [selectedAppPackages, setSelectedAppPackages] = useState<string[]>([]);
  const [userAge, setUserAge] = useState<string>('');
  const [userGender, setUserGender] = useState<string>('');
  const [concentrationLevel, setConcentrationLevel] = useState<number>(0);

  const renderScreen = () => {
    switch (currentScreen) {
      // ==========================================
      // SPLASH
      // ==========================================
      case 'splash':
        return <SplashScreen onContinue={() => setCurrentScreen('onboarding-welcome')} />;

      // ==========================================
      // ONBOARDING INTRO (6 screens)
      // ==========================================
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

      // ==========================================
      // TRANSITION: "Hi {Name}!"
      // ==========================================
      case 'hello-name':
        return <HelloNameScreen name={userName} onNext={() => setCurrentScreen('permissions-usage')} />;

      // ==========================================
      // PERMISSIONS (3 screens - ALL TOGETHER)
      // ==========================================
      case 'permissions-usage':
        return <OnboardingUsageStats onNext={() => setCurrentScreen('permissions-overlay')} onBack={() => setCurrentScreen('hello-name')} />;
      case 'permissions-overlay':
        return <OnboardingOverlay onNext={() => setCurrentScreen('permissions-battery')} onBack={() => setCurrentScreen('permissions-usage')} />;
      case 'permissions-battery':
        return <OnboardingBattery onComplete={() => setCurrentScreen('permissions-accessibility')} onBack={() => setCurrentScreen('permissions-overlay')} />;
      case 'permissions-accessibility':
        return <OnboardingAccessibility onComplete={() => setCurrentScreen('app-analysis')} onBack={() => setCurrentScreen('permissions-battery')} />;

      // ==========================================
      // APP SETUP (4 screens)
      // ==========================================
      case 'app-analysis':
        return <AppAnalysisScreen onNext={(apps) => { setAnalyzedApps(apps); setCurrentScreen('app-selection'); }} onBack={() => setCurrentScreen('permissions-accessibility')} />;
      case 'app-selection':
        return (
          <AppSelectionScreen
            apps={analyzedApps}
            selectedApps={selectedAppPackages}
            setSelectedApps={setSelectedAppPackages}
            onNext={() => setCurrentScreen('time-calculation')}
            onBack={() => setCurrentScreen('app-analysis')}
          />
        );
      case 'time-calculation':
        return (
          <TimeCalculationScreen
            apps={analyzedApps}
            selectedApps={selectedAppPackages}
            onNext={() => setCurrentScreen('commitment')}
            onBack={() => setCurrentScreen('app-selection')}
          />
        );
      case 'commitment':
        return <CommitmentScreen onComplete={() => setCurrentScreen('lets-personalize')} onBack={() => setCurrentScreen('time-calculation')} />;

      // ==========================================
      // PERSONALIZATION (8 screens)
      // ==========================================
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
            onNext={(level) => { setConcentrationLevel(level); setCurrentScreen('personalize-phonestats'); }}
            onBack={() => setCurrentScreen('personalize-gender')}
          />
        );
      case 'personalize-phonestats':
        return <PhoneStatsScreen onNext={() => setCurrentScreen('personalize-study')} onBack={() => setCurrentScreen('personalize-concentration')} />;
      case 'personalize-study':
        return <StudyScreen onNext={() => setCurrentScreen('personalize-rewire')} onBack={() => setCurrentScreen('personalize-phonestats')} />;
      case 'personalize-rewire':
        return <RewireScreen onNext={() => setCurrentScreen('personalize-fivedays')} onBack={() => setCurrentScreen('personalize-study')} />;
      case 'personalize-fivedays':
        return <FiveDaysScreen onNext={() => setCurrentScreen('personalize-ready')} onBack={() => setCurrentScreen('personalize-rewire')} />;
      case 'personalize-ready':
        return <ReadyScreen onNext={() => setCurrentScreen('auth')} />;

      // ==========================================
      // AUTH
      // ==========================================
      case 'auth':
        return (
          <AuthScreen
            onDemo={() => setCurrentScreen('welcome-first')}
            onLogin={() => setCurrentScreen('welcome-first')}
            onSignup={() => setCurrentScreen('welcome-first')}
          />
        );
      case 'welcome-first':
        return <WelcomeFirstTimeScreen onStart={() => setCurrentScreen('main')} />;

      // ==========================================
      // MAIN APP
      // ==========================================
      case 'main':
        return (
          <OverlayManager>
            <MainApp />
          </OverlayManager>
        );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#050508' : '#FAFAFA' }}>
      {renderScreen()}
    </View>
  );
};

// Root App Component - ThemeProvider MUST wrap AppContent
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
