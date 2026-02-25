-- Seed status_inventory with the 3 expected statuses
-- ID 1 = Em estoque (default), ID 2 = Estoque baixo, ID 3 = Sem estoque
INSERT INTO "status_inventory" ("id", "status", "created_at", "updated_at")
VALUES
  (1, 'Em estoque',    NOW(), NOW()),
  (2, 'Estoque baixo', NOW(), NOW()),
  (3, 'Sem estoque',   NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Ensure sequence starts after 3 to avoid conflicts
SELECT setval(pg_get_serial_sequence('"status_inventory"', 'id'), GREATEST(3, (SELECT MAX(id) FROM "status_inventory")));
