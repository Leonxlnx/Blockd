# Blockd - Onboarding Flow

> Complete breakdown of the 20+ screen onboarding experience

---

## 📊 Flow Diagram

```
SPLASH → INTRO (6) → HELLO → PERMISSIONS (4) → APP SETUP (4) → PERSONALIZATION (8) → AUTH → MAIN
```

---

## 🎬 Screen-by-Screen

### 1. Splash Screen
- **Duration**: 2-3 seconds
- **Content**: Logo animation, app name
- **Next**: Auto-transition or tap

---

### 2. Intro Sequence (6 screens)

#### 2.1 Welcome
- **Title**: "Welcome to Blockd"
- **Illustration**: Zen/calm visual
- **CTA**: "Get Started"

#### 2.2 Problem
- **Title**: "The Problem"
- **Content**: "Screen addiction is real..."
- **Illustration**: Overwhelmed person with phone

#### 2.3 Solution
- **Title**: "The Solution"
- **Content**: "Blockd helps you take control..."
- **Illustration**: Shield/protection visual

#### 2.4 Benefits
- **Title**: "What You'll Get"
- **Content**: 5-star review previews
- **Social Proof**: User testimonials

#### 2.5 How Heard
- **Title**: "How did you hear about us?"
- **Options**: Social, Friend, App Store, Other
- **Purpose**: Marketing attribution

#### 2.6 Name Input
- **Title**: "What's your name?"
- **Input**: Text field with validation
- **CTA**: "Continue"

---

### 3. Hello Transition
- **Content**: "Hi, {Name}! 👋"
- **Animation**: Fade in/out
- **Duration**: 1.5 seconds

---

### 4. Permissions Sequence (4 screens)

#### 4.1 Usage Stats
- **Required**: Yes (core functionality)
- **Opens**: Settings → Usage Access
- **Explanation**: "To track your screen time..."

#### 4.2 Overlay
- **Required**: Yes (for blocking)
- **Opens**: Settings → Display over other apps
- **Explanation**: "To show blocking screen..."

#### 4.3 Battery Optimization
- **Required**: Recommended
- **Opens**: Settings → Battery → Unrestricted
- **Explanation**: "To keep running 24/7..."

#### 4.4 Accessibility (Android 13+)
- **Required**: Yes (for real-time blocking)
- **Special Flow**: Restricted Settings bypass guide
- **Steps**:
  1. Open App Info
  2. Tap ⋮ → "Allow restricted settings"
  3. Go to Accessibility Settings
  4. Enable Blockd

---

### 5. App Setup Sequence (4 screens)

#### 5.1 App Analysis
- **Content**: "Scanning your apps..."
- **Animation**: Loading progress
- **Native**: Calls `PermissionsModule.getTodayUsage()`

#### 5.2 App Selection
- **Content**: List of apps with usage time
- **Interaction**: Checkbox to select apps to block
- **CTA**: "Continue (X selected)"

#### 5.3 Time Calculation
- **Content**: "You'll save X hours this week"
- **Stats**: Based on selected apps usage
- **Visualization**: Bar chart comparison

#### 5.4 Commitment
- **Content**: "I commit to reducing my usage"
- **Interaction**: Hold-to-confirm button (3 sec)
- **Psychology**: Creates mental commitment

---

### 6. Personalization Sequence (8 screens)

#### 6.1 Let's Personalize
- **Content**: "Let's tailor your experience"
- **Transition**: Builds anticipation

#### 6.2 Age Selection
- **Options**: 13-17, 18-24, 25-34, 35-44, 45+
- **Purpose**: Personalize messaging

#### 6.3 Gender Selection
- **Options**: Male, Female, Other, Prefer not to say
- **Purpose**: Analytics/personalization

#### 6.4 Concentration Scale
- **Input**: 1-5 slider
- **Question**: "How hard is it to stay focused?"
- **Purpose**: Determine blocking strictness

#### 6.5 Phone Stats
- **Content**: User's daily usage stats
- **Visualization**: Hours, unlocks, top apps
- **Impact**: "That's X days per year"

#### 6.6 Study Screen
- **Content**: Scientific backing
- **Source**: Brain studies on phone addiction
- **Credibility**: Research-backed claims

#### 6.7 Rewire
- **Content**: "Ready to rewire your brain?"
- **Motivation**: Scientific hope

#### 6.8 Five Days
- **Content**: "In 5 days, you'll notice..."
- **Promise**: Concrete benefits timeline

#### 6.9 Ready
- **Content**: "You're ready!"
- **CTA**: "Let's Go"

---

### 7. Authentication

#### 7.1 Auth Screen
- **Options**: 
  - Sign in with Google
  - Sign in with Email
  - Continue as Guest (Demo)
- **Firebase**: Authentication integration

#### 7.2 Welcome First Time
- **Content**: "Welcome, {Name}!"
- **Animation**: Celebration confetti
- **CTA**: "Start Using Blockd"

---

### 8. Main App
- **Navigation**: Bottom tabs
- **Tabs**: Overview, Limits, Settings
- **Content**: Dashboard with stats

---

## ⚙️ Technical Implementation

### State Management
All onboarding state is managed in `App.tsx`:
```typescript
const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
const [userName, setUserName] = useState('');
const [selectedApps, setSelectedApps] = useState([]);
// ... etc
```

### Screen Components
Located in `src/screens/onboarding/`:
- `OnboardingScreens.tsx` - Intro sequence
- `OnboardingPermissions.tsx` - Permission screens
- `AppSetupScreens.tsx` - App analysis & selection
- `PersonalizationScreens.tsx` - Personalization flow
- `PermissionSetupScreen.tsx` - Accessibility guide

### Progress Tracking
Built-in progress bar at top shows `currentStep / totalSteps`.
