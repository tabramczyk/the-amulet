# 03 - Actions System

## Two-Column Layout

### Click Actions (Left Column)
- **Purpose**: Story progression, location changes, unlocking content
- **Time cost**: Each action defines `timeCostDays` (0 = instant, or any positive number)
- **Examples**: Travel (3-10 days), talk to NPC (0 days), investigate (1 day)

### Continuous Actions (Right Column)
- **Purpose**: Main progression engine (XP and money generation)
- **Rules**:
  - Only ONE continuous action at a time
  - Starts with one click
  - Consumes 1 day per tick
  - Stops when: player stops it, changes location, selects another, or story interruption
- **Location dependent**: Available continuous actions depend on current location
- **Examples**: Begging, Farming, Training concentration, Crafting, Studying

## Action Data Shape

```typescript
// Click action
{
  id: string;
  name: string;
  description: string;
  type: 'click';
  timeCostDays: number;
  locationId: string;
  requirements: ActionRequirement[];
  effects: ActionEffect[];
}

// Continuous action
{
  id: string;
  name: string;
  description: string;
  type: 'continuous';
  locationId: string;
  requirements: ActionRequirement[];
  effects: TickEffect[]; // applied each tick
}
```
