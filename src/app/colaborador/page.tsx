import { AlertTriangle, Calendar, Package } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

export default async function ColaboradorPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Buscar dados do colaborador baseado no email do usuário logado
  const colaborador = await db.colaborador.findUnique({
    where: {
      email: session.user.email,
    },
    include: {
      emprestimos: {
        where: {
          status: "ATIVO",
        },
        include: {
          epi: true,
        },
        orderBy: {
          dataVencimento: "asc",
        },
      },
    },
  });

  if (!colaborador) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="py-8 text-center">
              <h2 className="mb-2 text-xl font-bold">
                Colaborador não encontrado
              </h2>
              <p className="text-muted-foreground">
                Seu email não está cadastrado como colaborador.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const emprestimosVencidos = colaborador.emprestimos.filter(
    (emp) => new Date(emp.dataVencimento) < new Date(),
  );

  const emprestimosProximos = colaborador.emprestimos.filter((emp) => {
    const diasParaVencer = Math.ceil(
      (new Date(emp.dataVencimento).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return diasParaVencer <= 7 && diasParaVencer > 0;
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Empréstimos</h1>
          <p className="text-muted-foreground">Bem-vindo, {colaborador.nome}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground text-sm">
            {colaborador.matricula}
          </p>
          <p className="text-muted-foreground text-sm">{colaborador.cargo}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Empréstimos Ativos
            </CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {colaborador.emprestimos.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próximos do Vencimento
            </CardTitle>
            <Calendar className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {emprestimosProximos.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {emprestimosVencidos.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Empréstimos */}
      <Card>
        <CardHeader>
          <CardTitle>Meus EPIs Emprestados</CardTitle>
          <CardDescription>
            {colaborador.emprestimos.length} empréstimo(s) ativo(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {colaborador.emprestimos.map((emprestimo) => {
              const isVencido =
                new Date(emprestimo.dataVencimento) < new Date();
              const diasParaVencer = Math.ceil(
                (new Date(emprestimo.dataVencimento).getTime() -
                  new Date().getTime()) /
                  (1000 * 60 * 60 * 24),
              );

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
                      <h3 className="font-semibold">{emprestimo.epi.nome}</h3>
                      <p className="text-muted-foreground text-sm">
                        {emprestimo.epi.categoria} • {emprestimo.quantidade}x
                      </p>
                      <div className="mt-1 flex items-center space-x-2">
                        <Badge
                          variant={
                            isVencido
                              ? "destructive"
                              : diasParaVencer <= 7
                                ? "secondary"
                                : "default"
                          }
                        >
                          {isVencido
                            ? "Vencido"
                            : diasParaVencer <= 7
                              ? `Vence em ${diasParaVencer} dias`
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
                </div>
              );
            })}

            {colaborador.emprestimos.length === 0 && (
              <div className="py-8 text-center">
                <Package className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">Nenhum empréstimo ativo</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {(emprestimosVencidos.length > 0 || emprestimosProximos.length > 0) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Alertas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {emprestimosVencidos.length > 0 && (
              <p className="text-red-700">
                ⚠️ Você tem {emprestimosVencidos.length} EPI(s) com devolução
                vencida. Regularize sua situação o mais breve possível.
              </p>
            )}
            {emprestimosProximos.length > 0 && (
              <p className="text-amber-700">
                📅 Você tem {emprestimosProximos.length} EPI(s) com vencimento
                próximo (até 7 dias). Prepare-se para a devolução.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
