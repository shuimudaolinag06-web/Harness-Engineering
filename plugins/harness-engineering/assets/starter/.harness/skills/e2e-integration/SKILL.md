# E2E Integration Skill

## Purpose

Prove that backend, frontend, database, proxy, and browser behavior work
together for critical user flows.

## Inputs

- Backend and frontend implementation.
- Runtime dependency definitions such as Docker Compose.
- OpenAPI contract and user flow.
- Existing backend/frontend validation commands.
- E2E framework choice, normally Playwright for web applications.

## Procedure

1. Confirm database and runtime dependencies can start locally or in CI.
2. Confirm backend health or API endpoint reachability.
3. Confirm frontend build/dev server and API proxy reachability.
4. Add a minimal E2E configuration and at least one critical browser flow.
5. Include at least one critical failure path when feasible.
6. Record how `verify:e2e` relates to `verify:env`.
7. Keep E2E focused. It should not replace unit tests, integration tests, or
   code review.

## Outputs

- `verification/e2e-plan.md`
- E2E test files such as `e2e/<flow>.spec.ts`
- `verification/e2e-result.json`
- `npm` script such as `verify:e2e`
- Updated `verification/test-plan.md`, `ci-result.json`, and `summary.md`

## Quality Gates

- E2E starts or verifies required runtime services.
- E2E validates browser-visible behavior and backend state/API responses.
- E2E is included in the full local gate unless documented as too expensive.
- E2E failures route back to the owning implementation or environment phase.
