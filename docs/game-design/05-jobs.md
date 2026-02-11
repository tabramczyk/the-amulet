# 05 - Jobs System

## Job Characteristics

Each job defines:
- Required location
- Skill requirements (hard requirements)
- Previous job requirements (optional)
- XP per day (tick)
- Money per day (tick)

## Progression
- No stat scaling - progression is purely: XP -> Level -> Unlocks
- Higher jobs may start weaker than a high-level lower job
- Higher jobs become better as they level up

## MVP Jobs

| Job | Location | Requirements | XP/day | Money/day |
|-----|----------|-------------|--------|-----------|
| Beggar | Slums | None | 1 | 1 |
| Farmer | Fields | Beggar lvl 10 | 2 | 3 |
| Laborer | Village | Strength 40 | 3 | 5 |

## Job Data Shape

```typescript
{
  id: string;
  name: string;
  description: string;
  locationId: string;
  requirements: {
    skills: { skillId: string; level: number }[];
    jobs: { jobId: string; level: number }[];
  };
  xpPerTick: number;
  moneyPerTick: number;
}
```
