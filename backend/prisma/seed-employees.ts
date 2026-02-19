// =============================================================================
// SEED EMPLOYEES - Popula 50 funcionarios completos + 15 projetos
// Executar: npx ts-node prisma/seed-employees.ts
// =============================================================================

import { PrismaClient, health_exam_type } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// ---- Helpers ----
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatCpf(i: number): string {
  const base = String(10000000000 + i * 111111).slice(0, 11);
  return `${base.slice(0, 3)}.${base.slice(3, 6)}.${base.slice(6, 9)}-${base.slice(9, 11)}`;
}

function formatRg(i: number): string {
  const base = String(1000000 + i * 11111).slice(0, 9);
  return `${base.slice(0, 2)}.${base.slice(2, 5)}.${base.slice(5, 8)}-${base.slice(8)}`;
}

function formatPhone(i: number): string {
  const ddd = randomItem(['11', '21', '31', '41', '51', '47', '48', '19', '13', '27']);
  const n = String(900000000 + i * 1000 + randomInt(0, 999)).slice(0, 9);
  return `(${ddd}) ${n.slice(0, 5)}-${n.slice(5)}`;
}

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// ---- Data pools ----
const FIRST_NAMES = [
  'Carlos', 'Maria', 'João', 'Ana', 'Pedro', 'Juliana', 'Lucas', 'Fernanda',
  'Rafael', 'Patrícia', 'Marcos', 'Camila', 'Bruno', 'Larissa', 'Thiago',
  'Beatriz', 'Felipe', 'Amanda', 'Gustavo', 'Vanessa', 'Diego', 'Renata',
  'André', 'Mariana', 'Roberto', 'Daniela', 'Eduardo', 'Priscila', 'Rodrigo',
  'Tatiana', 'Leandro', 'Natália', 'Fábio', 'Cristina', 'Alexandre', 'Isabela',
  'Wagner', 'Letícia', 'Ricardo', 'Gabriela', 'Vinícius', 'Carolina', 'Henrique',
  'Aline', 'Marcelo', 'Raquel', 'Sérgio', 'Simone', 'Paulo', 'Michele',
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Rodrigues',
  'Almeida', 'Nascimento', 'Lima', 'Araújo', 'Fernandes', 'Carvalho', 'Gomes',
  'Martins', 'Rocha', 'Ribeiro', 'Barros', 'Freitas', 'Moreira', 'Dias',
  'Teixeira', 'Vieira', 'Cardoso', 'Mendes', 'Monteiro', 'Nunes', 'Ramos',
  'Lopes', 'Correia',
];

const CARGOS = [
  'Engenheiro Civil', 'Engenheiro Eletricista', 'Engenheiro Mecânico',
  'Técnico em Segurança do Trabalho', 'Mestre de Obras', 'Encarregado de Obras',
  'Pedreiro', 'Eletricista', 'Soldador', 'Montador Industrial',
  'Operador de Máquinas', 'Carpinteiro', 'Pintor Industrial', 'Armador',
  'Almoxarife', 'Auxiliar Administrativo', 'Topógrafo', 'Instalador Solar',
  'Técnico em Edificações', 'Encanador', 'Serralheiro', 'Auxiliar de Obras',
  'Gestor de Projetos', 'Coordenador de Obras', 'Analista de Planejamento',
];

const DEPARTAMENTOS = [
  'Engenharia', 'Produção', 'Segurança do Trabalho', 'Administrativo',
  'Planejamento', 'Qualidade', 'Manutenção', 'Logística', 'RH',
];

const _GENEROS = ['Masculino', 'Feminino'];
const ESTADOS_CIVIS = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'];
const ESCOLARIDADES = ['Ensino Fundamental', 'Ensino Médio', 'Técnico', 'Superior Incompleto', 'Superior Completo', 'Pós-graduação'];
const TIPOS_CONTRATO = ['CLT', 'PJ', 'Temporário', 'Estágio', 'Terceirizado'];
const JORNADAS = ['44h semanais', '40h semanais', '36h semanais', '30h semanais', '12x36'];
const ESTADOS = ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'BA', 'PE', 'CE', 'GO', 'ES', 'DF'];
const CIDADES = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Florianópolis', 'Porto Alegre', 'Salvador', 'Recife', 'Fortaleza', 'Goiânia', 'Vitória', 'Brasília'];
const BAIRROS = ['Centro', 'Jardim América', 'Vila Nova', 'Boa Vista', 'Industrial', 'Santo Antônio', 'São José', 'Liberdade', 'Moema', 'Copacabana'];
const BANCOS = ['Banco do Brasil', 'Itaú', 'Bradesco', 'Caixa Econômica', 'Santander', 'Nubank', 'Inter', 'C6 Bank'];
const TIPO_CONTA = ['Corrente', 'Poupança'];
const PARENTESCOS = ['Cônjuge', 'Pai', 'Mãe', 'Irmão(ã)', 'Filho(a)'];
const CURSOS = ['Engenharia Civil', 'Engenharia Elétrica', 'Engenharia Mecânica', 'Administração', 'Técnico em Edificações', 'Técnico em Segurança', 'Técnico em Eletrotécnica'];
const INSTITUICOES = ['USP', 'UNICAMP', 'SENAI', 'IFSP', 'UFMG', 'UFRJ', 'PUC', 'Unisinos', 'UTFPR'];
const CNH_CATEGORIAS = ['A', 'B', 'AB', 'C', 'D', 'E'];

