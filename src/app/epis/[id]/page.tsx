import { notFound } from "next/navigation";

import { db } from "@/lib/prisma";

import EditarEPIForm from "./editar-form";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditarEPIPage({ params }: PageProps) {
  const epi = await db.ePI.findUnique({
    where: { id: params.id },
  });

  if (!epi) {
    notFound();
  }

  return <EditarEPIForm epi={epi} />;
}
