/** IDs da tabela sprints_tasks_statuses */
export const SPRINT_TASK_STATUS = {
  PENDENTE:     1,
  EM_ANDAMENTO: 2,
  CONCLUIDA:    3,
  SEM_SUCESSO:  4,
} as const;

/** IDs da tabela projects_backlogs_statuses */
export const BACKLOG_STATUS = {
  PENDENTE:     1,
  EM_ANDAMENTO: 2,
  CONCLUIDO:    3,
  CANCELADO:    4,
  IMPEDIDO:     5,
  SUCESSO:      6,
  SEM_SUCESSO:  7,
} as const;
