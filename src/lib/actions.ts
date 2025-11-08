"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/prisma";

export type ActionState = {
  success?: boolean;
  message?: string;
  errors?: {
    nome?: string[];
    email?: string[];
    matricula?: string[];
    cargo?: string[];
  };
};

export type EPIActionState = {
  success?: boolean;
  message?: string;
  errors?: {
    nome?: string[];
    categoria?: string[];
    quantidade?: string[];
    validade?: string[];
    descricao?: string[];
  };
};

export type EmprestimoActionState = {
  success?: boolean;
  message?: string;
  errors?: {
    colaboradorId?: string[];
    epiId?: string[];
    quantidade?: string[];
    dataVencimento?: string[];
  };
};

export type DevolucaoActionState = {
  success?: boolean;
  message?: string;
  errors?: {
    emprestimoId?: string[];
    quantidadeDevolvida?: string[];
  };
};

export async function createColaborador(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Extrair dados do form
  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const matricula = formData.get("matricula") as string;
  const cargo = formData.get("cargo") as string;
  const ativo = formData.get("ativo") === "on";
  const criarUsuario = formData.get("criarUsuario") === "on";

  // Validações básicas
  const errors: ActionState["errors"] = {};

  if (!nome || nome.trim().length < 2) {
    errors.nome = ["Nome deve ter pelo menos 2 caracteres"];
  }

  if (!email || !email.includes("@")) {
    errors.email = ["Email inválido"];
  }

  if (!matricula || matricula.trim().length < 1) {
    errors.matricula = ["Matrícula é obrigatória"];
  }

  if (!cargo || cargo.trim().length < 2) {
    errors.cargo = ["Cargo deve ter pelo menos 2 caracteres"];
  }

  // Se há erros, retorna early
  if (Object.keys(errors).length > 0) {
    return { errors, message: "Por favor, corrija os erros abaixo" };
  }

  try {
    // Verificar se email já existe
    const emailExists = await db.colaborador.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (emailExists) {
      return {
        errors: { email: ["Já existe um colaborador com este email"] },
        message: "Email já cadastrado",
      };
    }

    // Verificar se matrícula já existe
    const matriculaExists = await db.colaborador.findUnique({
      where: { matricula: matricula.trim() },
    });

    if (matriculaExists) {
      return {
        errors: { matricula: ["Já existe um colaborador com esta matrícula"] },
        message: "Matrícula já cadastrada",
      };
    }

    // Criar colaborador e usuário em transação
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const result = await db.$transaction(async (tx) => {
      // Criar colaborador
      const colaborador = await tx.colaborador.create({
        data: {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          matricula: matricula.trim(),
          cargo: cargo.trim(),
          ativo,
          ...(criarUsuario && {
            user: {
              create: {
                email: email.trim().toLowerCase(),
                password: await bcrypt.hash("123456", 12), // Senha padrão
                role: "COLABORADOR",
              },
            },
          }),
        },
      });

      return colaborador;
    });

    revalidatePath("/colaboradores");
    return {
      success: true,
      message: `Colaborador criado com sucesso${criarUsuario ? " e usuário de acesso gerado" : ""}!`,
    };
  } catch (error) {
    console.error("Erro ao criar colaborador:", error);
    return {
      message: "Erro interno do servidor. Tente novamente.",
    };
  }
}
export async function updateColaborador(
  id: string,
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const matricula = formData.get("matricula") as string;
  const cargo = formData.get("cargo") as string;
  const ativo = formData.get("ativo") === "on";

  const errors: ActionState["errors"] = {};

  if (!nome || nome.trim().length < 2) {
    errors.nome = ["Nome deve ter pelo menos 2 caracteres"];
  }

  if (!email || !email.includes("@")) {
    errors.email = ["Email inválido"];
  }

  if (!matricula || matricula.trim().length < 1) {
    errors.matricula = ["Matrícula é obrigatória"];
  }

  if (!cargo || cargo.trim().length < 2) {
    errors.cargo = ["Cargo deve ter pelo menos 2 caracteres"];
  }

  if (Object.keys(errors).length > 0) {
    return { errors, message: "Por favor, corrija os erros abaixo" };
  }

  try {
    // Verificar conflitos de email (excluindo o próprio colaborador)
    const emailExists = await db.colaborador.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        NOT: { id },
      },
    });

    if (emailExists) {
      return {
        errors: { email: ["Já existe outro colaborador com este email"] },
        message: "Email já cadastrado",
      };
    }

    // Verificar conflitos de matrícula (excluindo o próprio colaborador)
    const matriculaExists = await db.colaborador.findFirst({
      where: {
        matricula: matricula.trim(),
        NOT: { id },
      },
    });

    if (matriculaExists) {
      return {
        errors: {
          matricula: ["Já existe outro colaborador com esta matrícula"],
        },
        message: "Matrícula já cadastrada",
      };
    }

    await db.colaborador.update({
      where: { id },
      data: {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        matricula: matricula.trim(),
        cargo: cargo.trim(),
        ativo,
      },
    });

    revalidatePath("/colaboradores");
    revalidatePath(`/colaboradores/${id}`);
    return { success: true, message: "Colaborador atualizado com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar colaborador:", error);
    return {
      message: "Erro interno do servidor. Tente novamente.",
    };
  }
}

export async function deleteColaborador(id: string): Promise<ActionState> {
  try {
    // Verificar se o colaborador tem empréstimos ativos
    const emprestimosAtivos = await db.emprestimo.count({
      where: {
        colaboradorId: id,
        status: "ATIVO",
      },
    });

    if (emprestimosAtivos > 0) {
      return {
        message: "Não é possível excluir colaborador com empréstimos ativos",
      };
    }

    await db.colaborador.delete({
      where: { id },
    });

    revalidatePath("/colaboradores");
    return { success: true, message: "Colaborador excluído com sucesso!" };
  } catch (error) {
    console.error("Erro ao excluir colaborador:", error);
    return {
      message: "Erro interno do servidor. Tente novamente.",
    };
  }
}

export async function createEPI(
  prevState: EPIActionState,
  formData: FormData,
): Promise<EPIActionState> {
  // Extrair dados do form
  const nome = formData.get("nome") as string;
  const categoria = formData.get("categoria") as string;
  const quantidade = formData.get("quantidade") as string;
  const validade = formData.get("validade") as string;
  const descricao = formData.get("descricao") as string;

  // Validações
  const errors: EPIActionState["errors"] = {};

  if (!nome || nome.trim().length < 2) {
    errors.nome = ["Nome deve ter pelo menos 2 caracteres"];
  }

  if (!categoria || categoria.trim().length < 2) {
    errors.categoria = ["Categoria deve ter pelo menos 2 caracteres"];
  }

  if (!quantidade) {
    errors.quantidade = ["Quantidade é obrigatória"];
  } else {
    const quant = parseInt(quantidade);
    if (isNaN(quant) || quant < 0) {
      errors.quantidade = ["Quantidade deve ser um número positivo"];
    }
  }

  if (validade) {
    const dataValidade = new Date(validade);
    if (isNaN(dataValidade.getTime())) {
      errors.validade = ["Data de validade inválida"];
    } else if (dataValidade < new Date()) {
      errors.validade = ["Data de validade não pode ser no passado"];
    }
  }

  // Se há erros, retorna early
  if (Object.keys(errors).length > 0) {
    return { errors, message: "Por favor, corrija os erros abaixo" };
  }

  try {
    // Verificar se EPI com mesmo nome já existe
    const epiExists = await db.ePI.findFirst({
      where: {
        nome: {
          equals: nome.trim(),
          mode: "insensitive",
        },
      },
    });

    if (epiExists) {
      return {
        errors: { nome: ["Já existe uma EPI com este nome"] },
        message: "EPI já cadastrada",
      };
    }

    // Criar EPI
    await db.ePI.create({
      data: {
        nome: nome.trim(),
        categoria: categoria.trim(),
        quantidade: parseInt(quantidade),
        validade: validade ? new Date(validade) : null,
        descricao: descricao?.trim() || null,
      },
    });

    revalidatePath("/epis");
    return { success: true, message: "EPI criada com sucesso!" };
  } catch (error) {
    console.error("Erro ao criar EPI:", error);
    return {
      message: "Erro interno do servidor. Tente novamente.",
    };
  }
}

