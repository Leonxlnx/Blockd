# Blockd - Onboarding Flow

> Complete breakdown of the 25+ screen onboarding experience

**Last Updated:** December 26, 2024

---

## 📊 Flow Diagram

```
SPLASH → INTRO (6) → HELLO → PERMISSIONS (5) → APP SETUP (5) → PERSONALIZATION (9) → AUTH → WELCOME → MAIN
   1        2-7        8         9-13            14-18               19-27          28      29      30
```

**Total Screens:** 30 (including all sub-screens and transitions)

---

## 🎬 Screen-by-Screen Breakdown

### 1. Splash Screen (`splash`)
- **Duration**: 2 seconds
- **Content**: Blockd logo with fade-in animation
- **Next**: Auto-transition to onboarding-welcome

---

### 2-7. Intro Sequence (6 screens)

#### 2. Welcome (`onboarding-welcome`)
- **Title**: "Welcome to Blockd"
- **Subtitle**: "Take control of your digital life"
- **Visual**: Minimalist illustration
- **Buttons**: Back (to splash) | Continue

#### 3. Problem (`onboarding-problem`)
- **Title**: "The Problem"
- **Content**: "Screen addiction is real. Average person checks phone 58 times/day"
- **Visual**: Problem illustration
- **Buttons**: Back | Continue

#### 4. Solution (`onboarding-solution`)
- **Title**: "The Solution"
- **Content**: "Blockd helps you take control with real app blocking"
- **Visual**: Shield/protection visual
- **Buttons**: Back | Continue

#### 5. Benefits (`onboarding-benefits`)
- **Title**: "What You'll Get"
- **Features**: Bullet points + 5-star review
- **Visual**: Benefits list
- **Buttons**: Back | Continue  

#### 6. How Heard (`onboarding-howheard`)
- **Title**: "How did you hear about us?"
- **Options**: Social Media, Friends, App Store, Other
- **Purpose**: Marketing attribution
- **Buttons**: Back | Continue

#### 7. Name Input (`onboarding-name`)
- **Title**: "What's your name?"
- **Input**: Text field with keyboard
- **Validation**: 2+ characters required
- **Buttons**: Back | Continue

---

### 8. Hello Transition (`hello-name`)
- **Content**: "Hi, {Name}! 👋"
- **Animation**: Fade in/scale
- **Duration**: 1.5 seconds auto-transition
- **Next**: permissions-intro

---

### 9-13. Permissions Sequence (5 screens)

#### 9. Permissions Intro (`permissions-intro`)
- **Title**: "Restricted Permissions"
- **Content**: "Blockd needs special permissions to work"
- **Visual**: Lock/shield icon
- **Buttons**: Back | Continue

#### 10. Usage Stats (`permissions-usage`)
- **Title**: "Usage Access"
- **Content**: "To track your screen time accurately"
- **Status Badge**: Granted / Required
- **Action**: Opens Settings.ACTION_USAGE_ACCESS_SETTINGS
- **Buttons**: Back | Continue / Grant Access

#### 11. Overlay (`permissions-overlay`)
- **Title**: "Overlay Access"
- **Content**: "Display a blocking screen when you've reached your limit"
- **Status Badge**: Granted / Required
- **Action**: Opens Settings.ACTION_MANAGE_OVERLAY_PERMISSION
- **Buttons**: Back | Continue / Grant Access

#### 12. Battery (`permissions-battery`)
- **Title**: "Battery Optimization"
- **Content**: "Keep Blockd running in the background"
- **Status Badge**: Granted / Recommended
- **Action**: Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
- **Buttons**: Back | Continue / Grant Access

#### 13. Accessibility (`permissions-accessibility`)
- **Title**: "Accessibility Service"
- **Content**: "Detect when blocked apps are opened (Android 13+: Restricted Settings bypass required)"
- **Status Badge**: Granted / Required
- **Special**: Multi-step guide for Android 13+
- **Buttons**: Back | Continue / Enable Service

---

### 14-18. App Setup Sequence (5 screens)

#### 14. App Analysis (`app-analysis`)
- **Title**: "Analyzing Your Usage..."
- **Animation**: Loading spinner with progress
- **Native Call**: `PermissionsModule.getTodayUsage()`
- **Duration**: 2-3 seconds
- **Buttons**: Back (if fails)

#### 15. App Selection (`app-selection`)
- **Title**: "Select Apps to Limit"
- **Content**: Scrollable list of apps with:
  - App icon
  - App name
  - Today's usage time
  - Checkbox selection
- **Footer**: "X apps selected"
- **Buttons**: Back | Continue (disabled if none selected)

#### 16. Time Calculation (`time-calculation`)
- **Title**: "You'll Reclaim Your Time"
- **Stats**: 
  - "X hours saved this week"
  - "X hours saved this month"
  - Bar chart comparison
- **Visual**: Before/After time visualization
- **Buttons**: Back | Continue

#### 17. Commitment (`commitment`)
- **Title**: "Your Commitment"
- **Content**: Quote card: "I commit to reducing my screen time and taking control of my life"
- **Interaction**: Hold-to-confirm circular button
  - Shows percentage while holding
  - Requires holding for ~3 seconds
  - Smooth progress animation
  - Glow effect when active
- **Buttons**: Back (proper metal button at bottom)

#### 18. You Got This (`you-got-this`)
- **Title**: "You Got This! 💪"
- **Content**: Motivational message
- **Visual**: Checkmark in circle
- **Animation**: Scale-in celebration
- **Buttons**: Continue (auto-transitions after 2s)

---

### 19-27. Personalization Sequence (9 screens)

#### 19. Let's Personalize (`lets-personalize`)
- **Title**: "Let's Personalize"
- **Content**: "Answer a few quick questions"
- **Buttons**: Back | Continue

