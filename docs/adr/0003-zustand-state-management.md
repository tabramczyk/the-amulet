# ADR-0003: Zustand for State Management

## Status
Accepted

## Date
2026-02-08

## Context
Need state management for game state (player, skills, jobs, location, time). Must support save/load, subscription for UI updates, and be simple enough for AI to work with.

## Decision Drivers
- Idle games need reactive state (UI updates on tick)
- Save/load requires serializable state
- AI works better with simple, explicit state management
- No React, so need framework-agnostic solution

## Considered Options
1. **Zustand**: Minimal, framework-agnostic, TypeScript-native
2. **Redux Toolkit**: Battle-tested but heavy boilerplate
3. **Custom EventEmitter**: Full control but reinventing the wheel
4. **MobX**: Powerful but proxy magic is hard for AI to reason about

## Decision
Chosen: **Zustand**

### Rationale
Zustand is the simplest state manager that handles all requirements. It's framework-agnostic (works without React), has excellent TypeScript support, supports middleware (persist for save/load), and has minimal boilerplate. AI can read and modify Zustand stores easily because the API is small and explicit.

## Consequences
### Positive
- Tiny API surface (create, get, set, subscribe)
- Built-in persist middleware for localStorage
- No boilerplate, no reducers, no actions
- Framework-agnostic

### Negative
- Less structured than Redux (no enforced action patterns)
- Smaller community than Redux

## Validation
- State persists across browser refresh via localStorage
- UI re-renders on state changes without manual wiring
