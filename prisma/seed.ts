// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do banco de dados...");
  // Perguntar se deve limpar os dados (usando variável de ambiente ou argumento)
  const deleteAll = process.argv.includes("--delete-all");

  if (deleteAll) {
    console.log("🧹 Limpando todas as tabelas antes de inserir os dados...");

    // Ordem correta para evitar erros de foreign key
    await prisma.emprestimo.deleteMany();
    await prisma.ePI.deleteMany();
    await prisma.colaborador.deleteMany();
    await prisma.user.deleteMany();

    console.log("✅ Todos os dados antigos foram removidos com sucesso!");
  }

  // Criar colaboradores
  console.log("Criando colaboradores...");
  const colaboradores = await prisma.colaborador.createMany({
    data: [
      {
        nome: "João Silva",
        email: "joao.silva@empresa.com",
        avatarUrl: "https://images.pexels.com/photos/1370750/pexels-photo-1370750.jpeg",
        matricula: "EMP001",
        cargo: "Analista de Produção",
      },
      {
        nome: "Maria Santos",
        email: "maria.santos@empresa.com",
        avatarUrl: "https://images.pexels.com/photos/1499327/pexels-photo-1499327.jpeg",
        matricula: "EMP002",
        cargo: "Operadora de Máquinas",
      },
      {
        nome: "Pedro Oliveira",
        email: "pedro.oliveira@empresa.com",
        avatarUrl: "https://images.pexels.com/photos/634021/pexels-photo-634021.jpeg",
        matricula: "EMP003",
        cargo: "Técnico de Manutenção",
      },
      {
        nome: "Ana Costa",
        email: "ana.costa@empresa.com",
        avatarUrl: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg",
        matricula: "EMP004",
        cargo: "Supervisora de Qualidade",
      },
      {
        nome: "Carlos Rodrigues",
        email: "carlos.rodrigues@empresa.com",
        avatarUrl: "https://images.pexels.com/photos/1462980/pexels-photo-1462980.jpeg",
        matricula: "EMP005",
        cargo: "Auxiliar de Limpeza",
        ativo: false,
      },
      {
        nome: "Fernanda Lima",
        email: "fernanda.lima@empresa.com",
        avatarUrl: "https://images.pexels.com/photos/678783/pexels-photo-678783.jpeg",
        matricula: "EMP006",
        cargo: "Soldadora",
      },
      {
        nome: "Ricardo Alves",
        email: "ricardo.alves@empresa.com",
        avatarUrl: "https://images.pexels.com/photos/2589653/pexels-photo-2589653.jpeg",
        matricula: "EMP007",
        cargo: "Eletricista",
      },
      {
        nome: "Juliana Martins",
        email: "juliana.martins@empresa.com",
        avatarUrl: "https://images.pexels.com/photos/1081685/pexels-photo-1081685.jpeg",
        matricula: "EMP008",
        cargo: "Almoxarife",
      },
    ],
    skipDuplicates: true,
  });

  // Criar EPIs
  console.log("Criando EPIs...");
  const epis = await prisma.ePI.createMany({
    data: [
      {
        nome: "Capacete de Segurança",
        categoria: "Proteção da Cabeça",
        quantidade: 50,
        validade: new Date("2025-12-31"),
        descricao: "Capacete de segurança industrial com jugular",
      },
      {
        nome: "Óculos de Proteção",
        categoria: "Proteção Visual",
        quantidade: 100,
        validade: new Date("2025-06-30"),
        descricao: "Óculos de proteção contra impactos",
      },
      {
        nome: "Protetor Auricular",
        categoria: "Proteção Auditiva",
        quantidade: 80,
        validade: new Date("2025-10-15"),
        descricao: "Protetor auricular tipo concha",
      },
      {
        nome: "Luvas de Raspa",
        categoria: "Proteção das Mãos",
        quantidade: 200,
        validade: new Date("2025-08-20"),
        descricao: "Luvas de couro para proteção mecânica",
      },
      {
        nome: "Botina de Segurança",
        categoria: "Proteção dos Pés",
        quantidade: 60,
        validade: new Date("2025-03-15"),
        descricao: "Botina com biqueira de aço",
      },
      {
        nome: "Máscara PFF2",
        categoria: "Proteção Respiratória",
        quantidade: 150,
        validade: new Date("2025-11-30"),
        descricao: "Máscara de proteção respiratória",
      },
      {
        nome: "Cinto de Segurança",
        categoria: "Proteção contra Quedas",
        quantidade: 25,
        validade: new Date("2026-05-10"),
        descricao: "Cinto de segurança para trabalho em altura",
      },
      {
        nome: "Luva de Latex",
        categoria: "Proteção das Mãos",
        quantidade: 300,
        validade: new Date("2025-09-30"),
        descricao: "Luvas descartáveis de latex",
      },
      {
        nome: "Avental Protetor",
        categoria: "Proteção Corporal",
        quantidade: 45,
        validade: new Date("2025-01-15"),
        descricao: "Avental para proteção contra produtos químicos",
      },
    ],
    skipDuplicates: true,
  });

  // Buscar IDs criados para fazer os empréstimos
  const todosColaboradores = await prisma.colaborador.findMany();
  const todosEpis = await prisma.ePI.findMany();

  // Criar empréstimos de vários períodos
  console.log("Criando empréstimos...");
  const emprestimos = await prisma.emprestimo.createMany({
    data: [
      // Empréstimos ATIVOS - Período atual
      {
        colaboradorId: todosColaboradores[0].id,
        epiId: todosEpis[0].id,
        quantidade: 1,
        dataEmprestimo: new Date("2025-01-15"),
        dataVencimento: new Date("2025-04-15"),
        status: "ATIVO",
      },
      {
        colaboradorId: todosColaboradores[0].id,
        epiId: todosEpis[1].id,
        quantidade: 1,
        dataEmprestimo: new Date("2025-01-20"),
        dataVencimento: new Date("2025-04-20"),
        status: "ATIVO",
      },
      {
        colaboradorId: todosColaboradores[1].id,
        epiId: todosEpis[5].id,
        quantidade: 5,
        dataEmprestimo: new Date("2025-02-01"),
        dataVencimento: new Date("2025-05-01"),
        status: "ATIVO",
      },
      {
        colaboradorId: todosColaboradores[3].id,
        epiId: todosEpis[4].id,
        quantidade: 1,
        dataEmprestimo: new Date("2025-02-10"),
        dataVencimento: new Date("2025-05-10"),
        status: "ATIVO",
      },

      // Empréstimos DEVOLVIDOS - Período passado (últimos 3 meses)
      {
        colaboradorId: todosColaboradores[1].id,
        epiId: todosEpis[2].id,
        quantidade: 1,
        dataEmprestimo: new Date("2023-12-01"),
        dataVencimento: new Date("2025-03-01"),
        dataDevolucao: new Date("2025-01-25"),
        status: "DEVOLVIDO",
      },
      {
        colaboradorId: todosColaboradores[2].id,
        epiId: todosEpis[3].id,
        quantidade: 2,
        dataEmprestimo: new Date("2023-11-15"),
        dataVencimento: new Date("2025-02-15"),
        dataDevolucao: new Date("2025-01-10"),
        status: "DEVOLVIDO",
      },
      {
        colaboradorId: todosColaboradores[5].id,
        epiId: todosEpis[6].id,
        quantidade: 1,
        dataEmprestimo: new Date("2023-10-20"),
        dataVencimento: new Date("2025-01-20"),
        dataDevolucao: new Date("2023-12-15"),
        status: "DEVOLVIDO",
      },
      {
        colaboradorId: todosColaboradores[6].id,
        epiId: todosEpis[7].id,
        quantidade: 10,
        dataEmprestimo: new Date("2023-12-10"),
        dataVencimento: new Date("2025-03-10"),
        dataDevolucao: new Date("2025-02-01"),
        status: "DEVOLVIDO",
      },

      // Empréstimos VENCIDOS - Período passado
      {
        colaboradorId: todosColaboradores[2].id,
        epiId: todosEpis[3].id,
        quantidade: 2,
        dataEmprestimo: new Date("2023-10-10"),
        dataVencimento: new Date("2025-01-10"),
        status: "VENCIDO",
      },
      {
        colaboradorId: todosColaboradores[4].id,
        epiId: todosEpis[1].id,
        quantidade: 1,
        dataEmprestimo: new Date("2023-09-05"),
        dataVencimento: new Date("2023-12-05"),
        status: "VENCIDO",
      },
      {
        colaboradorId: todosColaboradores[7].id,
        epiId: todosEpis[8].id,
        quantidade: 1,
        dataEmprestimo: new Date("2023-11-20"),
        dataVencimento: new Date("2025-02-20"),
        status: "VENCIDO",
      },

      // Empréstimos históricos - 6 meses atrás
      {
        colaboradorId: todosColaboradores[0].id,
        epiId: todosEpis[0].id,
        quantidade: 1,
        dataEmprestimo: new Date("2023-08-01"),
        dataVencimento: new Date("2023-11-01"),
        dataDevolucao: new Date("2023-10-15"),
        status: "DEVOLVIDO",
      },
      {
        colaboradorId: todosColaboradores[1].id,
        epiId: todosEpis[2].id,
        quantidade: 1,
        dataEmprestimo: new Date("2023-07-15"),
        dataVencimento: new Date("2023-10-15"),
        dataDevolucao: new Date("2023-09-30"),
        status: "DEVOLVIDO",
      },

      // Empréstimos históricos - 1 ano atrás
      {
        colaboradorId: todosColaboradores[3].id,
        epiId: todosEpis[4].id,
        quantidade: 1,
        dataEmprestimo: new Date("2023-03-10"),
        dataVencimento: new Date("2023-06-10"),
        dataDevolucao: new Date("2023-05-20"),
        status: "DEVOLVIDO",
      },
      {
        colaboradorId: todosColaboradores[5].id,
        epiId: todosEpis[6].id,
        quantidade: 1,
        dataEmprestimo: new Date("2023-02-01"),
        dataVencimento: new Date("2023-05-01"),
        dataDevolucao: new Date("2023-04-15"),
        status: "DEVOLVIDO",
      },

      // Empréstimos recentes - últimos 30 dias
      {
        colaboradorId: todosColaboradores[6].id,
        epiId: todosEpis[7].id,
        quantidade: 20,
        dataEmprestimo: new Date("2025-01-25"),
        dataVencimento: new Date("2025-04-25"),
        status: "ATIVO",
      },
      {
        colaboradorId: todosColaboradores[7].id,
        epiId: todosEpis[8].id,
        quantidade: 1,
        dataEmprestimo: new Date("2025-02-05"),
        dataVencimento: new Date("2025-05-05"),
        status: "ATIVO",
      },
      {
        colaboradorId: todosColaboradores[2].id,
        epiId: todosEpis[1].id,
        quantidade: 1,
        dataEmprestimo: new Date("2025-02-12"),
        dataVencimento: new Date("2025-05-12"),
        status: "ATIVO",
      },

      // NOVOS EMPRÉSTIMOS - ADICIONAIS
      // Empréstimos ATIVOS adicionais
      {
        colaboradorId: todosColaboradores[4].id,
        epiId: todosEpis[0].id,
        quantidade: 1,
        dataEmprestimo: new Date("2025-02-14"),
        dataVencimento: new Date("2025-05-14"),
        status: "ATIVO",
      },
      {
        colaboradorId: todosColaboradores[5].id,
        epiId: todosEpis[2].id,
        quantidade: 1,
        dataEmprestimo: new Date("2025-02-18"),
        dataVencimento: new Date("2025-05-18"),
        status: "ATIVO",
      },
      {
        colaboradorId: todosColaboradores[6].id,
        epiId: todosEpis[4].id,
        quantidade: 1,
        dataEmprestimo: new Date("2025-02-22"),
        dataVencimento: new Date("2025-05-22"),
        status: "ATIVO",
      },
      {
        colaboradorId: todosColaboradores[7].id,
        epiId: todosEpis[6].id,
        quantidade: 1,
        dataEmprestimo: new Date("2025-02-25"),
        dataVencimento: new Date("2025-05-25"),
        status: "ATIVO",
      },

      // Empréstimos DEVOLVIDOS adicionais
      {
        colaboradorId: todosColaboradores[0].id,
        epiId: todosEpis[3].id,
        quantidade: 3,
        dataEmprestimo: new Date("2024-11-10"),
        dataVencimento: new Date("2025-02-10"),
        dataDevolucao: new Date("2025-01-30"),
        status: "DEVOLVIDO",
      },
      {
        colaboradorId: todosColaboradores[1].id,
        epiId: todosEpis[5].id,
        quantidade: 10,
        dataEmprestimo: new Date("2024-10-05"),
        dataVencimento: new Date("2025-01-05"),
        dataDevolucao: new Date("2024-12-20"),
        status: "DEVOLVIDO",
      },
      {
        colaboradorId: todosColaboradores[2].id,
        epiId: todosEpis[7].id,
        quantidade: 15,
        dataEmprestimo: new Date("2024-09-15"),
        dataVencimento: new Date("2024-12-15"),
        dataDevolucao: new Date("2024-11-25"),
        status: "DEVOLVIDO",
      },
      {
        colaboradorId: todosColaboradores[3].id,
        epiId: todosEpis[1].id,
        quantidade: 1,
        dataEmprestimo: new Date("2024-08-20"),
        dataVencimento: new Date("2024-11-20"),
        dataDevolucao: new Date("2024-10-15"),
        status: "DEVOLVIDO",
      },

      // Empréstimos VENCIDOS adicionais
      {
        colaboradorId: todosColaboradores[4].id,
        epiId: todosEpis[8].id,
        quantidade: 2,
        dataEmprestimo: new Date("2024-07-12"),
        dataVencimento: new Date("2024-10-12"),
        status: "VENCIDO",
      },
      {
        colaboradorId: todosColaboradores[5].id,
        epiId: todosEpis[0].id,
        quantidade: 1,
        dataEmprestimo: new Date("2024-06-08"),
        dataVencimento: new Date("2024-09-08"),
        status: "VENCIDO",
      },
      {
        colaboradorId: todosColaboradores[6].id,
        epiId: todosEpis[2].id,
        quantidade: 1,
        dataEmprestimo: new Date("2024-05-25"),
        dataVencimento: new Date("2024-08-25"),
        status: "VENCIDO",
      },
      {
        colaboradorId: todosColaboradores[7].id,
        epiId: todosEpis[4].id,
        quantidade: 1,
        dataEmprestimo: new Date("2024-04-18"),
        dataVencimento: new Date("2024-07-18"),
        status: "VENCIDO",
      },

      // Empréstimos históricos adicionais
      {
        colaboradorId: todosColaboradores[0].id,
        epiId: todosEpis[6].id,
        quantidade: 1,
        dataEmprestimo: new Date("2023-12-15"),
        dataVencimento: new Date("2024-03-15"),
        dataDevolucao: new Date("2024-02-28"),
        status: "DEVOLVIDO",
      },
      {
        colaboradorId: todosColaboradores[1].id,
        epiId: todosEpis[8].id,
        quantidade: 3,
        dataEmprestimo: new Date("2023-11-08"),
        dataVencimento: new Date("2024-02-08"),
        dataDevolucao: new Date("2024-01-20"),
        status: "DEVOLVIDO",
      },
      {
        colaboradorId: todosColaboradores[2].id,
        epiId: todosEpis[1].id,
        quantidade: 1,
        dataEmprestimo: new Date("2023-10-03"),
        dataVencimento: new Date("2024-01-03"),
        dataDevolucao: new Date("2023-12-15"),
        status: "DEVOLVIDO",
      },
      {
        colaboradorId: todosColaboradores[3].id,
        epiId: todosEpis[3].id,
        quantidade: 4,
        dataEmprestimo: new Date("2023-09-22"),
        dataVencimento: new Date("2023-12-22"),
        dataDevolucao: new Date("2023-11-30"),
        status: "DEVOLVIDO",
      },

      // Empréstimos com quantidades maiores
      {
        colaboradorId: todosColaboradores[4].id,
        epiId: todosEpis[5].id,
        quantidade: 25,
        dataEmprestimo: new Date("2025-01-08"),
        dataVencimento: new Date("2025-04-08"),
        status: "ATIVO",
      },
      {
        colaboradorId: todosColaboradores[5].id,
        epiId: todosEpis[7].id,
        quantidade: 30,
        dataEmprestimo: new Date("2024-12-12"),
        dataVencimento: new Date("2025-03-12"),
        dataDevolucao: new Date("2025-02-20"),
        status: "DEVOLVIDO",
      },
    ],
    skipDuplicates: true,
  });
  console.log("Seed concluído com sucesso!");
  console.log(`- ${(await prisma.user.findMany()).length} usuários criados`);
  console.log(
    `- ${(await prisma.colaborador.findMany()).length} colaboradores criados`,
  );
  console.log(`- ${(await prisma.ePI.findMany()).length} EPIs criados`);
  console.log(
    `- ${(await prisma.emprestimo.findMany()).length} empréstimos criados`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
