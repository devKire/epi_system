// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do banco de dados...");
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

  // Criar usuário admin
  console.log("Criando usuário admin...");
  const bcrypt = require('bcryptjs');
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@epis.com",
      password: await bcrypt.hash("123456", 12),
      role: "ADMIN",
    },
  });

  // Criar colaboradores
  console.log("Criando colaboradores...");
  const colaboradores = await prisma.colaborador.createMany({
    data: [
      {
        nome: "João Silva",
        email: "joao.silva@empresa.com",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        matricula: "EMP001",
        cargo: "Analista de Produção",
      },
      {
        nome: "Maria Santos",
        email: "maria.santos@empresa.com",
        avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w-400",
        matricula: "EMP002",
        cargo: "Operadora de Máquinas",
      },
      {
        nome: "Pedro Oliveira",
        email: "pedro.oliveira@empresa.com",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        matricula: "EMP003",
        cargo: "Técnico de Manutenção",
      },
      {
        nome: "Ana Costa",
        email: "ana.costa@empresa.com",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
        matricula: "EMP004",
        cargo: "Supervisora de Qualidade",
      },
      {
        nome: "Carlos Rodrigues",
        email: "carlos.rodrigues@empresa.com",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        matricula: "EMP005",
        cargo: "Auxiliar de Limpeza",
        ativo: false, // Colaborador inativo
      },
      {
        nome: "Fernanda Lima",
        email: "fernanda.lima@empresa.com",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
        matricula: "EMP006",
        cargo: "Soldadora",
      },
    ],
    skipDuplicates: true,
  });

  // Buscar os colaboradores criados para criar usuários e relacionamentos
  const todosColaboradores = await prisma.colaborador.findMany();

  // Criar usuários para alguns colaboradores
  console.log("Criando usuários para colaboradores...");
  for (let i = 0; i < Math.min(3, todosColaboradores.length); i++) {
    await prisma.user.create({
      data: {
        email: todosColaboradores[i].email,
        password: await bcrypt.hash("senha123", 12),
        role: "COLABORADOR",
        colaboradorId: todosColaboradores[i].id,
      },
    });
  }

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
        nome: "Uniforme",
        categoria: "Vestimenta",
        quantidade: 100,
        descricao: "Uniforme corporativo",
      },
    ],
    skipDuplicates: true,
  });

  const todosEpis = await prisma.ePI.findMany();

  // Criar empréstimos com os NOVOS STATUS
  console.log("Criando empréstimos...");
  const hoje = new Date();
  const umaSemanaAtras = new Date(hoje);
  umaSemanaAtras.setDate(hoje.getDate() - 7);
  
  const umMesAtras = new Date(hoje);
  umMesAtras.setDate(hoje.getDate() - 30);
  
  const tresMesesAtras = new Date(hoje);
  tresMesesAtras.setDate(hoje.getDate() - 90);

  const emprestimos = await prisma.emprestimo.createMany({
    data: [
      // EMPRESTADO (atual, não vencido)
      {
        colaboradorId: todosColaboradores[0].id,
        epiId: todosEpis[0].id,
        quantidade: 1,
        dataEmprestimo: umaSemanaAtras,
        dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth() + 3, hoje.getDate()),
        status: "EMPRESTADO",
        observacao: "Para uso no setor de produção",
      },
      {
        colaboradorId: todosColaboradores[1].id,
        epiId: todosEpis[1].id,
        quantidade: 2,
        dataEmprestimo: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 15),
        dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth() + 2, 15),
        status: "EMPRESTADO",
      },

      // EM_USO
      {
        colaboradorId: todosColaboradores[2].id,
        epiId: todosEpis[2].id,
        quantidade: 1,
        dataEmprestimo: new Date(hoje.getFullYear(), hoje.getMonth() - 2, 10),
        dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 10),
        status: "EM_USO",
        observacao: "Em uso contínuo no almoxarifado",
      },

      // FORNECIDO (não precisa devolver)
      {
        colaboradorId: todosColaboradores[3].id,
        epiId: todosEpis[7].id, // Uniforme
        quantidade: 2,
        dataEmprestimo: new Date(hoje.getFullYear(), hoje.getMonth() - 6, 1),
        dataVencimento: new Date(hoje.getFullYear() + 2, hoje.getMonth(), 1),
        status: "FORNECIDO",
        observacao: "Uniforme fornecido permanentemente",
      },

      // DEVOLVIDO (com data de devolução)
      {
        colaboradorId: todosColaboradores[0].id,
        epiId: todosEpis[3].id,
        quantidade: 1,
        dataEmprestimo: tresMesesAtras,
        dataVencimento: new Date(tresMesesAtras.getFullYear(), tresMesesAtras.getMonth() + 3, tresMesesAtras.getDate()),
        dataDevolucao: new Date(tresMesesAtras.getFullYear(), tresMesesAtras.getMonth() + 2, tresMesesAtras.getDate()),
        status: "DEVOLVIDO",
        observacaoDevolucao: "Devolvido em perfeito estado",
      },
      {
        colaboradorId: todosColaboradores[1].id,
        epiId: todosEpis[4].id,
        quantidade: 1,
        dataEmprestimo: umMesAtras,
        dataVencimento: new Date(umMesAtras.getFullYear(), umMesAtras.getMonth() + 3, umMesAtras.getDate()),
        dataDevolucao: new Date(umMesAtras.getFullYear(), umMesAtras.getMonth() + 1, umMesAtras.getDate()),
        status: "DEVOLVIDO",
      },

      // DANIFICADO
      {
        colaboradorId: todosColaboradores[4].id,
        epiId: todosEpis[5].id,
        quantidade: 1,
        dataEmprestimo: new Date(hoje.getFullYear(), hoje.getMonth() - 4, 20),
        dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 20),
        dataDevolucao: new Date(hoje.getFullYear(), hoje.getMonth() - 2, 15),
        status: "DANIFICADO",
        observacaoDevolucao: "Armação quebrada - enviar para manutenção",
      },

      // PERDIDO
      {
        colaboradorId: todosColaboradores[5].id,
        epiId: todosEpis[6].id,
        quantidade: 1,
        dataEmprestimo: new Date(hoje.getFullYear(), hoje.getMonth() - 3, 5),
        dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth(), 5),
        dataDevolucao: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 20),
        status: "PERDIDO",
        observacaoDevolucao: "Item extraviado no canteiro de obras",
      },

      // Empréstimo VENCIDO (status EMPRESTADO com data vencida)
      {
        colaboradorId: todosColaboradores[2].id,
        epiId: todosEpis[0].id,
        quantidade: 1,
        dataEmprestimo: new Date(hoje.getFullYear(), hoje.getMonth() - 4, 1),
        dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1),
        status: "EMPRESTADO",
        observacao: "Atrasado na devolução",
      },

      // Mais exemplos para ter dados variados
      {
        colaboradorId: todosColaboradores[3].id,
        epiId: todosEpis[1].id,
        quantidade: 1,
        dataEmprestimo: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 10),
        dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth() + 2, 10),
        status: "EM_USO",
      },
      {
        colaboradorId: todosColaboradores[0].id,
        epiId: todosEpis[2].id,
        quantidade: 1,
        dataEmprestimo: new Date(hoje.getFullYear(), hoje.getMonth() - 2, 15),
        dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 15),
        dataDevolucao: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 10),
        status: "DEVOLVIDO",
      },
    ],
    skipDuplicates: true,
  });

  // Atualizar quantidades de EPIs baseado nos empréstimos
  console.log("Atualizando quantidades de EPIs...");

  console.log("✅ Seed concluído com sucesso!");
  console.log(`- ${(await prisma.user.findMany()).length} usuários criados`);
  console.log(`- ${(await prisma.colaborador.findMany()).length} colaboradores criados`);
  console.log(`- ${(await prisma.ePI.findMany()).length} EPIs criados`);
  console.log(`- ${(await prisma.emprestimo.findMany()).length} empréstimos criados`);
  
  // Mostrar estatísticas
  const estatisticas = await prisma.emprestimo.groupBy({
    by: ['status'],
    _count: true,
  });
  
  console.log("\n📊 Estatísticas de empréstimos:");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });