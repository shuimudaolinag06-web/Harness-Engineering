# Unit Test Write Skill

## Purpose

Create change-driven tests that prove the requested behavior and guard against
regression.

## Inputs

- Approved tasks.
- Implementation notes.
- Existing test patterns.

## Procedure

1. Map every changed behavior to at least one test or documented reason.
2. Prefer boundary tests, error-path tests, and representative happy-path tests.
3. Avoid tests that only mirror implementation details.
4. Keep fixtures minimal and readable.
5. Record the test plan in `verification/test-plan.md`.

## Outputs

- Test changes.
- `verification/test-plan.md`
- Updated `summary.md`.

## Quality Gates

- Tests are tied to accepted behavior.
- Critical failure paths are covered.
- The test suite can run without external mutable state unless explicitly
  documented.
