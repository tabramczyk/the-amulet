# Security Documentation

## Overview
The Amulet is a client-side browser game with no backend, no user accounts, and no sensitive data processing (MVP phase). Security focus is on client-side best practices.

## Documents

| Document | Purpose |
|----------|---------|
| [constraints.md](constraints.md) | Hard security rules - NEVER violate |
| [threat-model.md](threat-model.md) | STRIDE-based threat analysis |

## Security Review Triggers
Any change to these areas requires security review:
- localStorage read/write operations
- Dynamic content rendering
- External resource loading
- CSP header modifications
