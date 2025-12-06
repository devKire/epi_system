//epi_system\src\app\epis\[id]\page.tsx

import { notFound } from "next/navigation";

import { db } from "@/lib/prisma";

import EditarEPIForm from "./editar-form";

// Use the built-in types from Next.js
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarEPIPage(props: PageProps) {
  const params = await props.params;
  const { id } = params;
  
  const epi = await db.ePI.findUnique({
    where: { id },
  });

  if (!epi) {
    notFound();
  }

  return <EditarEPIForm epi={epi} />;
}