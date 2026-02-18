# QA Test Specialist Memory

## Testing Patterns for IndustryView

### Backend API Testing (Node.js + Prisma)
- **Authentication**: Sistema usa Bearer token JWT obtido via `/api/v1/auth/signup` ou `/api/v1/auth/login`
- **Soft Delete**: Todos os deletes são soft delete (preenchem `deleted_at` ao invés de remover registro)
- **Normalization**: Campos de texto têm versões `_normalized` para buscas case-insensitive
- **BigInt Serialization**: Backend serializa BigInt para string automaticamente via `serializeBigInt()`
- **Validation**: Usa Zod para validação, retorna 400 com estrutura: `{error: true, code: "VALIDATION_ERROR", errors: [...]}`

### Common API Issues Found
1. **Special Characters**: Escape especial pode causar erro "INVALID_JSON" se não tratado no payload
2. **Weight Validation**: API aceita valores negativos (sem validação de min > 0)
3. **Empty Strings**: Validação impede strings vazias mas permite espaços em branco
4. **Foreign Keys**: Conversão de 0 para null é feita no service layer (zero = nenhum)

### Tasks Module (tasks_template) - Endpoints
- `POST /api/v1/tasks/list` - Lista paginada (não GET!)
- `POST /api/v1/tasks` - Criar task
- `GET /api/v1/tasks/:id` - Buscar por ID
- `PATCH /api/v1/tasks/:id` - Atualizar (parcial)
- `DELETE /api/v1/tasks/:id` - Soft delete
- Suporte: `/discipline`, `/unity`, `/priorities`, `/comments`

### Data Relationships
- `tasks_template` → `unity` (unity_id)
- `tasks_template` → `discipline` (discipline_id)
- `tasks_template` → `equipaments_types` (equipaments_types_id)
- Includes são carregados automaticamente no GET

### Test User Credentials
- Email: qa.test@industryview.com
- Password: QAtest@123
- User ID: 11

### Testing Checklist
- [ ] CRUD completo (Create, Read, Update, Delete)
- [ ] Validação de campos obrigatórios
- [ ] Edge cases (valores negativos, strings vazias, caracteres especiais)
- [ ] Autenticação (token válido, inválido, ausente)
- [ ] Paginação (page, per_page, pageTotal)
- [ ] Filtros (search, foreign keys)
- [ ] Soft delete (deleted_at preenchido, não aparece em listagens)
- [ ] Includes/Relations (objetos relacionados carregados)
- [ ] HTTP Status codes corretos (200, 201, 400, 401, 404)

### Performance Notes
- Paginação funciona bem até 100 items per_page
- Search usa normalização (case-insensitive por padrão)
- Índices no banco garantem performance em queries grandes

### Security Observations
- JWT expira em 24h (86400 segundos)
- Token deve estar no header `Authorization: Bearer {token}`
- Endpoints protegidos retornam 401 sem token válido
- Validação de ownership ainda não implementada (qualquer user pode editar qualquer task)
