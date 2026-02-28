# Spec Index

Quick-reference for agents. Read the relevant spec file, not all of them.

## Feature Specs (specs/features/)

| Area | File | Key behaviors |
|------|------|---------------|
| Jobs | jobs.feature | XP/leveling, requirements, location locks, reincarnation bonus |
| Skills | skills.feature | XP/leveling, soft caps, concentration bonus |
| Locations | locations.feature | Access requirements, available jobs/skills |
| Actions | actions.feature | Click vs continuous, dual actions, requirements, effects |
| Economy | economy.feature | Gold earnings/expenses, net balance |
| Life Cycle | life-cycle.feature | Age progression, death, reincarnation flow |
| Reincarnation | reincarnation.feature | Bonus stacking, progress reset, lives counter |
| Time | time-system.feature | Tick = 1 day, speed, pause, fractional ticks |
| Food | food.feature | Food options, daily cost, persists across locations |
| Housing | housing.feature | Housing options, daily cost, location-locked, resets on move |

## Schema Specs (specs/schemas/)

| Area | File | Defines |
|------|------|---------|
| Game State | game-state.schema.ts | Master state: time, player, skills, jobs, reincarnation |
| Jobs | job.schema.ts | Job definition, requirements, runtime state |
| Skills | skill.schema.ts | Skill definition, reincarnation bonuses |
| Actions | action.schema.ts | Click/continuous actions, discriminated unions |
| Locations | location.schema.ts | Location requirements (skill/job/clan/jobOneOf) |
| Housing | housing.schema.ts | Housing tiers |
| Food | food.schema.ts | Food options |
| Clans | clan.schema.ts | Clan definitions |
| Triggered Events | triggered-event.schema.ts | Timed/conditional events with conditions, effects, priority |
