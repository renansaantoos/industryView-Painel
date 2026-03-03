# QA Test Specialist - Memory

## Project: IndustryView React

### Architecture
- Frontend: React 19 + TypeScript + Vite (no Jest/Vitest - zero project-level test files exist)
- API layer: `src/services/api/` modules re-exported as namespaces from `src/services/index.ts`
- Types: `src/types/quality.ts`, `src/types/safety.ts`, `src/types/ppe.ts`, etc.
- TypeScript check command: `npx tsc --noEmit` (run from project root)

### Field Name Inconsistency (Known Pattern)
Two different naming conventions exist for task-template foreign keys:
- `task_templates_id` - used by: TaskGoldenRule, TaskDocument, TaskRequiredPpe, TaskRequiredTraining, listTaskDocuments, listTaskGoldenRules, createTaskGoldenRule, listTaskRequiredPpe, createTaskRequiredPpe, listTaskRequiredTrainings
- `tasks_template_id` - used by: TaskChecklist, listTaskChecklists, createTaskChecklist

This inconsistency is intentional (mirrors backend schema). Do NOT try to normalize them.

### Key Files
- `src/services/api/quality.ts` - golden rules, checklists, NC, documents API functions
- `src/pages/tasks/TaskList.tsx` - sole consumer of listTaskGoldenRules, listTaskChecklists, createTaskGoldenRule
- `src/types/quality.ts` - TaskGoldenRule, TaskChecklist, TaskDocument type definitions

### Bug Fixed (2026-03-02)
- `listTaskGoldenRules`: was wrongly mapping `task_templates_id` to `tasks_id`. Fixed to pass params directly.
- `listTaskChecklists`: param renamed from `tasks_id` to `tasks_template_id`.
- `TaskList.tsx`: 3 `createTaskGoldenRule` calls changed from `tasks_id` to `task_templates_id`; `loadLinkedChecklists` changed from `tasks_id` to `tasks_template_id`.
