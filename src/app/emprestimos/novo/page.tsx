import { db } from "@/lib/prisma";

import NovoEmprestimoForm from "./novo-form";

export default async function NovoEmprestimoPage() {
  // Buscar colaboradores ativos e EPIs com estoque
  const [colaboradores, epis] = await Promise.all([
    db.colaborador.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    }),
    db.ePI.findMany({
      where: {
        quantidade: { gt: 0 },
        OR: [{ validade: null }, { validade: { gt: new Date() } }],
      },
      orderBy: { nome: "asc" },
    }),
  ]);

  return <NovoEmprestimoForm colaboradores={colaboradores} epis={epis} />;
}
