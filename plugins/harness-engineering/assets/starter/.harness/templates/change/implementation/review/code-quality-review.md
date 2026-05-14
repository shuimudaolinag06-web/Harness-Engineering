# Code Quality Review

## Purpose

Check code quality, boundaries, maintainability, test effectiveness, and
regression risk for high-risk implementation changes.

## Verdict

`APPROVED | REVISION REQUIRED | BLOCKED`

## Reviewed Inputs

- `implementation/notes.md`
- `implementation/tdd-cycle-log.md`
- `implementation/task-execution-plan.md`
- Test and CI evidence
- Changed code paths

## Findings

| Priority | Finding | Evidence | Required Action | Blocking |
| --- | --- | --- | --- | --- |
| `INFO` | `<finding>` | `<path>` | `<action>` | `No` |

## Next Action

## Quality Gates

- Code respects existing module and ownership boundaries.
- Tests assert behavior and would fail for the targeted risk.
- Maintainability risks and regression risks are explicit.
- This review augments, but does not replace, the base code review or test
  review gates.
