# ADR-0002: Data-Driven Game Architecture

## Status
Accepted

## Date
2026-02-08

## Context
The game has many similar entities (skills, jobs, locations, actions) that share patterns. Need an architecture that allows easy content addition and AI-assisted balancing.

## Decision Drivers
- Game design doc specifies data-driven approach
- AI coding works best when adding content = adding data, not code
- Balancing requires rapid iteration on numbers
- Want to validate all content at build time

## Considered Options
1. **Data objects with Zod validation**: TypeScript objects validated by schemas
2. **JSON/YAML config files**: External config loaded at runtime
3. **Hardcoded in systems**: Logic and data intertwined

## Decision
Chosen: **Data objects with Zod validation**

### Rationale
TypeScript data objects get full IDE support and compile-time checking. Zod schemas validate structure AND generate types, eliminating type drift. Keeping data in TypeScript (not JSON) allows computed values and better AI tooling support.

## Consequences
### Positive
- Single source of truth (Zod schema -> type -> data)
- Adding content is purely data work, no system changes
- AI can add content without understanding system internals
- Build-time validation catches content errors

### Negative
- Data files are TypeScript, not easily editable by non-programmers
- Must remember to validate data against schemas in tests

## Implementation Notes
- All schemas in `specs/schemas/`
- All data in `src/data/`
- Test: every data file validates against its schema

## Validation
- Schema validation tests pass
- New content can be added by only editing `src/data/` files
