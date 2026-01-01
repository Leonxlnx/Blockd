# User Flow

## Main User Journeys

### Journey 1: First Time User

```
Open App → Welcome → Personalization (4 steps) → Permissions → Main App
```

### Journey 2: Add New Limit

```
Limits Tab → "+" Button → Select App → Choose Mode →
  ├─ Detox: Select Duration (days) → Confirm → Done
  └─ Limit: Select Daily Time → Confirm → Done
```

### Journey 3: Blocked App Opens

```
User opens blocked app (e.g., YouTube)
    ↓
AccessibilityService triggers
    ↓
Blockd comes to foreground
    ↓
Beautiful overlay appears
    ├─ "Exit App" → Go to home screen
    └─ "Cancel limit" → 4-step verification flow
```

### Journey 4: Cancel Limit (Strict Flow)

```
Tap "Cancel limit"
    ↓
Step 1: Confirm Intent ("Are you sure?")
    ↓
Step 2: Type random string (e.g., "A7K9X2")
    ↓
Step 3: Type phrase ("I choose to break my commitment")
    ↓
Step 4: Final confirmation + Streak broken warning
    ↓
Limit removed
```

## Tab Structure (MainApp)

```
┌─────────────────────────────────────┐
│             [Dashboard]             │
│  Screen Time Card                   │
│  Most Used Apps                     │
│  Weekly Overview Chart              │
├─────────────────────────────────────┤
│              [Limits]               │
│  Active Limits List                 │
│  Add New Limit (+)                  │
│  Limit Detail Modal                 │
├─────────────────────────────────────┤
│             [Settings]              │
│  Name Input                         │
│  Notification Settings              │
│  Permissions Status                 │
│  About / Help                       │
└─────────────────────────────────────┘
        [Dashboard] [Limits] [Settings]
                 ↑ Tab Bar ↑
```

## Overlay Types

| Type | When Shown | Actions |
|------|------------|---------|
| Detox | App in complete block mode | Exit, Cancel |
| Limit Start | Daily limit active, time remaining | Continue, Exit |
| Limit End | Daily limit exceeded | Exit, Cancel |
