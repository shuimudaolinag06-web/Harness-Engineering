# Coding Standards

## Purpose

Define the default implementation bar for enterprise-grade changes.

## Rules

- Prefer small, cohesive modules with explicit inputs and outputs.
- Keep business rules close to domain code and keep orchestration code thin.
- Validate external input at boundaries.
- Fail with actionable errors and include useful diagnostic context.
- Use deterministic tests for all changed behavior.
- Do not introduce third-party dependencies without a clear reason.
- Keep generated or mechanical files out of hand-written logic.

## Quality Gates

- Tests must assert observable behavior.
- Error paths and boundary values must be covered for risky logic.
- New scripts must use explicit exit codes and readable failure messages.
- Configuration should be machine-readable when it drives workflow behavior.
