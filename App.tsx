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
} from './src/screens/onboarding/AppSetupScreens';
import MainPlaceholder from './src/screens/MainPlaceholder';

// Type for app usage data
interface AppUsage {
  packageName: string;
  appName: string;
  usageMinutes: number;
}

type Screen =
  | 'splash'
  | 'onboarding-welcome'
  | 'onboarding-problem'
  | 'onboarding-solution'
  | 'onboarding-benefits'
  | 'onboarding-howheard'
  | 'onboarding-name'
  | 'permissions-usage'
  | 'permissions-overlay'
  | 'permissions-battery'
  | 'app-analysis'
  | 'app-selection'
  | 'time-calculation'
  | 'commitment'
  | 'main';

const AppContent: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [userName, setUserName] = useState<string>('');
  const [heardFrom, setHeardFrom] = useState<string>('');
  const [analyzedApps, setAnalyzedApps] = useState<AppUsage[]>([]);
  const [selectedApps, setSelectedApps] = useState<AppUsage[]>([]);

  const renderScreen = () => {
    switch (currentScreen) {
      // Splash Screen
      case 'splash':
        return (
          <SplashScreen
            onContinue={() => setCurrentScreen('onboarding-welcome')}
          />
        );

      // Onboarding Flow (6 screens)
      case 'onboarding-welcome':
        return (
          <OnboardingWelcome
            onNext={() => setCurrentScreen('onboarding-problem')}
            onBack={() => setCurrentScreen('splash')}
          />
        );
      case 'onboarding-problem':
        return (
          <OnboardingProblem
            onNext={() => setCurrentScreen('onboarding-solution')}
            onBack={() => setCurrentScreen('onboarding-welcome')}
          />
        );
      case 'onboarding-solution':
        return (
          <OnboardingSolution
            onNext={() => setCurrentScreen('onboarding-benefits')}
            onBack={() => setCurrentScreen('onboarding-problem')}
          />
        );
      case 'onboarding-benefits':
        return (
          <OnboardingBenefits
            onNext={() => setCurrentScreen('onboarding-howheard')}
            onBack={() => setCurrentScreen('onboarding-solution')}
          />
        );
      case 'onboarding-howheard':
        return (
          <OnboardingHowHeard
            onNext={(source: string) => {
              setHeardFrom(source);
              setCurrentScreen('onboarding-name');
            }}
            onBack={() => setCurrentScreen('onboarding-benefits')}
          />
        );
      case 'onboarding-name':
        return (
          <OnboardingName
            onNext={(name: string) => {
              setUserName(name);
              setCurrentScreen('permissions-usage');
            }}
            onBack={() => setCurrentScreen('onboarding-howheard')}
          />
        );

      // Permission Flow (3 screens)
      case 'permissions-usage':
        return (
          <OnboardingUsageStats
            onNext={() => setCurrentScreen('permissions-overlay')}
            onBack={() => setCurrentScreen('onboarding-name')}
          />
        );
      case 'permissions-overlay':
        return (
          <OnboardingOverlay
            onNext={() => setCurrentScreen('permissions-battery')}
            onBack={() => setCurrentScreen('permissions-usage')}
          />
        );
      case 'permissions-battery':
        return (
          <OnboardingBattery
            onComplete={() => setCurrentScreen('app-analysis')}
            onBack={() => setCurrentScreen('permissions-overlay')}
          />
        );

      // App Setup Flow
      case 'app-analysis':
        return (
          <AppAnalysisScreen
            onNext={(apps: AppUsage[]) => {
              setAnalyzedApps(apps);
              setCurrentScreen('app-selection');
            }}
            onBack={() => setCurrentScreen('permissions-battery')}
          />
        );
      case 'app-selection':
        return (
          <AppSelectionScreen
            apps={analyzedApps}
            onNext={(apps: AppUsage[]) => {
              setSelectedApps(apps);
              setCurrentScreen('time-calculation');
            }}
            onBack={() => setCurrentScreen('app-analysis')}
          />
        );
      case 'time-calculation':
        return (
          <TimeCalculationScreen
            selectedApps={selectedApps}
            onNext={() => setCurrentScreen('commitment')}
            onBack={() => setCurrentScreen('app-selection')}
          />
        );
      case 'commitment':
        return (
          <CommitmentScreen
            onComplete={() => setCurrentScreen('main')}
            onBack={() => setCurrentScreen('time-calculation')}
          />
        );

      // Main App
      case 'main':
        return <MainPlaceholder />;

      default:
        return (
          <SplashScreen
            onContinue={() => setCurrentScreen('onboarding-welcome')}
          />
        );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
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
