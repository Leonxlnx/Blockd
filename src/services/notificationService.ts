import { NativeModules } from 'react-native';

const { BlockingModule } = NativeModules;

// Show 5 minute warning
export const show5MinWarning = (appName: string) => {
    BlockingModule?.showNotification?.('⏰ 5 Minutes Left', `You have 5 minutes left for ${appName} today`);
};

// Show 1 minute warning
export const show1MinWarning = (appName: string) => {
    BlockingModule?.showNotification?.('⚠️ 1 Minute Left!', `Only 1 minute left for ${appName}!`);
};

// Show limit exceeded notification
export const showLimitExceeded = (appName: string) => {
    BlockingModule?.showNotification?.('🚫 Time\'s Up!', `Your daily limit for ${appName} has been reached`);
};

// Show daily summary
export const showDailySummary = (totalMinutes: number, appsBlocked: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    BlockingModule?.showNotification?.('📊 Daily Summary', `Screen time: ${hours}h ${mins}m • ${appsBlocked} apps limited`);
};