export async function updateEPI(
  id: string,
  prevState: EPIActionState,
  formData: FormData,
): Promise<EPIActionState> {
  const nome = formData.get("nome") as string;
  const categoria = formData.get("categoria") as string;
  const quantidade = formData.get("quantidade") as string;
  const validade = formData.get("validade") as string;
  const descricao = formData.get("descricao") as string;

  const errors: EPIActionState["errors"] = {};

  if (!nome || nome.trim().length < 2) {
    errors.nome = ["Nome deve ter pelo menos 2 caracteres"];
  }

  if (!categoria || categoria.trim().length < 2) {
    errors.categoria = ["Categoria deve ter pelo menos 2 caracteres"];
  }

  if (!quantidade) {
    errors.quantidade = ["Quantidade é obrigatória"];
  } else {
    const quant = parseInt(quantidade);
    if (isNaN(quant) || quant < 0) {
      errors.quantidade = ["Quantidade deve ser um número positivo"];
    }
  }

  if (validade) {
    const dataValidade = new Date(validade);
    if (isNaN(dataValidade.getTime())) {
      errors.validade = ["Data de validade inválida"];
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors, message: "Por favor, corrija os erros abaixo" };
  }

  try {
    // Verificar conflitos de nome (excluindo a própria EPI)
    const epiExists = await db.ePI.findFirst({
      where: {
        nome: {
          equals: nome.trim(),
          mode: "insensitive",
        },
        NOT: { id },
      },
    });

    if (epiExists) {
      return {
        errors: { nome: ["Já existe outra EPI com este nome"] },
        message: "Nome já cadastrado",
      };
    }

    await db.ePI.update({
      where: { id },
      data: {
        nome: nome.trim(),
        categoria: categoria.trim(),
        quantidade: parseInt(quantidade),
        validade: validade ? new Date(validade) : null,
        descricao: descricao?.trim() || null,
      },
    });

    revalidatePath("/epis");
    revalidatePath(`/epis/${id}`);
    return { success: true, message: "EPI atualizada com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar EPI:", error);
    return {
      message: "Erro interno do servidor. Tente novamente.",
    };
  }
}

export async function deleteEPI(id: string): Promise<EPIActionState> {
  try {
    // Verificar se a EPI tem empréstimos ativos
    const emprestimosAtivos = await db.emprestimo.count({
      where: {
        epiId: id,
        status: "ATIVO",
      },
    });

    if (emprestimosAtivos > 0) {
      return {
        message: "Não é possível excluir EPI com empréstimos ativos",
      };
    }

    await db.ePI.delete({
      where: { id },
    });

    revalidatePath("/epis");
    return { success: true, message: "EPI excluída com sucesso!" };
  } catch (error) {
    console.error("Erro ao excluir EPI:", error);
    return {
      message: "Erro interno do servidor. Tente novamente.",
    };
  }
}

