import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const firebaseService = {
    // Auth
    auth: auth(),
    currentUser: auth().currentUser,

    // Database
    db: firestore(),

    // Check connection
    checkConnection: async () => {
        try {
            await firestore().collection('test').doc('ping').get();
            return true;
        } catch (e) {
            console.error('Firebase connection error:', e);
            return false;
        }
    }
};