// Projetos de construção/engenharia
const PROJETOS = [
  { name: 'Usina Solar Fotovoltaica - Fazenda Boa Vista', city: 'Uberlândia', state: 'MG', category: 'Energia Solar', cnae: '3511-5' },
  { name: 'Parque Solar Serra do Mel', city: 'Serra do Mel', state: 'RN', category: 'Energia Solar', cnae: '3511-5' },
  { name: 'Condomínio Residencial Jardim Europa', city: 'Campinas', state: 'SP', category: 'Residencial', cnae: '4120-4' },
  { name: 'Edifício Comercial Corporate Tower', city: 'São Paulo', state: 'SP', category: 'Comercial', cnae: '4120-4' },
  { name: 'Ampliação Galpão Industrial Logística ABC', city: 'Santo André', state: 'SP', category: 'Industrial', cnae: '4120-4' },
  { name: 'Reforma Hospital Regional Norte', city: 'Sorocaba', state: 'SP', category: 'Saúde', cnae: '4399-1' },
  { name: 'Ponte Sobre Rio Paraná - Trecho Sul', city: 'Presidente Prudente', state: 'SP', category: 'Infraestrutura', cnae: '4211-1' },
  { name: 'Subestação Elétrica 138kV Maringá', city: 'Maringá', state: 'PR', category: 'Energia', cnae: '4221-9' },
  { name: 'Loteamento Verde Park Residence', city: 'Curitiba', state: 'PR', category: 'Urbanização', cnae: '4211-1' },
  { name: 'Usina Solar Flutuante Represa Itaipu', city: 'Foz do Iguaçu', state: 'PR', category: 'Energia Solar', cnae: '3511-5' },
  { name: 'Centro de Distribuição Magazine Express', city: 'Joinville', state: 'SC', category: 'Logística', cnae: '4120-4' },
  { name: 'Escola Técnica Federal - Campus Norte', city: 'Blumenau', state: 'SC', category: 'Educação', cnae: '4120-4' },
  { name: 'Terminal Rodoviário Metropolitano', city: 'Belo Horizonte', state: 'MG', category: 'Infraestrutura', cnae: '4211-1' },
  { name: 'Parque Eólico Ventos do Nordeste', city: 'Natal', state: 'RN', category: 'Energia Eólica', cnae: '3511-5' },
  { name: 'Retrofit Edifício Patrimônio Histórico', city: 'Rio de Janeiro', state: 'RJ', category: 'Retrofit', cnae: '4399-1' },
];

// Tipos de EPI
const PPE_TYPES_DATA = [
  { name: 'Capacete de Segurança', ca_number: 'CA-12345', validity_months: 24 },
  { name: 'Óculos de Proteção', ca_number: 'CA-23456', validity_months: 12 },
  { name: 'Protetor Auricular Plug', ca_number: 'CA-34567', validity_months: 6 },
  { name: 'Abafador de Ruído', ca_number: 'CA-45678', validity_months: 12 },
  { name: 'Luva de Vaqueta', ca_number: 'CA-56789', validity_months: 6 },
  { name: 'Luva Nitrílica', ca_number: 'CA-67890', validity_months: 3 },
  { name: 'Botina de Segurança com Biqueira de Aço', ca_number: 'CA-78901', validity_months: 12 },
  { name: 'Cinto de Segurança Tipo Paraquedista', ca_number: 'CA-89012', validity_months: 24 },
  { name: 'Talabarte Duplo com ABS', ca_number: 'CA-90123', validity_months: 24 },
  { name: 'Respirador PFF2', ca_number: 'CA-11234', validity_months: 1 },
  { name: 'Máscara Semifacial com Filtro', ca_number: 'CA-22345', validity_months: 6 },
  { name: 'Protetor Facial (Face Shield)', ca_number: 'CA-33456', validity_months: 12 },
  { name: 'Avental de Raspa de Couro', ca_number: 'CA-44567', validity_months: 12 },
  { name: 'Mangote de Raspa', ca_number: 'CA-55678', validity_months: 12 },
  { name: 'Perneira de Segurança', ca_number: 'CA-66789', validity_months: 12 },
  { name: 'Colete Refletivo', ca_number: 'CA-77890', validity_months: 12 },
  { name: 'Luva Isolante Classe 0', ca_number: 'CA-88901', validity_months: 6 },
  { name: 'Bota de PVC Cano Longo', ca_number: 'CA-99012', validity_months: 12 },
];

