# Quality Model

## Purpose

Define what enterprise-grade means for this harness.

## Quality Attributes

- Traceability: every request has a durable change directory.
- Verifiability: every quality gate has evidence.
- Repeatability: validation can run locally or in CI without special setup.
- Evolvability: failures feed new rules, skills, or validator checks.
- Least context: agents load only the information needed for the current phase.

## Metrics

- Requirement review iterations.
- Code review iterations.
- Test count and pass rate.
- CI failures routed by owning phase.
- Harness improvements created from detected failures.
