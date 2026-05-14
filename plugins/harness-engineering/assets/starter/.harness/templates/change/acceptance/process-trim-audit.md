# Process Trim Audit

## Purpose

审计本次 change 是否存在流程删减、阶段合并或门禁降级，确保 Harness 保持
简单入口、可配置门禁和可审计证据。

## Trim Declaration

| Item | Value | Evidence |
| --- | --- | --- |
| Process trim declared | `Yes/No` | `<source>` |
| Stage merge declared | `Yes/No` | `<source>` |
| Gate reduction declared | `Yes/No` | `<source>` |
| Selected gateProfile | `<profile>` | `<risk/gate-profile-selection.md>` |

## Combined Stages

| Stage | Combined With | Reason | Replacement / Shared Evidence |
| --- | --- | --- | --- |
| `<stage>` | `<stage>` | `<reason>` | `<evidence>` |

## Non-Skippable Gate Check

| Gate | Status | Evidence |
| --- | --- | --- |
| Requirement review | `Pass/Fail/N/A` | `<evidence>` |
| Code review | `Pass/Fail/N/A` | `<evidence>` |
| Test review | `Pass/Fail/N/A` | `<evidence>` |
| CI or Harness validation | `Pass/Fail/N/A` | `<evidence>` |
| E2E or integration evidence when applicable | `Pass/Fail/N/A` | `<evidence>` |
| Final delivery audit when applicable | `Pass/Fail/N/A` | `<evidence>` |

## Risk Guardrail Check

| Risk | Result | Evidence |
| --- | --- | --- |
| High-risk change avoided `fast-iteration` | `Pass/Fail/N/A` | `<evidence>` |
| Low-risk change was not forced through heavy gates | `Pass/Fail/N/A` | `<evidence>` |
| Minimum commands were preserved | `Pass/Fail/N/A` | `<evidence>` |
| Deferred SHOULD FIX / NICE TO HAVE items are explicit | `Pass/Fail/N/A` | `<evidence>` |

## Verdict

`APPROVED | APPROVED WITH FOLLOW-UP | REVISION REQUIRED`

## Findings

| Priority | Finding | Evidence | Required Action | Blocking |
| --- | --- | --- | --- | --- |
| INFO | `<finding>` | `<evidence>` | `<action>` | `No` |

## Next Action

`Proceed | Add evidence | Re-run validation | Escalate to heavier profile`

## Quality Gates

- Process trimming combines evidence only; it does not delete audit ownership.
- Any skipped or merged activity has reason, replacement evidence, and owner approval.
- High-risk changes cannot use validate-only gates.
- Low-risk changes keep at least Harness validation or equivalent executable evidence.
