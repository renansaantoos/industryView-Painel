-- =============================================================================
-- Migration: 20260303210000_tool_models
-- Separar Tool Models (catalogo) de Tool Instances (unidades fisicas)
-- =============================================================================

-- 1. Criar tabela tool_models (catalogo de tipos de ferramentas)
CREATE TABLE tool_models (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES tool_categories(id),
  name VARCHAR(200) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  description TEXT,
  control_type VARCHAR(20) NOT NULL DEFAULT 'patrimonio',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 2. Adicionar coluna model_id em tools (nullable inicialmente para poder popular)
ALTER TABLE tools ADD COLUMN model_id BIGINT;

-- 3. Criar um tool_model para CADA tool (incluindo deletadas) e mapear 1:1
--    Uso de DO block para garantir mapeamento correto sem depender de timestamps
DO $$
DECLARE
  t RECORD;
  new_model_id BIGINT;
BEGIN
  FOR t IN SELECT * FROM tools ORDER BY id LOOP
    INSERT INTO tool_models (
      company_id, category_id, name, brand, model,
      description, control_type, created_at, updated_at, deleted_at
    ) VALUES (
      t.company_id, t.category_id, t.name, t.brand, t.model,
      t.description, t.control_type, t.created_at, t.updated_at, t.deleted_at
    )
    RETURNING id INTO new_model_id;

    UPDATE tools SET model_id = new_model_id WHERE id = t.id;
  END LOOP;
END $$;

-- 4. Tornar model_id NOT NULL e adicionar FK
ALTER TABLE tools ALTER COLUMN model_id SET NOT NULL;
ALTER TABLE tools ADD CONSTRAINT fk_tools_model_id FOREIGN KEY (model_id) REFERENCES tool_models(id);

-- 5. Atualizar tool_kit_items: substituir tool_id por model_id
--    Kit define quais *modelos* sao necessarios; na atribuicao busca instancias disponiveis
ALTER TABLE tool_kit_items ADD COLUMN model_id BIGINT;

UPDATE tool_kit_items ki
SET model_id = t.model_id
FROM tools t
WHERE t.id = ki.tool_id;

ALTER TABLE tool_kit_items ALTER COLUMN model_id SET NOT NULL;
ALTER TABLE tool_kit_items ADD CONSTRAINT fk_tool_kit_items_model FOREIGN KEY (model_id) REFERENCES tool_models(id);

-- Remover unique index e FK antiga de tool_id
DROP INDEX IF EXISTS uq_tool_kit_items_kit_tool;
ALTER TABLE tool_kit_items DROP CONSTRAINT IF EXISTS fk_tool_kit_items_tool;
ALTER TABLE tool_kit_items DROP COLUMN tool_id;

-- Nova constraint unique por kit + model
CREATE UNIQUE INDEX uq_tool_kit_items_kit_model ON tool_kit_items(kit_id, model_id);

-- 6. Remover colunas de catalogo de tools (agora estao em tool_models)
ALTER TABLE tools DROP COLUMN name;
ALTER TABLE tools DROP COLUMN brand;
ALTER TABLE tools DROP COLUMN model;
ALTER TABLE tools DROP COLUMN category_id;
ALTER TABLE tools DROP COLUMN control_type;
ALTER TABLE tools DROP COLUMN description;

-- Remover indice antigo de category_id e control_type em tools
DROP INDEX IF EXISTS idx_tools_category_id;
DROP INDEX IF EXISTS idx_tools_control_type;

-- 7. Criar indices para performance
CREATE INDEX idx_tool_models_company_id ON tool_models(company_id);
CREATE INDEX idx_tool_models_category_id ON tool_models(category_id);
CREATE INDEX idx_tool_models_created_at ON tool_models(created_at DESC);
CREATE INDEX idx_tools_model_id ON tools(model_id);
CREATE INDEX idx_tool_kit_items_model_id ON tool_kit_items(model_id);