// Tipos de treinamento (NRs)
const TRAINING_TYPES_DATA = [
  { name: 'NR-06 - Equipamento de Proteção Individual', nr_reference: 'NR-06', validity_months: 24, workload_hours: 4, is_mandatory: true },
  { name: 'NR-10 - Segurança em Instalações Elétricas', nr_reference: 'NR-10', validity_months: 24, workload_hours: 40, is_mandatory: false },
  { name: 'NR-11 - Transporte e Movimentação de Materiais', nr_reference: 'NR-11', validity_months: 24, workload_hours: 16, is_mandatory: false },
  { name: 'NR-12 - Segurança no Trabalho em Máquinas', nr_reference: 'NR-12', validity_months: 24, workload_hours: 8, is_mandatory: false },
  { name: 'NR-18 - Segurança na Construção Civil', nr_reference: 'NR-18', validity_months: 24, workload_hours: 6, is_mandatory: true },
  { name: 'NR-33 - Segurança em Espaços Confinados', nr_reference: 'NR-33', validity_months: 12, workload_hours: 16, is_mandatory: false },
  { name: 'NR-35 - Trabalho em Altura', nr_reference: 'NR-35', validity_months: 24, workload_hours: 8, is_mandatory: true },
  { name: 'NR-34 - Condições de Trabalho na Indústria Naval', nr_reference: 'NR-34', validity_months: 24, workload_hours: 8, is_mandatory: false },
  { name: 'Integração de Segurança', nr_reference: null, validity_months: 12, workload_hours: 4, is_mandatory: true },
  { name: 'Primeiros Socorros', nr_reference: null, validity_months: 12, workload_hours: 8, is_mandatory: false },
  { name: 'Combate a Incêndio', nr_reference: null, validity_months: 12, workload_hours: 8, is_mandatory: false },
  { name: 'CIPA - NR-05', nr_reference: 'NR-05', validity_months: 12, workload_hours: 20, is_mandatory: false },
];

// Tipos de documentos de funcionário
const DOC_TYPES = [
  { tipo: 'RG', nome: 'Cópia do RG' },
  { tipo: 'CPF', nome: 'Cópia do CPF' },
  { tipo: 'CNH', nome: 'Cópia da CNH' },
  { tipo: 'Comprovante de Residência', nome: 'Comprovante de Residência Atualizado' },
  { tipo: 'CTPS', nome: 'Cópia da Carteira de Trabalho' },
  { tipo: 'Diploma', nome: 'Diploma/Certificado de Formação' },
  { tipo: 'ASO', nome: 'Atestado de Saúde Ocupacional' },
  { tipo: 'Certificado NR', nome: 'Certificado de Treinamento NR' },
];

// Tipos de benefícios
const BENEFIT_TYPES = [
  { tipo: 'vt', descricao: 'Vale Transporte - Bilhete Único', valor: 220.00 },
  { tipo: 'vr', descricao: 'Vale Refeição - Alelo', valor: 660.00 },
  { tipo: 'va', descricao: 'Vale Alimentação - Sodexo', valor: 450.00 },
  { tipo: 'plano_saude', descricao: 'Plano de Saúde - Unimed Enfermaria', valor: 350.00 },
  { tipo: 'plano_odonto', descricao: 'Plano Odontológico - OdontoPrev', valor: 45.00 },
  { tipo: 'seguro_vida', descricao: 'Seguro de Vida em Grupo - MetLife', valor: 30.00 },
];

// =============================================================================
// MAIN SEED FUNCTION
// =============================================================================

