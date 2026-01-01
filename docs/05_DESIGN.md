# Design System

## Color Palette

### Primary Colors
```css
--background-dark: #0A0A0F
--background-card: #14141A
--background-glass: rgba(255, 255, 255, 0.08)
```

### Accent Colors
```css
--accent-purple: #8B5CF6
--accent-blue: #3B82F6
--accent-orange: #F97316
--accent-red: #EF4444
--accent-green: #22C55E
```

### Text Colors
```css
--text-primary: #FFFFFF
--text-secondary: rgba(255, 255, 255, 0.7)
--text-muted: rgba(255, 255, 255, 0.4)
```

## Typography

| Element | Size | Weight |
|---------|------|--------|
| H1 (Title) | 28px | Bold |
| H2 (Section) | 22px | Bold |
| Body | 16px | Regular |
| Caption | 14px | Regular |
| Small | 12px | Regular |

## Components

### MetalCard
```tsx
<MetalCard title="Screen Time">
  {/* Content */}
</MetalCard>
```
- Dark glass background
- Subtle border
- Optional gradient header

### GlassCard
```tsx
<GlassCard>
  {/* Content */}
</GlassCard>
```
- Semi-transparent background
- Blur effect
- Rounded corners (16px)

### Button Styles
1. **Primary**: Gradient background (purple → blue)
2. **Secondary**: Glass background with border
3. **Ghost**: Text only, no background

### Icons
Custom View-based icons instead of emoji for consistency:
- Clock icon (circle with hands)
- Block icon (circle with X)
- Check icon (checkmark in circle)

## Overlay Design

### Blocking Overlay Layout
```
┌────────────────────────────────┐
│                                │
│         [App Icon]             │
│                                │
│    ⛔ BLOCKED / ⏰ TIME'S UP   │
│                                │
│      "App is blocked"          │
│   "You set this limit..."      │
│                                │
│      [━━━ Exit App ━━━]        │
│                                │
│       Cancel limit             │
│                                │
└────────────────────────────────┘
```

## Animations

- **Tab Switch**: 200ms ease-out
- **Modal Open**: 300ms slide-up
- **Button Press**: Scale 0.95 on press
- **Card Hover**: Subtle glow effect

## Spacing

| Element | Value |
|---------|-------|
| Screen Padding | 20px |
| Card Gap | 12px |
| Section Gap | 24px |
| Button Padding | 16px vertical |
