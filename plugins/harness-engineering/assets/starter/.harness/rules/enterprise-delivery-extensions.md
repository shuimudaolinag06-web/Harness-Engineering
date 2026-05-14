# Enterprise Delivery Extension Rules

## Purpose

Define optional enterprise delivery extensions that can be layered on top of the
10-stage Harness pipeline without breaking the base workflow.

## Rules

- Keep the base 10-stage pipeline compatible. Add enterprise capabilities through
  `extensionStages`, `gateProfiles`, `riskRules`, templates, rules, and skills.
- Do not delete review or verification gates. Low-risk work may merge review
  steps, but reviewer evidence must still exist.
- Do not replace executable validation with narrative documents. Every delivery
  profile must name at least one executable validation command.
- Treat `minimumCommands` as the executable floor. A selected profile may add
  commands, and matching `riskRules` may raise the floor, but the effective gate
  cannot go below the combined minimum.
- Use `riskRules` for money, state-machine, security, database, public API,
  deployment, and external acceptance risks. These risks cannot select
  `fast-iteration`.
- Use the government/enterprise prototype extension when stakeholders require
  page maps, user flows, or high-fidelity behavior confirmation before coding.
- Use implementation readiness before full business coding when OpenAPI,
  database migration, backend scaffold, frontend scaffold, or runtime readiness
  can reduce downstream rework.
- Use frontend-specific review when UI behavior, API client code, or
  high-fidelity prototype implementation changes.
- Use E2E integration gates when backend, frontend, database, proxy, and browser
  behavior must be proven together.
- Use acceptance audit templates before final delivery audit or formal
  government/enterprise UAT.
- Classify findings as `MUST FIX`, `SHOULD FIX`, or `NICE TO HAVE`. `MUST FIX`
  items block the next gate; `SHOULD FIX` items may be accepted only as explicit
  tracked risks.

## Risk Gate Profiles

| Profile | Use Case | Minimum Executable Gate |
| --- | --- | --- |
| `full-audit` | Regulated or external delivery | `npm.cmd run verify` plus domain-specific gates |
| `balanced-enterprise` | Normal enterprise application delivery | backend/frontend/E2E as applicable plus Harness validation |
| `fast-iteration` | PoC, demo, or exploration | Harness validator and smoke/build check |
| `government-enterprise-prototype-first` | Prototype sign-off before coding | prototype review plus contract/scaffold validation |
| `risk-adaptive` | Mixed-risk product lines | gate depth selected by risk tag |

## Quality Gates

- New extension stages must have a trigger, artifacts, and quality gates.
- New gate profiles must have use cases, required commands, minimum commands,
  quality gates, and cost estimates.
- New risk rules must have risk tags, minimum commands, quality gates, and only
  reference known profiles or extension stages.
- Payment, money movement, status-machine, security, database, deployment, and
  data migration changes cannot use a documentation-only gate.
- E2E does not replace unit/integration tests or code review.
- Acceptance audit must link requirements, design, implementation, tests, E2E,
  and validation evidence.
