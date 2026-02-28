# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.3.0] - 2026-03-01

### Changed
- Life-cycle system refactored from hardcoded events to data-driven triggered event system
- `processMultipleTicks` now halts on any blocking event (was death-only)
- `changeLocation` effect now applies data-driven `entryEffects` from location definitions (was hardcoded prison setup)
- `applySingleClickEffect` exported for reuse by event system

### Added
- Triggered event system (`src/systems/event-system.ts`) — evaluates data-defined events each tick with priority ordering, blocking/non-blocking behavior, and AND-condition logic
- `TriggeredEvent` schema (`specs/schemas/triggered-event.schema.ts`) composing existing `ActionRequirement` and `ActionEffect` unions
- `entryEffects` field on Location schema for data-driven location entry behavior
- 3 new `ActionRequirement` types: `location`, `relocationDay`, `hasPendingRelocation`
- 2 new `ActionEffect` types: `setHousingId`, `setPendingRelocation`
- Event data file (`src/data/events.ts`) with 4 triggered events: meal theft, bandit proposal, amulet awakening, death gate
- Prison entry effects in location data (food, housing, pending relocation)
- ADR-0006: Data-driven triggered events
- Comprehensive tests for event system, new requirement types, and new effect types

## [0.2.0] - 2026-02-22

### Changed
- Prison sentence extended from 100 to 365 days
- Bandit proposal now triggers via timed event at prison day 100 (was last-day pause)
- Bandit choice actions (Lift Stone, Decline Proposal) gated by `bandit_proposal_active` story flag instead of last-day check
- Lifting the stone now restores prison meals and joins bandits clan (player stays in prison)
- Declining the proposal now clears food (player stays in prison, hungry)
- Prison sentence message updated to "1 year" (was "100 days")

### Added
- Prison meal-stealing event at day 30 (removes prison food, adds story message)
- `entryDay` field on pending relocation schema for tracking prison entry
- `setFoodId` action effect type for modifying player food directly
- Message log auto-scroll to newest messages
- Message log highlight animation on new messages
- Custom scrollbar styling for message log
- Lifestyle panel hides prison food after meals are stolen (unless player joins bandits)
- Auto-tag release step in CI/CD deploy workflow

### Fixed
- Prison release deadlock at day 365 — removed redundant last-day pause mechanism that froze the game by pausing before relocation and disabling all actions
- CLAUDE.md team lead workflow: plan spec changes first, then tests/implementation separately

## [0.1.0] - 2026-02-22

### Added
- Core game loop with tick-based time system (1 tick = 1 in-game day)
- Life cycle: age 16 start, death at ~58, reincarnation via amulet
- Reincarnation system with permanent XP bonuses per skill/job
- Skills: Concentration, Strength, Endurance, Intelligence with soft caps
- Jobs: Beggar, Scavenger, Errand Runner, Fisherman, Farmer, Shepherd, Woodcutter, Hunter, Laborer, Soldier, Robbery
- 6 locations: Slums, Fields, Village, Prison, Barracks, Bandit Hideout
- Click actions (story/travel) and continuous actions (job/skill progression)
- Dual action slots: one job + one skill simultaneously
- Economy system with gold earnings and daily expenses
- Food and housing lifestyle systems with XP bonuses
- Clans system: Army and Bandits with story branching
- Prison system with bandit recruitment event
- Story intro sequence (amulet discovery, bread theft)
- Auto-save/load via localStorage with Zod validation
- Zustand state management with single source of truth
- Full spec-first development: Gherkin features + Zod schemas
- GitHub Pages deployment via CI/CD
