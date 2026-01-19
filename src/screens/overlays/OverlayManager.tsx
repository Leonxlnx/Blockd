import React, { useState, useEffect } from 'react';
import { View, StyleSheet, NativeEventEmitter, NativeModules, AppState, Modal, BackHandler } from 'react-native';
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

    // Debounce to prevent flashing - ignore events within 500ms
    const lastEventTimeRef = React.useRef<number>(0);
    const DEBOUNCE_MS = 500;

    useEffect(() => {
        // Check block status on EVERY app focus (critical for onNewIntent)
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === 'active') {
                BlockingModule?.startMonitoring?.();
                // Check for block on every app focus!
                checkBlockStatus();
            } else if (nextAppState === 'background') {
                BlockingModule?.stopMonitoring?.();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Subscribe to blocking events
        const eventEmitter = new NativeEventEmitter(NativeModules.BlockingModule);
        const blockListener = eventEmitter.addListener('onAppBlocked', (event: BlockEvent) => {
            handleBlockEvent(event);
        });

        // Start monitoring immediately
        BlockingModule?.startMonitoring?.();

        // Check on initial mount too
        checkBlockStatus();

        // Load blocked apps from limits service
        loadBlockedApps();

        return () => {
            subscription.remove();
            blockListener.remove();
            BlockingModule?.stopMonitoring?.();
        };
    }, []);

    // Function to check if app was launched/refocused due to a block
    const checkBlockStatus = async () => {
        try {
            const blockedPkg = await BlockingModule?.checkInitialLaunch?.();
            if (blockedPkg) {
                console.log('🔒 BLOCK TRIGGERED for:', blockedPkg);
            }
        } catch (e) {
            console.log('Block check error:', e);
        }
    };

    // CRITICAL: Block back button when overlay is shown to prevent escape!
    useEffect(() => {
        if (showOverlay) {
            const backAction = () => {
                // Return true to block the back button
                return true;
            };
            const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
            return () => backHandler.remove();
        }
    }, [showOverlay]);

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

    // Track acknowledged sessions to prevent repeated overlays
    const acknowledgedSessions = React.useRef<Set<string>>(new Set());

    const handleBlockEvent = (event: BlockEvent) => {
        // Debounce check - prevent rapid re-triggering that causes flashing
        const now = Date.now();
        if (now - lastEventTimeRef.current < DEBOUNCE_MS) {
            return; // Ignore event if within debounce window
        }
        lastEventTimeRef.current = now;

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
            // Show start overlay only once per session if not already acknowledged
            if (!acknowledgedSessions.current.has(event.packageName)) {
                setOverlayType('limit_start');
                setShowOverlay(true);
            }
        } else if (event.blockType === 'limit_exceeded') {
            setOverlayType('limit_end');
            setShowOverlay(true);
        }
    };

    const handleExit = () => {
        setShowOverlay(false);
        BlockingModule?.launchHome?.();
    };

    const handleContinue = () => {
        // User chose to continue into the app, acknowledge this session
        if (currentBlock?.packageName) {
            acknowledgedSessions.current.add(currentBlock.packageName);
        }
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
