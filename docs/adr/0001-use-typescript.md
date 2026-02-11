# ADR-0001: Use TypeScript with Strict Mode

## Status
Accepted

## Date
2026-02-08

## Context
Need a language for browser game development that supports AI-assisted coding, strong type safety, and broad ecosystem support.

## Decision Drivers
- AI coding assistants work best with typed languages
- Browser games need JavaScript compatibility
- Data-driven design requires strong validation
- Want to catch bugs at compile time

## Considered Options
1. **TypeScript (strict mode)**: Full type safety, broad ecosystem
2. **Plain JavaScript**: No compilation, less safety
3. **ReScript/Elm**: Stronger types but smaller ecosystem

## Decision
Chosen: **TypeScript with strict mode**

### Rationale
TypeScript strict mode catches the most bugs at compile time while maintaining full JavaScript ecosystem access. Combined with Zod for runtime validation, it provides end-to-end type safety. AI assistants generate better TypeScript than alternatives due to training data volume.

## Consequences
### Positive
- Compile-time bug detection
- Self-documenting code via types
- Best AI assistant support

### Negative
- Build step required
- Some type gymnastics for complex patterns

## Validation
- `tsc --noEmit` passes with zero errors
- No `any` types in codebase (enforced by ESLint)
