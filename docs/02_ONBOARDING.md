# Onboarding Flow

## Overview

The onboarding flow guides new users through app setup, permissions, and personalization.

## Screens

### 1. Welcome Screen
- App logo and tagline
- "Get Started" button

### 2. PersonalizationScreens (4 steps)

**Step 1: Name Input**
- Ask user for their name
- Used for personalized messages

**Step 2: Motivation Selection**
- "Why do you want to reduce screen time?"
- Options: Productivity, Mental Health, Sleep, Family Time, etc.

**Step 3: Daily Goal Selection**
- "How much time do you want to save?"
- Options: 1 hour, 2 hours, 3+ hours

**Step 4: Problem Apps Selection**
- "Which apps distract you the most?"
- Show installed apps with icons
- Multi-select with checkboxes

### 3. OnboardingPermissions
- Request required permissions:
  1. Usage Stats Permission
  2. Accessibility Service
  3. "Display over other apps" (Overlay)
  4. Notifications

### 4. Onboarding Complete
- Success animation
- "Start Blocking" button
- Navigate to MainApp

## Code Location
- `src/screens/onboarding/PersonalizationScreens.tsx`
- `src/screens/onboarding/OnboardingPermissions.tsx`
- `src/screens/onboarding/OnboardingScreens.tsx`

## User Data Storage
- Name → Firestore (`users/{uid}/name`)
- Motivation → Firestore
- Selected apps → Initial limits created
