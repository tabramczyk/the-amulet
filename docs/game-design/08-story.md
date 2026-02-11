# 08 - Story System

## Main Story Hook

### Life Start (Age 16)
- Player finds a strange amulet
- Cannot sell or discard it
- No explanation given

### Death Trigger
- Shortly before death (age ~58-60): Amulet starts glowing
- All normal actions are disabled
- Only available action: **Touch the Amulet**

### Reincarnation
- Touching the amulet triggers death
- Resets the world
- Applies prestige bonuses
- Player reincarnates at age 16

## Story Events (MVP)

| Event | Trigger | Effect |
|-------|---------|--------|
| Find the Amulet | Life start | Sets story flag |
| Amulet Whispers | Age 30, first life | Flavor text |
| Amulet Glows | Near death | Disables actions, enables Touch |
| Touch the Amulet | Player choice | Triggers reincarnation |

## Implementation
- Story events are data-driven (same as other actions)
- Use story flags (boolean map) for state tracking
- Events check conditions each tick or on location change
