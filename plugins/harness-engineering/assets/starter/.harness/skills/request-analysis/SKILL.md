# Request Analysis Skill

## Purpose

Convert an ambiguous request into a precise, reviewable engineering plan.

## Inputs

- User request.
- Relevant wiki documents.
- Existing rules and pipeline definition.

## Procedure

1. Restate the goal in business and engineering terms.
2. Define in scope and out of scope.
3. Identify affected modules and integration points.
4. Capture assumptions, constraints, risks, and open questions.
5. Produce `request_analysis/spec.md`.
6. Split work into tasks with owner, dependencies, output, and verification.
7. Produce `request_analysis/tasks.md`.
8. Update `summary.md`.

## Outputs

- `request_analysis/spec.md`
- `request_analysis/tasks.md`
- `summary.md`

## Quality Gates

- Acceptance criteria are observable.
- Open questions are explicit.
- Every task has a verification method.
