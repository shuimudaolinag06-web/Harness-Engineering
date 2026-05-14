# Government Enterprise Prototype Skill

## Purpose

Prepare and review high-fidelity prototype artifacts for government or
enterprise stakeholders before business coding starts.

## Inputs

- Accepted requirement spec and task list.
- OpenAPI draft or expected API surface when available.
- Product scope and explicit out-of-scope items.
- Existing UI conventions, design system, or customer delivery style.

## Procedure

1. Create a page map that lists pages, target users, entry points, key fields,
   key operations, related APIs, and acceptance criteria.
2. Create user flows for happy paths, exception paths, audit paths, and scope
   guardrails.
3. Create a high-fidelity prototype specification that covers layout, fields,
   validation, button states, loading states, empty states, error states,
   success feedback, status display, amount display, and audit logging.
4. Review the prototype against the requirement, API contract, database design,
   and scope boundaries.
5. Record reviewer findings before implementation begins.

## Outputs

- `docs/prototype/page-map.md`
- `docs/prototype/user-flow.md`
- `docs/prototype/high-fidelity-prototype-spec.md`
- `design/prototype-review-v1.md`
- Updated `summary.md` and `prompt-code-traceability.md`

## Quality Gates

- Prototype artifacts cover every MVP page and flow.
- Prototype review confirms no out-of-scope business capability was introduced.
- Fields, states, and operations map to the API contract and acceptance criteria.
- Government/enterprise styling favors operational clarity, auditability, and
  repeat-use efficiency over marketing presentation.
