# React Expert Agent Memory — IndustryView

## Arquitetura do Projeto
- Monorepo: backend (`IndustryView-Painel/backend/`) + frontend (`IndustryView-Painel/industryview-react/`)
- Backend: Node.js + Express + Prisma + PostgreSQL + Zod para validação
- Frontend: React + Vite + TypeScript + react-hook-form + Zod (via Zod no backend) + TanStack patterns

## Padrões de Validação Backend
- Todo campo de FK opcional (ex: `client_id`) precisa ter `z.preprocess` que converte `''`/`null`/`undefined` → `null` antes do `.nullable().optional()`
- Sem esse preprocess, o campo é descartado pelo Zod e nunca chega ao service
- Exemplo correto para FK opcional:
  ```ts
  client_id: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().int().nullable().optional()
  ),
  ```

## Padrões de Service (Prisma)
- No `create()`, campos opcionais de FK devem usar `?? null` (não `|| null`) para preservar `0` se necessário
- No `update()`, usar padrão `if (input.field !== undefined) updateData.field = input.field ?? null;`
- Ambos `createProjectSchema` e `updateProjectSchema` devem ter os mesmos campos opcionais — nunca omitir um campo no schema de update que existe no create

## Padrões de Formulários (Frontend)
- Campos de seleção (`SearchableSelect`) NÃO são registrados via `react-hook-form register`. Usar state separado (`useState`) e injetar no payload do `onSubmit`
- Ao editar, pré-selecionar o valor salvo no banco via `useEffect` que roda após o `reset()` do formulário
- Usar `useEffect([selectedClientId, allClients])` para resolver o objeto completo do cliente após a lista carregar (evita race condition)
- `client_id: selectedClientId ?? null` no payload do PATCH/POST garante que "sem seleção" envia `null` e não `undefined`

## Componentes Reutilizáveis Confirmados
- `SearchableSelect` em `src/components/common/SearchableSelect.tsx`
- `maskCNPJ` exportada de `src/components/clients/ClientFormModal.tsx`
- `clientsApi.listClients({ per_page: 100 })` retorna `PaginatedResponse<Client>` — extrair com `result?.items ?? []`

## Arquivo de Tipos
- `src/types/project.ts` — `CreateProjectRequest` já tem `client_id?: number`
- `src/types/project.ts` — `ProjectInfo` já tem `client_id?: number | null` e `client_name?: string | null`
