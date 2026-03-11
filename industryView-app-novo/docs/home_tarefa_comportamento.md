# Home Tarefas - Comportamento Atual

## Visao Geral

A tela `home_page_tarefas` possui 2 abas:
- **Tab 0**: Tarefas (Em Andamento / Sem Sucesso)
- **Tab 1**: Inspecoes

Cada card possui **botoes individuais** e um **checkbox**. Quando checkboxes sao marcados, botoes de acao em lote aparecem na parte inferior da tela.

---

## Estrutura de um Card

### Card de Tarefa (Tab 0)
| Elemento | Descricao |
|----------|-----------|
| Checkbox | Lado esquerdo, seleciona a tarefa para acao em lote |
| Nome | Nome da tarefa |
| Badge status | "Em dia" (verde) ou "Atrasado" (vermelho) |
| Disciplina e Unidade | Texto cinza abaixo do nome |
| Barra de progresso | Aparece se a tarefa tem quantidade (ex: "5 / 10 m2 - 50%") |
| Badges | Equipe (roxo) + Criticidade (cor variada) |
| Data agendada | Se houver |
| Botao "Detalhes" | Azul - abre detalhes da tarefa |
| Botao "Concluir" | Verde - conclui apenas esta tarefa |
| Botao "S. Suc." | Vermelho - marca apenas esta tarefa como sem sucesso |

### Card de Inspecao (Tab 1)
Igual ao card de tarefa, porem os botoes de acao sao:
| Botao | Cor | Acao |
|-------|-----|------|
| Detalhes | Azul | Abre detalhes |
| Aprovado | Verde | Aprova apenas esta inspecao |
| Reprovado | Vermelho | Reprova apenas esta inspecao |

---

## Acoes Individuais (botao do card)

### Concluir (tarefa individual)

**Se a tarefa TEM quantidade (quantityAssigned > 0):**
1. Abre modal pedindo "Quantidade Executada"
2. Campo vem pre-preenchido com a quantidade designada
3. Usuario confirma
4. Chama API `atualizaStatusSingleTaskCall` com:
   - `sprintsTasksId`: ID da tarefa
   - `sprintsTasksStatusesId`: 3 (conclusao)
   - `quantityDone`: quantidade digitada
5. Tarefa desaparece da lista
6. Snackbar: "Tarefa concluida com sucesso!"

**Se a tarefa NAO tem quantidade:**
1. Adiciona tarefa em `AppState().tasksfinish`
2. Abre modal de confirmacao (`ConfirmdialogWidget`)
3. Usuario confirma
4. Pagina recarrega

### Sem Sucesso (tarefa individual)
1. Abre modal `SemSucessoModalWidget` com 1 item
2. Usuario seleciona **motivo da falha** (obrigatorio, dropdown)
3. Usuario digita **observacoes** (opcional)
4. Ao confirmar:
   - API: `atualizaStatusDaSprintTaskCall` com status 4
   - API: `editSprintTaskCall` para salvar o motivo
   - API: `addCommentCall` para historico
5. Tarefa desaparece da lista

### Aprovado (inspecao individual)
1. Modal de confirmacao: "Deseja aprovar esta tarefa de inspecao?"
2. Ao confirmar:
   - API: `updateInspectionCall` com `qualityStatusId: 2`
3. Tarefa desaparece da lista

### Reprovado (inspecao individual)
1. Modal de confirmacao: "Deseja reprovar esta tarefa de inspecao?"
2. Ao confirmar:
   - API: `updateInspectionCall` com `qualityStatusId: 3`
3. Tarefa desaparece da lista

---

## Checkbox e Acoes em Lote (batch)

### Como funciona o checkbox

**Ao marcar um checkbox:**
- Cria um `TasksListStruct` com os dados da tarefa
- Adiciona em `AppState().taskslist`
- Checkbox fica azul com checkmark

**Ao desmarcar um checkbox:**
- Remove a tarefa de `AppState().taskslist`
- Checkbox volta ao branco/vazio

**Validacao especial:** Tarefas de cravacao de estacas que nao podem ser concluidas mostram um aviso e nao permitem selecao.

