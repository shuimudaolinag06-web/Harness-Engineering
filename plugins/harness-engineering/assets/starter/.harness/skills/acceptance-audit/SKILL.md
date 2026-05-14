# Acceptance Audit Skill

## Purpose

Prepare final delivery audit evidence and decide whether a change may enter
formal acceptance, UAT, or production-like hardening.

## Inputs

- Requirement, design, implementation, review, verification, E2E, and deployment
  evidence.
- `summary.md`, `prompt-code-traceability.md`, `test-plan.md`, and CI/deploy
  result artifacts.
- Known risks and follow-up findings.

## Procedure

1. Verify that MVP scope and out-of-scope items are explicit.
2. Check traceability from requirement to design to code to tests to E2E.
3. Check executable quality gates and CI/deploy evidence.
4. Separate findings into `MUST FIX`, `SHOULD FIX`, and `NICE TO HAVE`.
5. Produce release readiness and final delivery audit artifacts.
6. Decide whether the change can proceed to final delivery audit.
7. Capture Harness process improvements discovered during the change.

## Outputs

- `acceptance/acceptance_review_v1.md`
- `acceptance/release_readiness_checklist.md`
- `acceptance/final_delivery_audit_v1.md`
- Updated `summary.md`
- Updated `prompt-code-traceability.md`

## Quality Gates

- No unresolved `MUST FIX` remains before final delivery audit.
- `SHOULD FIX` items are explicitly accepted as risk or scheduled before UAT.
- Audit evidence links the full engineering chain.
- The final decision states whether the change is a valid Harness workflow
  sample and whether template/rule improvements should be backported.
