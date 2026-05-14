# Environment Readiness

## Purpose

Record whether local or CI runtime dependencies are ready for implementation,
integration, and E2E.

## Runtime Matrix

| Dependency | Required Version | Check Command | Result | Impact If Missing |
| --- | --- | --- | --- | --- |
| Java | `<version>` | `<command>` | `Pending` | `<impact>` |
| Maven | `<version>` | `<command>` | `Pending` | `<impact>` |
| Node.js | `<version>` | `<command>` | `Pending` | `<impact>` |
| Docker | `<version>` | `<command>` | `Pending` | `<impact>` |
| Git | `<version>` | `<command>` | `Pending` | `<impact>` |

## Verification Commands

| Command | Purpose | Result |
| --- | --- | --- |
| `<command>` | `<purpose>` | `Pending` |

## Front-Back Verification Start Criteria

- OpenAPI contract exists and is stable enough for integration.
- Backend endpoint or stub is reachable.
- Frontend build/dev server is reachable.
- Database/runtime dependencies are reachable.
- No unresolved `MUST FIX` blocks integration.

## Quality Gates

- Missing tools are documented with impact but do not block documentation-only
  validation.
- Business verification does not start until runtime dependencies are reachable
  or explicitly stubbed.
