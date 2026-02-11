# 06 - Locations System

## Purpose
Locations control available content: jobs, skill training, story events.

## MVP Locations

| Location | Entry Requirements | Available Jobs | Available Training |
|----------|-------------------|----------------|-------------------|
| Slums | None (starting) | Beggar | Concentration, Endurance |
| Fields | Beggar lvl 5 | Farmer | Strength, Endurance |
| Village | Farmer lvl 5 OR Strength 20 | Laborer | Strength, Intelligence |

## Location Data Shape

```typescript
{
  id: string;
  name: string;
  description: string;
  requirements: LocationRequirement[];
  availableJobIds: string[];
  availableTrainingSkillIds: string[];
}
```

## Travel
- Changing location is a click action
- Travel time: configurable per route (e.g., Slums->Fields: 3 days)
- Changing location stops current continuous action
