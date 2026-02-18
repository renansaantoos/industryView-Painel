export type RegimeTributario =
  | 'simples_nacional'
  | 'lucro_presumido'
  | 'lucro_real'
  | 'mei'
  | 'isento';

export type CompanyType = 'matriz' | 'filial';

export interface CompanyFull {
  id: number;
  brand_name: string;
  legal_name?: string;
  cnpj?: string;
  company_type?: CompanyType;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  cep?: string;
  address_line?: string;
  complemento?: string;
  numero?: string;
  bairro?: string;
  city?: string;
  state?: string;
  pais?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  cnae?: string;
  regime_tributario?: RegimeTributario;
  responsavel_legal?: string;
  responsavel_cpf?: string;
  created_at: string;
  updated_at: string;
  branches?: CompanyBranch[];
}

export interface CompanyBranch {
  id: number;
  company_id: number;
  brand_name: string;
  legal_name?: string;
  cnpj?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  cnae?: string;
  phone?: string;
  email?: string;
  website?: string;
  cep?: string;
  address_line?: string;
  complemento?: string;
  numero?: string;
  bairro?: string;
  city?: string;
  state?: string;
  pais?: string;
  responsavel_legal?: string;
  responsavel_cpf?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyUpdatePayload {
  brand_name?: string;
  legal_name?: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  cep?: string;
  address_line?: string;
  complemento?: string;
  numero?: string;
  bairro?: string;
  city?: string;
  state?: string;
  pais?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  cnae?: string;
  regime_tributario?: RegimeTributario;
  responsavel_legal?: string;
  responsavel_cpf?: string;
}

export interface BranchPayload {
  brand_name: string;
  legal_name?: string;
  cnpj?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  cnae?: string;
  phone?: string;
  email?: string;
  website?: string;
  cep?: string;
  address_line?: string;
  complemento?: string;
  numero?: string;
  bairro?: string;
  city?: string;
  state?: string;
  pais?: string;
  responsavel_legal?: string;
  responsavel_cpf?: string;
  ativo?: boolean;
}
