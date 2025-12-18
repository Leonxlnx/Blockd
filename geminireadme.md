# Blockd - Gemini Context File

> **Hinweis**: Diese Datei wird nach jeder Iteration aktualisiert. Immer am Anfang lesen, am Ende erweitern.

---

## 🧠 Projekt-Übersicht

**Name**: Blockd  
**Typ**: Minimalist Focus & Digital Wellbeing App  
**Plattform**: Android (React Native Bare Workflow 0.76)  
**Ästhetik**: Premium 2.5D – Light Mode First, OLED Dark Mode  

### Design Preferences (Approved)
- 8-Point Grid System
- Squircle corners (Apple-style continuous curvature)
- Soft colored shadows (Sage-getönte Schatten)
- Micro-animations (spring, fade, scale)
- 2.5D decorative elements
- OLED-optimized dark mode (#0A0908)

---

## ✅ Abgeschlossene Phasen

### Phase 1: Projekt Foundation ✓
- React Native 0.76, Android build working

### Phase 2: Design System ✓
- Premium theme.ts: 8-point grid, soft shadows, OLED dark
- 7+ reusable components

### Phase 3: Onboarding (Basic) ✓
- 3 Screens: Value, Social Proof (5-stars), Identity

### Phase 4: Permissions ✓
- Native PermissionsModule.java
- 3 Permission Screens: Usage Stats, Overlay, Battery
- Real permission checking with AppState listener

---

## 📁 Projekt-Struktur

```
Blockd/
├── android/app/src/main/java/com/blockd/
│   ├── permissions/
│   │   ├── PermissionsModule.java
│   │   └── PermissionsPackage.java
├── assets/images/
│   ├── logo-light.png, logo-dark.png
│   ├── onboarding-zen.png, onboarding-focus.png, onboarding-time.png
├── src/
│   ├── components/
│   │   ├── Button, Text, Card, Input, ProgressBar
│   │   ├── GlassCard, AnimatedContainer
│   ├── native/
│   │   └── Permissions.ts
│   ├── screens/
│   │   ├── Landing.tsx
│   │   └── onboarding/
│   │       ├── OnboardingScreens.tsx
│   │       └── OnboardingPermissions.tsx
│   └── theme/
│       ├── ThemeContext.tsx, theme.ts
├── App.tsx
└── plan.md, geminireadme.md
```

---

## 📝 Nächste Schritte

1. **Phase 5**: App Analysis (UsageStatsManager, scan installed apps)
2. **Phase 6**: Commitment Flow (calculation, hold-to-commit)
3. **Phase 7**: Main App (Dashboard, Limits, Settings tabs)

---

## 👆 User Action Required

- **Remove logo backgrounds** for perfect transparency (logo-light.png, logo-dark.png)

---

## 🔄 Letzte Aktualisierung

**Datum**: 2024-12-18  
**Status**: Phase 4 complete, Premium Design Overhaul complete
