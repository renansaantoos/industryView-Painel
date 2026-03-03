/** Department */
export interface Department {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

/** Tool Category */
export interface ToolCategory {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

/** Tool */
export interface Tool {
  id: number;
  company_id: number;
  category_id?: number;
  name: string;
  description?: string;
  control_type: 'patrimonio' | 'quantidade';
  patrimonio_code?: string;
  quantity_total: number;
  quantity_available: number;
  brand?: string;
  model?: string;
  serial_number?: string;
  condition: 'novo' | 'bom' | 'regular' | 'danificado' | 'descartado';
  branch_id?: number;
  department_id?: number;
  project_id?: number;
  assigned_user_id?: number;
  assigned_team_id?: number;
  notes?: string;
  category?: { id: number; name: string };
  branch?: { id: number; brand_name: string };
  department?: { id: number; name: string };
  project?: { id: number; name: string };
  assigned_user?: { id: number; name: string };
  assigned_team?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

/** Tool Movement */
export interface ToolMovement {
  id: number;
  tool_id: number;
  movement_type: string;
  quantity: number;
  from_branch_id?: number;
  from_department_id?: number;
  from_user_id?: number;
  from_team_id?: number;
  from_project_id?: number;
  to_branch_id?: number;
  to_department_id?: number;
  to_user_id?: number;
  to_team_id?: number;
  to_project_id?: number;
  condition?: string;
  notes?: string;
  performed_by_id: number;
  tool?: { id: number; name: string; patrimonio_code?: string };
  performed_by?: { id: number; name: string };
  created_at: string;
}

/** Tool Acceptance Term */
export interface ToolAcceptanceTerm {
  id: number;
  tool_id: number;
  delivered_by_id: number;
  received_by_id: number;
  delivery_date: string;
  notes?: string;
  tool?: { id: number; name: string; patrimonio_code?: string };
  delivered_by?: { id: number; name: string };
  received_by?: { id: number; name: string };
  created_at: string;
}

/** Tool Kit */
export interface ToolKit {
  id: number;
  company_id: number;
  name: string;
  cargo: string;
  description?: string;
  items?: ToolKitItem[];
  created_at: string;
  updated_at: string;
}

/** Tool Kit Item */
export interface ToolKitItem {
  id: number;
  kit_id: number;
  category_id: number;
  quantity: number;
  category?: { id: number; name: string };
  created_at: string;
}

/** Tools Summary */
export interface ToolsSummary {
  total: number;
  assigned: number;
  available: number;
  by_condition: { condition: string; count: number }[];
  by_control_type: { control_type: string; count: number }[];
}

/** Assign Kit Result */
export interface AssignKitResult {
  kit_id: number;
  kit_name: string;
  user_id: number;
  assigned_tools: { tool_id: number; name: string; category: string }[];
}
