# Recent Decisions Log

## 2026-02-08 - Project Setup

### Tech Stack Decisions
- **TypeScript + Vite**: Modern, fast, good AI support (ADR-0001)
- **Zustand**: Simplest state management for this use case (ADR-0003)
- **Vanilla DOM**: No framework overhead for idle game UI (ADR-0005)
- **Zod + Gherkin**: Spec-first development for AI autonomy (ADR-0004)
- **Vitest + Playwright**: Fast unit tests + E2E coverage
- **Data-driven architecture**: All content as data objects (ADR-0002)

### Permission Setup
- Updated `.claude/settings.local.json` for autonomous agent teams
- Updated `~/.claude/settings.json` with CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
