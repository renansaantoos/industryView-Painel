// =============================================================================
// Cria 15 novas equipes e vincula a projetos da empresa Renan
// =============================================================================

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const COMPANY_ID = BigInt(12);

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const NEW_TEAMS = [
  'Equipe Foxtrot',
  'Equipe Golf',
  'Equipe Hotel',
  'Equipe India',
  'Equipe Juliet',
  'Equipe Kilo',
  'Equipe Lima',
  'Equipe Mike',
  'Equipe November',
  'Equipe Oscar',
  'Equipe Papa',
  'Equipe Quebec',
  'Equipe Romeo',
  'Equipe Sierra',
  'Equipe Tango',
];

async function main() {
  console.log('=== CRIANDO 15 NOVAS EQUIPES ===\n');

  // 1. Buscar projetos da empresa
  const projects = await prisma.projects.findMany({
    where: { company_id: COMPANY_ID, deleted_at: null },
    select: { id: true, name: true },
    orderBy: { id: 'asc' },
  });
  console.log(`Projetos disponíveis: ${projects.length}`);

  // 2. Buscar funcionários da empresa
  const users = await prisma.users.findMany({
    where: { company_id: COMPANY_ID, deleted_at: null },
    select: { id: true, name: true },
    orderBy: { id: 'asc' },
  });
  console.log(`Funcionários disponíveis: ${users.length}\n`);

  // 3. Criar 15 equipes distribuídas pelos projetos
  let teamsCreated = 0;

  for (let i = 0; i < 15; i++) {
    const project = projects[i % projects.length];
    const shortProj = project.name!.split(' ').slice(0, 2).join(' ');
    const teamName = `${NEW_TEAMS[i]} - ${shortProj}`;

    // Criar equipe
    const team = await prisma.teams.create({
      data: {
        name: teamName,
        projects_id: project.id,
      },
    });

    // Líder: rodar entre os funcionários (pegar um diferente para cada equipe)
    const leaderIdx = (i * 3 + 5) % users.length;
    try {
      await prisma.teams_leaders.create({
        data: {
          users_id: users[leaderIdx].id,
          teams_id: team.id,
        },
      });
    } catch {
      // unique constraint
    }

    // Membros: 3 a 6 por equipe
    const numMembers = randomInt(3, 6);
    const startIdx = (i * 7 + 12) % users.length;
    let added = 0;

    for (let m = 0; m < numMembers + 5 && added < numMembers; m++) {
      const memberIdx = (startIdx + m) % users.length;
      const memberId = users[memberIdx].id;

      // Não colocar o líder como membro
      if (memberId === users[leaderIdx].id) continue;

      try {
        await prisma.teams_members.create({
          data: {
            users_id: memberId,
            teams_id: team.id,
          },
        });
        added++;
      } catch {
        // unique constraint - já é membro
      }
    }

    // Garantir vínculo projects_users para todos do time
    const allTeamUserIds = [users[leaderIdx].id];
    const freshMembers = await prisma.teams_members.findMany({
      where: { teams_id: team.id, deleted_at: null },
      select: { users_id: true },
    });
    for (const fm of freshMembers) {
      if (fm.users_id) allTeamUserIds.push(fm.users_id);
    }

    for (const uid of allTeamUserIds) {
      const exists = await prisma.projects_users.findFirst({
        where: { users_id: uid, projects_id: project.id, deleted_at: null },
      });
      if (!exists) {
        try {
          await prisma.projects_users.create({
            data: { users_id: uid, projects_id: project.id },
          });
        } catch { /* unique */ }
      }
    }

    console.log(`  ${i + 1}/15 - ${teamName} | Líder: ${users[leaderIdx].name} | ${added} membros | Projeto: ${project.name}`);
    teamsCreated++;
  }

  // 4. Relatório final
  console.log('\n=== RESULTADO FINAL ===\n');

  const allTeams = await prisma.teams.findMany({
    where: { deleted_at: null, projects: { company_id: COMPANY_ID } },
    include: {
      teams_members: { where: { deleted_at: null } },
      teams_leaders: { where: { deleted_at: null } },
      projects: { select: { name: true } },
    },
    orderBy: { id: 'asc' },
  });

  console.log(`Total de equipes na empresa: ${allTeams.length}`);
  console.log(`Novas equipes criadas: ${teamsCreated}\n`);

  for (const t of allTeams) {
    const total = t.teams_leaders.length + t.teams_members.length;
    console.log(`  ${t.name} -> ${t.projects?.name} (${total} pessoas)`);
  }
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error('ERRO:', e); await prisma.$disconnect(); process.exit(1); });
