import { notFound } from "next/navigation";

import { db } from "@/lib/prisma";

import EditarColaboradorForm from "./editar-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarColaboradorPage({ params }: PageProps) {
  const { id } = await params; // 👈 await params aqui

  const colaborador = await db.colaborador.findUnique({
    where: { id },
  });

  if (!colaborador) {
    notFound();
  }

  return <EditarColaboradorForm colaborador={colaborador} />;
}
