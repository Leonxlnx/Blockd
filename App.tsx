import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
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
  // Onboarding
  | 'onboarding-welcome'
  | 'onboarding-problem'
  | 'onboarding-solution'
  | 'onboarding-benefits'
  | 'onboarding-howheard'
  | 'onboarding-name'
  // Transition
  | 'hello-name'
  // Permissions
  | 'permissions-usage'
  | 'permissions-overlay'
  | 'permissions-battery'
  // App Setup
  | 'app-analysis'
  | 'app-selection'
  | 'time-calculation'
  | 'commitment'
  // Personalization
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
      // ==========================================
      // SPLASH
      // ==========================================
      case 'splash':
        return <SplashScreen onContinue={() => setCurrentScreen('onboarding-welcome')} />;

      // ==========================================
      // ONBOARDING FLOW (6 screens)
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
        return <OnboardingHowHeard onNext={(source: string) => { setHeardFrom(source); setCurrentScreen('onboarding-name'); }} onBack={() => setCurrentScreen('onboarding-benefits')} />;
      case 'onboarding-name':
        return <OnboardingName onNext={(name: string) => { setUserName(name); setCurrentScreen('hello-name'); }} onBack={() => setCurrentScreen('onboarding-howheard')} />;

      // ==========================================
      // TRANSITION: Hello Name
      // ==========================================
      case 'hello-name':
        return <HelloNameScreen name={userName} onNext={() => setCurrentScreen('permissions-usage')} />;

      // ==========================================
      // PERMISSIONS FLOW (3 screens)
      // ==========================================
      case 'permissions-usage':
        return <OnboardingUsageStats onNext={() => setCurrentScreen('permissions-overlay')} onBack={() => setCurrentScreen('hello-name')} />;
      case 'permissions-overlay':
        return <OnboardingOverlay onNext={() => setCurrentScreen('permissions-battery')} onBack={() => setCurrentScreen('permissions-usage')} />;
      case 'permissions-battery':
        return <OnboardingBattery onComplete={() => setCurrentScreen('app-analysis')} onBack={() => setCurrentScreen('permissions-overlay')} />;

      // ==========================================
      // APP SETUP FLOW
      // ==========================================
      case 'app-analysis':
        return <AppAnalysisScreen onNext={(apps: AppUsage[]) => { setAnalyzedApps(apps); setCurrentScreen('app-selection'); }} onBack={() => setCurrentScreen('permissions-battery')} />;
      case 'app-selection':
        return <AppSelectionScreen apps={analyzedApps} onNext={(apps: AppUsage[]) => { setSelectedApps(apps); setCurrentScreen('time-calculation'); }} onBack={() => setCurrentScreen('app-analysis')} />;
      case 'time-calculation':
        return <TimeCalculationScreen selectedApps={selectedApps} onNext={() => setCurrentScreen('commitment')} onBack={() => setCurrentScreen('app-selection')} />;
      case 'commitment':
        return <CommitmentScreen onComplete={() => setCurrentScreen('lets-personalize')} onBack={() => setCurrentScreen('time-calculation')} />;

      // ==========================================
      // PERSONALIZATION FLOW
      // ==========================================
      case 'lets-personalize':
        return <LetsPersonalizeScreen onNext={() => setCurrentScreen('personalize-age')} />;
      case 'personalize-age':
        return <AgeSelectionScreen onNext={(age: string) => { setUserAge(age); setCurrentScreen('personalize-gender'); }} onBack={() => setCurrentScreen('lets-personalize')} />;
      case 'personalize-gender':
        return <GenderSelectionScreen onNext={(gender: string) => { setUserGender(gender); setCurrentScreen('personalize-concentration'); }} onBack={() => setCurrentScreen('personalize-age')} />;
      case 'personalize-concentration':
        return <ConcentrationScaleScreen onNext={(level: number) => { setConcentrationLevel(level); setCurrentScreen('personalize-phonestats'); }} onBack={() => setCurrentScreen('personalize-gender')} />;
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
      // AUTH FLOW
      // ==========================================
      case 'auth':
        return <AuthScreen onDemo={() => setCurrentScreen('welcome-first')} onLogin={() => setCurrentScreen('welcome-first')} onSignup={() => setCurrentScreen('welcome-first')} />;
      case 'welcome-first':
        return <WelcomeFirstTimeScreen onStart={() => setCurrentScreen('main')} />;

      // ==========================================
      // MAIN APP
      // ==========================================
      case 'main':
        return <MainApp />;

      default:
        return <SplashScreen onContinue={() => setCurrentScreen('onboarding-welcome')} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      {renderScreen()}
    </View>
  );
};

function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
