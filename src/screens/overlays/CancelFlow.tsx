import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, BackHandler, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import { Text } from '../../components';
import { spacing } from '../../theme/theme';

const { width } = Dimensions.get('window');

type CancelStep = 'confirm' | 'read' | 'video' | 'math' | 'final';

interface CancelFlowProps {
    appName: string;
    mode: 'detox' | 'limit';
    streak: number;
    onCancel: () => void;
    onKeep: () => void;
}

export const CancelFlow: React.FC<CancelFlowProps> = ({ appName, mode, streak, onCancel, onKeep }) => {
    const [step, setStep] = useState<CancelStep>('confirm');
    const [videoComplete, setVideoComplete] = useState(false);
    const [mathAnswer, setMathAnswer] = useState('');
    const [mathProblem, setMathProblem] = useState({ a: 0, b: 0, answer: 0 });
    const videoRef = useRef<any>(null);

    useEffect(() => {
        const a = Math.floor(Math.random() * 50) + 10;
        const b = Math.floor(Math.random() * 50) + 10;
        setMathProblem({ a, b, answer: a * b });
    }, []);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            onKeep();
            return true;
        });
        return () => backHandler.remove();
    }, []);

    const cancelText = `I am choosing to give up on my ${mode} challenge for ${appName}. I admit that I am too weak to resist my urges today. I am breaking my commitment to myself and losing my ${streak} day streak. I understand that giving in now will only make it harder to build self-discipline in the future.`;

    const renderStep = () => {
        switch (step) {
            case 'confirm':
                return (
                    <View style={styles.stepContent}>
                        <Text variant="h1" style={styles.emoji}>⚠️</Text>
                        <Text variant="h2" weight="bold" color="#FFF" align="center">
                            Cancel {mode === 'detox' ? 'Detox' : 'Limit'}?
                        </Text>
                        <Text variant="body" color="rgba(255,255,255,0.6)" align="center" style={{ marginTop: spacing[3] }}>
                            You're about to break your {streak} day streak for {appName}.
                        </Text>

                        <View style={styles.buttonsColumn}>
                            <TouchableOpacity onPress={() => setStep('read')} style={styles.dangerButton}>
                                <Text variant="body" weight="bold" color="#FFF">Yes, I want to cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onKeep} style={styles.safeButton}>
                                <Text variant="body" weight="bold" color="#000">No, stay focused</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            case 'read':
                return (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Text variant="h2" weight="bold" color="#FFF" align="center">
                            Read This Out Loud
                        </Text>
                        <Text variant="body" color="rgba(255,255,255,0.5)" align="center" style={{ marginTop: spacing[2], marginBottom: spacing[5] }}>
                            To proceed, read the following text carefully
                        </Text>

                        <View style={styles.readBox}>
                            <Text variant="body" color="rgba(255,255,255,0.9)" style={{ lineHeight: 28 }}>
                                "{cancelText}"
                            </Text>
                        </View>

                        <View style={styles.buttonsColumn}>
                            <TouchableOpacity onPress={() => setStep('video')} style={styles.dangerButton}>
                                <Text variant="body" weight="bold" color="#FFF">I've read it, continue</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onKeep} style={styles.safeButton}>
                                <Text variant="body" weight="bold" color="#000">Stop, keep my {mode}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                );

            case 'video':
                return (
                    <View style={styles.stepContent}>
                        <Text variant="h2" weight="bold" color="#FFF" align="center">
                            Watch This First
                        </Text>
                        <Text variant="body" color="rgba(255,255,255,0.5)" align="center" style={{ marginTop: spacing[2] }}>
                            A brief message before you proceed
                        </Text>

                        <View style={styles.videoContainer}>
                            <Video
                                ref={videoRef}
                                source={require('../../../assets/videos/dummy.mp4')}
                                style={styles.video}
                                resizeMode="contain"
                                onEnd={() => setVideoComplete(true)}
                                onError={(e: any) => {
                                    console.log('Video error:', e);
                                    setVideoComplete(true);
                                }}
                                controls={true}
                            />
                        </View>

                        {!videoComplete && (
                            <TouchableOpacity onPress={() => setVideoComplete(true)} style={styles.skipVideoBtn}>
                                <Text variant="caption" color="rgba(255,255,255,0.4)">Skip video (dev only)</Text>
                            </TouchableOpacity>
                        )}

                        {videoComplete && (
                            <View style={styles.buttonsColumn}>
                                <TouchableOpacity onPress={() => setStep('math')} style={styles.dangerButton}>
                                    <Text variant="body" weight="bold" color="#FFF">Continue anyway</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onKeep} style={styles.safeButton}>
                                    <Text variant="body" weight="bold" color="#000">Changed my mind</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                );

            case 'math':
                const isCorrect = parseInt(mathAnswer) === mathProblem.answer;

                return (
                    <View style={styles.stepContent}>
                        <Text variant="h2" weight="bold" color="#FFF" align="center">
                            Solve This Problem
                        </Text>
                        <Text variant="body" color="rgba(255,255,255,0.5)" align="center" style={{ marginTop: spacing[2] }}>
                            Enter the correct answer to proceed
                        </Text>

                        <View style={styles.mathBox}>
                            <Text variant="h1" weight="bold" color="#FFF" style={styles.mathProblem}>
                                {mathProblem.a} × {mathProblem.b} = ?
                            </Text>
                            <TextInput
                                value={mathAnswer}
                                onChangeText={setMathAnswer}
                                keyboardType="number-pad"
                                placeholder="Your answer"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                style={styles.mathInput}
                                selectionColor="#FFF"
                            />
                        </View>

                        {mathAnswer.length > 0 && !isCorrect && (
                            <Text variant="caption" color="#FF4444" style={{ marginBottom: spacing[3] }}>
                                Incorrect answer, try again
                            </Text>
                        )}

                        <View style={styles.buttonsColumn}>
                            <TouchableOpacity
                                onPress={() => isCorrect && setStep('final')}
                                style={[styles.dangerButton, { opacity: isCorrect ? 1 : 0.3 }]}
                                disabled={!isCorrect}
                            >
                                <Text variant="body" weight="bold" color="#FFF">Submit & Continue</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onKeep} style={styles.safeButton}>
                                <Text variant="body" weight="bold" color="#000">Nevermind, keep going</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            case 'final':
                return (
                    <View style={styles.stepContent}>
                        <Text variant="h1" style={styles.emoji}>💔</Text>
                        <Text variant="h2" weight="bold" color="#FFF" align="center">
                            Final Confirmation
                        </Text>
                        <Text variant="body" color="rgba(255,255,255,0.6)" align="center" style={{ marginTop: spacing[3] }}>
                            Your {mode === 'detox' ? 'detox challenge' : 'daily limit'} for {appName} will be cancelled.
                            {'\n\n'}Your {streak} day streak will reset to 0.
                        </Text>

                        <View style={styles.buttonsColumn}>
                            <TouchableOpacity onPress={onCancel} style={styles.finalDangerButton}>
                                <Text variant="body" weight="bold" color="#FFF">Cancel My {mode === 'detox' ? 'Detox' : 'Limit'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onKeep} style={styles.safeButton}>
                                <Text variant="body" weight="bold" color="#000">Keep Going! 💪</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0A0A12', '#15151F', '#0D0D15']} style={StyleSheet.absoluteFillObject} />
            {renderStep()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    stepContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing[5] },
    scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing[5], paddingVertical: spacing[8] },
    emoji: { fontSize: 64, marginBottom: spacing[4] },
    buttonsColumn: { marginTop: spacing[6], width: '100%', gap: spacing[3] },
    dangerButton: { backgroundColor: 'rgba(255,68,68,0.3)', borderWidth: 1, borderColor: '#FF4444', paddingVertical: spacing[4], borderRadius: 16, alignItems: 'center' },
    finalDangerButton: { backgroundColor: '#FF4444', paddingVertical: spacing[4], borderRadius: 16, alignItems: 'center' },
    safeButton: { backgroundColor: '#FFF', paddingVertical: spacing[4], borderRadius: 16, alignItems: 'center' },
    readBox: { backgroundColor: 'rgba(255,255,255,0.05)', padding: spacing[5], borderRadius: 16, marginBottom: spacing[4] },
    videoContainer: { width: width - 48, height: 220, borderRadius: 16, overflow: 'hidden', marginTop: spacing[5], backgroundColor: '#000' },
    video: { width: '100%', height: '100%' },
    skipVideoBtn: { marginTop: spacing[4], padding: spacing[2] },
    mathBox: { marginTop: spacing[6], alignItems: 'center' },
    mathProblem: { fontSize: 36, marginBottom: spacing[5] },
    mathInput: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: spacing[5], paddingVertical: spacing[4], borderRadius: 12, fontSize: 24, color: '#FFF', textAlign: 'center', minWidth: 150, fontWeight: 'bold' },
});
