# Análise de Compatibilidade Flutter ↔ Node.js Backend

**Data**: 2026-02-05
**Status**: 🔴 INCOMPATIBILIDADES CRÍTICAS IDENTIFICADAS

---

## 🚨 PROBLEMA CRÍTICO: Signup 400 Bad Request

### Frontend Flutter Envia (MULTIPART):
```dart
// Classe: SignupAndRetrieveAnAuthenticationTokenCall
// Endpoint: POST /auth/signup
// BodyType: MULTIPART

params: {
  'name': name,
  'email': email,
  'phone': phone,
  'password_hash': passwordHash,          // ❌ MULTIPART não funciona para JSON
  'env_from_create': envFromCreate,
  'user_system_access': userSystemAccess,
  'user_control_system': userControlSystem,
  'user_role_type': userRoleType,
  'profile_picture': profilePicture,
}
```

### Backend Node.js Espera (JSON):
```typescript
// Arquivo: backend/src/modules/auth/auth.schema.ts
// Validação Zod para req.body (JSON)

{
  name: string,
  email: string,
  phone?: string,
  password_hash: string,
  env_from_create?: number,
  user_system_access?: number,
  user_control_system?: number,
  user_role_type?: number,
  // profile_picture: tratado via multer middleware
}
```

**CAUSA RAIZ**: Flutter usa `BodyType.MULTIPART` mas o backend espera `application/json`

---

## ✅ Login - COMPATÍVEL

### Frontend Flutter:
```dart
// Classe: LoginAndRetrieveAnAuthenticationTokenCall
// Endpoint: POST /auth/login
// BodyType: JSON

{
  "email": "user@example.com",
  "password_hash": "senha123"
}
```

### Backend Node.js:
```typescript
// auth.schema.ts
{
  email: string,
  password_hash: string
}
```

**STATUS**: ✅ Estrutura compatível

---

## ⚠️ GET /auth/me - ESTRUTURA DIFERENTE

### Frontend Flutter Espera:
```dart
// Classe: GetTheRecordBelongingToTheAuthenticationTokenCall
// Parse esperado:

$.user.id
$.user.name
$.user.email
$.user.phone
$.user.users_permissions_id
$.user.users_permissions.users_system_access_id
$.user.users_permissions.users_roles_id
$.user.users_permissions.users_control_system_id
$.user.profile_picture.url
$.result1.sprints_of_projects_of_sprints_statuses.id  // ❌ Path inválido
```

### Backend Node.js Retorna:
```typescript
// auth.service.ts - getMe()
{
  result1: projectsUsers[],  // Array de projects_users com join
  user: {
    id,
    name,
    email,
    phone,
    users_permissions_id,
    users_permissions: {
      users_system_access: { id, env },
      users_roles: { id, role },
      users_control_system: { id, access_level }
    },
    company: { ... }
  }
}
```

**PROBLEMAS**:
1. ❌ Flutter tenta acessar `$.result1.sprints_of_projects_of_sprints_statuses.id` (path inexistente)
2. ⚠️ Estrutura de `result1` pode não ser o que Flutter espera para sprints

---

## ⚠️ GET /users/{id} - ESTRUTURA DIFERENTE

### Frontend Flutter Espera:
```dart
// Classe: GetUserCall
// Parse esperado:

$.result1.id        // ❌ Backend retorna campos no root
$.result1.name
$.result1.email
$.result1.phone
$.result1.permissionsId
```

### Backend Node.js Retorna:
```typescript
// users.service.ts - getById()
{
  // Spread de user (campos no root, não em result1)
  id,
  name,
  email,
  phone,
  users_permissions_id,
  users_permissions: { ... },
  company: { ... },
  _projects: [...],  // Array de projetos
}
```

**PROBLEMA**: ❌ Flutter espera `$.result1.*` mas backend retorna `$.*` (root)

---

## 🔴 INCOMPATIBILIDADES IDENTIFICADAS

### 1. CRÍTICO - Signup (400 Bad Request)
- **Arquivo Frontend**: `api_calls.dart` linha 6363
- **Arquivo Backend**: `auth.schema.ts` + `auth.routes.ts`
- **Problema**: Frontend envia MULTIPART, backend espera JSON
- **Solução**: Alterar Flutter para enviar JSON (sem upload) OU adicionar multer no backend

### 2. ALTO - GET /auth/me (Response Structure)
- **Arquivo Frontend**: `api_calls.dart` linha 6250
- **Arquivo Backend**: `auth.service.ts` linha 183
- **Problema**: Paths JSON incompatíveis
- **Solução**: Ajustar response do backend para match com paths do Flutter

### 3. ALTO - GET /users/{id} (Response Structure)
- **Arquivo Frontend**: `api_calls.dart` linha 624
- **Arquivo Backend**: `users.service.ts` linha 266
- **Problema**: Flutter espera `$.result1.*`, backend retorna `$.*`
- **Solução**: Wrap resposta em `{ result1: user }` no backend

### 4. MÉDIO - profile_picture
- **Status**: Não implementado no backend
- **Impacto**: Campo é enviado no signup mas não é tratado

---

## 📋 ENDPOINTS NÃO TESTADOS AINDA

- [ ] GET /projects (listagem)
- [ ] GET /sprints (listagem)
- [ ] POST /tasks (criação)
- [ ] GET /reports/dashboard
- [ ] POST /users/list (com filtros)

---

## 🛠️ PRÓXIMOS PASSOS

1. **URGENTE**: Corrigir incompatibilidade de signup (MULTIPART vs JSON)
2. **ALTO**: Validar estrutura de response de /auth/me
3. **ALTO**: Validar estrutura de response de /users/{id}
4. **MÉDIO**: Testar demais endpoints críticos
5. **BAIXO**: Implementar profile_picture upload se necessário

---

## 💡 RECOMENDAÇÕES

### Opção A: Ajustar Backend (Mais Rápido)
```typescript
// Adicionar wrapper em responses:
return { result1: data };  // Match com padrão Xano
```

### Opção B: Ajustar Frontend (Mais Correto)
```dart
// Alterar parsers JSON para novos paths:
$.id  // ao invés de $.result1.id
```

**RECOMENDAÇÃO**: Opção A (ajustar backend) para manter compatibilidade com código Flutter existente.
