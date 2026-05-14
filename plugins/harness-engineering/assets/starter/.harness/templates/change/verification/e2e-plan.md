# E2E Plan

## Purpose

Define the front-back integration and browser E2E scope for this change.

## Runtime Requirements

| Runtime | Startup Command | Health Check | Required |
| --- | --- | --- | --- |
| Database | `<command>` | `<check>` | `Yes/No` |
| Backend | `<command>` | `<check>` | `Yes/No` |
| Frontend | `<command>` | `<check>` | `Yes/No` |

## E2E Scenarios

| Scenario | Steps | Expected Result | Priority |
| --- | --- | --- | --- |
| `<scenario>` | `<steps>` | `<result>` | `Critical/Normal` |

## Relationship To Other Tests

- E2E does not replace unit tests.
- E2E does not replace code review.
- E2E should prove integrated behavior across browser, frontend, backend, and
  runtime dependencies.

## Quality Gates

- Critical happy path is covered.
- At least one critical failure path is covered when feasible.
- Runtime startup and health checks are documented.
