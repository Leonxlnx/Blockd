import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const firebaseService = {
    // Auth Instance
    auth: auth(),

    // Get Current User
    getCurrentUser: () => auth().currentUser,

    // Sign In
    signIn: async (email: string, pass: string) => {
        try {
            await auth().signInWithEmailAndPassword(email, pass);
            return { success: true };
        } catch (e: any) {
            let msg = 'Login failed';
            if (e.code === 'auth/user-not-found') msg = 'User not found';
            if (e.code === 'auth/wrong-password') msg = 'Invalid password';
            if (e.code === 'auth/invalid-email') msg = 'Invalid email';
            console.error('Sign In Error:', e);
            return { success: false, error: msg };
        }
    },

    // Sign Up
    signUp: async (email: string, pass: string) => {
        try {
            await auth().createUserWithEmailAndPassword(email, pass);
            return { success: true };
        } catch (e: any) {
            let msg = 'Signup failed';
            if (e.code === 'auth/email-already-in-use') msg = 'Email already in use';
            if (e.code === 'auth/weak-password') msg = 'Password too weak';
            console.error('Sign Up Error:', e);
            return { success: false, error: msg };
        }
    },

    // Sign Out
    signOut: async () => {
        try {
            await auth().signOut();
        } catch (e) {
            console.error('Sign Out Error:', e);
        }
    },

    // Database
    db: firestore(),

    // Check connection (Test Firestore)
    checkConnection: async () => {
        try {
            // Just check if we can get a reference
            const ref = firestore().collection('test');
            return !!ref;
        } catch (e) {
            console.error('Firebase connection error:', e);
            return false;
        }
    }
};
