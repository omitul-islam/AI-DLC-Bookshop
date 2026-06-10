# Guardrails

Whenever a new feature is requested, follow this process step by step. Do not skip any gate — each gate requires user approval before advancing.

---

## New Feature Workflow

```
Gate 1: Requirements
   New feature idea → Add to 01-source/requirements.md
   → Show user → [Approve?] → Yes → Go to Gate 2

Gate 2: Execution Plan
   Create/update execution plan in execution/execution.md
   → Show user → [Approve?] → Yes → Go to Gate 3

Gate 3: Implementation Guide
   Add implementation steps to IMPLEMENTATION-GUIDE.md
   → Show user → [Approve?] → Yes → Go to Gate 4

Gate 4: Design / Database
   Update database-design.md if schema changes
   → Show user → [Approve?] → Yes → Go to Gate 5

Gate 5: API Contracts (if endpoints change)
   Update OpenAPI specs in 06-contracts/01-apis/rest/
   Update related context docs (business rules, module specs, UI design)
   → Show user → [Approve?] → Yes → Go to Gate 6

Gate 6: Pre-Implementation Guardrail
   Run the full "Before Implementation" checklist below
   → Show user → [Approve?] → Yes → Start coding

Gate 7: Implementation
   Write code following existing patterns

Gate 8: Post-Implementation Guardrail
   Run the full "After Implementation" checklist below
   → If any check fails, fix or ask user for guidance
```

---

## Before Implementation

### 1. Requirements & Planning
- [ ] Feature added to [`01-source/requirements.md`](../01-source/requirements.md)
- [ ] Feature added to [`execution/execution.md`](../execution/execution.md) delivery table or current sprint
- [ ] Implementation steps added to [`IMPLEMENTATION-GUIDE.md`](../IMPLEMENTATION-GUIDE.md)
- [ ] User has validated and approved the plan

### 2. Context Documentation Impact
- [ ] **Database** [`04-architecture/02-database-design/database-design.md`](../04-architecture/02-database-design/database-design.md): Update ERD, data models, schema if entities/relationships change
- [ ] **Business Rules** [`02-domain/03-business-rules/`](../02-domain/03-business-rules/): Update if new validation rules are introduced
- [ ] **API Contracts** [`06-contracts/01-apis/rest/`](../06-contracts/01-apis/rest/): Update OpenAPI specs if endpoints change
- [ ] **UI Design** [`07-design-system/01-foundation/ui-design-context.md`](../07-design-system/01-foundation/ui-design-context.md): Update if UI layout or nav changes
- [ ] **Module Specs** [`05-modules/`](../05-modules/): Update if module scope changes

---

## After Implementation

### 3. Code Quality
- [ ] Backend builds: `npm run build` (tsc + compile)
- [ ] Frontend builds: `npm run build` (tsc + vite build)
- [ ] No TypeScript errors in either project
- [ ] Lint passes: `npm run lint`

### 4. Documentation Sync
- [ ] [`audit/audit.md`](../audit/audit.md) updated with ISO 8601 timestamp, what changed, and which files
- [ ] [`aidlc-state/aidlc-state.md`](../aidlc-state/aidlc-state.md) updated — requirements traceability status, context docs status
- [ ] [`README.md`](../../README.md) updated if new files/directories were created
- [ ] Any removed features documented in context files

### 5. Application Run Check
- [ ] Start the app: `docker compose up -d` (or `npm run dev` in both backend + frontend terminals)
- [ ] Open frontend in browser at `http://localhost:5173`
- [ ] Navigate to each new/affected page and verify it renders without errors
- [ ] Check browser console (F12) for any JS/network errors
- [ ] If the app fails to start or a page errors, **stop and ask the owner clearly for the fix** — describe what you see (screenshot, error message) and what needs to be done

### 6. Verification
- [ ] Feature works as described in the requirements
- [ ] No regressions in existing functionality
- [ ] Database changes are backwards-compatible (if applicable)

---

## On Failure

If any step above fails:

1. **Immediately stop** — do not proceed to the next step
2. **Diagnose** — identify the exact error (build log, browser console, network tab, terminal output)
3. **Retry** up to 5 times with fixes
4. If still failing after 5 retries, **stop and observe the context** again
5. **Suggest a solution** to the user — describe what went wrong, what you tried, and what you think the fix is
6. **Wait for approval and feedback** before proceeding

> **CRITICAL**: Never say "build passes, lint passes" and skip the Application Run Check. You MUST start the app and open each affected page in a browser to verify it renders without JS/network errors. If the app fails to start or a page errors, stop and follow this On Failure procedure immediately.
