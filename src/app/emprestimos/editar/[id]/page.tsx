// epi_system\src\app\emprestimos\editar\[id]\page.tsx
import { notFound } from "next/navigation";

import { db } from "@/lib/prisma";

import EditarEmprestimoForm from "./editar-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarEmprestimoPage(props: PageProps) {
  const params = await props.params;
  const { id } = params;
  
  const emprestimo = await db.emprestimo.findUnique({
    where: { id },
    include: {
      colaborador: true,
      epi: true,
    },
  });

  if (!emprestimo) {
    notFound();
  }

  return <EditarEmprestimoForm emprestimo={emprestimo} />;
}