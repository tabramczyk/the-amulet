# The Amulet - AI Development Context

> Fantasy reincarnation idle RPG. Browser-based, static hosting, no backend.
> This file is read by ALL agent teammates. Keep it authoritative and concise.

## Project Identity

- **Name**: The Amulet
- **Type**: Browser idle/clicker RPG
- **Stack**: TypeScript, Vite, Zustand, Zod, Vanilla DOM
- **Phase**: Foundation → MVP
- **Hosting**: Static (no server required)

## Environment

```bash
# Node.js v24 LTS - use nvm
nvm use 24
```

## Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run test         # Run unit tests (Vitest)
npm run test:watch   # Watch mode
npm run test:coverage # With coverage report
npm run test:e2e     # Playwright E2E tests
npm run test:features # Cucumber/Gherkin specs
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run typecheck    # TypeScript check
npm run verify       # lint + typecheck + test (run before commits)
npm run verify:full  # verify + features + e2e
npm run format       # Prettier format
```

## Critical Constraints (NEVER violate)

1. **Spec-first with intent**: Every change starts with WHY (intent/context), then updates
   specs (`specs/features/`, `specs/schemas/`) BEFORE code. Specs are the source of truth
   for behavior. If spec and code disagree, the code is wrong. When changing specs, document
   the reasoning — not just the new value.
2. **Types from Zod**: ALL types derived from Zod schemas. Never hand-write interfaces for game data
3. **Data-driven**: ALL game content in src/data/. Systems in src/systems/ must be content-agnostic
4. **No eval()**: No eval, Function(), or string args in setTimeout/setInterval (SEC-01)
5. **No innerHTML**: Use textContent or DOM API for dynamic content (SEC-02)
6. **No secrets in code**: No API keys or credentials (SEC-03)
7. **Validate external data**: All localStorage data validated via Zod before use (SEC-05)
8. **Test before commit**: Run `npm run verify` before every commit

## Architecture

```
src/
├── core/           # Game loop, tick system, time conversion
├── systems/        # Game logic: skills, jobs, prestige, actions, locations
├── state/          # Zustand store (single source of game state)
├── data/           # Game content: skill defs, job defs, location defs
├── types/          # Generated types (from Zod schemas)
├── ui/             # DOM rendering, panels, user input
└── index.ts        # Entry point

specs/
├── schemas/        # Zod schemas (SINGLE SOURCE OF TRUTH for data types)
└── features/       # Gherkin behavior specs

tests/
├── unit/           # Fast, isolated tests
├── integration/    # Multi-system tests
└── e2e/            # Full browser tests
```

## Specs Quick Reference

See `specs/SPEC-INDEX.md` for a map of all feature and schema specs.

## Data Flow

```
Real Time → Game Loop (ticks) → Active Systems → Zustand Store → UI Render
                                                       ↓
                                              localStorage (auto-save)
