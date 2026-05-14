# Unit Test CI Skill

## Purpose

Turn local and CI verification into mechanical evidence.

## Inputs

- Test plan.
- Repository validation commands.
- CI or local test output.

## Procedure

1. Run the documented validation command.
2. Capture status, total tests, passed tests, failed tests, and command.
3. Write `verification/ci-result.json`.
4. Reject empty test runs.
5. Route failures to the owning phase.

## Outputs

- `verification/preflight.md`
- `verification/ci-result.json`

## Quality Gates

- `status` must be `SUCCESS`.
- `totalTests` must be greater than zero.
- `passedTests` must equal `totalTests`.
