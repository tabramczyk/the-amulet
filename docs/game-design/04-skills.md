# 04 - Skills System

## Skill Types

| Type | Purpose | Examples |
|------|---------|---------|
| Meta | Provide bonuses | Concentration (XP gain bonus) |
| Attribute | Character stats | Strength, Intelligence, Endurance |

## Progression Rules

1. Skills gain XP **only while relevant actions are active**
2. Each skill has: Level, XP, Soft Cap per life
3. **Soft cap**: Past the cap, XP gain is heavily reduced (not zero)
4. Cap increase: via content unlocks (not in MVP scope)

## MVP Skills

| Skill | Type | Soft Cap | Effect |
|-------|------|----------|--------|
| Concentration | Meta | 30 | +1% XP gain per level (all skills) |
| Strength | Attribute | 50 | Job requirement |
| Intelligence | Attribute | 50 | Job requirement |
| Endurance | Attribute | 50 | (Future: affects lifespan) |

## XP Formula

```
effectiveXP = baseXP * concentrationBonus * prestigeBonus
if (level >= softCap) effectiveXP *= 0.1
```

## Leveling

XP required per level follows a simple curve:
```
xpToNextLevel = baseXP * (currentLevel + 1)
```