```

## Workflow — Development Cycle (MANDATORY for all teammates)

Every change follows these phases IN ORDER. Skipping or reordering is a bug.

### Phase 0 — Intent (understand WHY)
- Clarify the purpose of the change: what problem does it solve? What's the goal?
- For non-trivial changes, capture reasoning in the commit message or relevant ADR
- This prevents "structurally correct but misaligned" changes

### Phase 1 — Spec (update the source of truth)
- Update Gherkin features in `specs/features/` to describe desired behavior
- Update Zod schemas in `specs/schemas/` if data structures change
- Keep specs focused on **behavior and constraints**, not implementation details
- Specs are authoritative: if spec and code disagree, the code is wrong
- Consult `specs/SPEC-INDEX.md` to find the relevant spec file — read only that file,
  not all specs

### Phase 2 — Test (prove the change is captured)
- Write/update unit tests in `tests/unit/` to match the new spec
- Tests SHOULD fail before implementation (Red phase of TDD)
- A test that passes without code changes may mean it's not testing the right thing

### Phase 3 — Implement (make tests pass)
- Change code in `src/` to satisfy the updated tests
- Keep changes minimal — only what's needed to make tests pass

### Phase 4 — Validate (verify + review)
- Run `npm run verify` (lint + typecheck + tests must pass)
- QA/Security reviews for security constraint violations
- Update docs in `docs/` if behavior changed

### When to be strict vs. lightweight
- **Zod schemas** (data contracts): Always strict — update before implementation
- **Gherkin features** (behavior): Strict for requirements and key behaviors.
  Lightweight for exploratory/prototyping work — capture intent, refine spec after learning.
- **Within a component**: TDD-iterate freely. The spec defines the boundary, not every detail.

## Game Design Quick Reference

- **Core loop**: Age 16 → Act → Die (~age 60) → Reincarnate stronger → Repeat
- **Time**: 1 tick = 1 in-game day. ~4.46 days/real-second. No background progression.
- **Actions**: Click (story/travel, costs X days) + Continuous (1/tick, main progression)
- **Skills**: Meta (Concentration=XP bonus) + Attributes (Str/Int/End). Soft caps per life.
- **Jobs**: Location-locked, require skill/job levels. Give XP + money per tick.
- **Prestige**: Total levels across lives → permanent % XP bonus per skill/job.
- **MVP**: 3 locations, 3 jobs, 4 skills, 1 prestige layer, full life loop.

Full GDD: docs/game-design/README.md

## Team Lead Workflow

The main agent acts as **team lead** and must NEVER modify any files (code, specs, schemas,
docs, configs — nothing). The team lead's only job is to **understand, plan, and delegate**.

1. **Understand the request** — read relevant specs, schemas, and code to grasp scope
2. **Plan the approach** — decide which agents are needed and what each should do
3. **Enforce development cycle ordering** — delegate in phase order:
   - First: spec updates (Architect for schemas, QA/Architect for features)
   - Then: test updates (QA/Security, Implementer)
   - Then: implementation (Implementer, Data Author)
   - Finally: validation (QA/Security)
   Never delegate implementation before specs are updated.
4. **Delegate everything** — spawn the right agents (by `subagent_type`) for ALL work,
   including schema changes, spec updates, implementation, UI, tests, and docs
5. **Parallelize** — launch independent tasks simultaneously using background agents
6. **Coordinate** — monitor agent progress, resolve blockers, ensure integration
7. **Verify** — run `npm run verify` after all agents complete to confirm integration
8. **Clean up** — shut down agents and delete the team when done

The team lead must NOT use Write, Edit, or NotebookEdit tools. All file changes — including
schemas, specs, data definitions, and documentation — must be delegated to the appropriate agent.

## Agent Team Roles

Each role has a custom agent definition in `.claude/agents/` with its model and
prompt pre-configured. Spawn agents with `subagent_type: "<agent-name>"` in the Task tool.

| Role | Agent File | Model | Owns |
|------|-----------|-------|------|
| Architect | `.claude/agents/architect.md` | opus | specs/schemas/, docs/adr/, docs/architecture/ |
| Implementer | `.claude/agents/implementer.md` | sonnet | src/core/, src/systems/, src/state/ |
| UI Developer | `.claude/agents/ui-developer.md` | sonnet | src/ui/, src/styles/, index.html |
| QA / Security | `.claude/agents/qa-security.md` | sonnet | tests/, specs/features/ (shared with Architect) |
| Data Author | `.claude/agents/data-author.md` | sonnet | src/data/, specs/schemas/ |

### How to choose agents

- **Schema changes** → Architect (opus) for design, then Implementer for store integration
- **New game content** (skills, jobs, actions, housing, food) → Data Author
- **Game logic** (systems, tick processing, state) → Implementer
- **UI panels, DOM, styles, layout** → UI Developer
- **Tests, security review, spec validation** → QA / Security
- **Cross-cutting features** → spawn multiple agents in parallel, one per concern

## Key Files

| File | Purpose |
|------|---------|
| specs/schemas/game-state.schema.ts | Master game state schema |
| src/state/store.ts | Zustand store definition |
| src/core/game-loop.ts | Main tick loop |
| src/core/time.ts | Time conversion utilities |
| src/systems/skill-system.ts | Skill XP and leveling |
| src/systems/job-system.ts | Job progression |
| src/systems/reincarnation-system.ts | Reincarnation bonuses |
| src/systems/action-system.ts | Click + continuous actions |
| src/data/skills.ts | Skill definitions |
| src/data/jobs.ts | Job definitions |
| src/data/locations.ts | Location definitions |

## ADR Index

See docs/adr/README.md for all architecture decisions.

## Coverage Requirements

| Area | Minimum |
|------|---------|
| src/systems/ | 90% |
| src/core/ | 85% |
| src/data/ (validation) | 100% |
| Global | 80% |

## Context Management

- Use `/compact` when context reaches ~80% to summarize and free space
- Use `/clear` between unrelated tasks to start fresh
- Agents should read `specs/SPEC-INDEX.md` first, then load only relevant spec files
- Keep CLAUDE.md under 250 lines — move detailed content to referenced files
