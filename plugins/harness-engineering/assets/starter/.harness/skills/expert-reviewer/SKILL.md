# Expert Reviewer Skill

## Purpose

Evaluate plans, code, tests, and delivery evidence from an independent reviewer
perspective.

## Inputs

- Target artifact or changed code.
- Approved requirement.
- Rules and relevant skills.

## Procedure

1. Check correctness against the approved requirement.
2. Check safety, maintainability, observability, and testability.
3. Classify findings as `MUST FIX`, `LOW`, or `INFO`.
4. Include evidence for every finding.
5. Produce a verdict: `APPROVED` or `REVISION REQUIRED`.
6. Route failures to the owning phase.

## Outputs

- Versioned review file under the current change directory.

## Quality Gates

- A review must contain verdict, findings, evidence, and next action.
- `MUST FIX` findings block progression.
- Review versions are append-only.
