export type RegimeTributario =
  | 'simples_nacional'
  | 'lucro_presumido'
  | 'lucro_real'
  | 'mei'
  | 'isento';

export type CompanyType = 'matriz' | 'filial';

export interface RepresentanteLegal {
  nome: string;
  cpf: string;
}

export interface CompanyFull {
  id: number;
  brand_name: string;
  legal_name?: string;
  cnpj?: string;
  company_type?: CompanyType;
  phone?: string;
  email?: string;
  contact_name?: string;
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
  representantes_legais?: RepresentanteLegal[];
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
  contact_name?: string;
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
  representantes_legais?: RepresentanteLegal[];
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
  contact_name?: string | null;
  website?: string | null;
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
  representantes_legais?: RepresentanteLegal[] | null;
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
  contact_name?: string | null;
  website?: string | null;
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
  representantes_legais?: RepresentanteLegal[] | null;
  ativo?: boolean;
}
