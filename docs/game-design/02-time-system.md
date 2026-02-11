# 02 - Time System

## Time Units
- 1 game tick = 1 in-game day
- Continuous actions advance 1 day per tick

## Real-Time Scaling

| Metric | Value |
|--------|-------|
| Lifespan | Age 16 to ~60 |
| Game days per life | ~16,060 (44 years x 365) |
| Real time per life | ~1 hour |
| Days per real second | ~4.46 |
| Tick interval | ~224ms |

## Tick Rules

1. Game loop converts real elapsed time -> day ticks
2. Continuous actions consume ticks automatically
3. **No background progression** when no action is active
4. Click actions may consume 0 or more days (configurable per action)

## Implementation Notes

- Use `requestAnimationFrame` for game loop
- Calculate elapsed ticks from deltaTime, not fixed interval
- Accumulate fractional ticks (don't drop sub-tick time)
- Cap max ticks per frame to prevent spiral of death
