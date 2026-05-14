# Harness Change Flow Skill

## Purpose

Provide a Chinese, beginner-friendly entry point for running the Harness
Engineering change flow. This skill translates human stage names such as
`需求分析` or `最终审计` into the correct Harness phase, required source files,
evidence artifacts, reviewer separation, and executable validation commands.

This skill is an orchestration layer only. It does not replace the base
10-stage pipeline, `gateProfiles`, `riskRules`, required reviews, or executable
validation evidence.

## Inputs

- User requested action, for example `流程配置`, `需求分析`, `代码评审`, or `CI验证`.
- Change ID under `.harness/changes/<change-id>/`.
- Current requirement or task context.
- `.harness/config/pipeline.json`.
- `.harness/rules/`.
- `.harness/templates/change/`.
- Existing change evidence under `.harness/changes/<change-id>/`.

## Procedure

1. Normalize the Chinese action name to one Harness action in the action map.
2. Read `.harness/config/pipeline.json` and the current change's
   `risk/gate-profile-selection.md` when it exists.
3. Identify the owning base phase, required skill files, required inputs,
   output artifacts, quality gates, and rollback route.
4. If the action is a review action, enforce execution/review separation.
5. If the action depends on risk policy, apply selected `gateProfile`,
   matched `riskRules`, required `extensionStages`, and effective minimum
   commands.
6. Produce an actionable Chinese checklist for the user or execution Agent.
7. Preserve the underlying executable validation commands as audit evidence.
8. Update or instruct the Agent to update `summary.md` after the action.

## Action Map

| 中文动作 | Harness phase / extension | Primary skill | Main evidence |
| --- | --- | --- | --- |
| `流程配置` | `lightweight-entry-governance` | `harness-change-flow` | `risk/lightweight-entry-decision.md`, `risk/gate-profile-selection.md` |
| `变更初始化` | Change setup | `harness-change-flow` | `summary.md`, risk files, baseline verification JSON |
| `需求分析` | `request-analysis` | `request-analysis` | `request_analysis/spec.md`, `request_analysis/tasks.md`, `summary.md` |
| `需求评审` | `requirement-review` | `expert-reviewer` | `request_analysis/review/spec_review_v1.md` |
| `设计准备` | `implementation` plus optional extensions | `implementation-readiness`, `government-enterprise-prototype` | `design/plan.md`, prototype files, readiness files |
| `原型确认` | `government-enterprise-prototype` | `government-enterprise-prototype` | `prototype/*`, `design/prototype-review-v1.md` |
| `实现` | `implementation` | `coding-skill` | code changes, `implementation/notes.md` |
| `TDD实现` | `tdd-execution-quality` | `coding-skill` | `implementation/task-execution-plan.md`, `implementation/tdd-cycle-log.md` |
| `代码评审` | `code-review` | `expert-reviewer` | `implementation/review/code_review_v1.md` |
| `前端评审` | `frontend-special-review` | `frontend-review` | `implementation/review/frontend_code_review_v1.md` |
| `测试编写` | `unit-test-writing` | `unit-test-write` | test changes, `verification/test-plan.md` |
| `测试评审` | `unit-test-review` | `expert-reviewer` | `verification/review/test_review_v1.md` |
| `提交前检查` | `code-push-readiness` | `unit-test-ci` | `verification/preflight.md` |
| `CI验证` | `ci-verification` | `unit-test-ci` | `verification/ci-result.json` |
| `E2E联调` | `e2e-integration-gate` | `e2e-integration` | `verification/e2e-plan.md`, `verification/e2e-result.json` |
| `部署验证` | `deployment-verification` | `deploy-verify` | `verification/deploy-result.json` |
| `最终审计` | `acceptance-audit`, `user-confirmation` | `acceptance-audit` | acceptance review, release checklist, final audit |
| `用户确认` | `user-confirmation` | `expert-reviewer` | `acceptance/user-confirmation.md` |

