# Blockd - Design System

> Complete design guide for UI components, colors, typography, and patterns

**Last Updated:** December 26, 2024

---

## 🎨 Design Philosophy

### Premium Liquid Metal (v1.1)
Blockd uses a sophisticated **2.5D liquid metal aesthetic** that combines:
- Multi-layered gradient borders for depth
- Subtle shadows for elevation
- Smooth animations for premium feel
- Consistent iconography (Feather icons)

### Core Principles
1. **Simplicity First** - Clean, uncluttered interfaces
2. **Data Visibility** - Important metrics always prominent
3. **Touch-Optimized** - 48dp minimum touch targets
4. **Dark Mode Native** - OLED-optimized true black
5. **Performance** - 60fps animations, instant interactions

---

## 🌈 Color System

### Light Mode
```typescript
colors: {
  background: '#FCFCFF',      // Near-white base
  surface1: '#FFFFFF',        // Pure white cards
  surface2: '#F8F8FC',        // Slightly tinted
  surface3: '#F0F0F4',        // More prominent

  text: '#1A1A1A',            // Near-black
  textSecondary: '#666666',   // Medium gray
  textTertiary: '#999999',    // Light gray

  primary: '#007AFF',         // iOS blue
  success: '#22C55E',         // Green
  warning: '#F59E0B',         // Amber
  error: '#EF4444',           // Red
}
```

### Dark Mode
```typescript
colors: {
  background: '#000000',      // Pure OLED black
  surface1: '#0A0A0A',        // Slightly elevated
  surface2: '#121212',        // Card level
  surface3: '#1A1A1A',        // Prominent cards

  text: '#FFFFFF',            // Pure white
  textSecondary: '#AAAAAA',   // Light gray
  textTertiary: '#666666',    // Dim gray

  primary: '#0A84FF',         // Brighter blue for dark
  success: '#32D74B',         // Brighter green
  warning: '#FFD60A',         // Brighter amber
  error: '#FF453A',           // Brighter red
}
```

### Metal Gradients
```typescript
// Premium card border (outer)
isDark
  ? ['rgba(50,50,55,1)', 'rgba(30,30,35,1)']
  : ['rgba(255,255,255,1)', 'rgba(245,245,250,1)']

// Premium card fill (inner)
isDark
  ? ['rgba(25,25,30,0.98)', 'rgba(18,18,22,0.99)']
  : ['rgba(252,252,255,0.99)', 'rgba(248,248,252,0.98)']
```

---

## 📏 Spacing System

**8-Point Grid**: All spacing uses multiples of 8px

```typescript
export const spacing = {
  1: 8,    // 8px  - Tiny gaps
  2: 16,   // 16px - Small padding
  3: 24,   // 24px - Medium padding
  4: 32,   // 32px - Large padding
  5: 40,   // 40px - Extra large
  6: 48,   // 48px - Huge
  7: 56,   // 56px - Massive
  8: 64,   // 64px - Maximum
};
```

**Usage:**
```typescript
<View style={{ padding: spacing[4] }}>  // 32px padding
<View style={{ marginTop: spacing[2] }}> // 16px margin
```

---

## 🔤 Typography

### Font Family
**System Default** - Uses platform native fonts for best performance:
- iOS: SF Pro / SF Pro Display
- Android: Roboto / Roboto Condensed

### Text Variants
```typescript
// Custom Text component with variants
<Text variant="h1">         // 32px, bold
<Text variant="h2">         // 24px, bold
<Text variant="h3">         // 20px, semibold
<Text variant="body">       // 16px, regular
<Text variant="caption">    // 14px, regular
```

### Font Weights
```typescript
weight="bold"      // 700
weight="semibold"  // 600
weight="medium"    // 500
weight="regular"   // 400
```

### Line Heights
- Headers: 1.2x font size
- Body: 1.5x font size
- Captions: 1.4x font size

---

## 🧩 Component Library

### 1. MetalCard (Premium)
Multi-layered gradient card with metallic border effect.

```typescript
<View style={styles.premiumCardOuter}>  // Shadow container
  <LinearGradient                       // Metallic border
    colors={['rgba(50,50,55,1)', 'rgba(30,30,35,1)']}
    style={styles.premiumCardBorder}
  >
    <LinearGradient                     // Inner fill
      colors={['rgba(25,25,30,0.98)', 'rgba(18,18,22,0.99)']}
      style={styles.premiumCardInner}
    >
      {children}
    </LinearGradient>
  </LinearGradient>
</View>
```

