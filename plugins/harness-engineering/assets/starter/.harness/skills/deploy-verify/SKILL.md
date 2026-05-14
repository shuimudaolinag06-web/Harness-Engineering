# Deploy Verify Skill

## Purpose

Verify released behavior in an explicit environment with rollback readiness.

## Inputs

- Deployment target.
- Release notes or implementation summary.
- Smoke check plan.

## Procedure

1. Confirm environment and parameters with a human when needed.
2. Run smoke checks against user-visible behavior.
3. Record observations and evidence.
4. Document rollback plan and owner.
5. Write `verification/deploy-result.json`.

## Outputs

- `verification/deploy-result.json`

## Quality Gates

- Environment is explicit.
- Smoke checks pass or the release is halted.
- Rollback plan is documented.