## Beginner Command Facade

Use the repository command facade to inspect the action checklist. The
preferred beginner form is:

```text
harness <中文动作|English phase> <change-id>
```

The same action can be called by Chinese stage name or by the underlying
Harness phase name:

```powershell
harness 需求分析 <change-id>
harness request-analysis <change-id>
harness 需求评审 <change-id>
harness requirement-review <change-id>
harness CI验证 <change-id>
harness ci-verification <change-id>
```

Windows PowerShell may not search the current directory by default. If `harness`
is not on `PATH`, use the local wrapper from the repository root:

```powershell
.\harness.cmd 需求分析 <change-id>
.\harness.cmd request-analysis <change-id>
```

The npm script remains as a compatible fallback:

```powershell
npm.cmd run harness -- 列出阶段
npm.cmd run harness -- 需求分析 <change-id>
npm.cmd run harness -- 需求评审 <change-id>
npm.cmd run harness -- CI验证 <change-id>
npm.cmd run harness -- 最终审计 <change-id>
```

The command facade is a guide and guardrail. When it lists executable commands
such as `npm.cmd run validate` or `npm.cmd run verify`, those commands still
need to be run and recorded as evidence.

## Flow Configuration Commands

Flow configuration is the first beginner action. It selects the current
change's `riskTags`, `gateProfile`, `extensionStages`, effective minimum
commands, combinable stages, non-skippable stages, and required evidence.

Use these commands before requirement analysis:

```powershell
harness 流程配置 <change-id>
harness flow-config <change-id>
harness gate-profile-selection <change-id>
harness risk-selection <change-id>
```

Equivalent PowerShell-local form:

```powershell
.\harness.cmd 流程配置 <change-id>
.\harness.cmd flow-config <change-id>
```

Expected configuration evidence:

- `.harness/changes/<change-id>/risk/lightweight-entry-decision.md`
- `.harness/changes/<change-id>/risk/gate-profile-selection.md`
- `.harness/changes/<change-id>/acceptance/process-trim-audit.md` when a stage
  merge, process trim, or gate reduction is declared.

Configuration procedure:

1. Run `harness 流程配置 <change-id>` to print the checklist.
2. Answer the five lightweight intake questions.
3. Select risk tags from `.harness/config/pipeline.json` `riskRules`.
4. Select one profile from `gateProfiles`.
5. Add required extension stages from matched risk rules.
6. Calculate effective minimum commands as selected profile minimum commands
   plus every matched risk rule minimum command.
7. Record which stages may be combined and which stages are non-skippable.
8. Only then run `harness 变更初始化 <change-id>` and
   `harness 需求分析 <change-id>`.

Configuration guardrails:

- High-risk tags such as `money`, `financial-calculation`, `state-machine`,
  `status-transition`, `security`, `permission`, `database`, `data-migration`,
  `public-api`, `openapi`, `deployment`, `runtime`,
  `government-acceptance`, `enterprise-uat`, or `external-acceptance` must not
  select `fast-iteration`.
- Low-risk changes may be lightweight, but still keep Harness validation and
  audit evidence.
- Stage merging combines evidence only; it does not delete audit ownership.

## Outputs

- Chinese stage checklist.
- Required input files and output artifacts for the selected action.
- Review separation warning for review actions.
- Effective validation command guidance.
- Rollback route when the quality gate fails.
- Updated or requested update to `.harness/changes/<change-id>/summary.md`.

## Quality Gates

- A Chinese action must map to a known Harness phase or extension.
- Low-risk flow simplification may combine evidence but must not delete audit
  responsibility.
- High-risk changes must apply `riskRules` and must not select
  `fast-iteration`.
- Review actions must be performed by an independent reviewer or independent
  review process.
- No delivery action may be marked complete without executable verification
  evidence when verification is required.
- Failures must route back to the owning phase and should produce a concrete
  improvement candidate for a rule, skill, template, prompt, validator, or
  regression test.
