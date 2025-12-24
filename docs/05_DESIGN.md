# Blockd - Design System

> Complete visual language and component reference

---

## 🎨 Color Palette

### Primary Colors (Sage Theme)
```
Primary 50:   #F0F4F1
Primary 100:  #D9E5DC
Primary 200:  #B5CDB9
Primary 300:  #8FB296
Primary 400:  #6A9973  ← Main accent
Primary 500:  #4A7C54
Primary 600:  #3D6645
Primary 700:  #305137
Primary 800:  #243D2A
Primary 900:  #18291C
```

### Neutral Colors
```
Neutral 50:   #FAFAFA  ← Light background
Neutral 100:  #F5F5F5
Neutral 200:  #E5E5E5
Neutral 300:  #D4D4D4
Neutral 400:  #A3A3A3
Neutral 500:  #737373
Neutral 600:  #525252
Neutral 700:  #404040
Neutral 800:  #262626
Neutral 900:  #171717
Neutral 950:  #0A0908  ← OLED dark background
```

### Semantic Colors
```
Success:  #22C55E
Warning:  #FFB800
Error:    #FF4444
Info:     #007AFF
```

---

## 📐 Spacing System (8-Point Grid)

```typescript
spacing = {
  0:  0,
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  7:  28,
  8:  32,
  9:  36,
  10: 40,
}
```

**Usage:**
- Component padding: `spacing[4]` (16px)
- Section gaps: `spacing[6]` (24px)
- Screen margins: `spacing[4]` (16px)

---

## 🔤 Typography

### Font Weights
```
Light:     300
Regular:   400
Medium:    500
Semibold:  600
Bold:      700
```

### Font Sizes
```
xs:   10px
sm:   12px
base: 14px
md:   16px
lg:   18px
xl:   20px
2xl:  24px
3xl:  30px
4xl:  36px
5xl:  48px
```

### Text Variants
```typescript
h1:      { fontSize: 36, fontWeight: 700, lineHeight: 44 }
h2:      { fontSize: 30, fontWeight: 700, lineHeight: 38 }
h3:      { fontSize: 24, fontWeight: 600, lineHeight: 32 }
body:    { fontSize: 16, fontWeight: 400, lineHeight: 24 }
caption: { fontSize: 12, fontWeight: 500, lineHeight: 16 }
```

---

## 🟦 Border Radius

```typescript
borderRadius = {
  none: 0,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 9999,
}
```

**Squircle Effect:**
Apple-style continuous curvature is achieved via `borderRadius.lg` (16px) on cards.

---

## 🌑 Shadows

### Light Mode
```typescript
shadows = {
  sm: {
    shadowColor: '#4A7C54',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#4A7C54',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#4A7C54',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
}
```

### Dark Mode
Shadows are reduced or removed to maintain OLED aesthetics.

---

## 🧱 Components

### Button
```tsx
<Button 
  title="Primary Action"
  variant="primary"     // primary | secondary | ghost | outline
  size="md"             // sm | md | lg
  fullWidth={false}
  loading={false}
  disabled={false}
  gradientIndex={1}     // 1 | 2 | 3
/>
```

**Variants:**
- **Primary**: Sage gradient, white text
- **Secondary**: Neutral background, dark text
- **Ghost**: Transparent, colored text
- **Outline**: Border, colored text

---

### GlassCard
```tsx
<GlassCard style={{ padding: spacing[4] }}>
  {/* Content */}
</GlassCard>
```

**Properties:**
- Frosted glass effect
- Semi-transparent background
- Subtle blur (where supported)
- Works in both light/dark modes

---

### Text
```tsx
<Text 
  variant="body"        // h1 | h2 | h3 | body | caption
  weight="regular"      // regular | medium | semibold | bold
  color={theme.colors.text}
  align="left"          // left | center | right
>
  Content here
</Text>
```

---

### NavBar
```tsx
<NavBar 
  activeTab="dashboard"   // dashboard | limits | settings
  onTabPress={(tab) => {}}
  isDark={false}
/>
```

**Properties:**
- Floating rounded design
- 2.5D raised appearance
- Animated active state
- Icon + label for each tab

---

## 🌓 Theme Modes

### Light Mode
```
Background:     #FAFAFA
Surface:        #FFFFFF
Text Primary:   #1A1A1A
Text Secondary: #737373
Accent:         #4A7C54
```

### Dark Mode (OLED)
```
Background:     #0A0908 (true black)
Surface:        rgba(255,255,255,0.06)
Text Primary:   #FFFFFF
Text Secondary: rgba(255,255,255,0.6)
Accent:         #8FB296 (lighter sage)
```

---

## ✨ Animations

### Micro-interactions
```typescript
// Spring config
spring: {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
}

// Fade timing
fade: {
  duration: 200,
  useNativeDriver: true,
}

// Scale press effect
scale: {
  pressIn: 0.97,
  pressOut: 1.0,
}
```

### Screen Transitions
- **Fade**: For overlapping content
- **Slide**: For sequential screens
- **Scale**: For modals and overlays

---

## 📦 Icon System

Icons are built as View-based components (no external library):

```tsx
<HomeIcon size={24} color="#000" filled={true} />
<ShieldIcon size={24} color="#000" filled={false} />
<GearIcon size={24} color="#000" filled={true} />
<PlusIcon size={24} color="#000" />
<XIcon size={24} color="#000" />
<ChevronIcon size={24} color="#000" />
<LockIcon size={24} color="#000" />
<CheckIcon size={24} color="#22C55E" />
<WarningIcon size={24} color="#FFB800" />
```

---

## 📱 Layout Patterns

### Bento Grid (Dashboard)
```
┌─────────────────────────────────┐
│         Large Card              │
└─────────────────────────────────┘
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Small 1 │ │ Small 2 │ │ Small 3 │
└─────────┘ └─────────┘ └─────────┘
```

### List with Sections
```
SECTION LABEL
┌─────────────────────────────────┐
│ Row 1                      →    │
├─────────────────────────────────┤
│ Row 2                      →    │
└─────────────────────────────────┘
```

### Modal Overlay
```
┌─────────────────────────────────┐
│  Header                    [X]  │
├─────────────────────────────────┤
│                                 │
│         Content                 │
│                                 │
└─────────────────────────────────┘
```
