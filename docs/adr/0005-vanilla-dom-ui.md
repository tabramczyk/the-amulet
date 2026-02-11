# ADR-0005: Vanilla DOM over Framework for UI

## Status
Accepted

## Date
2026-02-08

## Context
Need a UI approach for an idle RPG. The UI is relatively simple: stat displays, buttons, text. Need to decide between a framework (React, Vue) or vanilla DOM manipulation.

## Decision Drivers
- Idle RPG UI is mostly text and buttons
- No complex component composition needed
- Want minimal bundle size (static hosting)
- AI should be able to work with UI code easily

## Considered Options
1. **Vanilla TypeScript + DOM**: Direct DOM manipulation, no framework
2. **React**: Component model, virtual DOM
3. **Preact**: Lighter React alternative
4. **Lit**: Web components

## Decision
Chosen: **Vanilla TypeScript + DOM**

### Rationale
The game UI is fundamentally simple - text displays, buttons, and panels. A framework adds complexity without proportional benefit. Vanilla DOM with Zustand subscriptions provides reactive updates without framework overhead. Bundle stays tiny. AI has less abstraction to reason about.

## Consequences
### Positive
- Zero framework dependencies
- Tiny bundle size
- No framework version upgrades
- Direct, explicit code

### Negative
- Manual DOM manipulation (more verbose)
- No component lifecycle management
- Must build own patterns for UI composition

## Implementation Notes
- Use `document.createElement` helpers in `src/ui/dom-helpers.ts`
- Subscribe to Zustand store for reactive updates
- Organize UI by game panel (top-bar, actions, stats)

## Validation
- UI renders correctly in Chrome, Firefox, Safari
- No framework in `package.json` dependencies
