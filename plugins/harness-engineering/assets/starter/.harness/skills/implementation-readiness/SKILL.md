# Implementation Readiness Skill

## Purpose

Validate that a change is ready for full implementation by preparing stable
contracts, database migration, scaffolds, and runtime checks first.

## Inputs

- Approved requirement and design artifacts.
- Technology stack and runtime assumptions.
- API, database, frontend, backend, and deployment constraints.
- Existing validation scripts and environment dependencies.

## Procedure

1. Produce or validate the OpenAPI contract for the MVP scope.
2. Produce or validate database migration scripts with reversible reasoning and
   safe naming conventions.
3. Create backend and frontend scaffolds only as needed for smoke/build checks.
4. Add environment readiness checks for database, backend startup, frontend
   build, and local validator commands.
5. Record when front-back verification may begin.
6. Avoid implementing full business logic during readiness-only rounds.

## Outputs

- OpenAPI contract or contract checklist.
- Database migration checklist.
- Backend and frontend smoke/build evidence.
- `verification/environment-readiness.md`
- Updated `implementation/notes.md`, `verification/test-plan.md`, and
  `summary.md`

## Quality Gates

- Contract and migration align to accepted scope.
- Runtime smoke/build checks are executable.
- Missing Java, Maven, Node, Docker, or Git is documented with impact.
- Readiness artifacts do not claim business logic is complete.
