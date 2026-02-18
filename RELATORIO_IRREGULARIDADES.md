# Relatório de Irregularidades: Migração Xano para Node.js

Este documento rastreia inconsistências, erros e comportamentos inesperados encontrados durante os testes de validação do novo backend Node.js em comparação com o backend original Xano.

## Metodologia de Análise

Para cada problema encontrado, classificaremos a provável causa raiz:

- **Erro de Prompt**: A instrução passada para a IA criar o código foi vaga ou incompleta.
- **Erro de Agente/IA**: A IA recebeu a instrução correta, mas gerou código com falha lógica ou incompleto.
- **Déficit de Contexto/IDE**: A IA não tinha acesso a informações ocultas do Xano (ex: dados populados no banco, triggers invisíveis, configurações de ambiente) e por isso não replicou.

## Log de Testes

### 1. Autenticação e Cadastro (Signup)

#### 1.1. Falta de Dados Iniciais (Seed)
- **Sintoma**: Erro `Referencia invalida: users_permissions_users_control_system_id_fkey` ao tentar cadastrar.
- **Descrição**: O backend esperava que IDs específicos (1, 2, 3) já existissem nas tabelas de domínio (`users_roles`, `users_system_access`), mas o banco criado estava vazio.
- **Comparação Xano**: No Xano, essas tabelas provavelmente já tinham dados inseridos manualmente ou via CSV que não foram exportados como código explicitamente.
- **Causa Raiz**: **Déficit de Contexto**. A migração focou na estrutura (Schema) do banco de dados, mas ignorou os dados estáticos que o app Flutter "chumbava" (hardcoded ids como 3). O agente deveria ter inferido a necessidade de um seed script ao ver IDs fixos no código Flutter.
- **Status**: ✅ **Corrigido** (Criado script `seed.ts`).

#### 1.2. Validação de Senha Estrita
- **Sintoma**: Erro 400 ao enviar senha sem caractere especial.
- **Descrição**: O novo backend impôs regras de senha (maiúscula, número, especial) que talvez não existissem ou fossem diferentes no Xano.
- **Causa Raiz**: **Decisão de Implementação (Agente)**. A IA optou por usar "boas práticas" de segurança (Zod schema) que podem ser mais rígidas que o original. Não é necessariamente um erro, mas uma diferença de comportamento.
- **Status**: ℹ️ **Observado** (Usuário instruído a usar senha forte).

#### 1.3. Falta de Dados (Status de Pagamento da Empresa)
- **Sintoma**: Erro `Referencia invalida: company_status_payment_id_fkey` ao criar empresa.
- **Descrição**: O cadastro de empresa exige um `status_payment_id` válido, mas a tabela `status_payment` está vazia.
- **Causa Raiz**: **Déficit de Contexto**. Continuação do problema de falta de seed.
- **Status**: ✅ **Corrigido** (Atualizado `seed.ts` com dados de `status_payment`).

### 2. Gestão de Tarefas (Tasks Template)

#### 2.1. Falha no Pré-carregamento de Edição
- **Sintoma**: Ao editar uma tarefa, os campos "Unidade/Medida" e "Disciplina" vêm vazios ("Selecione"), ignorando o valor salvo.
- **Descrição**: O formulário de edição não está vinculando corretamente os dados retornados pelo backend aos dropdowns.
- **Causa Raiz**: **A investigar**. Provável que o endpoint de "Get Task" não esteja retornando os relacionamentos (`unity`, `discipline`) ou o frontend espera nomes de campos diferentes (ex: `unity_id` vs `unity.id`).
- **Status**: ✅ **Corrigido** (Adicionada inicialização no `initState` do Flutter).

#### 2.2. Card de Tarefa Incompleto
- **Sintoma**: O card de listagem da tarefa não exibe o campo "Unidade/Medida", apenas "Disciplina" e "Peso".
- **Descrição**: Ausência visual de um dado importante para o usuário.
- **Causa Raiz**: **Erro de Agente/IA**. O agente provavelmente esqueceu de adicionar esse `Text` widget no layout do card.
- **Status**: 🔄 **Em Correção** (Regressão: Overflow de pixels detectado após adição do campo).

#### 2.3. Card de Tarefa Incompleto -> Overflow
- **Sintoma**: O card apresenta "Bottom Overflowed by 6.0 pixels" após adicionar o campo "Unidade".
- **Causa Raiz**: `mainAxisExtent` do `GridView` estava fixo em 130.0, insuficiente para o novo conteúdo.
- **Ação**: Aumentar a altura fixa do card.
- **Status**: ✅ **Corrigido** (Ajustado `mainAxisExtent` para 150.0 em `tarefas_widget.dart`).

#### 2.4. Edição de Funcionário sem Pré-carregamento
- **Sintoma**: Ao editar um funcionário, os dropdowns "Cargos", "Tipos de acesso" e "Níveis" vêm vazios.
- **Descrição**: Falha na inicialização dos controladores de estado com os valores recebidos do backend.
- **Causa Raiz**: **Erro de Frontend (Agente/IA)**. O `initState` do modal não atribui os valores recebidos aos `valueControllers` do modelo.
- **Status**: ✅ **Corrigido** (Inicialização explícita adicionada ao `initState` em `modal_add_usuario_widget.dart`).

#### 2.5. Listagem de Funcionários Incompleta
- **Sintoma**: A coluna "Tipo/Nível de acesso" aparece vazia ou apenas com hífens na listagem de funcionários.
- **Causa Raiz**: **Erro de Binding (Frontend)**. O caminho JSON para acessar `access_level` provavelmente está incorreto ou não está acessando a estrutura aninhada `users_permissions`.
- **Status**: ✅ **Corrigido** (Removidos underscores incorretos dos paths JSON em `funcionario_widget.dart`).

### 3. Integrações Externas (SendGrid)

#### 3.1. Recuperação de Senha (Email não enviado)
- **Sintoma**: Ao solicitar recuperação de senha, o usuário não recebe o e-mail (erro de headers provisionais/conexão ou sucesso falso).
- **Causa Raiz**: **Erro de Agente/IA (Mock)**. O serviço `AuthModuleService.sendRecoveryCode` (`auth.service.ts`) gera o código e salva no banco, mas **não chama** o `EmailService`. A lógica de envio foi substituída por um retorno de sucesso fixo (`// Envia email (em producao)`).
- **Status**: 🔴 **Pendente** (Lógica de envio inexistente).

### 7. Infraestrutura e Estabilidade

#### 7.1. Dependência de Banco de Dados (Downtime)
- **Sintoma**: Backend para de responder (`EADDRINUSE` ou erro de conexão Prisma `P1001`) e o frontend exibe erro de conexão.
- **Causa Raiz**: **Ambiente**. O serviço de banco de dados (PostgreSQL) depende do Docker Desktop. O container Alpine precisava da biblioteca `openssl` para o Prisma Client funcionar.
- **Status**: ✅ **Resolvido** (Docker online e dependência `openssl` adicionada ao container).
