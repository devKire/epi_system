import { notFound } from "next/navigation";

import { db } from "@/lib/prisma";

import EditarColaboradorForm from "./editar-form";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditarColaboradorPage({ params }: PageProps) {
  const colaborador = await db.colaborador.findUnique({
    where: { id: params.id },
  });

  if (!colaborador) {
    notFound();
  }

  return <EditarColaboradorForm colaborador={colaborador} />;
}