#### 20. Age Selection (`personalize-age`)
- **Title**: "How old are you?"
- **Options**: 
  - 13-17
  - 18-24
  - 25-34
  - 35-44
  - 45+
- **Buttons**: Back | Continue

#### 21. Gender Selection (`personalize-gender`)
- **Title**: "Gender"
- **Options**: 
  - Male
  - Female
  - Other
  - Prefer not to say
- **Buttons**: Back | Continue

#### 22. Concentration Scale (`personalize-concentration`)
- **Title**: "How hard is it to stay focused?"
- **Input**: Slider from 1-5
  - 1: Very easy
  - 5: Extremely difficult
- **Buttons**: Back | Continue

#### 23. Phone Stats (`personalize-phonestats`)
- **Title**: "Your Current Usage"
- **Stats Display**:
  - Daily screen time: X hours
  - Daily unlocks: X times
  - Top app: AppName
  - Impact: "That's X days per year"
- **Buttons**: Back | Continue

#### 24. Study Screen (`personalize-study`)
- **Title**: "The Science"
- **Content**: Research-backed claims about phone addiction
- **Visual**: Brain/science illustration
- **Buttons**: Back | Continue

#### 25. Rewire (`personalize-rewire`)
- **Title**: "Ready to Rewire?"
- **Content**: "Your brain can adapt and break these habits"
- **Buttons**: Back | Continue

#### 26. Five Days (`personalize-fivedays`)
- **Title**: "In 5 Days..."
- **Content**: "You'll notice: Better focus, More free time, Less anxiety"
- **Buttons**: Back | Continue

#### 27. Ready (`personalize-ready`)
- **Title**: "You're Ready!"
- **Content**: "Let's create your account"
- **Buttons**: Back | Continue

---

### 28. Authentication (`auth`)
- **Title**: "Sign In / Sign Up"
- **Options**:
  - 🍎 Sign in with Apple (black button)
  - ⚪ Sign in with Google (white button)
  - ✉️ Continue with Email (white button)
- **Firebase**: Handles all auth flows
- **Buttons**: Back

---

### 29. Welcome First Time (`welcome-first`)
- **Title**: "Welcome, {Name}!"
- **Content**: "Your account is ready"
- **Animation**: Celebration/confetti
- **Buttons**: Start Using Blockd

---

### 30. Main App (`main`)
- **Navigation**: Floating bottom tab bar
- **Tabs**: 
  - Dashboard (home icon)
  - Limits (shield icon)
  - Settings (settings icon)
- **Content**: Premium metal dashboard

---

## ⚙️ Technical Implementation

### State Management
All onboarding state managed in `App.tsx`:
```typescript
const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
const [userName, setUserName] = useState<string>('');
const [heardFrom, setHeardFrom] = useState<string>('');
const [analyzedApps, setAnalyzedApps] = useState<any[]>([]);
const [selectedAppPackages, setSelectedAppPackages] = useState<string[]>([]);
const [userAge, setUserAge] = useState<string>('');
const [userGender, setUserGender] = useState<string>('');
const [concentrationLevel, setConcentrationLevel] = useState<number>(0);
```

### Screen Components
Located in `src/screens/onboarding/`:
- **OnboardingScreens.tsx** - Intro sequence (6 screens)
- **OnboardingPermissions.tsx** - All 5 permission screens
- **AppSetupScreens.tsx** - App analysis, selection, commitment (5 screens)
- **PersonalizationScreens.tsx** - Personalization flow + auth (10 screens)

### Navigation Flow
```typescript
// Example: Commitment Screen
case 'commitment':
  return <CommitmentScreen 
    onNext={() => setCurrentScreen('you-got-this')} 
    onBack={() => setCurrentScreen('time-calculation')} 
  />;
```

### Progress Tracking
Each section has visual progress bar:
- Permissions: 1/5, 2/5, 3/5, 4/5, 5/5
- Personalization: 1/8, 2/8, ... 8/8

---

## 🎨 Design Consistency

### Common Elements
- **BottomButtons Component**: Consistent Back + Continue buttons
- **ProgressBar**: Top indicator showing current/total steps
- **LinearGradient Background**: Matching theme colors
- **Animations**: useEntranceAnimation hook (fade + slide up)
- **Premium Metal Style**: Gradient borders on all cards

### Animations
```typescript
const titleAnim = useEntranceAnimation(0);      // Delay 0ms
const cardAnim = useEntranceAnimation(150);     // Delay 150ms
const buttonAnim = useEntranceAnimation(300);   // Delay 300ms
```

---

## 🔧 Permission Handling

### Permission Check Flow
```typescript
useEffect(() => {
  checkPermission();
  const sub = AppState.addEventListener('change', (s) => {
    if (s === 'active') checkPermission();
  });
  return () => sub.remove();
}, []);
```

### Status Badge Logic
- **Granted**: Green dot + "Granted" text
- **Required**: Gray dot + "Required" text
- Updates in real-time when user returns from settings

---

## 📱 User Experience

### Skip Prevention
- No skip button during permissions (all required)
- Back buttons allow navigation to previous screens
- Can't proceed to main app without completing all steps

### Data Persistence
- User name stored to Firebase on auth
- Selected apps stored in AsyncStorage
- Limits created and synced to Firebase

### Error Handling
- Permission denial shows helpful messages
- Failed analysis allows retry
- Auth errors display Firebase error messages

---

## 🚀 Future Improvements

- [ ] Add optional tutorial skip for returning users
- [ ] Implement onboarding analytics tracking
- [ ] Add A/B testing for conversion optimization
- [ ] Localization support
- [ ] Accessibility improvements (screen reader support)

---
