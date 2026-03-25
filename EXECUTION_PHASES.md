# EXECUTION_PHASES.md — Codex Execution Phases Checklist

This file defines how I will execute work in this project, aligned to `AGENTS.md`, `OVERVIEW.md`, `DATABASE.md`, `AUTH.md`, `BACKEND.md`, `FRONTEND.md`, `MODULES.md`, and `API.md`.
Each phase has completion gates and a pass/fail rule.

## Group 1: Instruction & Scope Phase

### Phase 1.1: Instruction Read Pass (Mandatory First Step)
- Read `AGENTS.md` first.
- Read all project instruction files before writing or modifying code.
- Extract constraints on stack, architecture, roles, API design, and response formats.
- Completion gates:
  - File order respected (`AGENTS.md` first, then all instruction docs).
  - Key constraints recorded for current task.
- Pass/fail rule:
  - Pass only if all required instruction files were reviewed.

### Phase 1.2: Task Scoping
- Map request to affected layer(s): backend, frontend, database, auth, module, API contract.
- Identify impacted files and dependencies before implementation.
- Ask clarification questions only when requirements are ambiguous or conflicting.
- Completion gates:
  - Impacted layers listed.
  - Candidate files/modules identified.
  - Open questions captured (if any).
- Pass/fail rule:
  - Pass only if scope is concrete enough to implement without guessing.

## Group 2: Design & Planning Phase

### Phase 2.1: Convention-Aligned Design
- Keep module separation: model, schema, CRUD, router, service/hook/page.
- Preserve API base path `/api/v1` and consistent response shape:
  - `{"status":"success","data":...}`
- Enforce role-based permissions from `AUTH.md` and `MODULES.md`.
- Completion gates:
  - Architecture pattern mapped for each touched module.
  - API contract and role guard rules explicitly planned.
- Pass/fail rule:
  - Pass only if proposed design matches project conventions.

### Phase 2.2: Data & Validation Design
- Validate inputs with Pydantic schemas in backend.
- Respect database schema and relationships from `DATABASE.md`.
- Use UTC-compatible timestamp handling and proper status codes.
- Completion gates:
  - Input/output schema changes identified.
  - Data model and relation impact confirmed.
  - Status-code map confirmed for affected endpoints.
- Pass/fail rule:
  - Pass only if validation and data flow are fully specified.

## Group 3: Implementation Phase

### Phase 3.1: Backend Execution
- Implement endpoint logic with `APIRouter`, dependency injection, and role guards.
- Add/update SQLAlchemy models, CRUD, and schemas per module conventions.
- Keep business logic in the proper module and avoid hardcoded secrets.
- Completion gates:
  - Router, schema, CRUD, and model updates are in correct files.
  - Auth dependencies and role checks implemented where required.
  - No secrets or unsafe hardcoded configuration introduced.
- Pass/fail rule:
  - Pass only if backend changes compile logically and follow docs.

### Phase 3.2: Frontend Execution
- Use React + Tailwind + ShadCN patterns from `FRONTEND.md`.
- Use Axios service layer, Zustand auth store, and React Query hooks.
- Keep pages/components modular and mobile-safe (`overflow-x-auto` for tables).
- Completion gates:
  - API calls routed through `services/` layer.
  - State/query patterns follow Zustand + React Query conventions.
  - UI remains responsive and uses approved component/style rules.
- Pass/fail rule:
  - Pass only if frontend implementation matches established patterns.

## Group 4: Verification Phase

### Phase 4.1: Contract & Access Checks
- Verify endpoint paths, methods, and auth requirements match `API.md` and `MODULES.md`.
- Verify response format consistency and status code correctness.
- Confirm access rules by role (`superadmin`, `secretary`, `finance`, `group_leader`, `member`).
- Completion gates:
  - Endpoint path/method checks completed for all touched APIs.
  - Role matrix checked for create/read/update/delete behavior.
  - Response shape checks completed.
- Pass/fail rule:
  - Pass only if contract and permission checks show no mismatch.

### Phase 4.2: Quality Checks
- Check for clean structure, modularity, and no secret leakage.
- Confirm no unsupported package additions without explicit confirmation.
- Ensure changed behavior aligns with documented business rules.
- Completion gates:
  - Diff review completed.
  - Dependency changes reviewed and approved if needed.
  - Business-logic rules validated against docs.
- Pass/fail rule:
  - Pass only if no convention, security, or dependency violations remain.

## Group 5: Delivery & Handoff Phase

### Phase 5.1: Change Summary
- Summarize what was implemented and where.
- Note any assumptions, limitations, or pending decisions.
- Completion gates:
  - Changed files listed with purpose.
  - Assumptions and unresolved items documented.
- Pass/fail rule:
  - Pass only if handoff context is sufficient for next contributor.

### Phase 5.2: Next Actions
- Provide clear next steps (for example: test endpoints, complete remaining module cases, or refine UI flow).
- Request clarification immediately when blocked by missing requirements.
- Completion gates:
  - Actionable next steps provided.
  - Blockers or required decisions clearly listed.
- Pass/fail rule:
  - Pass only if the user can continue immediately without ambiguity.

## Task Run Template

Use this template at the start of each implementation task.

```md
# Task Run: <task name>

## Group 1: Instruction & Scope
- [ ] Phase 1.1 complete
- [ ] Phase 1.2 complete
- Scope summary:
- Open questions:

## Group 2: Design & Planning
- [ ] Phase 2.1 complete
- [ ] Phase 2.2 complete
- Design summary:

## Group 3: Implementation
- [ ] Phase 3.1 complete
- [ ] Phase 3.2 complete
- Files changed:

## Group 4: Verification
- [ ] Phase 4.1 complete
- [ ] Phase 4.2 complete
- Verification notes:

## Group 5: Delivery & Handoff
- [ ] Phase 5.1 complete
- [ ] Phase 5.2 complete
- Summary:
- Next actions:
- Blockers:
```
