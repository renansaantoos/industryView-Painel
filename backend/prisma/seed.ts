import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // 1. users_control_system (ID 3 necessário)
    await prisma.users_control_system.upsert({
        where: { id: 1 }, update: {}, create: { id: 1, access_level: 'Admin System' },
    })
    await prisma.users_control_system.upsert({
        where: { id: 2 }, update: {}, create: { id: 2, access_level: 'Manager System' },
    })
    await prisma.users_control_system.upsert({
        where: { id: 3 }, update: {}, create: { id: 3, access_level: 'User System' },
    })

    // 2. users_roles (ID 3 necessário)
    await prisma.users_roles.upsert({
        where: { id: 1 }, update: {}, create: { id: 1, role: 'Admin', role_normalized: 'admin' },
    })
    await prisma.users_roles.upsert({
        where: { id: 3 }, update: {}, create: { id: 3, role: 'User', role_normalized: 'user' },
    })
    // ID 5 é usado como default em users_permissions na schema.prisma
    await prisma.users_roles.upsert({
        where: { id: 5 }, update: {}, create: { id: 5, role: 'Guest', role_normalized: 'guest' },
    })

    // 3. users_system_access (ID 3 necessário)
    await prisma.users_system_access.upsert({
        where: { id: 1 }, update: {}, create: { id: 1, env: 'Development' },
    })
    await prisma.users_system_access.upsert({
        where: { id: 3 }, update: {}, create: { id: 3, env: 'Production' },
    })

    // 4. status_payment (Necessário para criar empresa)
    await prisma.status_payment.upsert({
        where: { id: 1 }, update: {}, create: { id: 1, name: 'Active' },
    })
    await prisma.status_payment.upsert({
        where: { id: 2 }, update: {}, create: { id: 2, name: 'Inactive' },
    })
    await prisma.status_payment.upsert({
        where: { id: 3 }, update: {}, create: { id: 3, name: 'Pending' },
    })

    // 5. projects_statuses (Necessário para criar projetos)
    // Values: Ativo, Inativo, Em andamento, Cancelado
    await prisma.projects_statuses.upsert({
        where: { id: 1 }, update: {}, create: { id: 1, status: 'Ativo' },
    })
    await prisma.projects_statuses.upsert({
        where: { id: 2 }, update: {}, create: { id: 2, status: 'Inativo' },
    })
    await prisma.projects_statuses.upsert({
        where: { id: 3 }, update: {}, create: { id: 3, status: 'Em andamento' },
    })
    await prisma.projects_statuses.upsert({
        where: { id: 4 }, update: {}, create: { id: 4, status: 'Cancelado' },
    })

    // 6. sprints_statuses
    // Values: Futura, Ativa, Concluída, Cancelada
    await prisma.sprints_statuses.upsert({
        where: { id: 1 }, update: {}, create: { id: 1, status: 'Futura' },
    })
    await prisma.sprints_statuses.upsert({
        where: { id: 2 }, update: {}, create: { id: 2, status: 'Ativa' },
    })
    await prisma.sprints_statuses.upsert({
        where: { id: 3 }, update: {}, create: { id: 3, status: 'Concluída' },
    })
    await prisma.sprints_statuses.upsert({
        where: { id: 4 }, update: {}, create: { id: 4, status: 'Cancelada' },
    })

    // 7. quality_status
    // Values: Não inspecionado, Inspeção aprovada, Inspeção não aprovada
    await prisma.quality_status.upsert({
        where: { id: 1 }, update: {}, create: { id: 1, status: 'Não inspecionado' },
    })
    await prisma.quality_status.upsert({
        where: { id: 2 }, update: {}, create: { id: 2, status: 'Inspeção aprovada' },
    })
    await prisma.quality_status.upsert({
        where: { id: 3 }, update: {}, create: { id: 3, status: 'Inspeção não aprovada' },
    })

    // 8. subtasks_statuses
    // Values: Pendente, Em andamento, Concluida, Cancelado, Impedido, Sucesso, Sem sucesso
    await prisma.subtasks_statuses.upsert({
        where: { id: 1 }, update: {}, create: { id: 1, status: 'Pendente' },
    })
    await prisma.subtasks_statuses.upsert({
        where: { id: 2 }, update: {}, create: { id: 2, status: 'Em andamento' },
    })
    await prisma.subtasks_statuses.upsert({
        where: { id: 3 }, update: {}, create: { id: 3, status: 'Concluida' },
    })
    await prisma.subtasks_statuses.upsert({
        where: { id: 4 }, update: {}, create: { id: 4, status: 'Cancelado' },
    })
    await prisma.subtasks_statuses.upsert({
        where: { id: 5 }, update: {}, create: { id: 5, status: 'Impedido' },
    })
    await prisma.subtasks_statuses.upsert({
        where: { id: 6 }, update: {}, create: { id: 6, status: 'Sucesso' },
    })
    await prisma.subtasks_statuses.upsert({
        where: { id: 7 }, update: {}, create: { id: 7, status: 'Sem sucesso' },
    })

    // 9. projects_backlogs_statuses
    // Values: Pendente, Em andamento, Concluído, Cancelado, Impedido, Sucesso, Sem sucesso
    await prisma.projects_backlogs_statuses.upsert({
        where: { id: 1 }, update: {}, create: { id: 1, status: 'Pendente' },
    })
    await prisma.projects_backlogs_statuses.upsert({
        where: { id: 2 }, update: {}, create: { id: 2, status: 'Em andamento' },
    })
    await prisma.projects_backlogs_statuses.upsert({
        where: { id: 3 }, update: {}, create: { id: 3, status: 'Concluído' },
    })
    await prisma.projects_backlogs_statuses.upsert({
        where: { id: 4 }, update: {}, create: { id: 4, status: 'Cancelado' },
    })
    await prisma.projects_backlogs_statuses.upsert({
        where: { id: 5 }, update: {}, create: { id: 5, status: 'Impedido' },
    })
    await prisma.projects_backlogs_statuses.upsert({
        where: { id: 6 }, update: {}, create: { id: 6, status: 'Sucesso' },
    })
    await prisma.projects_backlogs_statuses.upsert({
        where: { id: 7 }, update: {}, create: { id: 7, status: 'Sem sucesso' },
    })

    // 10. sprints_tasks_statuses
    // Values: Pendente, Em Andamento, Concluida, Sem Sucesso
    await prisma.sprints_tasks_statuses.upsert({
        where: { id: 1 }, update: {}, create: { id: 1, status: 'Pendente' },
    })
    await prisma.sprints_tasks_statuses.upsert({
        where: { id: 2 }, update: {}, create: { id: 2, status: 'Em Andamento' },
    })
    await prisma.sprints_tasks_statuses.upsert({
        where: { id: 3 }, update: {}, create: { id: 3, status: 'Concluida' },
    })
    await prisma.sprints_tasks_statuses.upsert({
        where: { id: 4 }, update: {}, create: { id: 4, status: 'Sem Sucesso' },
    })

    // 11. projects_steps_statuses (Necessário para criar projects_steps ao criar projeto)
    // IDs usados no projects.service.ts: 1, 2, 3, 4, 5
    const stepsStatuses = [
        { id: 1, status: 'Não iniciado' },
        { id: 2, status: 'Em configuração' },
        { id: 3, status: 'Configurado' },
        { id: 4, status: 'Em andamento' },
        { id: 5, status: 'Concluído' },
    ]
    for (const s of stepsStatuses) {
        await prisma.projects_steps_statuses.upsert({
            where: { id: s.id },
            update: {},
            create: { id: s.id, status: s.status },
        })
    }
    console.log('projects_steps_statuses seeded (IDs 1-5)')

    // 12. projects_works_situations (Dropdown "Situação da obra")
    const worksSituations = [
        { id: 1, status: 'Em obras' },
        { id: 2, status: 'Paralisada' },
        { id: 3, status: 'Concluída' },
        { id: 4, status: 'Em projeto' },
        { id: 5, status: 'Em licenciamento' },
        { id: 6, status: 'Não iniciada' },
    ]
    for (const w of worksSituations) {
        await prisma.projects_works_situations.upsert({
            where: { id: w.id },
            update: {},
            create: { id: w.id, status: w.status },
        })
    }
    console.log('projects_works_situations seeded (IDs 1-6)')

    // 13. Empresa padrão (necessária para non_execution_reasons)
    await prisma.company.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            brand_name: 'Doublex Engenharia',
            legal_name: 'Doublex Engenharia e Construções Ltda',
            cnpj: '12.345.678/0001-90',
            status_payment_id: 1,
            company_type: 'matriz',
        },
    })
    console.log('Empresa padrão criada (ID 1)')

    // 14. Non Execution Reasons (motivos de nao-execucao)
    // Uses company_id = 1 as default seed company
    const defaultNonExecReasons = [
        { name: 'Chuva', category: 'clima' },
        { name: 'Vento forte', category: 'clima' },
        { name: 'Falta de material', category: 'material' },
        { name: 'Material com defeito', category: 'material' },
        { name: 'Falta de efetivo', category: 'efetivo' },
        { name: 'Afastamento medico', category: 'efetivo' },
        { name: 'Equipamento quebrado', category: 'equipamento' },
        { name: 'Equipamento indisponivel', category: 'equipamento' },
        { name: 'Acidente de trabalho', category: 'seguranca' },
        { name: 'Interdicao por seguranca', category: 'seguranca' },
        { name: 'Aguardando liberacao', category: 'seguranca' },
        { name: 'Erro de projeto', category: 'projeto' },
        { name: 'Revisao de projeto', category: 'projeto' },
        { name: 'Falta de energia', category: 'outros' },
        { name: 'Outros', category: 'outros' },
    ]
    console.log('Seeding non_execution_reasons...')
    for (let i = 0; i < defaultNonExecReasons.length; i++) {
        const r = defaultNonExecReasons[i]
        await prisma.non_execution_reasons.upsert({
            where: { id: BigInt(i + 1) },
            update: {},
            create: { id: BigInt(i + 1), name: r.name, category: r.category, company_id: BigInt(1) },
        })
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
