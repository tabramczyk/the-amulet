# ADR-0006: Data-Driven Triggered Event System

## Status
Accepted

## Date
2026-03-01

## Context
The life-cycle system (`src/systems/life-cycle-system.ts`) hardcodes 5 game events with
magic strings and numbers: prison meal theft (day 30), bandit proposal (day 100), prison
release (day 365), amulet awakening (age 30), and death gate (age 58). The `changeLocation`
handler also hardcodes prison-specific setup logic. This violates the data-driven
architecture principle (ADR-0002): adding any location-specific event requires modifying
core system code instead of adding data definitions. This is the biggest blocker to
content extensibility.

## Decision Drivers
- ADR-0002 mandates game content in `src/data/`, systems in `src/systems/` must be content-agnostic
- Adding new events (e.g., for new locations) should not require modifying system code
- Existing `ActionRequirement` and `ActionEffect` discriminated unions already model
  conditions and effects -- reuse avoids schema proliferation
- Backward compatibility: existing game state schema must not require migration

## Considered Options
1. **Extend existing ActionRequirement/ActionEffect unions + new TriggeredEvent schema**:
   Add location/relocation/housing requirement/effect variants to the existing discriminated
   unions. Create a lightweight `TriggeredEvent` schema that composes conditions (requirements)
   and effects. Add `entryEffects` to `LocationSchema` for location-entry setup.
2. **Standalone event DSL**: Create a separate condition/effect type system specifically
   for events, independent of the action system.
3. **Event callbacks in data**: Define events as named functions registered in a map,
   called by the system.

## Decision
Chosen: **Option 1** -- Extend existing unions + TriggeredEvent schema

### Rationale
Option 1 reuses the battle-tested `ActionRequirement` and `ActionEffect` discriminated
unions rather than creating parallel type hierarchies. The `isRequirementMet()` and
`applySingleClickEffect()` functions already handle most condition/effect evaluation, so
new requirement/effect variants integrate naturally. Option 2 would duplicate logic and
force maintenance of two parallel systems. Option 3 violates the data-driven principle
since callbacks are code, not data.

The new requirement types (`location`, `relocationDay`, `hasPendingRelocation`) and effect
types (`setHousingId`, `setPendingRelocation`) are general-purpose and will serve future
locations with entry effects or timed relocations, not just the prison.

## Consequences

### Positive
- New events require only data definitions (no system code changes)
- Location entry setup (prison food, housing, relocation timer) becomes declarative
- Single condition/effect vocabulary shared by actions and events
- No save migration needed (`entryEffects` defaults to `[]`, game state unchanged)

### Negative
- `ActionRequirementSchema` and `ActionEffectSchema` unions grow larger (5 new variants total)
- `entryEffects` must not contain `changeLocation` to avoid infinite recursion -- requires validation constraint
- Blocking events (pause game, clear actions) add complexity to tick processing

## Implementation Notes
- `TriggeredEvent.conditions` uses AND semantics (all must be met)
- Events are sorted by `priority` (descending); higher priority events are checked first
- `blocking: true` events pause the game loop, clear active actions, and halt multi-tick processing
- `entryEffects` on locations replace hardcoded location-specific setup in `changeLocation`
- `entryEffects` must NOT contain `changeLocation` effects (document + test this constraint)
- Keep `pendingRelocation` resolution in the life-cycle system since it is structural (self-clearing timer), not content

## Validation
- `npm run verify` passes after all phases
- All existing life-cycle tests continue passing (behavior preserved, not changed)
- New event-system tests cover: priority ordering, blocking/non-blocking, condition AND logic
- Manual play-through: prison flow (day 30, 100, 365), amulet awakening (age 30), death gate (age 58)
