import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, BackHandler, Dimensions, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Text } from '../../components';
import { spacing } from '../../theme/theme';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

type CancelStep = 'confirm' | 'random_string' | 'phrase' | 'final';

interface CancelFlowProps {
    appName: string;
    mode: 'detox' | 'limit';
    streak: number;
    onCancel: () => void;
    onKeep: () => void;
}

export const CancelFlow: React.FC<CancelFlowProps> = ({ appName, mode, streak, onCancel, onKeep }) => {
    const [step, setStep] = useState<CancelStep>('confirm');
    const [userName, setUserName] = useState<string>('User');

    // Step 2: Random String
    const [randomString, setRandomString] = useState('');
    const [randomInput, setRandomInput] = useState('');
    const [randomError, setRandomError] = useState(false);

    // Step 3: Phrase
    const [phraseInput, setPhraseInput] = useState('');

    useEffect(() => {
        loadUserName();
        generateRandomString();

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            onKeep();
            return true;
        });
        return () => backHandler.remove();
    }, []);

    const loadUserName = async () => {
        try {
            const user = auth().currentUser;
            if (user) {
                const doc = await firestore().collection('users').doc(user.uid).get();
                if (doc.exists()) {
                    const data = doc.data();
                    setUserName(data?.name || data?.displayName || 'User');
                }
            }
        } catch (e) {
            console.log('Error loading user name for cancel flow', e);
        }
    };

    const generateRandomString = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
        let result = '';
        for (let i = 0; i < 50; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setRandomString(result);
        setRandomInput('');
    };

    const handleRandomStringCheck = () => {
        if (randomInput === randomString) {
            setStep('phrase');
        } else {
            setRandomError(true);
            generateRandomString(); // New string on error
            setRandomInput(''); // Clear input
            setTimeout(() => setRandomError(false), 3000);
        }
    };

    const getPhrase = () => {
        return `I ${userName} want to cancel my ${mode === 'detox' ? 'Detox' : 'Limit'}. I can no longer stick to it and I am simply giving away my concentration.`;
    };

    const handlePhraseCheck = () => {
        if (phraseInput.trim() === getPhrase()) {
            setStep('final');
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'confirm':
                return (
                    <View style={styles.stepContent}>
                        <View style={styles.iconContainer}>
                            <Icon name="alert-triangle" size={40} color="#FFD700" />
                        </View>
                        <Text variant="h2" weight="bold" color="#FFF" align="center">
                            Are you sure?
                        </Text>
                        <Text variant="body" color="rgba(255,255,255,0.6)" align="center" style={{ marginTop: spacing[3], maxWidth: 280 }}>
                            You are about to break your {streak} day streak for {appName}.
                        </Text>

                        <View style={styles.buttonsColumn}>
                            <TouchableOpacity onPress={() => setStep('random_string')} style={styles.dangerButton}>
                                <Text variant="body" weight="bold" color="#FFF">Yes, continue</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onKeep} style={styles.safeButton}>
                                <Text variant="body" weight="bold" color="#000">No, stay focused</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            case 'random_string':
                return (
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            <Text variant="h2" weight="bold" color="#FFF" align="center">Security Check</Text>
                            <Text variant="body" color="rgba(255,255,255,0.6)" align="center" style={{ marginTop: spacing[2], marginBottom: spacing[5] }}>
                                Type the following text exactly as shown:
                            </Text>

                            <View style={styles.codeBox}>
                                <Text style={styles.codeText}>{randomString}</Text>
                            </View>

                            <TextInput
                                value={randomInput}
                                onChangeText={(t) => { setRandomInput(t); setRandomError(false); }}
                                placeholder="Type here..."
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                style={[styles.input, randomError && { borderColor: '#FF4444', borderWidth: 1 }]}
                                autoCapitalize="none"
                                autoCorrect={false}
                                multiline
                            />

                            {randomError && (
                                <Text variant="caption" color="#FF4444" align="center" style={{ marginTop: spacing[2] }}>
                                    Incorrect! Try again with a new code.
                                </Text>
                            )}

                            <View style={styles.buttonsColumn}>
                                <TouchableOpacity onPress={handleRandomStringCheck} style={[styles.dangerButton, { opacity: randomInput.length > 0 ? 1 : 0.5 }]} disabled={randomInput.length === 0}>
                                    <Text variant="body" weight="bold" color="#FFF">Verify</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onKeep} style={styles.safeButton}>
                                    <Text variant="body" weight="bold" color="#000">Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                );

            case 'phrase':
                const targetPhrase = getPhrase();
                const isMatch = phraseInput.trim() === targetPhrase;

                return (
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            <Text variant="h2" weight="bold" color="#FFF" align="center">Declarations</Text>
                            <Text variant="body" color="rgba(255,255,255,0.6)" align="center" style={{ marginTop: spacing[2], marginBottom: spacing[5] }}>
                                Type this declaration to admit defeat:
                            </Text>

                            <View style={styles.phraseBox}>
                                <Text style={styles.phraseText}>"{targetPhrase}"</Text>
                            </View>

                            <TextInput
                                value={phraseInput}
                                onChangeText={setPhraseInput}
                                placeholder="I..."
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                style={styles.input}
                                multiline
                            />

                            <View style={styles.buttonsColumn}>
                                <TouchableOpacity
                                    onPress={handlePhraseCheck}
                                    style={[styles.dangerButton, { opacity: isMatch ? 1 : 0.5 }]}
                                    disabled={!isMatch}
                                >
                                    <Text variant="body" weight="bold" color="#FFF">Continue</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onKeep} style={styles.safeButton}>
                                    <Text variant="body" weight="bold" color="#000">Stop</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                );

            case 'final':
                return (
                    <View style={styles.stepContent}>
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,68,68,0.2)' }]}>
                            <Icon name="x-circle" size={40} color="#FF4444" />
                        </View>
                        <Text variant="h2" weight="bold" color="#FFF" align="center">
                            Really Delete?
                        </Text>
                        <Text variant="body" color="rgba(255,255,255,0.6)" align="center" style={{ marginTop: spacing[3], maxWidth: 280 }}>
                            This is your last chance. Do you really want to remove this limit?
                        </Text>

                        <View style={styles.buttonsColumn}>
                            <TouchableOpacity onPress={onCancel} style={styles.finalDangerButton}>
                                <Text variant="body" weight="bold" color="#FFF">Yes, Delete Limit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onKeep} style={styles.safeButton}>
                                <Text variant="body" weight="bold" color="#000">No, Keep Limit</Text>
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
    iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,215,0,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing[5] },
    buttonsColumn: { marginTop: spacing[6], width: '100%', gap: spacing[3] },
    dangerButton: { backgroundColor: 'rgba(255,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(255,68,68,0.5)', paddingVertical: spacing[4], borderRadius: 16, alignItems: 'center' },
    finalDangerButton: { backgroundColor: '#FF4444', paddingVertical: spacing[4], borderRadius: 16, alignItems: 'center' },
    safeButton: { backgroundColor: '#FFF', paddingVertical: spacing[4], borderRadius: 16, alignItems: 'center' },
    codeBox: { backgroundColor: 'rgba(0,0,0,0.3)', padding: spacing[4], borderRadius: 12, marginBottom: spacing[4], width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    codeText: { fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', fontSize: 16, color: '#FFD700', lineHeight: 24, textAlign: 'center' },
    phraseBox: { backgroundColor: 'rgba(255,255,255,0.05)', padding: spacing[4], borderRadius: 12, marginBottom: spacing[4], width: '100%' },
    phraseText: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', lineHeight: 24, textAlign: 'center' },
    input: { backgroundColor: 'rgba(255,255,255,0.1)', padding: spacing[4], borderRadius: 12, fontSize: 16, color: '#FFF', minHeight: 60, textAlignVertical: 'top', width: '100%' },
});
