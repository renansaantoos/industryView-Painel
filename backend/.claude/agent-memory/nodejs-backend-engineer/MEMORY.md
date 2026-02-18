# IndustryView Backend - Agent Memory

## Stack e Arquitetura

- **Framework**: Express 4.x com TypeScript
- **ORM**: Prisma com PostgreSQL, IDs do tipo `BigInt` em todo o banco
- **Padrão arquitetural**: Route -> Controller -> Service -> Schema (Zod)
- **Soft delete**: Todos os registros usam `deleted_at: null` para filtrar ativos
- **Autenticacao**: JWT via middleware `authenticate` que popula `req.user` e `req.auth`

## Estrutura de Pastas

```
src/
  modules/
    reports/     - reports.routes.ts, reports.controller.ts, reports.service.ts, reports.schema.ts
    projects/    - idem
    teams/       - idem
    sprints/     - idem
    tasks/       - idem
  middleware/
    auth.ts      - middleware authenticate, requirePermission
  types/
    index.ts     - AuthenticatedRequest, UserWithPermissions, etc.
  utils/
    bigint.ts    - toNumber(), serializeBigInt()
    errors.ts    - BadRequestError, NotFoundError, etc.
    helpers.ts   - buildPaginationResponse()
  config/
    database.ts  - instancia do Prisma (exporta `db`)
```

## Convencoes Importantes

- **BigInt**: Sempre converter com `BigInt(value)` ao passar para Prisma; usar `Number(bigint)` ao retornar
- **company_id**: Vem de `req.user?.companyId` (ja convertido para number no middleware auth)
- **AuthenticatedRequest**: Usar em vez de `Request` quando precisar de `req.user`
- **Status codes**: Seguir padrao REST (200 GET, 201 POST, 204 DELETE, 400 validacao, 401 auth, 403 perm, 404 not found, 409 conflito)

## Modelos Importantes e Relacoes

- `projects` -> `company_id`, `projects_statuses_id`, `deleted_at`
- `teams_projects` -> liga times a projetos (`teams_id`, `projects_id`, `deleted_at`)
- `teams_members` -> membros do time (`teams_id`, `users_id`, `deleted_at`)
- `sprints` -> `projects_id`, `deleted_at`
- `sprints_tasks` -> `sprints_id`, `sprints_tasks_statuses_id` (1=Pendente, 2=Em Andamento, 3=Concluida, 4=Sem Sucesso), `deleted_at`
- Status de projeto: <= 2 = ativo, >= 3 = concluido/cancelado

## Detalhes do reports.service.ts

- `getDashboard(input, company_id?)`: aceita `company_id` opcional para stats globais
- `getBurndown(input)`: retorna `{ date, restantes, acumuladas, valor_referencia, concluidas }`
  - Para frontend: `ideal = valor_referencia`, `actual = restantes`
- Trackers instalados: status 2, 3, 5; Modulos: total=status 4+5, instalados=status 5

Veja mais detalhes em: `patterns.md`
