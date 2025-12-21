import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// LIMIT TYPES
// ============================================

export interface AppLimit {
    packageName: string;
    appName: string;
    icon?: string;
    mode: 'detox' | 'limit';
    dailyLimitMinutes?: number; // For limit mode
    detoxEndDate?: string; // ISO string for detox mode
    streak: number;
    startedAt: string;
    usedTodayMinutes: number;
    lastResetDate: string;
    isActive: boolean;
}

// ============================================
// LIMITS SERVICE
// ============================================

class LimitsService {
    private limits: AppLimit[] = [];
    private listeners: ((limits: AppLimit[]) => void)[] = [];

    // Get current user ID
    private getUserId(): string | null {
        return auth().currentUser?.uid || null;
    }

    // Load limits from Firestore + AsyncStorage (local-first)
    async loadLimits(): Promise<AppLimit[]> {
        const uid = this.getUserId();

        // Try local first
        const localData = await AsyncStorage.getItem('blockd_limits');
        if (localData) {
            this.limits = JSON.parse(localData);
        }

        // If logged in, sync from Firestore
        if (uid) {
            try {
                const snapshot = await firestore()
                    .collection('users')
                    .doc(uid)
                    .collection('limits')
                    .get();

                const firestoreLimits = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    packageName: doc.id,
                } as AppLimit));

                if (firestoreLimits.length > 0) {
                    this.limits = firestoreLimits;
                    await AsyncStorage.setItem('blockd_limits', JSON.stringify(this.limits));
                }
            } catch (e) {
                console.log('Firestore sync error:', e);
            }
        }

        this.notifyListeners();
        return this.limits;
    }

    // Save a limit
    async saveLimit(limit: AppLimit): Promise<void> {
        const existingIndex = this.limits.findIndex(l => l.packageName === limit.packageName);

        if (existingIndex >= 0) {
            this.limits[existingIndex] = limit;
        } else {
            this.limits.push(limit);
        }

        // Save locally
        await AsyncStorage.setItem('blockd_limits', JSON.stringify(this.limits));

        // Sync to Firestore if logged in
        const uid = this.getUserId();
        if (uid) {
            try {
                await firestore()
                    .collection('users')
                    .doc(uid)
                    .collection('limits')
                    .doc(limit.packageName)
                    .set(limit);
            } catch (e) {
                console.log('Firestore save error:', e);
            }
        }

        this.notifyListeners();
    }

    // Delete a limit
    async deleteLimit(packageName: string): Promise<void> {
        this.limits = this.limits.filter(l => l.packageName !== packageName);

        await AsyncStorage.setItem('blockd_limits', JSON.stringify(this.limits));

        const uid = this.getUserId();
        if (uid) {
            try {
                await firestore()
                    .collection('users')
                    .doc(uid)
                    .collection('limits')
                    .doc(packageName)
                    .delete();
            } catch (e) {
                console.log('Firestore delete error:', e);
            }
        }

        this.notifyListeners();
    }

    // Get all limits
    getLimits(): AppLimit[] {
        return this.limits;
    }

    // Get limit for specific app
    getLimit(packageName: string): AppLimit | undefined {
        return this.limits.find(l => l.packageName === packageName);
    }

    // Update usage time (called by blocking service)
    async updateUsage(packageName: string, minutesUsed: number): Promise<void> {
        const limit = this.getLimit(packageName);
        if (!limit) return;

        const today = new Date().toISOString().split('T')[0];

        // Reset if new day
        if (limit.lastResetDate !== today) {
            limit.usedTodayMinutes = 0;
            limit.lastResetDate = today;
            limit.streak += 1;
        }

        limit.usedTodayMinutes = minutesUsed;
        await this.saveLimit(limit);
    }

    // Check if app is over limit
    isOverLimit(packageName: string): boolean {
        const limit = this.getLimit(packageName);
        if (!limit || !limit.isActive) return false;

        if (limit.mode === 'detox') {
            return new Date() < new Date(limit.detoxEndDate || '');
        }

        return limit.usedTodayMinutes >= (limit.dailyLimitMinutes || 999);
    }

    // Break streak (when user cancels)
    async breakStreak(packageName: string): Promise<void> {
        const limit = this.getLimit(packageName);
        if (!limit) return;

        limit.streak = 0;
        limit.isActive = false;
        await this.saveLimit(limit);
    }

    // Subscribe to changes
    subscribe(callback: (limits: AppLimit[]) => void): () => void {
        this.listeners.push(callback);
        callback(this.limits);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notifyListeners(): void {
        this.listeners.forEach(l => l(this.limits));
    }
}

export const limitsService = new LimitsService();