async function main() {
  console.log('=== SEED EMPLOYEES - Iniciando ===\n');

  // -----------------------------------------------------------------------
  // 1. Garantir que a empresa existe
  // -----------------------------------------------------------------------
  console.log('1. Criando/verificando empresa...');
  const company = await prisma.company.upsert({
    where: { id: BigInt(1) },
    update: {},
    create: {
      id: BigInt(1),
      brand_name: 'Doublex Engenharia',
      legal_name: 'Doublex Engenharia e Construções Ltda',
      cnpj: '12.345.678/0001-90',
      phone: '(11) 3456-7890',
      email: 'contato@doublex.com.br',
      cep: '01310-100',
      numero: '1500',
      address_line: 'Av. Paulista',
      bairro: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      status_payment_id: BigInt(1),
      company_type: 'matriz',
      pais: 'Brasil',
      responsavel_legal: 'Roberto Mendes da Silva',
      responsavel_cpf: '123.456.789-00',
      website: 'www.doublex.com.br',
    },
  });
  console.log(`   Empresa: ${company.brand_name} (ID: ${company.id})\n`);

  // -----------------------------------------------------------------------
  // 2. Garantir role ID 10 (usado para funcionários comuns)
  // -----------------------------------------------------------------------
  await prisma.users_roles.upsert({
    where: { id: BigInt(10) },
    update: {},
    create: { id: BigInt(10), role: 'Funcionário', role_normalized: 'funcionario' },
  });

  // -----------------------------------------------------------------------
  // 3. Criar 50 funcionários
  // -----------------------------------------------------------------------
  console.log('2. Criando 50 funcionários...');
  const password = await bcrypt.hash('Senha@123', SALT_ROUNDS);

  const createdUserIds: bigint[] = [];

  for (let i = 0; i < 50; i++) {
    const firstName = FIRST_NAMES[i];
    const lastName = randomItem(LAST_NAMES) + ' ' + randomItem(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}.${lastName.split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}${i}@doublex.com.br`;
    const phone = formatPhone(i);
    const genero = i < 25 ? 'Masculino' : 'Feminino';
    const cargo = CARGOS[i % CARGOS.length];
    const depto = DEPARTAMENTOS[i % DEPARTAMENTOS.length];
    const admissao = randomDate(new Date('2020-01-01'), new Date('2025-06-01'));
    const salarioBase = cargo.startsWith('Engenheiro') ? randomInt(8000, 18000) :
      cargo.includes('Técnico') ? randomInt(4000, 8000) :
        cargo.includes('Gestor') || cargo.includes('Coordenador') ? randomInt(10000, 20000) :
          cargo.includes('Analista') ? randomInt(5000, 10000) :
            randomInt(2500, 5500);
    const estado = ESTADOS[i % ESTADOS.length];
    const cidade = CIDADES[i % CIDADES.length];

    // Definir role: primeiros 5 = Admin, próximos 10 = Manager, restante = User
    const roleId = i < 3 ? BigInt(1) : i < 10 ? BigInt(3) : BigInt(10);
    const controlId = i < 3 ? BigInt(1) : i < 10 ? BigInt(2) : BigInt(3);

    // Criar users_permissions
    const perm = await prisma.users_permissions.create({
      data: {
        users_system_access_id: BigInt(3),
        users_roles_id: roleId,
        users_control_system_id: controlId,
      },
    });

    // Criar user
    const user = await prisma.users.create({
      data: {
        name: fullName,
        name_normalized: normalizeText(fullName),
        email,
        phone,
        password_hash: password,
        users_permissions_id: perm.id,
        company_id: company.id,
        first_login: false,
      },
    });

    createdUserIds.push(user.id);

    // Criar HR data completo
    await prisma.employees_hr_data.create({
      data: {
        users_id: user.id,
        nome_completo: fullName,
        cpf: formatCpf(i),
        rg: formatRg(i),
        rg_orgao_emissor: randomItem(['SSP/SP', 'SSP/RJ', 'SSP/MG', 'SSP/PR', 'DETRAN']),
        rg_data_emissao: randomDate(new Date('2005-01-01'), new Date('2020-01-01')),
        data_nascimento: randomDate(new Date('1975-01-01'), new Date('2000-12-31')),
        genero,
        estado_civil: randomItem(ESTADOS_CIVIS),
        nacionalidade: 'Brasileira',
        naturalidade: cidade,
        nome_mae: `${randomItem(FIRST_NAMES.slice(25))} ${randomItem(LAST_NAMES)}`,
        nome_pai: `${randomItem(FIRST_NAMES.slice(0, 25))} ${randomItem(LAST_NAMES)}`,
        // Endereço
        cep: `${randomInt(10000, 99999)}-${String(randomInt(0, 999)).padStart(3, '0')}`,
        logradouro: `Rua ${randomItem(['das Flores', 'São Paulo', 'XV de Novembro', 'Tiradentes', 'Brasil', 'da Liberdade', 'dos Pinheiros', 'Marechal Deodoro'])}`,
        numero: String(randomInt(1, 3000)),
        complemento: randomItem(['', 'Apto 101', 'Bloco B', 'Casa 2', 'Fundos', '']),
        bairro: randomItem(BAIRROS),
        cidade,
        estado,
        // Dados profissionais
        matricula: `MAT-${String(2024000 + i).padStart(7, '0')}`,
        data_admissao: admissao,
        tipo_contrato: i < 40 ? 'CLT' : randomItem(TIPOS_CONTRATO),
        cargo,
        departamento: depto,
        salario: salarioBase + randomInt(0, 500),
        jornada_trabalho: randomItem(JORNADAS),
        pis_pasep: `${randomInt(100, 999)}.${randomInt(10000, 99999)}.${randomInt(10, 99)}-${randomInt(0, 9)}`,
        ctps_numero: String(randomInt(1000000, 9999999)),
        ctps_serie: String(randomInt(100, 999)),
        ctps_uf: estado,
        // CNH (60% tem)
        ...(Math.random() > 0.4 ? {
          cnh_numero: String(randomInt(10000000000, 99999999999)),
          cnh_categoria: randomItem(CNH_CATEGORIAS),
          cnh_validade: randomDate(new Date('2025-01-01'), new Date('2030-12-31')),
        } : {}),
        // Dados bancários
        banco_nome: randomItem(BANCOS),
        banco_agencia: `${randomInt(1000, 9999)}`,
        banco_conta: `${randomInt(10000, 999999)}-${randomInt(0, 9)}`,
        banco_tipo_conta: randomItem(TIPO_CONTA),
        banco_pix: email,
        // Contato de emergência
        emergencia_nome: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
        emergencia_parentesco: randomItem(PARENTESCOS),
        emergencia_telefone: formatPhone(i + 100),
        // Escolaridade
        escolaridade: randomItem(ESCOLARIDADES),
        curso: randomItem(CURSOS),
        instituicao: randomItem(INSTITUICOES),
        // Observações
        observacoes: i % 5 === 0 ? 'Funcionário destaque do mês anterior' : undefined,
      },
    });

    if ((i + 1) % 10 === 0) console.log(`   ${i + 1}/50 funcionários criados`);
  }
  console.log(`   Total: ${createdUserIds.length} funcionários criados\n`);

  // -----------------------------------------------------------------------
  // 4. Criar 15 projetos
  // -----------------------------------------------------------------------
  console.log('3. Criando 15 projetos...');
  const createdProjectIds: bigint[] = [];

  for (let i = 0; i < 15; i++) {
    const p = PROJETOS[i];
    const startDate = randomDate(new Date('2024-01-01'), new Date('2025-06-01'));
    const statusId = i < 10 ? BigInt(3) : i < 13 ? BigInt(1) : BigInt(2); // Em andamento / Ativo / Inativo

    const project = await prisma.projects.create({
      data: {
        registration_number: `PRJ-${String(2024000 + i).padStart(7, '0')}`,
        name: p.name,
        name_normalized: normalizeText(p.name),
        project_creation_date: startDate,
        start_date: startDate,
        cep: `${randomInt(10000, 99999)}-${String(randomInt(0, 999)).padStart(3, '0')}`,
        city: p.city,
        state: p.state,
        country: 'Brasil',
        street: `Rod. ${randomItem(['BR-101', 'SP-340', 'BR-116', 'PR-445', 'MG-010'])} Km ${randomInt(10, 400)}`,
        cnae: p.cnae,
        category: p.category,
        completion_percentage: i < 10 ? randomInt(5, 85) : i < 13 ? 0 : randomInt(90, 100),
        projects_statuses_id: statusId,
        company_id: company.id,
        responsible: `Eng. ${FIRST_NAMES[i]} ${randomItem(LAST_NAMES)}`,
        art: `ART-${randomInt(100000, 999999)}`,
      },
    });

    createdProjectIds.push(project.id);
    console.log(`   Projeto ${i + 1}/15: ${p.name}`);
  }
  console.log('');

  // -----------------------------------------------------------------------
  // 5. Vincular funcionários a projetos
  // -----------------------------------------------------------------------
  console.log('4. Vinculando funcionários a projetos...');
  let linkCount = 0;

  for (let i = 0; i < createdUserIds.length; i++) {
    const userId = createdUserIds[i];
    // Cada funcionário participa de 1 a 3 projetos
    const numProjects = randomInt(1, 3);
    const shuffled = [...createdProjectIds].sort(() => Math.random() - 0.5);
    const selectedProjects = shuffled.slice(0, numProjects);

    for (const projId of selectedProjects) {
      await prisma.projects_users.create({
        data: {
          users_id: userId,
          projects_id: projId,
        },
      });
      linkCount++;
    }
  }
  console.log(`   ${linkCount} vínculos funcionário-projeto criados\n`);

  // -----------------------------------------------------------------------
  // 6. Criar times para os projetos
  // -----------------------------------------------------------------------
  console.log('5. Criando times...');
  const TEAM_NAMES = ['Equipe Alpha', 'Equipe Bravo', 'Equipe Charlie', 'Equipe Delta', 'Equipe Elétrica', 'Equipe Estrutura', 'Equipe Civil', 'Equipe Montagem'];
  const createdTeamIds: bigint[] = [];

  for (let i = 0; i < 15; i++) {
    const teamName = `${TEAM_NAMES[i % TEAM_NAMES.length]} - ${PROJETOS[i].name.split(' ')[0]}`;
    const team = await prisma.teams.create({
      data: {
        name: teamName,
        projects_id: createdProjectIds[i],
      },
    });
    createdTeamIds.push(team.id);

    // Líder = um dos primeiros 10 funcionários (managers/admins)
    const leaderId = createdUserIds[i % 10];
    await prisma.teams_leaders.create({
      data: {
        users_id: leaderId,
        teams_id: team.id,
      },
    });

    // Membros: 2 a 5 por time
    const membersCount = randomInt(2, 5);
    const memberStart = 10 + (i * 3) % 40;
    for (let m = 0; m < membersCount; m++) {
      const memberId = createdUserIds[(memberStart + m) % 50];
      if (memberId !== leaderId) {
        try {
          await prisma.teams_members.create({
            data: {
              users_id: memberId,
              teams_id: team.id,
            },
          });
        } catch {
          // Ignora duplicatas
        }
      }
    }
  }
  console.log(`   ${createdTeamIds.length} times criados com líderes e membros\n`);

  // -----------------------------------------------------------------------
  // 7. Criar tipos de EPI e entregas
  // -----------------------------------------------------------------------
  console.log('6. Criando EPIs e entregas...');
  const ppeTypeIds: bigint[] = [];

  for (const ppe of PPE_TYPES_DATA) {
    const created = await prisma.ppe_types.create({
      data: {
        name: ppe.name,
        ca_number: ppe.ca_number,
        validity_months: ppe.validity_months,
        company_id: company.id,
      },
    });
    ppeTypeIds.push(created.id);
  }

  // Cada funcionário recebe entre 3 e 8 EPIs
  let ppeDeliveryCount = 0;
  for (const userId of createdUserIds) {
    const numEpis = randomInt(3, 8);
    const shuffledEpis = [...ppeTypeIds].sort(() => Math.random() - 0.5).slice(0, numEpis);

    for (const ppeId of shuffledEpis) {
      const deliveryDate = randomDate(new Date('2024-01-01'), new Date('2026-01-31'));
      await prisma.ppe_deliveries.create({
        data: {
          users_id: userId,
          ppe_types_id: ppeId,
          delivery_date: deliveryDate,
          quantity: randomInt(1, 3),
          delivered_by_user_id: createdUserIds[randomInt(0, 2)], // Admin entrega
        },
      });
      ppeDeliveryCount++;
    }
  }
  console.log(`   ${PPE_TYPES_DATA.length} tipos de EPI, ${ppeDeliveryCount} entregas realizadas\n`);

  // -----------------------------------------------------------------------
  // 8. Criar tipos de treinamento e registros
  // -----------------------------------------------------------------------
  console.log('7. Criando treinamentos...');
  const trainingTypeIds: bigint[] = [];

  for (const tt of TRAINING_TYPES_DATA) {
    const created = await prisma.training_types.create({
      data: {
        name: tt.name,
        nr_reference: tt.nr_reference,
        validity_months: tt.validity_months,
        workload_hours: tt.workload_hours,
        is_mandatory_for_admission: tt.is_mandatory,
        company_id: company.id,
      },
    });
    trainingTypeIds.push(created.id);
  }

  // Cada funcionário faz 2 a 6 treinamentos
  let trainingCount = 0;
  const instrutores = ['José Carlos Mendes', 'Ana Paula Ferreira', 'Ricardo Teixeira', 'Maria Helena Costa'];

  for (const userId of createdUserIds) {
    const numTrainings = randomInt(2, 6);
    const shuffledTrainings = [...trainingTypeIds].sort(() => Math.random() - 0.5).slice(0, numTrainings);

    for (const ttId of shuffledTrainings) {
      const trainingDate = randomDate(new Date('2024-01-01'), new Date('2026-01-31'));
      const ttData = TRAINING_TYPES_DATA[trainingTypeIds.indexOf(ttId)];
      const expiryDate = new Date(trainingDate);
      expiryDate.setMonth(expiryDate.getMonth() + (ttData?.validity_months || 12));

      await prisma.worker_trainings.create({
        data: {
          users_id: userId,
          training_types_id: ttId,
          training_date: trainingDate,
          expiry_date: expiryDate,
          instructor_name: randomItem(instrutores),
          institution: randomItem(['SENAI', 'SENAC', 'SESI', 'Empresa Própria', 'Safety Training BR']),
          certificate_number: `CERT-${randomInt(100000, 999999)}`,
          workload_hours: ttData?.workload_hours || 8,
          status: expiryDate > new Date() ? 'valido' : 'vencido',
          projects_id: randomItem(createdProjectIds),
          registered_by_user_id: createdUserIds[0],
        },
      });
      trainingCount++;
    }
  }
  console.log(`   ${TRAINING_TYPES_DATA.length} tipos de treinamento, ${trainingCount} registros\n`);

  // -----------------------------------------------------------------------
  // 9. Criar férias
  // -----------------------------------------------------------------------
  console.log('8. Criando registros de férias...');
  let vacationCount = 0;
  const adminId = createdUserIds[0];

  for (let i = 0; i < createdUserIds.length; i++) {
    const userId = createdUserIds[i];
    // 70% tem férias registradas
    if (Math.random() > 0.3) {
      const numVacations = randomInt(1, 2);
      for (let v = 0; v < numVacations; v++) {
        const inicio = randomDate(new Date('2024-06-01'), new Date('2026-06-01'));
        const dias = randomItem([15, 20, 30]);
        const fim = new Date(inicio);
        fim.setDate(fim.getDate() + dias);
        const status = randomItem(['pendente', 'aprovado', 'aprovado', 'aprovado', 'rejeitado']);

        const aqInicio = new Date(inicio);
        aqInicio.setFullYear(aqInicio.getFullYear() - 1);

        await prisma.employees_vacations.create({
          data: {
            users_id: userId,
            tipo: randomItem(['férias', 'férias', 'férias', 'licença médica', 'licença paternidade']),
            data_inicio: inicio,
            data_fim: fim,
            dias_total: dias,
            dias_abono: Math.random() > 0.7 ? randomInt(1, 10) : 0,
            periodo_aquisitivo_inicio: aqInicio,
            periodo_aquisitivo_fim: inicio,
            status,
            aprovado_por_id: status === 'aprovado' ? adminId : undefined,
            aprovado_em: status === 'aprovado' ? randomDate(inicio, new Date()) : undefined,
            observacoes: v === 0 ? 'Período regular' : 'Segundo período fracionado',
          },
        });
        vacationCount++;
      }
    }
  }
  console.log(`   ${vacationCount} registros de férias criados\n`);

  // -----------------------------------------------------------------------
  // 10. Criar documentos dos funcionários
  // -----------------------------------------------------------------------
  console.log('9. Criando documentos dos funcionários...');
  let docCount = 0;

  for (const userId of createdUserIds) {
    const numDocs = randomInt(3, 6);
    const shuffledDocs = [...DOC_TYPES].sort(() => Math.random() - 0.5).slice(0, numDocs);

    for (const doc of shuffledDocs) {
      const emissao = randomDate(new Date('2020-01-01'), new Date('2025-12-01'));
      const validade = new Date(emissao);
      validade.setFullYear(validade.getFullYear() + randomInt(1, 5));

      await prisma.employees_documents.create({
        data: {
          users_id: userId,
          tipo: doc.tipo,
          nome: doc.nome,
          descricao: `Documento ${doc.tipo} do funcionário`,
          numero_documento: `DOC-${randomInt(100000, 999999)}`,
          data_emissao: emissao,
          data_validade: validade,
          status: validade > new Date() ? 'ativo' : 'vencido',
        },
      });
      docCount++;
    }
  }
  console.log(`   ${docCount} documentos criados\n`);

  // -----------------------------------------------------------------------
  // 11. Criar folgas (day offs)
  // -----------------------------------------------------------------------
  console.log('10. Criando folgas...');
  let dayOffCount = 0;
  const dayOffTipos = ['folga_compensatoria', 'banco_horas', 'folga_escala', 'troca_turno'] as const;

  for (const userId of createdUserIds) {
    if (Math.random() > 0.5) {
      const numDayOffs = randomInt(1, 3);
      for (let d = 0; d < numDayOffs; d++) {
        const data = randomDate(new Date('2025-01-01'), new Date('2026-06-01'));
        const tipo = randomItem([...dayOffTipos]);
        const status = randomItem(['pendente', 'aprovado', 'aprovado', 'rejeitado', 'cancelado']);

        await prisma.employees_day_offs.create({
          data: {
            users_id: userId,
            tipo,
            data,
            motivo: randomItem([
              'Compensação de hora extra',
              'Consulta médica',
              'Resolução de assuntos pessoais',
              'Troca com colega de turno',
              'Banco de horas acumulado',
            ]),
            horas_banco: tipo === 'banco_horas' ? randomInt(4, 12) : undefined,
            status,
            aprovado_por_id: status === 'aprovado' ? adminId : undefined,
            aprovado_em: status === 'aprovado' ? new Date() : undefined,
            observacoes: Math.random() > 0.7 ? 'Aprovado pela gerência' : undefined,
          },
        });
        dayOffCount++;
      }
    }
  }
  console.log(`   ${dayOffCount} folgas criadas\n`);

  // -----------------------------------------------------------------------
  // 12. Criar benefícios
  // -----------------------------------------------------------------------
  console.log('11. Criando benefícios...');
  let benefitCount = 0;

  for (const userId of createdUserIds) {
    // Cada funcionário CLT recebe 3-6 benefícios
    const numBenefits = randomInt(3, 6);
    const shuffledBenefits = [...BENEFIT_TYPES].sort(() => Math.random() - 0.5).slice(0, numBenefits);

    for (const ben of shuffledBenefits) {
      const inicio = randomDate(new Date('2023-01-01'), new Date('2025-06-01'));

      await prisma.employees_benefits.create({
        data: {
          users_id: userId,
          tipo: ben.tipo,
          descricao: ben.descricao,
          valor: ben.valor + randomInt(-50, 100),
          data_inicio: inicio,
          status: Math.random() > 0.1 ? 'ativo' : 'suspenso',
          observacoes: Math.random() > 0.8 ? 'Benefício padrão da empresa' : undefined,
        },
      });
      benefitCount++;
    }
  }
  console.log(`   ${benefitCount} benefícios criados\n`);

  // -----------------------------------------------------------------------
  // 13. Criar histórico de carreira
  // -----------------------------------------------------------------------
  console.log('12. Criando histórico de carreira...');
  let careerCount = 0;

  for (let i = 0; i < createdUserIds.length; i++) {
    const userId = createdUserIds[i];
    const cargo = CARGOS[i % CARGOS.length];
    const depto = DEPARTAMENTOS[i % DEPARTAMENTOS.length];
    const admissao = randomDate(new Date('2020-01-01'), new Date('2024-01-01'));

    // Evento de admissão
    await prisma.employees_career_history.create({
      data: {
        users_id: userId,
        tipo: 'admissao',
        cargo_novo: cargo,
        departamento_novo: depto,
        salario_novo: randomInt(2500, 8000),
        data_efetivacao: admissao,
        motivo: 'Contratação inicial',
        registrado_por_id: adminId,
      },
    });
    careerCount++;

    // 40% tem promoção
    if (Math.random() > 0.6) {
      const promoDate = new Date(admissao);
      promoDate.setMonth(promoDate.getMonth() + randomInt(6, 24));
      const novoCargoIdx = (CARGOS.indexOf(cargo) + 1) % CARGOS.length;

      await prisma.employees_career_history.create({
        data: {
          users_id: userId,
          tipo: 'promocao',
          cargo_anterior: cargo,
          cargo_novo: CARGOS[novoCargoIdx],
          departamento_anterior: depto,
          departamento_novo: depto,
          salario_anterior: randomInt(2500, 8000),
          salario_novo: randomInt(5000, 15000),
          data_efetivacao: promoDate,
          motivo: 'Promoção por desempenho',
          registrado_por_id: adminId,
        },
      });
      careerCount++;
    }

    // 20% tem mudança de salário
    if (Math.random() > 0.8) {
      await prisma.employees_career_history.create({
        data: {
          users_id: userId,
          tipo: 'mudanca_salario',
          cargo_anterior: cargo,
          cargo_novo: cargo,
          salario_anterior: randomInt(3000, 8000),
          salario_novo: randomInt(5000, 12000),
          data_efetivacao: randomDate(new Date('2024-06-01'), new Date('2025-12-01')),
          motivo: 'Reajuste salarial anual',
          registrado_por_id: adminId,
        },
      });
      careerCount++;
    }
  }
  console.log(`   ${careerCount} registros de carreira criados\n`);

  // -----------------------------------------------------------------------
  // 14. Criar exames de saúde (ASO)
  // -----------------------------------------------------------------------
  console.log('13. Criando exames de saúde (ASO)...');
  let healthCount = 0;
  const _examTypes: health_exam_type[] = ['admissional', 'periodico', 'retorno_trabalho', 'mudanca_funcao', 'demissional'];

  for (const userId of createdUserIds) {
    // ASO admissional
    const admDate = randomDate(new Date('2020-01-01'), new Date('2024-06-01'));
    await prisma.worker_health_records.create({
      data: {
        users_id: userId,
        exam_type: 'admissional',
        exam_date: admDate,
        expiry_date: new Date(admDate.getFullYear() + 1, admDate.getMonth(), admDate.getDate()),
        result: 'apto',
        physician_name: randomItem(['Dr. Carlos Mendes', 'Dra. Maria Santos', 'Dr. Roberto Lima', 'Dra. Ana Oliveira']),
        physician_crm: `CRM-${randomItem(ESTADOS)}/${randomInt(10000, 99999)}`,
      },
    });
    healthCount++;

    // ASO periódico (80% tem)
    if (Math.random() > 0.2) {
      const perDate = randomDate(new Date('2024-06-01'), new Date('2026-01-01'));
      await prisma.worker_health_records.create({
        data: {
          users_id: userId,
          exam_type: 'periodico',
          exam_date: perDate,
          expiry_date: new Date(perDate.getFullYear() + 1, perDate.getMonth(), perDate.getDate()),
          result: Math.random() > 0.05 ? 'apto' : 'apto_com_restricao',
          restrictions: Math.random() > 0.9 ? 'Restrição para trabalho em altura' : undefined,
          physician_name: randomItem(['Dr. Carlos Mendes', 'Dra. Maria Santos', 'Dr. Roberto Lima']),
          physician_crm: `CRM-${randomItem(ESTADOS)}/${randomInt(10000, 99999)}`,
        },
      });
      healthCount++;
    }
  }
  console.log(`   ${healthCount} exames de saúde criados\n`);

  // -----------------------------------------------------------------------
  // RESUMO FINAL
  // -----------------------------------------------------------------------
  console.log('=== SEED CONCLUÍDO COM SUCESSO ===');
  console.log(`
  RESUMO:
  - 1 Empresa (Doublex Engenharia)
  - 50 Funcionários (todos com dados completos)
  - 15 Projetos
  - ${linkCount} Vínculos funcionário-projeto
  - ${createdTeamIds.length} Times com líderes e membros
  - ${PPE_TYPES_DATA.length} Tipos de EPI, ${ppeDeliveryCount} entregas
  - ${TRAINING_TYPES_DATA.length} Tipos de treinamento, ${trainingCount} registros
  - ${vacationCount} Registros de férias
  - ${docCount} Documentos
  - ${dayOffCount} Folgas
  - ${benefitCount} Benefícios
  - ${careerCount} Registros de carreira
  - ${healthCount} Exames de saúde (ASO)

  Senha padrão de todos os funcionários: Senha@123
  `);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('ERRO NO SEED:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
