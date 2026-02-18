-- ============================================
-- IndustryView Seed: 65 Teams, 150 Leaders, 950 Employees
-- All linked to company doublex (id=1)
-- ============================================

BEGIN;

-- 1. Associate user myrko with company doublex
UPDATE users SET company_id = 1 WHERE id = 10;

-- 2. Associate existing projects with company
UPDATE projects SET company_id = 1 WHERE company_id IS NULL;

-- 3. Create 65 teams (linked to project 14)
INSERT INTO teams (name, projects_id, created_at, updated_at)
SELECT
  'Equipe ' || team_name,
  14,
  NOW(),
  NOW()
FROM (VALUES
  ('Montagem Alpha'), ('Montagem Beta'), ('Montagem Gamma'), ('Montagem Delta'), ('Montagem Epsilon'),
  ('Instalacao Solar A'), ('Instalacao Solar B'), ('Instalacao Solar C'), ('Instalacao Solar D'), ('Instalacao Solar E'),
  ('Estrutura Metalica 1'), ('Estrutura Metalica 2'), ('Estrutura Metalica 3'), ('Estrutura Metalica 4'), ('Estrutura Metalica 5'),
  ('Eletrica Norte'), ('Eletrica Sul'), ('Eletrica Leste'), ('Eletrica Oeste'), ('Eletrica Central'),
  ('Fundacao A'), ('Fundacao B'), ('Fundacao C'), ('Fundacao D'), ('Fundacao E'),
  ('Tracker Setup 1'), ('Tracker Setup 2'), ('Tracker Setup 3'), ('Tracker Setup 4'), ('Tracker Setup 5'),
  ('Modulos Painel 1'), ('Modulos Painel 2'), ('Modulos Painel 3'), ('Modulos Painel 4'), ('Modulos Painel 5'),
  ('Cabeamento AC'), ('Cabeamento DC'), ('Cabeamento Geral'), ('Cabeamento Especial'), ('Cabeamento Subterraneo'),
  ('Subestacao Alpha'), ('Subestacao Beta'), ('Subestacao Gamma'),
  ('Terraplanagem 1'), ('Terraplanagem 2'), ('Terraplanagem 3'),
  ('Logistica Interna'), ('Logistica Externa'), ('Logistica Materiais'),
  ('Qualidade e Inspecao'), ('Qualidade Solda'), ('Qualidade Eletrica'),
  ('Seguranca Area 1'), ('Seguranca Area 2'), ('Seguranca Area 3'),
  ('Comissionamento A'), ('Comissionamento B'), ('Comissionamento C'),
  ('Manutencao Preventiva'), ('Manutencao Corretiva'), ('Manutencao Preditiva'),
  ('Topografia'), ('Meio Ambiente'), ('Civil Geral'), ('Apoio Operacional'), ('Supervisao Geral')
) AS t(team_name);

-- 4. Create permissions for 150 leaders (role_id=3 Lider, system_access=3 development, control=3 Usuario)
INSERT INTO users_permissions (users_roles_id, users_system_access_id, users_control_system_id, created_at)
SELECT 3, 3, 3, NOW()
FROM generate_series(1, 150);

-- 5. Create permissions for 950 employees (role_id=4 Colaborador, system_access=3 development, control=3 Usuario)
INSERT INTO users_permissions (users_roles_id, users_system_access_id, users_control_system_id, created_at)
SELECT 4, 3, 3, NOW()
FROM generate_series(1, 950);

