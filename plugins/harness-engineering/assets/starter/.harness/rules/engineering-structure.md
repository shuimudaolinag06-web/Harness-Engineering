# Engineering Structure Rules

## Purpose

Keep the repository understandable for humans and agents by making ownership,
workflow assets, and verification entry points obvious.

## Rules

- Harness assets live under `.harness/`.
- Agent role definitions live under `.harness/agents/`.
- Stable constraints live under `.harness/rules/`.
- Reusable SOPs live under `.harness/skills/<skill-name>/SKILL.md`.
- Long-lived domain knowledge lives under `.harness/wiki/`.
- Each request owns exactly one directory under `.harness/changes/`.
- Executable validators live under `scripts/`.
- Automated tests live under `test/`.

## Quality Gates

- The manifest must reference every required rule, skill, template, and wiki
  file.
- A change directory must contain `summary.md`, `request_analysis/spec.md`,
  `request_analysis/tasks.md`, at least one review artifact, and verification
  evidence.
- No phase may depend on undocumented tribal knowledge. If a rule matters, put
  it in the repository.
