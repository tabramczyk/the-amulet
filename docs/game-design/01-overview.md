# 01 - Game Overview

## High-Level Concept

| Property | Value |
|----------|-------|
| Type | Browser-based idle / clicker RPG |
| World | Fantasy medieval |
| Core Fantasy | Live a short mortal life, die, reincarnate stronger |
| Cost | Free, static hosting |
| Target Audience | Idle game fans, RPG fans |

## Core Loop

```
Age 16: Start life
  |
  v
Choose location -> Do actions
  |
  v
Gain skills, level jobs, earn money
  |
  v
Age progresses with actions
  |
  v
Near death: Amulet glows
  |
  v
Touch Amulet -> Die -> Reincarnate
  |
  v
Permanent prestige bonuses applied
  |
  v
Return to Age 16 (stronger)
```

## Key Design Principles

1. **Time only moves when you act** - no background progression
2. **Data-driven** - all content as data objects for easy iteration
3. **Simple aging** - no stat decay, no XP penalties, purely time-based death
4. **Permanent progression** - every life contributes to future lives
