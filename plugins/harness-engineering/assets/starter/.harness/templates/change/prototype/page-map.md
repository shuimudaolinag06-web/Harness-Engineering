# Page Map

## Purpose

Describe the government/enterprise page inventory before implementation.

## Page Inventory

| Page | Target User | Entry | Key Fields | Key Actions | Related API | Acceptance Criteria |
| --- | --- | --- | --- | --- | --- | --- |
| `<page>` | `<role>` | `<navigation or trigger>` | `<fields>` | `<actions>` | `<api>` | `<AC-xx>` |

## Navigation Model

```text
<page A>
  -> <page B>
```

## Page-Level Notes

- Keep operational pages clear, restrained, auditable, and suitable for repeated
  use.
- Do not introduce out-of-scope actions or statuses.

## Quality Gates

- Every MVP page has a target user, entry point, key fields, actions, API, and
  acceptance criteria.
- Out-of-scope pages and actions are explicitly absent.
