export interface EmployeeHrData {
  id: number;
  users_id: number;
  // Dados pessoais
  nome_completo?: string;
  cpf?: string;
  rg?: string;
  rg_orgao_emissor?: string;
  rg_data_emissao?: string;
  data_nascimento?: string;
  genero?: string;
  estado_civil?: string;
  nacionalidade?: string;
  naturalidade?: string;
  nome_mae?: string;
  nome_pai?: string;
  // Endereco
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  // Profissional
  matricula?: string;
  data_admissao?: string;
  data_demissao?: string;
  tipo_contrato?: string;
  cargo?: string;
  departamento?: string;
  salario?: number;
  jornada_trabalho?: string;
  pis_pasep?: string;
  ctps_numero?: string;
  ctps_serie?: string;
  ctps_uf?: string;
  // CNH
  cnh_numero?: string;
  cnh_categoria?: string;
  cnh_validade?: string;
  // Bancario
  banco_nome?: string;
  banco_agencia?: string;
  banco_conta?: string;
  banco_tipo_conta?: string;
  banco_pix?: string;
  // Emergencia
  emergencia_nome?: string;
  emergencia_parentesco?: string;
  emergencia_telefone?: string;
  // Escolaridade
  escolaridade?: string;
  curso?: string;
  instituicao?: string;
  // Outros
  observacoes?: string;
  foto_documento_url?: string;
  created_at?: string;
  updated_at?: string;
  user?: { id: number; name: string; email: string };
}

export interface EmployeeVacation {
  id: number;
  users_id: number;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  dias_total: number;
  dias_abono?: number;
  periodo_aquisitivo_inicio?: string;
  periodo_aquisitivo_fim?: string;
  status: string;
  aprovado_por_id?: number;
  aprovado_em?: string;
  observacoes?: string;
  created_at: string;
  updated_at?: string;
  user?: { id: number; name: string; email: string };
}

export interface VacationBalance {
  dias_direito: number;
  dias_usados: number;
  dias_pendentes: number;
  dias_disponiveis: number;
}

export interface EmployeeDocument {
  id: number;
  users_id: number;
  tipo: string;
  nome: string;
  descricao?: string;
  numero_documento?: string;
  data_emissao?: string;
  data_validade?: string;
  file_url?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  user?: { id: number; name: string; email: string };
}

export interface EmployeeDayOff {
  id: number;
  users_id: number;
  tipo: string;
  data: string;
  motivo?: string;
  horas_banco?: number;
  status: string;
  aprovado_por_id?: number;
  aprovado_em?: string;
  observacoes?: string;
  created_at: string;
  updated_at?: string;
  user?: { id: number; name: string; email: string };
  aprovado_por?: { id: number; name: string };
}

export interface DayOffBalance {
  total_horas: number;
  folgas_pendentes: number;
}

export interface EmployeeBenefit {
  id: number;
  users_id: number;
  tipo: string;
  descricao?: string;
  valor?: number;
  data_inicio: string;
  data_fim?: string;
  status: string;
  observacoes?: string;
  created_at: string;
  updated_at?: string;
  user?: { id: number; name: string; email: string };
}

export interface EmployeeCareerHistory {
  id: number;
  users_id: number;
  tipo: string;
  cargo_anterior?: string;
  cargo_novo?: string;
  departamento_anterior?: string;
  departamento_novo?: string;
  salario_anterior?: number;
  salario_novo?: number;
  data_efetivacao: string;
  motivo?: string;
  observacoes?: string;
  registrado_por_id?: number;
  created_at: string;
  user?: { id: number; name: string; email: string };
  registrado_por?: { id: number; name: string };
}
