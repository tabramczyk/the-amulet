# Security Constraints

> CRITICAL: These constraints must NEVER be violated by any agent or teammate.

## Hard Constraints

| ID | Constraint | Severity |
|----|-----------|----------|
| SEC-01 | No `eval()`, `Function()`, or `setTimeout/setInterval` with string args | Critical |
| SEC-02 | No `innerHTML` with dynamic/user data - use `textContent` or DOM API | Critical |
| SEC-03 | No secrets, API keys, or credentials in source code | Critical |
| SEC-04 | No loading external scripts at runtime | Critical |
| SEC-05 | All external data validated via Zod before use | High |
| SEC-06 | CSP header in index.html must not include `unsafe-eval` | High |
| SEC-07 | Save data loaded from localStorage must be validated | High |

## ESLint Enforcement

These ESLint rules enforce security constraints:
- `no-eval` -> SEC-01
- `no-implied-eval` -> SEC-01
- `no-new-func` -> SEC-01

## Save Data Security

Save data in localStorage is player-modifiable. For MVP:
- Accept that players can cheat via localStorage editing
- Validate save data structure (Zod) to prevent crashes
- Do NOT trust save data values for security-critical decisions
