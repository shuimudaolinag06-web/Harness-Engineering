# Lightweight Entry Decision

## Purpose

用最多 5 个入口问题，为本次 change 推荐合适的 Harness gate profile。
这个模板用于保持简单入口，同时让流程删减、门禁选择和人工确认可审计。

## Entry Questions

| Question | Answer | Evidence / Notes |
| --- | --- | --- |
| 是否修改业务代码？ | `Yes/No` | `<notes>` |
| 是否影响金额、状态机、权限、安全、数据库、公开 API 或部署？ | `Yes/No` | `<notes>` |
| 是否需要外部客户、政企、UAT 或正式验收？ | `Yes/No` | `<notes>` |
| 是否涉及 UI、前后端联调或 E2E？ | `Yes/No` | `<notes>` |
| 是否只是文档、模板、dry-run 或流程试点？ | `Yes/No` | `<notes>` |

## Recommended Profile

`fast-iteration | balanced-enterprise | full-audit | government-enterprise-prototype-first | risk-adaptive | tdd-execution`

## Recommendation Rules

| Condition | Recommended Profile |
| --- | --- |
| 文档、模板、dry-run、流程试点，且无高风险实现 | `fast-iteration` |
| 常规企业内部业务改动，需要保留 review 与验证证据 | `balanced-enterprise` |
| 风险标签混合，需要由 `riskRules` 自动加严 | `risk-adaptive` |
| 政企、外部客户、UAT 或正式验收前置 | `government-enterprise-prototype-first` 或 `full-audit` |
| 金额、状态机、权限、安全、数据库、公开 API 或部署实现变更 | `tdd-execution` 或 `risk-adaptive` 加 `tdd-execution-quality` |

## Current Flow Template

请根据以上答案输出当前 change 的流程模板：

| Flow Area | Decision |
| --- | --- |
| Selected gateProfile | `<profile>` |
| Required extensionStages | `<stages or N/A>` |
| Minimum commands | `<commands>` |
| Recommended commands | `<commands>` |
| Combined stages | `<stages or N/A>` |
| Non-skippable stages | `<stages>` |
| Required evidence | `<evidence files>` |

## Human Confirmation

| Role | Confirmation | Notes |
| --- | --- | --- |
| Request owner | `Approved/Needs Change` | `<notes>` |
| Engineering owner | `Approved/Needs Change` | `<notes>` |

## Quality Gates

- Entry decision uses no more than 5 questions.
- Low-risk changes are not forced into heavy implementation gates.
- High-risk changes inherit stricter `riskRules`.
- Any combined stage keeps review responsibility and evidence.
- The selected profile is copied into `risk/gate-profile-selection.md`.
