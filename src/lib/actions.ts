/* eslint-disable @typescript-eslint/no-explicit-any */
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
    avatarUrl?: string[];
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
    status?: string[];
    dataDevolucao?: string[];
    observacaoDevolucao?: string[];
  };
};

export type DevolucaoActionState = {
  success?: boolean;
  message?: string;
  errors?: {
    emprestimoId?: string[];
    quantidadeDevolvida?: string[];
    status?: string[];
    dataDevolucao?: string[];
  };
};

export async function createColaborador(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Extrair dados do form
  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const avatarUrl = formData.get("avatarUrl") as string;
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

  if (!avatarUrl || avatarUrl.trim().length < 5) {
    errors.avatarUrl = ["URL da foto de perfil é obrigatória"];
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
    const result = await db.$transaction(async (tx:any) => {
      // Criar colaborador
      const colaborador = await tx.colaborador.create({
        data: {
          nome: nome.trim(),
          email: email.trim().toLowerCase(),
          avatarUrl: avatarUrl.trim(),
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
  const avatarUrl = formData.get("avatarUrl") as string;
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

  if (!avatarUrl || avatarUrl.trim().length < 5) {
    errors.avatarUrl = ["URL da foto de perfil é obrigatória"];
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
        avatarUrl: avatarUrl.trim(),
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
        status: "EMPRESTADO",
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
        status: "EMPRESTADO",
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
  const status = (formData.get("status") as string) || "EMPRESTADO";
  const observacao = formData.get("observacao") as string;

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

  // Validar status
  const statusPermitidos = ["EMPRESTADO", "EM_USO", "FORNECIDO"];
  if (status && !statusPermitidos.includes(status)) {
    errors.status = ["Status inválido para novo empréstimo"];
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
    
    // Só verifica estoque se não for status FORNECIDO
    if (status !== "FORNECIDO") {
      if (epi.quantidade < quantidadeSolicitada) {
        return {
          errors: {
            quantidade: [`Estoque insuficiente. Disponível: ${epi.quantidade}`],
          },
          message: "Estoque insuficiente",
        };
      }
    }

    // Verificar validade da EPI (exceto para FORNECIDO)
    if (epi.validade && new Date(epi.validade) < new Date() && status !== "FORNECIDO") {
      return {
        errors: { epiId: ["EPI está vencida"] },
        message: "EPI vencida",
      };
    }

    // Criar empréstimo e atualizar estoque em uma transação
    const result = await db.$transaction(async (tx: any) => {
      // Se não for FORNECIDO, atualizar estoque da EPI
      if (status !== "FORNECIDO") {
        await tx.ePI.update({
          where: { id: epiId },
          data: { quantidade: { decrement: quantidadeSolicitada } },
        });
      }

      // Criar empréstimo
      const emprestimo = await tx.emprestimo.create({
        data: {
          colaboradorId,
          epiId,
          quantidade: quantidadeSolicitada,
          dataVencimento: new Date(dataVencimento),
          status: status as any,
          observacao,
          // Se for FORNECIDO, já define data de devolução como nula permanente
          dataDevolucao: status === "FORNECIDO" ? null : undefined,
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

export async function updateEmprestimo(
  id: string,
  prevState: EmprestimoActionState,
  formData: FormData,
): Promise<EmprestimoActionState> {
  const status = formData.get("status") as string;
  const dataDevolucao = formData.get("dataDevolucao") as string;
  const observacaoDevolucao = formData.get("observacaoDevolucao") as string;
  const observacao = formData.get("observacao") as string;

  const errors: EmprestimoActionState["errors"] = {};

  if (!status) {
    errors.status = ["Status é obrigatório"];
  }

  // Validar datas quando status for de devolução
  const statusDevolucao = ["DEVOLVIDO", "DANIFICADO", "PERDIDO"];
  if (statusDevolucao.includes(status)) {
    if (!dataDevolucao) {
      errors.dataDevolucao = ["Data de devolução é obrigatória para este status"];
    } else {
      const dataDev = new Date(dataDevolucao);
      if (isNaN(dataDev.getTime())) {
        errors.dataDevolucao = ["Data de devolução inválida"];
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors, message: "Por favor, corrija os erros abaixo" };
  }

  try {
    // Buscar empréstimo atual
    const emprestimo = await db.emprestimo.findUnique({
      where: { id },
      include: { epi: true },
    });

    if (!emprestimo) {
      return {
        errors: { status: ["Empréstimo não encontrado"] },
        message: "Empréstimo inválido",
      };
    }

    const dataUpdate: any = {
      status: status as any,
      observacao,
    };

    // Se for status de devolução, atualizar dataDevolucao e observacaoDevolucao
    if (statusDevolucao.includes(status)) {
      dataUpdate.dataDevolucao = new Date(dataDevolucao);
      dataUpdate.observacaoDevolucao = observacaoDevolucao;
      
      // Se não for FORNECIDO e está sendo devolvido, restaurar estoque
      if (emprestimo.status !== "FORNECIDO" && 
          !["DEVOLVIDO", "DANIFICADO", "PERDIDO"].includes(emprestimo.status)) {
        await db.ePI.update({
          where: { id: emprestimo.epiId },
          data: { quantidade: { increment: emprestimo.quantidade } },
        });
      }
    }

    await db.emprestimo.update({
      where: { id },
      data: dataUpdate,
    });

    revalidatePath("/emprestimos");
    revalidatePath(`/emprestimos/${id}`);
    return { success: true, message: "Empréstimo atualizado com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar empréstimo:", error);
    return {
      message: "Erro interno do servidor. Tente novamente.",
    };
  }
}

export async function getEmprestimoById(id: string) {
  try {
    const emprestimo = await db.emprestimo.findUnique({
      where: { id },
      include: {
        colaborador: { select: { nome: true, matricula: true } },
        epi: { select: { nome: true, categoria: true, validade: true } },
      },
    });
    
    return emprestimo;
  } catch (error) {
    console.error("Erro ao buscar empréstimo:", error);
    return null;
  }
}

// No seu arquivo de server actions (lib/actions.ts)
export async function registrarDevolucao(
  prevState: DevolucaoActionState,
  formData: FormData,
): Promise<DevolucaoActionState> {
  const emprestimoId = formData.get("emprestimoId") as string;
  const quantidadeDevolvida = formData.get("quantidadeDevolvida") as string;
  const status = formData.get("status") as string;
  const dataDevolucao = formData.get("dataDevolucao") as string;
  const observacaoDevolucao = formData.get("observacaoDevolucao") as string;
  const observacao = formData.get("observacao") as string;

  const errors: DevolucaoActionState["errors"] = {};

  // Validações
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

  if (!status) {
    errors.status = ["Status é obrigatório"];
  } else if (!["DEVOLVIDO", "DANIFICADO", "PERDIDO"].includes(status)) {
    errors.status = ["Status de devolução inválido"];
  }

  // Validar data de devolução para status de devolução
  const statusDevolucao = ["DEVOLVIDO", "DANIFICADO", "PERDIDO"];
  if (statusDevolucao.includes(status)) {
    if (!dataDevolucao) {
      errors.dataDevolucao = ["Data de devolução é obrigatória"];
    } else {
      const dataDev = new Date(dataDevolucao);
      if (isNaN(dataDev.getTime())) {
        errors.dataDevolucao = ["Data de devolução inválida"];
      } else if (dataDev > new Date()) {
        errors.dataDevolucao = ["Data de devolução não pode ser futura"];
      }
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

    // Verificar se já está em status de devolução
    if (["DEVOLVIDO", "DANIFICADO", "PERDIDO"].includes(emprestimo.status)) {
      return {
        errors: { emprestimoId: ["Este empréstimo já foi finalizado"] },
        message: "Empréstimo já finalizado",
      };
    }

    // Verificar se é FORNECIDO (não pode devolver)
    if (emprestimo.status === "FORNECIDO") {
      return {
        errors: { emprestimoId: ["EPI fornecido permanentemente não pode ser devolvido"] },
        message: "EPI fornecido permanentemente",
      };
    }

    const quantDevolvida = parseInt(quantidadeDevolvida);
    
    // Verificar quantidade
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
    await db.$transaction(async (tx : any) => {
      // Para status de devolução, restaurar estoque (exceto PERDIDO)
      if (status !== "PERDIDO" && emprestimo.status !== "FORNECIDO") {
        await tx.ePI.update({
          where: { id: emprestimo.epiId },
          data: { quantidade: { increment: quantDevolvida } },
        });
      }

      // Dados para atualização
      const updateData: any = {
        status: status as any,
        observacao: observacao || emprestimo.observacao,
      };

      // Adicionar dados específicos de devolução
      if (statusDevolucao.includes(status)) {
        updateData.dataDevolucao = new Date(dataDevolucao);
        updateData.observacaoDevolucao = observacaoDevolucao;
      }

      // Se devolução parcial, atualizar quantidade e criar novo registro
      if (quantDevolvida < emprestimo.quantidade) {
        updateData.quantidade = quantDevolvida;
        
        // Criar novo registro com quantidade restante
        await tx.emprestimo.create({
          data: {
            colaboradorId: emprestimo.colaboradorId,
            epiId: emprestimo.epiId,
            quantidade: emprestimo.quantidade - quantDevolvida,
            dataEmprestimo: emprestimo.dataEmprestimo,
            dataVencimento: emprestimo.dataVencimento,
            status: emprestimo.status, // Mantém o status original
            observacao: emprestimo.observacao,
          },
        });
      }

      // Atualizar empréstimo original
      await tx.emprestimo.update({
        where: { id: emprestimoId },
        data: updateData,
      });
    });

    revalidatePath("/emprestimos");
    return { 
      success: true, 
      message: `Devolução registrada com sucesso! Status: ${
        status === "DEVOLVIDO" ? "Devolvido" :
        status === "DANIFICADO" ? "Danificado" : "Perdido"
      }` 
    };
  } catch (error) {
    console.error("Erro ao registrar devolução:", error);
    return {
      message: "Erro interno do servidor. Tente novamente.",
    };
  }
}


export async function getRelatoriosData() {
  try {
    // Contagens básicas
    const totalEPIs = await db.ePI.count()
    const totalEmprestimos = await db.emprestimo.count()
    const colaboradoresAtivos = await db.colaborador.count({
      where: { ativo: true }
    })

    // Empréstimos por status
    const emprestimosPorStatus = await db.emprestimo.groupBy({
      by: ['status'],
      _count: true,
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // Empréstimos por mês (últimos 6 meses)
    const seisMesesAtras = new Date()
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6)

    const emprestimosPorMes = await db.emprestimo.groupBy({
      by: ['dataEmprestimo'],
      _count: true,
      where: {
        dataEmprestimo: {
          gte: seisMesesAtras
        }
      },
      orderBy: {
        dataEmprestimo: 'asc'
      }
    })

    // EPIs por categoria
    const episPorCategoria = await db.ePI.groupBy({
      by: ['categoria'],
      _sum: {
        quantidade: true
      },
      orderBy: {
        _sum: {
          quantidade: 'desc'
        }
      }
    })

    // Top colaboradores (mais empréstimos)
    const topColaboradores = await db.emprestimo.groupBy({
      by: ['colaboradorId'],
      _count: true,
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    })

    // EPIs com baixo estoque (< 10)
    const episBaixoEstoque = await db.ePI.findMany({
      where: {
        quantidade: {
          lt: 10
        }
      },
      orderBy: {
        quantidade: 'asc'
      }
    })

    // Empréstimos atrasados
    const hoje = new Date()
    const emprestimosAtrasados = await db.emprestimo.findMany({
      where: {
        dataVencimento: {
          lt: hoje
        },
        status: {
          in: ['EMPRESTADO', 'EM_USO', 'FORNECIDO']
        }
      },
      include: {
        colaborador: true,
        epi: true
      }
    })

    // Empréstimos ativos
    const emprestimosAtivos = await db.emprestimo.count({
      where: {
        status: {
          in: ['EMPRESTADO', 'EM_USO', 'FORNECIDO']
        }
      }
    })

    // Empréstimos concluídos
    const emprestimosConcluidos = await db.emprestimo.count({
      where: {
        status: 'DEVOLVIDO'
      }
    })

    // Formatar os dados para resposta
    const resultado = {
      estatisticas: {
        totalEPIs,
        totalEmprestimos,
        colaboradoresAtivos,
        emprestimosAtrasados: emprestimosAtrasados.length,
        emprestimosAtivos,
        emprestimosConcluidos
      },
      emprestimosPorStatus: emprestimosPorStatus.map((item: any)  => ({
        status: item.status,
        quantidade: item._count
      })),
      emprestimosPorMes: emprestimosPorMes.map((item: any)  => {
        const data = new Date(item.dataEmprestimo)
        return {
          mes: `${data.getMonth() + 1}/${data.getFullYear()}`,
          quantidade: item._count
        }
      }).slice(-6), // Últimos 6 meses
      episPorCategoria: episPorCategoria.map((item: any) => ({
        categoria: item.categoria,
        quantidade: item._sum.quantidade || 0
      })),
      topColaboradores: await Promise.all(
        topColaboradores.map(async (item : any) => {
          const colaborador = await db.colaborador.findUnique({
            where: { id: item.colaboradorId }
          })
          return {
            nome: colaborador?.nome || 'Desconhecido',
            quantidade: item._count
          }
        })
      ),
      episBaixoEstoque: episBaixoEstoque.map((item: any)  => ({
        nome: item.nome,
        quantidade: item.quantidade,
        categoria: item.categoria
      })),
      emprestimosAtrasadosDetalhes: emprestimosAtrasados.map((item: any)  => {
        const diasAtraso = Math.floor(
          (hoje.getTime() - item.dataVencimento.getTime()) / (1000 * 60 * 60 * 24)
        )
        return {
          colaborador: item.colaborador.nome,
          epi: item.epi.nome,
          dataVencimento: item.dataVencimento.toISOString(),
          diasAtraso
        }
      })
    }

    return {
      success: true,
      data: resultado
    }
  } catch (error) {
    console.error("Erro ao buscar dados para relatórios:", error)
    return {
      success: false,
      error: "Erro ao carregar dados dos relatórios"
    }
  }
}