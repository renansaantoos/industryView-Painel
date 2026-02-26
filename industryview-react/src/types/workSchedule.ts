export interface EmployeeWorkSchedule {
  id: number;
  users_id: number;
  tolerancia_entrada: number | null;
  intervalo_almoco_min: number | null;
  seg_ativo: boolean;
  seg_entrada: string | null;
  seg_saida: string | null;
  ter_ativo: boolean;
  ter_entrada: string | null;
  ter_saida: string | null;
  qua_ativo: boolean;
  qua_entrada: string | null;
  qua_saida: string | null;
  qui_ativo: boolean;
  qui_entrada: string | null;
  qui_saida: string | null;
  sex_ativo: boolean;
  sex_entrada: string | null;
  sex_saida: string | null;
  sab_ativo: boolean;
  sab_entrada: string | null;
  sab_saida: string | null;
  dom_ativo: boolean;
  dom_entrada: string | null;
  dom_saida: string | null;
  created_at: string;
  updated_at: string;
}
