import React, { useState, useEffect } from 'react';
import { View, StyleSheet, NativeEventEmitter, NativeModules, AppState, Modal } from 'react-native';
import { DetoxOverlay, LimitOverlayStart, LimitOverlayEnd } from './OverlayScreens';
import { CancelFlow } from './CancelFlow';
import { limitsService, AppLimit } from '../../services/limitsService';

const { BlockingModule } = NativeModules;

interface BlockEvent {
    packageName: string;
    blockType: 'detox' | 'limit_active' | 'limit_exceeded';
    remainingMinutes: number;
    remainingDays: number;
    dailyLimit: number;
}

interface OverlayManagerProps {
    children: React.ReactNode;
}

export const OverlayManager: React.FC<OverlayManagerProps> = ({ children }) => {
    const [currentBlock, setCurrentBlock] = useState<BlockEvent | null>(null);
    const [showOverlay, setShowOverlay] = useState(false);
    const [overlayType, setOverlayType] = useState<'detox' | 'limit_start' | 'limit_end' | null>(null);
    const [showCancelFlow, setShowCancelFlow] = useState(false);
    const [currentLimit, setCurrentLimit] = useState<AppLimit | null>(null);

    useEffect(() => {
        // Start monitoring when app becomes active
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                BlockingModule?.startMonitoring?.();
            } else if (state === 'background') {
                BlockingModule?.stopMonitoring?.();
            }
        });

        // Subscribe to blocking events
        const eventEmitter = new NativeEventEmitter(NativeModules.BlockingModule);
        const blockListener = eventEmitter.addListener('onAppBlocked', (event: BlockEvent) => {
            handleBlockEvent(event);
        });

        // Start monitoring immediately
        BlockingModule?.startMonitoring?.();

        // Load blocked apps from limits service
        loadBlockedApps();

        return () => {
            subscription.remove();
            blockListener.remove();
            BlockingModule?.stopMonitoring?.();
        };
    }, []);

    const loadBlockedApps = async () => {
        const limits = await limitsService.loadLimits();
        limits.forEach(limit => {
            if (limit.isActive) {
                if (limit.mode === 'detox' && limit.detoxEndDate) {
                    BlockingModule?.addBlockedApp?.(
                        limit.packageName,
                        'detox',
                        new Date(limit.detoxEndDate).getTime(),
                        0
                    );
                } else if (limit.mode === 'limit' && limit.dailyLimitMinutes) {
                    BlockingModule?.addBlockedApp?.(
                        limit.packageName,
                        'limit',
                        0,
                        limit.dailyLimitMinutes
                    );
                }
            }
        });
    };

    const handleBlockEvent = (event: BlockEvent) => {
        setCurrentBlock(event);

        // Get limit details
        const limit = limitsService.getLimit(event.packageName);
        if (limit) {
            setCurrentLimit(limit);
        }

        if (event.blockType === 'detox') {
            setOverlayType('detox');
            setShowOverlay(true);
        } else if (event.blockType === 'limit_active') {
            // Show start overlay only once per session
            setOverlayType('limit_start');
            setShowOverlay(true);
        } else if (event.blockType === 'limit_exceeded') {
            setOverlayType('limit_end');
            setShowOverlay(true);
        }
    };

    const handleExit = () => {
        setShowOverlay(false);
        // TODO: Navigate back to home or launcher
    };

    const handleContinue = () => {
        // User chose to continue into the app
        setShowOverlay(false);
    };

    const handleStartCancel = () => {
        setShowCancelFlow(true);
    };

    const handleCancelComplete = async () => {
        // User completed the cancel flow
        if (currentLimit) {
            await limitsService.breakStreak(currentLimit.packageName);
            BlockingModule?.removeBlockedApp?.(currentLimit.packageName);
        }
        setShowCancelFlow(false);
        setShowOverlay(false);
    };

    const handleCancelAbort = () => {
        // User decided not to cancel
        setShowCancelFlow(false);
    };

    const getAppName = () => {
        return currentLimit?.appName || currentBlock?.packageName?.split('.').pop() || 'App';
    };

    return (
        <View style={styles.container}>
            {children}

            {/* Blocking Overlay */}
            <Modal visible={showOverlay && !showCancelFlow} transparent animationType="fade">
                {overlayType === 'detox' && currentBlock && (
                    <DetoxOverlay
                        appName={getAppName()}
                        appIcon={currentLimit?.icon}
                        daysRemaining={currentBlock.remainingDays}
                        onExit={handleExit}
                        onCancel={handleStartCancel}
                    />
                )}
                {overlayType === 'limit_start' && currentBlock && (
                    <LimitOverlayStart
                        appName={getAppName()}
                        appIcon={currentLimit?.icon}
                        minutesRemaining={currentBlock.remainingMinutes}
                        onContinue={handleContinue}
                        onExit={handleExit}
                    />
                )}
                {overlayType === 'limit_end' && (
                    <LimitOverlayEnd
                        appName={getAppName()}
                        appIcon={currentLimit?.icon}
                        onExit={handleExit}
                        onCancel={handleStartCancel}
                    />
                )}
            </Modal>

            {/* Cancel Flow */}
            <Modal visible={showCancelFlow} animationType="slide">
                <CancelFlow
                    appName={getAppName()}
                    mode={currentLimit?.mode || 'limit'}
                    streak={currentLimit?.streak || 0}
                    onCancel={handleCancelComplete}
                    onKeep={handleCancelAbort}
                />
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});
