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

## Pacing Philosophy

- This is a semi-idle game: time only passes when actions are active, but players should always have something meaningful to do
- Players should NOT have to wait too long to make their next meaningful decision or action
- Action requirements should be balanced so players are not stuck grinding one thing for too long before unlocking the next
- The goal is a steady flow of progression: unlock, do, unlock next, repeat
- Waiting time between meaningful decisions should be minimized
- Requirements for progression gates (jobs, locations) should feel achievable within a reasonable portion of one life
- Each life should present multiple decision points rather than a single long grind

## Implementation Notes

- Use `requestAnimationFrame` for game loop
- Calculate elapsed ticks from deltaTime, not fixed interval
- Accumulate fractional ticks (don't drop sub-tick time)
- Cap max ticks per frame to prevent spiral of death
