# Development Workflow Rules

## Purpose

Prevent one-shot implementation, premature victory declaration, and unverified
changes.

## Rules

- Follow the 10-stage pipeline in `.harness/config/pipeline.json`.
- Use a written plan before editing production code.
- Separate execution from evaluation. Reviewer output must be recorded as an
  artifact.
- Keep review iterations bounded by the caps in the pipeline config.
- Route failures to the phase that owns the failure.
- Preserve all historical review versions.
- Update the change summary immediately after each phase.

## Human Checkpoints

- Pending requirement decision.
- Post requirement review.
- Post code review.
- Deployment parameters.
- Final acceptance.

## Quality Gates

- CI success requires `status == SUCCESS`, `totalTests > 0`, and
  `passedTests == totalTests`.
- A review artifact must include verdict, findings, evidence, and next action.
- Deployment verification must include environment, smoke checks, and rollback
  plan.
