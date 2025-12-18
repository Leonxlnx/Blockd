import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { ThemeProvider, useTheme } from './src/theme';
import Landing from './src/screens/Landing';
import {
  OnboardingValue,
  OnboardingSocialProof,
  OnboardingIdentity
} from './src/screens/onboarding/OnboardingScreens';
import {
  OnboardingUsageStats,
  OnboardingOverlay,
  OnboardingBattery,
} from './src/screens/onboarding/OnboardingPermissions';

type Screen =
  | 'landing'
  | 'onboarding-1'
  | 'onboarding-2'
  | 'onboarding-3'
  | 'permissions-1'
  | 'permissions-2'
  | 'permissions-3'
  | 'complete';

const AppContent: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [userName, setUserName] = useState<string>('');

  const renderScreen = () => {
    switch (currentScreen) {
      // Onboarding Flow
      case 'onboarding-1':
        return <OnboardingValue onNext={() => setCurrentScreen('onboarding-2')} />;
      case 'onboarding-2':
        return (
          <OnboardingSocialProof
            onNext={() => setCurrentScreen('onboarding-3')}
            onBack={() => setCurrentScreen('onboarding-1')}
          />
        );
      case 'onboarding-3':
        return (
          <OnboardingIdentity
            onNext={(name) => {
              setUserName(name);
              setCurrentScreen('permissions-1');
            }}
            onBack={() => setCurrentScreen('onboarding-2')}
          />
        );

      // Permission Flow
      case 'permissions-1':
        return (
          <OnboardingUsageStats
            onNext={() => setCurrentScreen('permissions-2')}
            onBack={() => setCurrentScreen('onboarding-3')}
          />
        );
      case 'permissions-2':
        return (
          <OnboardingOverlay
            onNext={() => setCurrentScreen('permissions-3')}
            onBack={() => setCurrentScreen('permissions-1')}
          />
        );
      case 'permissions-3':
        return (
          <OnboardingBattery
            onComplete={() => setCurrentScreen('complete')}
            onBack={() => setCurrentScreen('permissions-2')}
          />
        );

      // Complete - back to landing for now
      case 'complete':
        return (
          <Landing
            onNavigateToOnboarding={() => setCurrentScreen('onboarding-1')}
          />
        );

      // Landing
      case 'landing':
      default:
        return (
          <Landing
            onNavigateToOnboarding={() => setCurrentScreen('onboarding-1')}
          />
        );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
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
