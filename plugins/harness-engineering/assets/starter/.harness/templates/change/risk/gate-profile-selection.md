# Gate Profile Selection

## Purpose

Select the right Harness gate profile for the change before implementation.

## Risk Inputs

| Risk Factor | Present | Notes |
| --- | --- | --- |
| Money or financial calculation | `Yes/No` | `<notes>` |
| State-machine transition | `Yes/No` | `<notes>` |
| Security or permission boundary | `Yes/No` | `<notes>` |
| Database schema or data migration | `Yes/No` | `<notes>` |
| Public API contract | `Yes/No` | `<notes>` |
| Deployment/runtime change | `Yes/No` | `<notes>` |
| Government/enterprise acceptance | `Yes/No` | `<notes>` |

## Risk Tags

- `<risk tag from pipeline.riskRules>`

## Matched Risk Rules

| Rule ID | Reason Matched | Added Minimum Commands | Required Extension Stages |
| --- | --- | --- | --- |
| `<riskRules[].id>` | `<evidence>` | `<commands>` | `<stages>` |

## Lightweight Entry Decision

| Field | Value |
| --- | --- |
| Lightweight entry decision file | `risk/lightweight-entry-decision.md | N/A` |
| Recommended profile | `<profile>` |
| Human-confirmed profile | `<profile>` |

## Selected Profile

`full-audit | balanced-enterprise | fast-iteration | government-enterprise-prototype-first | risk-adaptive | tdd-execution`

## Selection Rationale

- Why this profile:
- Why a heavier profile was not selected:
- Why a lighter profile was not selected:
- Applicable `gateProfiles[].useCases`:
- Not-applicable `gateProfiles[].notUseCases` reviewed:

## Profile Minimum Commands

- `<gateProfiles[].minimumCommands command>`

## Recommended Commands

- `<gateProfiles[].recommendedCommands command>`

## Effective Minimum Commands

- `<profile minimum command plus matched risk rule minimum command>`

## Required Commands

- `<command>`

## Review Plan

- Requirement review:
- Design/prototype review:
- Code review:
- Test review:
- Acceptance review:

## Required Evidence

- `<gateProfiles[].requiredEvidence item>`

## Combined Stages

| Stage | Combined With | Reason | Evidence |
| --- | --- | --- | --- |
| `<stage or N/A>` | `<stage or N/A>` | `<reason>` | `<evidence>` |

## Non-Skippable Stages

- `<gateProfiles[].nonSkippableStages item>`

## Deferred Items

| Item | Reason Deferred | Owner | Target |
| --- | --- | --- | --- |
| `<SHOULD FIX or NICE TO HAVE>` | `<reason>` | `<owner>` | `<target>` |

## Quality Gates

- The selected profile matches risk level.
- Selected profile is not listed in any matched rule's `disallowedProfiles`.
- Effective minimum commands include the selected profile minimum commands and
  every matched risk rule minimum command.
- Required extension stages from matched risk rules are completed or explicitly
  marked not applicable with reviewer evidence.
- Review and verification gates are not deleted, only combined or scaled.
- Any skipped gate is documented with a reason and replacement evidence.
- If stage merge or process trim is declared, `acceptance/process-trim-audit.md`
  exists and records the decision.
