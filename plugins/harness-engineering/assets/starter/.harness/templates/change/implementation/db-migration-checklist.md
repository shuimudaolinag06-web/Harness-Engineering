# Database Migration Checklist

## Purpose

Validate database migration readiness before implementation or E2E.

## Migration Scope

- Migration file:
- Tables changed:
- Rollback or recovery assumption:

## Checklist

| Check | Status | Evidence |
| --- | --- | --- |
| Primary keys and indexes match design | `Pending` | `<evidence>` |
| Money fields use integer storage when applicable | `Pending` | `<evidence>` |
| Audit timestamps are present | `Pending` | `<evidence>` |
| No unsafe forced coupling was introduced | `Pending` | `<evidence>` |
| Migration runs in local/CI runtime | `Pending` | `<evidence>` |

## Quality Gates

- Migration can be validated by an executable smoke, test, or migration command.
- Schema supports accepted MVP behavior without adding future scope.