export async function createEmprestimo(
  prevState: EmprestimoActionState,
  formData: FormData,
): Promise<EmprestimoActionState> {
  const colaboradorId = formData.get("colaboradorId") as string;
  const epiId = formData.get("epiId") as string;
  const quantidade = formData.get("quantidade") as string;
  const dataVencimento = formData.get("dataVencimento") as string;

  const errors: EmprestimoActionState["errors"] = {};

  if (!colaboradorId) {
    errors.colaboradorId = ["Colaborador é obrigatório"];
  }

  if (!epiId) {
    errors.epiId = ["EPI é obrigatório"];
  }

  if (!quantidade) {
    errors.quantidade = ["Quantidade é obrigatória"];
  } else {
    const quant = parseInt(quantidade);
    if (isNaN(quant) || quant <= 0) {
      errors.quantidade = ["Quantidade deve ser maior que zero"];
    }
  }

  if (!dataVencimento) {
    errors.dataVencimento = ["Data de vencimento é obrigatória"];
  } else {
    const dataVenc = new Date(dataVencimento);
    if (isNaN(dataVenc.getTime())) {
      errors.dataVencimento = ["Data de vencimento inválida"];
    } else if (dataVenc <= new Date()) {
      errors.dataVencimento = ["Data de vencimento deve ser futura"];
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors, message: "Por favor, corrija os erros abaixo" };
  }

  try {
    // Verificar se colaborador existe e está ativo
    const colaborador = await db.colaborador.findUnique({
      where: { id: colaboradorId },
    });

    if (!colaborador) {
      return {
        errors: { colaboradorId: ["Colaborador não encontrado"] },
        message: "Colaborador inválido",
      };
    }

    if (!colaborador.ativo) {
      return {
        errors: { colaboradorId: ["Colaborador não está ativo"] },
        message: "Colaborador inativo",
      };
    }

    // Verificar se EPI existe e tem estoque suficiente
    const epi = await db.ePI.findUnique({
      where: { id: epiId },
    });

    if (!epi) {
      return {
        errors: { epiId: ["EPI não encontrada"] },
        message: "EPI inválida",
      };
    }

    const quantidadeSolicitada = parseInt(quantidade);
    if (epi.quantidade < quantidadeSolicitada) {
      return {
        errors: {
          quantidade: [`Estoque insuficiente. Disponível: ${epi.quantidade}`],
        },
        message: "Estoque insuficiente",
      };
    }

    // Verificar validade da EPI
    if (epi.validade && new Date(epi.validade) < new Date()) {
      return {
        errors: { epiId: ["EPI está vencida"] },
        message: "EPI vencida",
      };
    }

    // Criar empréstimo e atualizar estoque em uma transação
    const result = await db.$transaction(async (tx) => {
      // Atualizar estoque da EPI
      await tx.ePI.update({
        where: { id: epiId },
        data: { quantidade: { decrement: quantidadeSolicitada } },
      });

      // Criar empréstimo
      const emprestimo = await tx.emprestimo.create({
        data: {
          colaboradorId,
          epiId,
          quantidade: quantidadeSolicitada,
          dataVencimento: new Date(dataVencimento),
        },
      });

      return emprestimo;
    });

    revalidatePath("/emprestimos");
    return { success: true, message: "Empréstimo criado com sucesso!" };
  } catch (error) {
    console.error("Erro ao criar empréstimo:", error);
    return {
      message: "Erro interno do servidor. Tente novamente.",
    };
  }
}

export async function registrarDevolucao(
  prevState: DevolucaoActionState,
  formData: FormData,
): Promise<DevolucaoActionState> {
  const emprestimoId = formData.get("emprestimoId") as string;
  const quantidadeDevolvida = formData.get("quantidadeDevolvida") as string;

  const errors: DevolucaoActionState["errors"] = {};

  if (!emprestimoId) {
    errors.emprestimoId = ["ID do empréstimo é obrigatório"];
  }

  if (!quantidadeDevolvida) {
    errors.quantidadeDevolvida = ["Quantidade devolvida é obrigatória"];
  } else {
    const quant = parseInt(quantidadeDevolvida);
    if (isNaN(quant) || quant <= 0) {
      errors.quantidadeDevolvida = ["Quantidade deve ser maior que zero"];
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors, message: "Por favor, corrija os erros abaixo" };
  }

  try {
    // Buscar empréstimo
    const emprestimo = await db.emprestimo.findUnique({
      where: { id: emprestimoId },
      include: { epi: true },
    });

    if (!emprestimo) {
      return {
        errors: { emprestimoId: ["Empréstimo não encontrado"] },
        message: "Empréstimo inválido",
      };
    }

    if (emprestimo.status === "DEVOLVIDO") {
      return {
        errors: { emprestimoId: ["Este empréstimo já foi devolvido"] },
        message: "Empréstimo já devolvido",
      };
    }

    const quantDevolvida = parseInt(quantidadeDevolvida);
    if (quantDevolvida > emprestimo.quantidade) {
      return {
        errors: {
          quantidadeDevolvida: [
            `Quantidade excede o emprestado (${emprestimo.quantidade})`,
          ],
        },
        message: "Quantidade inválida",
      };
    }

    // Registrar devolução em transação
    await db.$transaction(async (tx) => {
      // Atualizar estoque da EPI
      await tx.ePI.update({
        where: { id: emprestimo.epiId },
        data: { quantidade: { increment: quantDevolvida } },
      });

      // Atualizar empréstimo
      await tx.emprestimo.update({
        where: { id: emprestimoId },
        data: {
          dataDevolucao: new Date(),
          status: "DEVOLVIDO",
          // Se devolução parcial, criar novo empréstimo com quantidade restante
          ...(quantDevolvida < emprestimo.quantidade && {
            quantidade: quantDevolvida,
          }),
        },
      });

      // Se devolução parcial, criar novo empréstimo com quantidade restante
      if (quantDevolvida < emprestimo.quantidade) {
        await tx.emprestimo.create({
          data: {
            colaboradorId: emprestimo.colaboradorId,
            epiId: emprestimo.epiId,
            quantidade: emprestimo.quantidade - quantDevolvida,
            dataEmprestimo: emprestimo.dataEmprestimo,
            dataVencimento: emprestimo.dataVencimento,
            status: "ATIVO",
          },
        });
      }
    });

    revalidatePath("/emprestimos");
    return { success: true, message: "Devolução registrada com sucesso!" };
  } catch (error) {
    console.error("Erro ao registrar devolução:", error);
    return {
      message: "Erro interno do servidor. Tente novamente.",
    };
  }
}