**Styles:**
```typescript
premiumCardOuter: {
  marginBottom: spacing[2],
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.35,
  shadowRadius: 20,
  elevation: 8,
}

premiumCardBorder: {
  borderRadius: 20,
  padding: 1,  // Border thickness
}

premiumCardInner: {
  borderRadius: 19,
  padding: spacing[3],
}
```

### 2. GlassCard (Legacy)
Semi-transparent card with blur effect.

```typescript
<View style={[
  styles.glassCard,
  { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }
]}>
  {children}
</View>
```

### 3. Floating Nav Bar
Bottom navigation with glass morphism effect.

```typescript
<View style={styles.floatingNavContainer}>
  <LinearGradient
    colors={isDark 
      ? ['rgba(20,20,20,0.95)', 'rgba(10,10,10,0.98)']
      : ['rgba(255,255,255,0.95)', 'rgba(250,250,250,0.98)']
    }
    style={styles.floatingNavBar}
  >
    {tabs.map(tab => (
      <TouchableOpacity style={styles.floatingNavItem}>
        <Icon name={tab.icon} />
      </TouchableOpacity>
    ))}
  </LinearGradient>
</View>
```

### 4. BottomButtons (Onboarding)
Consistent back + continue button pattern.

```typescript
<View style={styles.bottomButtonsContainer}>
  {/* Back Button */}
  <TouchableOpacity style={styles.backButtonWrapper}>
    <LinearGradient
      colors={isDark ? ['#1A1A1A', '#282828', '#1A1A1A'] : ['#F5F5F5', '#FFFFFF', '#F5F5F5']}
      style={styles.buttonBase}
    >
      <Text>Back</Text>
    </LinearGradient>
  </TouchableOpacity>

  {/* Continue Button */}
  <TouchableOpacity style={styles.nextButtonWrapper}>
    <LinearGradient
      colors={isDark ? ['#FFFFFF', '#F0F0F0', '#DFDFDF'] : ['#2A2A2A', '#1A1A1A', '#0A0A0A']}
      style={styles.nextButtonBase}
    >
      <Text>Continue</Text>
    </LinearGradient>
  </TouchableOpacity>
</View>
```

### 5. Interactive Weekly Chart
Touch-to-view bar chart with tooltips.

```typescript
{reorderedData.map((val, i) => {
  const isSelected = selectedDay === i;
  const isToday = i === reorderedData.length - 1;
  
  return (
    <TouchableOpacity onPress={() => setSelectedDay(i)}>
      {isSelected && (
        <View style={styles.weeklyTooltip}>
          <Text>{formatTime(val)}</Text>
        </View>
      )}
      <LinearGradient
        colors={(isSelected || isToday) 
          ? ['#FFFFFF', '#CCCCCC']
          : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)']
        }
        style={[styles.weeklyBar, { height: `${barHeight}%` }]}
      />
      <Text weight={(isSelected || isToday) ? 'bold' : 'medium'}>
        {dayLabel}
      </Text>
    </TouchableOpacity>
  );
})}
```

---

## 🎭 Animations

### Entrance Animation Hook
Reusable fade + slide up animation for all screens.

```typescript
const useEntranceAnimation = (delay: number = 0) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(35)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { 
        toValue: 1, 
        duration: 400, 
        delay, 
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true 
      }),
      Animated.timing(translateY, { 
        toValue: 0, 
        duration: 500, 
        delay, 
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true 
      }),
    ]).start();
  }, []);

  return { opacity, translateY };
};
```

**Usage:**
```typescript
const titleAnim = useEntranceAnimation(0);
const cardAnim = useEntranceAnimation(150);
const buttonAnim = useEntranceAnimation(300);

return (
  <>
    <Animated.View style={{ opacity: titleAnim.opacity, transform: [{ translateY: titleAnim.translateY }] }}>
      <Text variant="h1">Title</Text>
    </Animated.View>
    {/* ... */}
  </>
);
```

### Hold Button Animation
Circular progress button for commitment screen.

