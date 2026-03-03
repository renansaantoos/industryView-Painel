-- =============================================================================
-- Migration: kit_items_tool_id
-- Substitui category_id por tool_id em tool_kit_items
-- Kit agora referencia ferramentas especificas, nao categorias
-- =============================================================================

-- Remove dados existentes (schema change incompativel)
DELETE FROM "tool_kit_items";

-- Remove constraint unique antiga e FK de categoria
ALTER TABLE "tool_kit_items" DROP CONSTRAINT IF EXISTS "uq_tool_kit_items_kit_category";
ALTER TABLE "tool_kit_items" DROP CONSTRAINT IF EXISTS "fk_tool_kit_items_category";
DROP INDEX IF EXISTS "idx_tool_kit_items_category_id";

-- Remove coluna antiga
ALTER TABLE "tool_kit_items" DROP COLUMN IF EXISTS "category_id";

-- Adiciona coluna tool_id
ALTER TABLE "tool_kit_items"
  ADD COLUMN "tool_id" BIGINT NOT NULL;

-- Adiciona FK para tools
ALTER TABLE "tool_kit_items"
  ADD CONSTRAINT "fk_tool_kit_items_tool"
    FOREIGN KEY ("tool_id") REFERENCES "tools"("id")
    ON UPDATE NO ACTION;

-- Nova constraint unique: um kit nao pode ter a mesma ferramenta duas vezes
CREATE UNIQUE INDEX "uq_tool_kit_items_kit_tool"
  ON "tool_kit_items"("kit_id", "tool_id");

-- Novo indice
CREATE INDEX "idx_tool_kit_items_tool_id" ON "tool_kit_items"("tool_id");
