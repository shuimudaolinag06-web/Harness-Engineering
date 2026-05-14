# User Flow

## Purpose

Describe user-visible flows for prototype review and implementation alignment.

## Happy Path Flows

### `<flow name>`

1. `<step>`
2. `<step>`
3. `<expected success feedback>`

## Exception Flows

| Scenario | Expected Behavior | API/Error Alignment |
| --- | --- | --- |
| `<scenario>` | `<behavior>` | `<code or response>` |

## Audit Flow

1. `<audit actor opens view>`
2. `<system displays evidence>`
3. `<audit evidence remains read-only>`

## Scope Guardrails

- `<out-of-scope action>` must not appear in navigation, buttons, dialogs, empty
  states, success messages, or API calls.

## Quality Gates

- Critical happy paths and exception paths are documented.
- Audit behavior is visible when the domain requires traceability.
- Scope guardrails are explicit.
