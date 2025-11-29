import { Edit, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/prisma";

import DeleteColaboradorButton from "./delete-colaborador-button";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ColaboradoresListPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const search = searchParams.search as string;
  const status = searchParams.status as string;

  const colaboradores = await db.colaborador.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { nome: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { matricula: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        status === "inativo"
          ? { ativo: false }
          : status === "ativo"
            ? { ativo: true }
            : {},
      ],
    },
    orderBy: { nome: "asc" },
    include: {
      _count: {
        select: {
          emprestimos: {
            where: { status: "ATIVO" },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Colaboradores</h1>
          <p className="text-muted-foreground">
            Gerencie os colaboradores do sistema
          </p>
        </div>
        <Button asChild>
          <Link href="/colaboradores/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Colaborador
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Colaboradores</CardTitle>
          <CardDescription>
            {colaboradores.length} colaborador(es) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {colaboradores.map((colaborador) => (
              <div
                key={colaborador.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 justify-centershadow-smborder border-primary/5 flex items-center rounded-full p-1">
                    <Image
                      src={colaborador.avatarUrl}
                      alt={colaborador.nome}
                      width={64}
                      height={64}
                      className="h-8 w-8 rounded-full border border-white/20 object-cover sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-12 lg:w-12"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{colaborador.nome}</h3>
                    <p className="text-muted-foreground text-sm">
                      {colaborador.email} • {colaborador.matricula}
                    </p>
                    <div className="mt-1 flex items-center space-x-2">
                      <Badge
                        variant={colaborador.ativo ? "default" : "secondary"}
                      >
                        {colaborador.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                      <Badge variant="outline">
                        {colaborador._count.emprestimos} empréstimo(s) ativo(s)
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/colaboradores/${colaborador.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <DeleteColaboradorButton colaboradorId={colaborador.id} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