export async function getRelatoriosData() {
  try {
    const [
      emprestimosPorMes,
      episMaisEmprestados,
      colaboradoresMaisAtivos,
      statusEmprestimos,
      emprestimosVencidosPorMes,
      categoriasMaisEmprestadas,
      stats,
    ] = await Promise.all([
      // Empréstimos por mês (últimos 6 meses)
      db.$queryRaw<Array<{ mes: string; total: number }>>`
        SELECT 
          TO_CHAR("dataEmprestimo", 'YYYY-MM') as mes,
          COUNT(*)::int as total
        FROM "emprestimos" 
        WHERE "dataEmprestimo" >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY TO_CHAR("dataEmprestimo", 'YYYY-MM')
        ORDER BY mes
      `,

      // EPIs mais emprestados
      db.ePI.findMany({
        include: {
          _count: { select: { emprestimos: true } },
        },
        orderBy: { emprestimos: { _count: "desc" } },
        take: 8,
      }),

      // Colaboradores mais ativos
      db.colaborador.findMany({
        include: {
          _count: { select: { emprestimos: true } },
        },
        where: { ativo: true },
        orderBy: { emprestimos: { _count: "desc" } },
        take: 8,
      }),

      // Status dos empréstimos
      db.emprestimo.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),

      // Empréstimos vencidos por mês
      db.$queryRaw<Array<{ mes: string; total: number }>>`
        SELECT 
          TO_CHAR("dataVencimento", 'YYYY-MM') as mes,
          COUNT(*)::int as total
        FROM "emprestimos" 
        WHERE "dataVencimento" >= CURRENT_DATE - INTERVAL '6 months'
          AND "status" = 'ATIVO'
          AND "dataVencimento" < CURRENT_DATE
        GROUP BY TO_CHAR("dataVencimento", 'YYYY-MM')
        ORDER BY mes
      `,

      // Categorias mais emprestadas
      db.$queryRaw<Array<{ categoria: string; total: number }>>`
        SELECT 
          e."categoria",
          COUNT(*)::int as total
        FROM "emprestimos" emp
        JOIN "EPI" e ON emp."epiId" = e.id
        WHERE emp."dataEmprestimo" >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY e."categoria"
        ORDER BY total DESC
        LIMIT 6
      `,

      // Estatísticas gerais
      Promise.all([
        db.emprestimo.count(),
        db.emprestimo.count({ where: { status: "ATIVO" } }),
        db.emprestimo.count({
          where: { status: "ATIVO", dataVencimento: { lt: new Date() } },
        }),
        db.colaborador.count({ where: { ativo: true } }),
        db.ePI.count(),
        db.ePI.count({ where: { quantidade: { lt: 5 } } }),
      ]),
    ]);

    return {
      emprestimosPorMes,
      episMaisEmprestados,
      colaboradoresMaisAtivos,
      statusEmprestimos,
      emprestimosVencidosPorMes,
      categoriasMaisEmprestadas,
      stats,
    };
  } catch (error) {
    console.error("Erro ao buscar dados dos relatórios:", error);
    throw new Error("Falha ao carregar dados dos relatórios");
  }
}
