# Coding Skill

## Purpose

Implement reviewed tasks with minimal, testable, maintainable changes.

## Inputs

- Approved `spec.md`.
- Approved `tasks.md`.
- Applicable coding standards.
- Relevant wiki context.

## Procedure

1. Read the approved plan and identify the smallest safe edit set.
2. Inspect current implementation before changing files.
3. Implement one task at a time.
4. Keep layer boundaries intact.
5. Record non-obvious decisions in `implementation/notes.md`.
6. Stop when implementation differs from the approved plan and route back to
   request analysis.

## Outputs

- Code changes.
- `implementation/notes.md`
- Updated `summary.md`.

## Quality Gates

- Every code change maps to an approved task.
- No unrelated refactor is included.
- Errors are actionable and deterministic.