### Checkbox "Selecionar Todas"
- **Quando nenhuma esta selecionada**: marca todas as tarefas da lista atual
- **Quando alguma esta selecionada**: desmarca todas (limpa `AppState().taskslist`)
- Visual: icone de traco (indeterminate) quando ativo

### Botoes de acao em lote (bottom bar)

Os botoes aparecem na parte inferior da tela **somente quando** `AppState().taskslist` nao esta vazio (1+ checkbox marcado).

#### Tab 0 - Tarefas: Botao "Concluir" (lote)
1. Copia `taskslist` para `tasksfinish`
2. Abre `ConcluirBatchModalWidget`
3. Modal mostra lista com todas as tarefas selecionadas
4. Cada tarefa tem um campo de input para "Quantidade Executada"
5. Valores pre-preenchidos com a quantidade designada
6. Usuario edita quantidades conforme necessario
7. Ao confirmar:
   - API: `atualizaStatusDaSprintTaskCall` em batch
   - Envia array com todos os IDs, status 3, e quantidades
   - Limpa `taskslist` e `tasksfinish`
   - Pagina recarrega

#### Tab 0 - Tarefas: Botao "Sem Sucesso" (lote)
1. Coleta IDs das tarefas selecionadas
2. Abre `SemSucessoModalWidget` com N itens
3. Usuario seleciona UM motivo (aplicado a todas)
4. Usuario digita observacoes (aplicadas a todas)
5. Ao confirmar:
   - API: `atualizaStatusDaSprintTaskCall` em batch com status 4
   - Para cada tarefa: `editSprintTaskCall` (salva motivo)
   - Para cada tarefa: `addCommentCall` (historico)
   - Limpa `taskslist` e `tasksfinish`
   - Pagina recarrega

#### Tab 1 - Inspecoes: Botao "Aprovado" (lote)
1. Coleta IDs selecionados
2. Para cada ID: chama `updateInspectionCall` com `qualityStatusId: 2`
3. Limpa `taskslist`
4. Pagina recarrega

#### Tab 1 - Inspecoes: Botao "Reprovado" (lote)
1. Coleta IDs selecionados
2. Abre `SemSucessoModalWidget` com N itens
3. Salva motivo e observacoes
4. API: `atualizaStatusDaSprintTaskCall` com status 4
5. Limpa `taskslist`
6. Pagina recarrega

---

## Resumo do Fluxo

```
ACAO INDIVIDUAL (botao do card)
  → Afeta APENAS a tarefa daquele card
  → Abre modal especifico para 1 item
  → Chama API individual ou single-task

ACAO EM LOTE (botao inferior da tela)
  → So fica disponivel quando 1+ checkbox esta marcado
  → Afeta TODAS as tarefas selecionadas via checkbox
  → Abre modal com lista de N itens
  → Chama API batch com array de tarefas
```

---

## Status IDs Utilizados

| ID | Significado |
|----|------------|
| 3 | Concluido / Aprovado |
| 4 | Sem Sucesso (com impedimento) |

Para inspecoes:
| qualityStatusId | Significado |
|-----------------|------------|
| 2 | Aprovado |
| 3 | Reprovado |

---

## Arquivos Relacionados

| Arquivo | Funcao |
|---------|--------|
| `lib/pages/home_page_tarefas/home_page_tarefas_widget.dart` | Pagina principal (3624 linhas) |
| `lib/pages/home_page_tarefas/home_page_tarefas_model.dart` | Estado da pagina |
| `lib/components/concluir_batch_modal_widget.dart` | Modal de conclusao em lote |
| `lib/components/sem_sucesso_modal_widget.dart` | Modal de sem sucesso |
| `lib/components/tasks_sem_sucesso_widget.dart` | Componente de tarefas sem sucesso |
| `lib/backend/schema/structs/tasks_list_struct.dart` | Struct de dados da tarefa |

---

## Comportamento ao Mudar de Aba

Ao trocar entre Tab 0 (Tarefas) e Tab 1 (Inspecoes):
- Todos os checkboxes sao desmarcados automaticamente
- `AppState().taskslist` e limpo
- Botoes de acao em lote desaparecem
