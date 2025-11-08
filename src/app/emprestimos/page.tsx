import { Calendar, Package, Plus, UserCheck } from "lucide-react";
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

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EmprestimosPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const status = searchParams.status as string;

  const emprestimos = await db.emprestimo.findMany({
    where: {
      AND: [
        status === "vencido"
          ? {
              status: "ATIVO",
              dataVencimento: { lt: new Date() },
            }
          : {},
        status === "ativo" ? { status: "ATIVO" } : {},
        status === "devolvido" ? { status: "DEVOLVIDO" } : {},
      ],
    },
    include: {
      colaborador: { select: { nome: true, matricula: true } },
      epi: { select: { nome: true, categoria: true } },
    },
    orderBy: { dataEmprestimo: "desc" },
  });

  const stats = await Promise.all([
    db.emprestimo.count({ where: { status: "ATIVO" } }),
    db.emprestimo.count({
      where: {
        status: "ATIVO",
        dataVencimento: { lt: new Date() },
      },
    }),
    db.emprestimo.count({ where: { status: "DEVOLVIDO" } }),
  ]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Empréstimos</h1>
          <p className="text-muted-foreground">
            Gerencie os empréstimos de EPIs
          </p>
        </div>
        <Button asChild>
          <Link href="/emprestimos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Empréstimo
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[0]}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats[1]}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devolvidos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats[2]}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Empréstimos</CardTitle>
          <CardDescription>
            {emprestimos.length} empréstimo(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emprestimos.map((emprestimo) => {
              const isVencido =
                emprestimo.status === "ATIVO" &&
                new Date(emprestimo.dataVencimento) < new Date();

              return (
                <div
                  key={emprestimo.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 rounded-full p-2">
                      <Package className="text-primary h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {emprestimo.colaborador.nome}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {emprestimo.epi.nome} • {emprestimo.quantidade}x
                      </p>
                      <div className="mt-1 flex items-center space-x-2">
                        <Badge
                          variant={
                            emprestimo.status === "DEVOLVIDO"
                              ? "default"
                              : isVencido
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {emprestimo.status === "DEVOLVIDO"
                            ? "Devolvido"
                            : isVencido
                              ? "Vencido"
                              : "Ativo"}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          Empréstimo:{" "}
                          {new Date(
                            emprestimo.dataEmprestimo,
                          ).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          Vencimento:{" "}
                          {new Date(
                            emprestimo.dataVencimento,
                          ).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {emprestimo.status === "ATIVO" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/emprestimos/devolucao?emprestimoId=${emprestimo.id}`}
                        >
                          Registrar Devolução
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
