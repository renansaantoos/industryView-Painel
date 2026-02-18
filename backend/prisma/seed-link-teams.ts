// =============================================================================
// Vincula TODOS os funcionários e projetos a equipes
// Executar: node -e "require('ts-node').register({transpileOnly:true}); require('./prisma/seed-link-teams.ts')"
// =============================================================================

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const COMPANY_ID = BigInt(12); // Empresa Renan

async function main() {
  console.log('=== VINCULANDO FUNCIONÁRIOS E PROJETOS A EQUIPES ===\n');

  // 1. Buscar todos os usuários da empresa
  const allUsers = await prisma.users.findMany({
    where: { company_id: COMPANY_ID, deleted_at: null },
    select: { id: true, name: true },
    orderBy: { id: 'asc' },
  });
  console.log(`Total de funcionários na empresa: ${allUsers.length}`);

  // 2. Buscar todos os projetos da empresa
  const allProjects = await prisma.projects.findMany({
    where: { company_id: COMPANY_ID, deleted_at: null },
    select: { id: true, name: true },
    orderBy: { id: 'asc' },
  });
  console.log(`Total de projetos na empresa: ${allProjects.length}`);

  // 3. Buscar equipes existentes da empresa
  const existingTeams = await prisma.teams.findMany({
    where: { deleted_at: null, projects: { company_id: COMPANY_ID } },
    include: {
      teams_members: { where: { deleted_at: null }, select: { users_id: true } },
      teams_leaders: { where: { deleted_at: null }, select: { users_id: true } },
    },
    orderBy: { id: 'asc' },
  });

  // 4. Identificar quem já está em alguma equipe
  const usersInTeams = new Set<string>();
  for (const t of existingTeams) {
    for (const m of t.teams_members) {
      if (m.users_id) usersInTeams.add(m.users_id.toString());
    }
    for (const l of t.teams_leaders) {
      if (l.users_id) usersInTeams.add(l.users_id.toString());
    }
  }

  const usersWithoutTeam = allUsers.filter(u => !usersInTeams.has(u.id.toString()));
  console.log(`Funcionários já em equipe: ${usersInTeams.size}`);
  console.log(`Funcionários SEM equipe: ${usersWithoutTeam.length}`);

  // 5. Identificar projetos sem equipe
  const projectsWithTeam = new Set(existingTeams.map(t => t.projects_id?.toString()).filter(Boolean));
  const projectsWithoutTeam = allProjects.filter(p => !projectsWithTeam.has(p.id.toString()));
  console.log(`Projetos SEM equipe: ${projectsWithoutTeam.length}\n`);

  // 6. Criar equipes para projetos que não têm
  const TEAM_PREFIXES = ['Equipe Alpha', 'Equipe Bravo', 'Equipe Charlie', 'Equipe Delta', 'Equipe Echo'];
  let newTeamsCreated = 0;

  for (const proj of projectsWithoutTeam) {
    const prefix = TEAM_PREFIXES[newTeamsCreated % TEAM_PREFIXES.length];
    const shortName = proj.name!.split(' ').slice(0, 2).join(' ');

    const team = await prisma.teams.create({
      data: {
        name: `${prefix} - ${shortName}`,
        projects_id: proj.id,
      },
    });

    // Escolher um líder dos primeiros 10 usuários (gestores)
    const leaderIdx = newTeamsCreated % Math.min(10, allUsers.length);
    try {
      await prisma.teams_leaders.create({
        data: {
          users_id: allUsers[leaderIdx].id,
          teams_id: team.id,
        },
      });
    } catch {
      // unique constraint - já é líder desse time
    }

    existingTeams.push({
      ...team,
      teams_members: [],
      teams_leaders: [{ users_id: allUsers[leaderIdx].id }],
    } as any);

    console.log(`  Criada equipe: ${team.name} (Projeto: ${proj.name})`);
    newTeamsCreated++;
  }

  if (newTeamsCreated > 0) console.log(`\n${newTeamsCreated} novas equipes criadas.`);

  // 7. Recarregar equipes da empresa (com as novas)
  const finalTeams = await prisma.teams.findMany({
    where: { deleted_at: null, projects: { company_id: COMPANY_ID } },
    include: {
      teams_members: { where: { deleted_at: null }, select: { users_id: true } },
      teams_leaders: { where: { deleted_at: null }, select: { users_id: true } },
      projects: { select: { id: true, name: true } },
    },
    orderBy: { id: 'asc' },
  });

  // 8. Recalcular quem ainda não está em equipe
  const alreadyInTeam = new Set<string>();
  for (const t of finalTeams) {
    for (const m of t.teams_members) {
      if (m.users_id) alreadyInTeam.add(m.users_id.toString());
    }
    for (const l of t.teams_leaders) {
      if (l.users_id) alreadyInTeam.add(l.users_id.toString());
    }
  }

  const stillWithoutTeam = allUsers.filter(u => !alreadyInTeam.has(u.id.toString()));
  console.log(`\nFuncionários ainda sem equipe para distribuir: ${stillWithoutTeam.length}`);

  // 9. Distribuir os funcionários sem equipe entre as equipes existentes
  let addedCount = 0;
  let teamIndex = 0;

  for (const user of stillWithoutTeam) {
    const targetTeam = finalTeams[teamIndex % finalTeams.length];
    teamIndex++;

    try {
      await prisma.teams_members.create({
        data: {
          users_id: user.id,
          teams_id: targetTeam.id,
        },
      });
      addedCount++;
    } catch {
      // unique constraint - já está nesse time, tentar próximo
      for (let retry = 0; retry < finalTeams.length; retry++) {
        const altTeam = finalTeams[(teamIndex + retry) % finalTeams.length];
        try {
          await prisma.teams_members.create({
            data: {
              users_id: user.id,
              teams_id: altTeam.id,
            },
          });
          addedCount++;
          break;
        } catch {
          // continua tentando
        }
      }
    }
  }
  console.log(`${addedCount} funcionários adicionados a equipes.\n`);

  // 10. Garantir que cada funcionário está vinculado ao projeto da sua equipe (projects_users)
  console.log('Verificando vínculos funcionário-projeto...');
  let projectLinksCreated = 0;

  for (const team of finalTeams) {
    if (!team.projects) continue;
    const projectId = team.projects.id;

    // Todos os membros + líderes do time devem estar no projects_users
    const teamUserIds: bigint[] = [];
    for (const m of team.teams_members) {
      if (m.users_id) teamUserIds.push(m.users_id);
    }
    for (const l of team.teams_leaders) {
      if (l.users_id) teamUserIds.push(l.users_id);
    }

    // Re-fetch members pois os dados podem estar desatualizados
    const freshTeam = await prisma.teams.findUnique({
      where: { id: team.id },
      include: {
        teams_members: { where: { deleted_at: null }, select: { users_id: true } },
        teams_leaders: { where: { deleted_at: null }, select: { users_id: true } },
      },
    });

    const freshUserIds: bigint[] = [];
    if (freshTeam) {
      for (const m of freshTeam.teams_members) {
        if (m.users_id) freshUserIds.push(m.users_id);
      }
      for (const l of freshTeam.teams_leaders) {
        if (l.users_id) freshUserIds.push(l.users_id);
      }
    }

    for (const userId of freshUserIds) {
      // Verificar se já existe o vínculo
      const existing = await prisma.projects_users.findFirst({
        where: {
          users_id: userId,
          projects_id: projectId,
          deleted_at: null,
        },
      });

      if (!existing) {
        try {
          await prisma.projects_users.create({
            data: {
              users_id: userId,
              projects_id: projectId,
            },
          });
          projectLinksCreated++;
        } catch {
          // unique constraint
        }
      }
    }
  }
  console.log(`${projectLinksCreated} novos vínculos funcionário-projeto criados.\n`);

  // 11. Relatório final
  console.log('=== RELATÓRIO FINAL ===\n');

  const finalTeamsReport = await prisma.teams.findMany({
    where: { deleted_at: null, projects: { company_id: COMPANY_ID } },
    include: {
      teams_members: {
        where: { deleted_at: null },
        include: { users: { select: { id: true, name: true } } },
      },
      teams_leaders: {
        where: { deleted_at: null },
        include: { users: { select: { id: true, name: true } } },
      },
      projects: { select: { id: true, name: true } },
    },
    orderBy: { id: 'asc' },
  });

  const allInTeamFinal = new Set<string>();
  for (const t of finalTeamsReport) {
    const projName = t.projects ? t.projects.name : 'SEM PROJETO';
    const leaders = t.teams_leaders.map(l => l.users?.name || '?').join(', ');
    const memberNames = t.teams_members.map(m => m.users?.name || '?');
    const totalPeople = t.teams_leaders.length + t.teams_members.length;

    console.log(`📋 ${t.name}`);
    console.log(`   Projeto: ${projName}`);
    console.log(`   Líder(es): ${leaders}`);
    console.log(`   Membros (${t.teams_members.length}): ${memberNames.join(', ')}`);
    console.log(`   Total: ${totalPeople} pessoas`);
    console.log('');

    for (const m of t.teams_members) {
      if (m.users_id) allInTeamFinal.add(m.users_id.toString());
    }
    for (const l of t.teams_leaders) {
      if (l.users_id) allInTeamFinal.add(l.users_id.toString());
    }
  }

  const finalWithout = allUsers.filter(u => !allInTeamFinal.has(u.id.toString()));
  console.log('---');
  console.log(`Total equipes: ${finalTeamsReport.length}`);
  console.log(`Funcionários em equipes: ${allInTeamFinal.size} / ${allUsers.length}`);
  if (finalWithout.length > 0) {
    console.log(`AINDA SEM EQUIPE: ${finalWithout.map(u => u.name).join(', ')}`);
  } else {
    console.log('TODOS os funcionários estão vinculados a pelo menos uma equipe!');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('ERRO:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
