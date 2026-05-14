---
name: harness-engineering
description: Install and use the Harness Engineering workflow for auditable AI coding. Use when setting up `.harness/` in a repository, selecting gate profiles and risk rules, running Chinese stage commands such as `harness 需求分析`, creating change evidence, separating implementation and review agents, validating CI evidence, or packaging the workflow for other coding tools.
---

# Harness Engineering

## Quick Start

Use this skill when a repository should adopt Harness Engineering or when a
user asks to run a Harness stage such as `流程配置`, `需求分析`, `需求评审`,
`CI验证`, or `最终审计`.

Preferred beginner commands after installation:

```powershell
harness 列出阶段
harness 流程配置 <change-id>
harness 变更初始化 <change-id>
harness 需求分析 <change-id>
harness 需求评审 <change-id>
harness CI验证 <change-id>
harness 最终审计 <change-id>
```

PowerShell local fallback from a repository root:

```powershell
.\harness.cmd 需求分析 <change-id>
.\harness.cmd request-analysis <change-id>
```

## Install Starter Assets

To install the starter into the current repository, run the plugin script:

```powershell
node plugins/harness-engineering/scripts/install-starter.mjs .
```

The script copies these portable assets into the target repository:

- `.harness/` workflow assets.
- `scripts/validate-harness.mjs`.
- `scripts/lib/harnessValidator.mjs`.
- `scripts/harness-flow.mjs`.
- `harness.cmd`, `harness.ps1`, and `harness`.

Then add or merge these package scripts if they are not already present:

```json
{
  "scripts": {
    "harness": "node scripts/harness-flow.mjs",
    "validate": "node scripts/validate-harness.mjs",
    "verify": "npm test && npm run validate"
  },
  "bin": {
    "harness": "./scripts/harness-flow.mjs"
  }
}
```

## Cross-Tool Usage

Codex can discover this plugin through `.codex-plugin/plugin.json`. Other
coding tools can still use the starter assets because the operational contract
is plain files plus Node scripts:

- Read `.harness/skills/harness-change-flow/SKILL.md`.
- Run `.\harness.cmd <stage> <change-id>` or `node scripts/harness-flow.mjs`.
- Run `npm.cmd run validate` and `npm.cmd run verify`.
- Preserve `.harness/changes/<change-id>/` evidence.

## Workflow Guardrails

- Start every non-trivial change with `流程配置`.
- Treat `change-id` as the audit directory name under `.harness/changes/`.
- Do not use a requirement document filename as the change id.
- Apply `gateProfile`, `riskTags`, `extensionStages`, and effective minimum
  commands before implementation.
- Keep implementation and review roles separate.
- Do not deliver without executable validation evidence.
- High-risk tags must not use `fast-iteration`.
- Failures should produce a follow-up improvement for a rule, skill, template,
  prompt, validator, or regression test.

## References

Read only what is needed:

- `references/install.md`: installation and cross-tool deployment.
- `references/action-map.md`: Chinese and English stage command map.
- `references/change-id.md`: change-id naming and examples.
- `references/agent-data-governance-example.md`: end-to-end example using the
  Agent data governance PRD.
