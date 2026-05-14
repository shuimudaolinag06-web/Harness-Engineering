# Frontend Review Skill

## Purpose

Review frontend implementation and tests against prototype, API contract,
enterprise usability, and scope guardrails.

## Inputs

- Frontend source files.
- API contract and frontend API client.
- Prototype page map, user flow, and high-fidelity specification.
- Frontend build/test results.
- Scope guardrails and out-of-scope features.

## Procedure

1. Check page coverage, navigation, core user operations, and status/audit
   display against the prototype.
2. Check API client paths, request payloads, envelope handling, and business
   error mapping against OpenAPI.
3. Check UI states: loading, empty, error, success, disabled, and conflict.
4. Check enterprise usability: restrained backend layout, high-frequency
   operation, audit readability, and no marketing-style pages.
5. Check scope guardrails for out-of-scope states, actions, and text.
6. Review tests and identify missing component, API-client, and E2E coverage.

## Outputs

- `implementation/review/frontend_code_review_v1.md`
- `verification/review/frontend_test_review_v1.md`
- Updated `verification/test-plan.md`
- Updated `prompt-code-traceability.md`

## Quality Gates

- No frontend `MUST FIX` remains before integration/E2E.
- Frontend behavior maps to prototype and API contract.
- Scope guardrails are explicitly checked.
- Test gaps are classified as `MUST FIX`, `SHOULD FIX`, or `NICE TO HAVE`.