-- 6. Create 150 leader users
-- Using a CTE to get the permission IDs we just created
WITH leader_perms AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM users_permissions
  WHERE users_roles_id = 3
  ORDER BY id DESC
  LIMIT 150
),
leader_names AS (
  SELECT n,
    (ARRAY['Ana','Bruno','Carlos','Daniela','Eduardo','Fernanda','Gabriel','Helena','Igor','Julia',
           'Kleber','Larissa','Marcos','Natalia','Otavio','Patricia','Rafael','Sandra','Thiago','Vanessa',
           'Anderson','Beatriz','Caio','Diana','Elias','Flavia','Gustavo','Isabela','Joao','Karen',
           'Leonardo','Marina','Nicolas','Olivia','Paulo','Renata','Samuel','Tatiana','Vitor','Yara',
           'Alexandre','Bianca','Cesar','Debora','Emanuel','Fabiana','Guilherme','Heloisa','Ivan','Jaqueline',
           'Leandro','Mariana','Nelson','Priscila','Renan','Simone','Tomas','Valeria','Wagner','Ximena',
           'Adriano','Bruna','Cristiano','Denise','Evandro','Francesca','Henrique','Ingrid','Jefferson','Karina',
           'Luciano','Michele','Norberto','Paloma','Rodrigo','Sabrina','Ulisses','Viviane','Wesley','Zelia',
           'Alisson','Camila','Douglas','Emanuela','Fabio','Giovana','Hugo','Janaina','Kevin','Luana',
           'Matheus','Nathalia','Oscar','Pietra','Raimundo','Stella','Ubiratan','Valentina','Xavier','Zilma',
           'Artur','Barbara','Claudio','Davi','Elena','Felipe','Gisele','Humberto','Irene','Jorge',
           'Kaique','Livia','Murilo','Noemi','Otilia','Pedro','Quintino','Rosa','Sergio','Teresa',
           'Umberto','Vera','Willian','Yuri','Zeca','Abel','Benedita','Cicero','Dalila','Edmundo',
           'Fatima','Geraldo','Hortencia','Ivo','Josefa','Laercio','Madalena','Nivaldo','Odete','Plinio',
           'Quirino','Roque','Socorro','Tadeu','Urania','Venancio','Waldemar','Xisto','Yolanda','Zenaide'])[n] AS first_name,
    (ARRAY['Silva','Santos','Oliveira','Souza','Lima','Pereira','Costa','Ferreira','Rodrigues','Almeida',
           'Nascimento','Araujo','Melo','Barbosa','Ribeiro','Martins','Carvalho','Gomes','Rocha','Dias',
           'Moreira','Nunes','Vieira','Monteiro','Cavalcante'])[((n-1) % 25) + 1] AS last_name
  FROM generate_series(1, 150) AS n
)
INSERT INTO users (name, name_normalized, email, phone, password_hash, company_id, users_permissions_id, first_login, created_at, updated_at)
SELECT
  ln.first_name || ' ' || ln.last_name,
  LOWER(ln.first_name || ' ' || ln.last_name),
  LOWER(REPLACE(REPLACE(ln.first_name, ' ', ''), '''', '') || '.' || LOWER(ln.last_name) || ln.n || '@doublex.com.br'),
  '(' || LPAD((11 + (ln.n % 89))::text, 2, '0') || ') 9' || LPAD((8000 + ln.n)::text, 4, '0') || '-' || LPAD((1000 + ln.n)::text, 4, '0'),
  '$2b$10$dummyhashedpasswordforleaderseeddata000000000000000',
  1,
  lp.id,
  false,
  NOW(),
  NOW()
FROM leader_names ln
JOIN leader_perms lp ON lp.rn = ln.n;

-- 7. Create 950 employee users
WITH employee_perms AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM users_permissions
  WHERE users_roles_id = 4
  ORDER BY id DESC
  LIMIT 950
),
first_names_arr AS (
  SELECT ARRAY[
    'Adriano','Aline','Amanda','Andre','Angela','Antonio','Aparecida','Benedito',
    'Breno','Camila','Carla','Cecilia','Celso','Clara','Claudio','Cristiane',
    'Dalton','Danilo','Debora','Denis','Diego','Edson','Eliane','Emerson',
    'Erica','Everton','Fabiano','Fabricio','Fernando','Flavio','Francisco','Geovana',
    'Geraldo','Gerson','Gilberto','Gisele','Hamilton','Helio','Hudson','Iara',
    'Ines','Isaac','Isadora','Italo','Ivone','Jacira','Jaime','Jonas',
    'Josiane','Julio','Juraci','Katia','Lauro','Leidiane','Lilian','Luciana',
    'Luiz','Marcela','Marcelo','Marcia','Mario','Marlene','Matilde','Mauricio',
    'Milton','Miriam','Monica','Nair','Neide','Nilton','Norma','Osvaldo',
    'Pamela','Patricia','Paulino','Perola','Raimunda','Raquel','Regina','Reinaldo',
    'Ricardo','Rita','Roberto','Rogerio','Romulo','Ronaldo','Rosana','Rosangela',
    'Rubens','Ruth','Sebastiao','Silvana','Silvio','Solange','Sueli','Tarcisio',
    'Telma','Teresinha','Valdir','Vanderlei','Vera','Vicente','Vinicius','Vitoria',
    'Waldeci','Wanderley','Washington','Wellington','Wilian','Zenon','Zuleica','Abel',
    'Abigail','Adalberto','Adelina','Ademir','Agatha','Agnaldo','Aguinaldo','Ailton',
    'Alcides','Aldo','Alexsandro','Alfredo','Alicio','Alzira','Amelia','Amilton',
    'Anselmo','Arlete','Arnaldo','Augusto','Bartolomeu','Belmiro','Benedita','Benicio',
    'Berenice','Bernardo','Beto','Caetano','Carmem','Carminha','Catarina','Celia',
    'Celina','Cid','Cintia','Claudete','Cleonice','Conceicao','Cosme','Cristina',
    'Damiao','Darci','Dario','Deise','Delia','Dimas','Dirce','Divino',
    'Dolores','Domingos','Donizete','Dorival','Durval','Edna','Edmilson','Edvaldo',
    'Elaine','Elba','Elenice','Elio','Elisabete','Elizeu','Eloi','Elza',
    'Emilia','Enio','Erasmo','Ermelinda','Ernesto','Esmeralda','Estela','Euclides',
    'Eulalia','Eunice','Evanildo','Expedito','Fatima','Felicia','Feliciano','Flora'
  ] AS names
),
last_names_arr AS (
  SELECT ARRAY[
    'Silva','Santos','Oliveira','Souza','Lima','Pereira','Costa','Ferreira','Rodrigues','Almeida',
    'Nascimento','Araujo','Melo','Barbosa','Ribeiro','Martins','Carvalho','Gomes','Rocha','Dias',
    'Moreira','Nunes','Vieira','Monteiro','Cavalcante','Campos','Cardoso','Correia','Cunha','Duarte',
    'Freitas','Lopes','Machado','Medeiros','Mendes','Miranda','Moura','Nogueira','Paixao','Pinto',
    'Ramos','Reis','Sales','Sampaio','Siqueira','Tavares','Teixeira','Vasconcelos','Xavier','Zanetti'
  ] AS names
)
INSERT INTO users (name, name_normalized, email, phone, password_hash, company_id, users_permissions_id, first_login, created_at, updated_at)
SELECT
  fn.names[((n-1) % array_length(fn.names, 1)) + 1] || ' ' || ln.names[((n-1) % array_length(ln.names, 1)) + 1],
  LOWER(fn.names[((n-1) % array_length(fn.names, 1)) + 1] || ' ' || ln.names[((n-1) % array_length(ln.names, 1)) + 1]),
  LOWER(
    REPLACE(fn.names[((n-1) % array_length(fn.names, 1)) + 1], ' ', '') || '.' ||
    LOWER(ln.names[((n-1) % array_length(ln.names, 1)) + 1]) ||
    n::text || '@doublex.com.br'
  ),
  '(' || LPAD((11 + (n % 89))::text, 2, '0') || ') 9' || LPAD((1000 + n)::text, 4, '0') || '-' || LPAD((2000 + n)::text, 4, '0'),
  '$2b$10$dummyhashedpasswordforemployeeseeddata00000000000',
  1,
  ep.id,
  false,
  NOW(),
  NOW()
FROM generate_series(1, 950) AS n
CROSS JOIN first_names_arr fn
CROSS JOIN last_names_arr ln
JOIN employee_perms ep ON ep.rn = n;

-- 8. Assign leaders to teams (distribute 150 leaders across 65 teams, ~2-3 leaders per team)
WITH new_teams AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS team_num
  FROM teams
  WHERE deleted_at IS NULL AND id > 3
  ORDER BY id
  LIMIT 65
),
new_leaders AS (
  SELECT u.id, ROW_NUMBER() OVER (ORDER BY u.id) AS leader_num
  FROM users u
  JOIN users_permissions up ON u.users_permissions_id = up.id
  WHERE up.users_roles_id = 3 AND u.company_id = 1 AND u.deleted_at IS NULL
  ORDER BY u.id
  LIMIT 150
)
INSERT INTO teams_leaders (users_id, teams_id, created_at, updated_at)
SELECT
  nl.id,
  nt.id,
  NOW(),
  NOW()
FROM new_leaders nl
JOIN new_teams nt ON nt.team_num = ((nl.leader_num - 1) % 65) + 1
ON CONFLICT (users_id, teams_id) DO NOTHING;

-- 9. Assign employees to teams (distribute 950 employees across 65 teams, ~14-15 per team)
WITH new_teams AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS team_num
  FROM teams
  WHERE deleted_at IS NULL AND id > 3
  ORDER BY id
  LIMIT 65
),
new_employees AS (
  SELECT u.id, ROW_NUMBER() OVER (ORDER BY u.id) AS emp_num
  FROM users u
  JOIN users_permissions up ON u.users_permissions_id = up.id
  WHERE up.users_roles_id = 4 AND u.company_id = 1 AND u.deleted_at IS NULL
  ORDER BY u.id
  LIMIT 950
)
INSERT INTO teams_members (users_id, teams_id, created_at, updated_at)
SELECT
  ne.id,
  nt.id,
  NOW(),
  NOW()
FROM new_employees ne
JOIN new_teams nt ON nt.team_num = ((ne.emp_num - 1) % 65) + 1
ON CONFLICT (users_id, teams_id) DO NOTHING;

COMMIT;