```typescript
const scaleAnim = useRef(new Animated.Value(1)).current;
const glowAnim = useRef(new Animated.Value(0)).current;

// On press in
Animated.spring(scaleAnim, { 
  toValue: 0.96, 
  friction: 8, 
  useNativeDriver: true 
}).start();

// On press out
Animated.spring(scaleAnim, { 
  toValue: 1, 
  friction: 8, 
  useNativeDriver: true 
}).start();

// Breathing glow
Animated.loop(
  Animated.sequence([
    Animated.timing(glowAnim, { toValue: 1, duration: 1500 }),
    Animated.timing(glowAnim, { toValue: 0, duration: 1500 }),
  ])
).start();
```

---

## 🎯 Icons

### Feather Icons
Using `react-native-vector-icons/Feather` for consistency.

```typescript
import Icon from 'react-native-vector-icons/Feather';

<Icon name="home" size={24} color={color} />
<Icon name="shield" size={24} color={color} />
<Icon name="settings" size={24} color={color} />
<Icon name="chevron-right" size={18} color={color} />
<Icon name="edit-2" size={16} color={color} />
```

**Common Icons:**
- `home` - Dashboard
- `shield` - Limits
- `settings` - Settings
- `lock` - Locked/blocked
- `unlock` - Unlocked
- `zap` - Focus/energy
- `chevron-right` - Navigate forward
- `x` - Close/dismiss
- `check` - Confirm
- `edit-2` - Edit
- `user` - Profile
- `mail` - Email
- `file-text` - Documents

---

## 📐 Layout Patterns

### Dashboard Header
```typescript
<View style={styles.dashboardHeader}>
  <Text variant="h1" weight="bold">Hello, {userName}</Text>
  <Text variant="body" color={textSecondary}>
    Good morning
  </Text>
</View>
```

### Settings Row
```typescript
<View style={styles.settingRow}>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[3] }}>
    <Icon name="user" size={20} />
    <Text variant="body" weight="medium">Name</Text>
  </View>
  <Text variant="body" color={textSecondary}>{userName}</Text>
</View>
```

### Stats Card
```typescript
<MetalCard>
  <View style={styles.statContent}>
    <Text variant="caption" color={textSecondary}>TODAY</Text>
    <RNText style={{ fontSize: 48, fontWeight: 'bold' }}>5h</RNText>
    <RNText style={{ fontSize: 32 }}>23m</RNText>
    <Text variant="caption" color={textSecondary}>Screen Time</Text>
  </View>
</MetalCard>
```

---

## 🚀 Performance Optimizations

### 1. Use Native Driver
Always use `useNativeDriver: true` for transform and opacity animations.

### 2. Avoid Inline Functions
```typescript
// ❌ Bad
<TouchableOpacity onPress={() => handlePress(item)}>

// ✅ Good
const handleItemPress = useCallback(() => handlePress(item), [item]);
<TouchableOpacity onPress={handleItemPress}>
```

### 3. Memo Heavy Components
```typescript
const WeeklyChart = React.memo(({ data }) => {
  // ... complex rendering
});
```

### 4. Use RNText for Numbers
Custom Text component can have rendering issues with large numbers.

```typescript
import { Text as RNText } from 'react-native';

// For screen time numbers
<RNText style={{ fontSize: 48, fontWeight: 'bold' }}>5h</RNText>
```

---

## ♿ Accessibility

### Touch Targets
Minimum 48dp (spacing[6]) for all interactive elements.

### Color Contrast
- Text on background: Minimum 4.5:1
- Large text: Minimum 3:1
- Interactive elements: Minimum 3:1

### Screen Reader Support
```typescript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Add new limit"
  accessibilityRole="button"
>
  <Text>Add Limit</Text>
</TouchableOpacity>
```

---

## 📱 Responsive Design

### Screen Sizes
- Small: < 360dp width
- Medium: 360-420dp
- Large: > 420dp

### Breakpoints
```typescript
const { width } = Dimensions.get('window');
const isSmallScreen = width < 360;

// Adjust spacing
const cardPadding = isSmallScreen ? spacing[2] : spacing[3];
```

---

## 🎨 Design Tokens Export

```typescript
export const theme = {
  spacing,
  colors: {
    light: lightColors,
    dark: darkColors,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    full: 9999,
  },
  shadows: {
    sm: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    md: { shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16 },
    lg: { shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 20 },
  },
};
```

---
