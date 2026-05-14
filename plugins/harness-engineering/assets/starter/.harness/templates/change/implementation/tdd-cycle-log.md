# TDD Cycle Log

## Purpose

Record Red-Green-Refactor evidence for high-risk implementation changes.

## Scope

- Feature or behavior under test:
- Risk tags:
- Equivalent evidence accepted by human reviewer, if any:

## Cycle Log

| Cycle | Red Evidence | Green Evidence | Refactor Evidence | Notes |
| --- | --- | --- | --- | --- |
| `TDD-01` | `<failing test, assertion, or expected failure>` | `<passing command/result>` | `<refactor or no-op rationale>` | `<notes>` |

## Command Evidence

| Command | Result | Artifact |
| --- | --- | --- |
| `<command>` | `<SUCCESS/FAILURE>` | `<path>` |

## Deviations

- `<deviation and reviewer-approved rationale>`

## Quality Gates

- At least one cycle records a failing expectation before the passing evidence,
  unless equivalent evidence is explicitly reviewed.
- Each cycle links to executable command evidence or test artifacts.
- Refactor decisions preserve accepted behavior and do not expand scope.
