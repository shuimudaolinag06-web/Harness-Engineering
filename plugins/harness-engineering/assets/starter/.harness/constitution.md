# Harness Engineering Constitution

## Purpose

Define the engineering principles that cannot be traded away by delivery speed,
AI assistance, or local process tailoring.

## Non-Negotiable Principles

- Keep the base Harness 10-stage pipeline compatible.
- Treat requirements, decisions, implementation evidence, verification, and
  acceptance as auditable project assets.
- Add optional governance only as an extension. Do not weaken existing quality
  gates to make a change appear faster.
- Prefer executable validation over narrative confidence.
- Keep business scope explicit. Do not let implementation invent requirements
  that were not accepted in the spec, proposal, or plan.
- Preserve user or team changes that are outside the current task unless a human
  explicitly requests a revert.

## Quality Red Lines

- Requirement review, code review, test review, CI verification, applicable E2E,
  and final audit may be strengthened or combined by policy, but not replaced by
  weaker evidence.
- Money, state-machine, security, permission, database, public API, and
  deployment implementation changes require TDD execution evidence or an
  explicitly reviewed equivalent.
- Documentation, template-only, process-copy, and dry-run changes must not be
  forced through implementation-only TDD gates.
- CI evidence must not claim success with zero tests when executable tests are
  expected.
- High-risk shortcuts must be recorded as findings, not hidden as process
  simplification.

## AI Collaboration Boundaries

- AI may draft specs, plans, tests, reviews, docs, and code changes within the
  accepted scope.
- AI must surface assumptions, unresolved risks, and verification gaps.
- AI must not silently reduce quality gates, delete audit evidence, or bypass
  human checkpoints.
- AI-generated implementation for high-risk changes must be paired with
  executable tests and independent review evidence.

## Human Confirmation Boundaries

- Humans confirm requirement scope, high-risk policy exceptions, production
  deployment parameters, and final acceptance.
- Humans decide whether SHOULD FIX or NICE TO HAVE items can be deferred.
- Humans own any decision to accept equivalent evidence in place of standard TDD
  artifacts for high-risk implementation.

## Quality Gates

- This constitution exists at `.harness/constitution.md`.
- The manifest or docs explicitly reference this constitution.
- Validator changes must preserve the base Harness 10-stage compatibility check.
- New governance assets are optional unless a change declares the governance
  version or matches a high-risk implementation rule.
