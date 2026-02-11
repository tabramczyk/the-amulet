# ADR-0004: Spec-First Development Workflow

## Status
Accepted

## Date
2026-02-08

## Context
AI autonomous development needs clear specifications to implement against, and automated verification that implementations are correct. Need a workflow that prevents regression.

## Decision Drivers
- AI must know WHAT to build before HOW
- Regression prevention requires automated checks
- Specs serve as living documentation
- Multiple spec types needed (data schemas, behavior, integration)

## Considered Options
1. **Zod schemas + Gherkin features**: Data validation + behavior specs
2. **TDD only**: Tests as specs
3. **OpenAPI/JSON Schema**: Standard but doesn't fit game domain well
4. **Custom spec format**: Full control but non-standard

## Decision
Chosen: **Zod schemas + Gherkin features**

### Rationale
Zod schemas define WHAT the data looks like (structure). Gherkin features define HOW the game behaves (behavior). Together they cover both dimensions. Zod schemas also generate TypeScript types, eliminating type drift. Gherkin is human-readable and AI-parseable.

## Workflow
1. Write/update Zod schema in `specs/schemas/`
2. Write Gherkin feature in `specs/features/`
3. Write failing unit tests
4. Implement until tests + features pass
5. Run `npm run verify`

## Validation
- All Zod schemas have corresponding validation tests
- All Gherkin features have step definitions
- `npm run verify:full` passes
