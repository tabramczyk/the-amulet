# Threat Model - The Amulet

## Methodology
STRIDE analysis for client-side browser game.

## Scope
MVP: Single-player browser game, no backend, static hosting.

## Assets

| Asset | Value | Location |
|-------|-------|----------|
| Game Client (JS bundle) | Medium | CDN/static host |
| Save Data | Low | localStorage |
| Game Content | Low | Bundled in JS |

## Threat Analysis

### T1: XSS via Game Content
- **Category**: Tampering
- **Threat**: If game text is rendered via innerHTML, malicious content injection
- **Impact**: High (arbitrary JS execution)
- **Mitigation**: Use textContent/DOM API exclusively (SEC-02)
- **Status**: Mitigated by constraint

### T2: Save Data Tampering
- **Category**: Tampering
- **Threat**: Player modifies localStorage to gain unfair advantage
- **Impact**: Low (single-player, no leaderboard)
- **Mitigation**: Accept risk (MVP). Validate structure only (Zod).
- **Status**: Accepted Risk

### T3: Supply Chain Attack
- **Category**: Tampering
- **Threat**: Malicious npm package
- **Impact**: High
- **Mitigation**: Minimal dependencies, npm audit in CI, lock file
- **Status**: Mitigated

### T4: CSP Bypass
- **Category**: Elevation of Privilege
- **Threat**: Weakened CSP allows script injection
- **Impact**: High
- **Mitigation**: Strict CSP in index.html (SEC-06)
- **Status**: Mitigated by constraint
