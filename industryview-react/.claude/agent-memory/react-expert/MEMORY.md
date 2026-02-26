# React Expert Memory - IndustryView React

## Project Structure
- **Routes**: `src/routes/index.tsx` — direct imports (no lazy), `createBrowserRouter`, wrapped in `MainLayout`
- **Sidebar**: `src/components/navigation/Sidebar.tsx` — `mainItems` array, selectionIndex 1-28 taken; 29+ available
- **i18n**: `src/i18n/{pt,en,es}.json` — `"nav"` key for sidebar, `"tasks"` key for task-related pages
- **Types**: `src/types/index.ts` re-exports from domain files; `ChecklistTemplate` is in `src/types/quality.ts`
- **Services**: `src/services/api/quality.ts` — `qualityApi`; list functions may return flat arrays OR paginated objects

## API Patterns
- `qualityApi.listChecklistTemplates()` returns `ChecklistTemplate[]` (flat, no pagination params) — do client-side filtering + pagination
- `qualityApi.listTaskChecklists({ tasks_id })` — param is `tasks_id`, NOT `checklist_templates_id`
- Paginated responses shape: `{ items, pageTotal, curPage, nextPage, prevPage, itemsReceived, itemsTotal }`
- Always guard with `Array.isArray(result) ? result : result?.items ?? []`

## Page Patterns (TaskList / ChecklistList)
- `setNavBarSelection(selectionIndex)` in `useEffect([], [])` for active sidebar highlight
- Modal: `div.modal-backdrop` > `div.modal-content` (NOT `modal-overlay`/`modal`)
- Modal max-width style: `{ maxWidth: '700px', width: '95%', padding: '24px' }`
- Section cards: `sectionStyle`, `sectionHeaderStyle`, `sectionBodyStyle`, `sectionIconStyle` inline styles
- Table: `div.table-container` > `table` > `motion.tbody variants={staggerParent}`; rows use `motion.tr variants={tableRowVariants}`
- Motion imports: `staggerParent, fadeUpChild, tableRowVariants` from `../../lib/motion`
- Loading: `<LoadingSpinner />`, Empty: `<EmptyState message={...} action={<button>} />`

## Routing Conflicts
- `/checklists` already maps to `ChecklistManagement` (quality page) — new checklist template page uses `/tarefas/checklists`

## Sidebar selectionIndex Registry
- 1=dashboard, 2=projects, 3=teams, 4=sprints, 5=tasks, 6=backlog, 7=reports, 8=employees, 9=inventory
- 11=settings, 12=account, 13=company, 14-20=SSMA, 21-27=operations, 28=planning, 29=checklists (task templates)

## Employee VacationsTab Patterns
- File: `src/pages/employees/tabs/VacationsTab.tsx`
- `VacationBalance` has: `dias_direito`, `dias_usados`, `dias_pendentes`, `dias_disponiveis`, `faltas_injustificadas`, `data_prevista_ferias`, `periodo_aquisitivo_inicio`, `periodo_aquisitivo_fim`, `periodo_concessivo_fim`
- All date strings from API may be ISO (with time) or plain YYYY-MM-DD; use `toDateInput(str)` = `str.substring(0,10)` to normalize; use `formatDateLocal(str)` = `new Date(str+'T00:00:00').toLocaleDateString('pt-BR')` to avoid UTC day-off bug
- Modal receives `balance` + `vacations` props; periodo aquisitivo fields are auto-filled and read-only when tipo='ferias' and creating a new record
- Error display uses `FormErrorAlert` component: red/pink bg, 4px left border, AlertTriangle icon
- "Dias de Direito" card: red if 0, orange border if < 30; shows faltas count in gray below label
- Banner extracted to `VacationBanner` component; shows 'no-date' fallback when `data_prevista_ferias` is null
