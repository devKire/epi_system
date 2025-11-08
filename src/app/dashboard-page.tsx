import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  Package,
  Plus,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";
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

const DashboardPage = async () => {
  // Buscar estatísticas do sistema
  const [
    totalColaboradores,
    colaboradoresAtivos,
    totalEPIs,
    emprestimosAtivos,
    emprestimosVencidos,
    episBaixoEstoque,
    episCriticosCount,
  ] = await Promise.all([
    db.colaborador.count(),
    db.colaborador.count({ where: { ativo: true } }),
    db.ePI.count(),
    db.emprestimo.count({ where: { status: "ATIVO" } }),
    db.emprestimo.count({
      where: {
        status: "ATIVO",
        dataVencimento: { lt: new Date() },
      },
    }),
    db.ePI.count({ where: { quantidade: { lt: 10 } } }),
    db.ePI.count({ where: { quantidade: { lt: 5 } } }),
  ]);

  // Buscar últimos empréstimos
  const ultimosEmprestimos = await db.emprestimo.findMany({
    take: 5,
    where: { status: "ATIVO" },
    include: {
      colaborador: { select: { nome: true, matricula: true } },
      epi: { select: { nome: true, categoria: true } },
    },
    orderBy: { dataEmprestimo: "desc" },
  });

  // Buscar EPIs com estoque crítico
  const episCriticos = await db.ePI.findMany({
    take: 5,
    where: { quantidade: { lt: 5 } },
    orderBy: { quantidade: "asc" },
  });

  // Buscar empréstimos próximos do vencimento (próximos 3 dias)
  const emprestimosProximosVencimento = await db.emprestimo.findMany({
    take: 5,
    where: {
      status: "ATIVO",
      dataVencimento: {
        gte: new Date(),
        lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias
      },
    },
    include: {
      colaborador: { select: { nome: true, matricula: true } },
      epi: { select: { nome: true } },
    },
    orderBy: { dataVencimento: "asc" },
  });

  const statsCards = [
    {
      title: "Colaboradores Ativos",
      value: colaboradoresAtivos,
      description: `Total: ${totalColaboradores}`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      href: "/colaboradores",
    },
    {
      title: "Total de EPIs",
      value: totalEPIs,
      description: `${episBaixoEstoque} com estoque baixo`,
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-100",
      href: "/epis",
    },
    {
      title: "Empréstimos Ativos",
      value: emprestimosAtivos,
      description: `${emprestimosVencidos} vencidos`,
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      href: "/emprestimos",
    },
    {
      title: "Estoque Crítico",
      value: episCriticosCount,
      description: "Menos de 5 unidades",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      href: "/epis?estoque=critico",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de gestão de EPIs
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button asChild className="sm:w-auto">
            <Link href="/emprestimos/novo">
              <UserCheck className="mr-2 h-4 w-4" />
              Novo Empréstimo
            </Link>
          </Button>
          <Button variant="outline" asChild className="sm:w-auto">
            <Link href="/epis/novo">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar EPI
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-muted-foreground text-xs">
                    {stat.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-8 w-8 p-0"
                >
                  <Link href={stat.href}>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Últimos Empréstimos */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Últimos Empréstimos
            </CardTitle>
            <CardDescription>
              Empréstimos realizados recentemente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ultimosEmprestimos.length === 0 ? (
              <div className="py-8 text-center">
                <Package className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">
                  Nenhum empréstimo encontrado
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ultimosEmprestimos.map((emprestimo) => {
                  const isVencido =
                    new Date(emprestimo.dataVencimento) < new Date();
                  const isProximoVencimento =
                    new Date(emprestimo.dataVencimento) <=
                    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                  return (
                    <div
                      key={emprestimo.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {emprestimo.colaborador.nome}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {emprestimo.epi.nome} • {emprestimo.quantidade}x
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {emprestimo.dataEmprestimo.toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                      </div>
                      <Badge
                        variant={
                          isVencido
                            ? "destructive"
                            : isProximoVencimento
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {new Date(emprestimo.dataVencimento).toLocaleDateString(
                          "pt-BR",
                        )}
                        {isVencido && <AlertCircle className="ml-1 h-3 w-3" />}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-4 border-t pt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/emprestimos">Ver todos os empréstimos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - Alertas e Ações */}
        <div className="space-y-6 lg:col-span-3">
          {/* Estoque Crítico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Estoque Crítico
                {episCriticos.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {episCriticos.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                EPIs com menos de 5 unidades em estoque
              </CardDescription>
            </CardHeader>
            <CardContent>
              {episCriticos.length === 0 ? (
                <div className="py-4 text-center">
                  <Shield className="mx-auto mb-2 h-12 w-12 text-green-500" />
                  <p className="text-muted-foreground">Estoque em dia</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {episCriticos.map((epi) => (
                    <div
                      key={epi.id}
                      className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{epi.nome}</p>
                        <p className="text-muted-foreground text-xs">
                          {epi.categoria}
                        </p>
                      </div>
                      <Badge variant="destructive">{epi.quantidade} un</Badge>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/epis?estoque=critico">Gerenciar estoque</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Próximos Vencimentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-600" />
                Próximos Vencimentos
              </CardTitle>
              <CardDescription>
                Empréstimos que vencem nos próximos 3 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emprestimosProximosVencimento.length === 0 ? (
                <div className="py-4 text-center">
                  <Calendar className="text-muted-foreground/50 mx-auto mb-2 h-12 w-12" />
                  <p className="text-muted-foreground">
                    Nenhum vencimento próximo
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {emprestimosProximosVencimento.map((emprestimo) => (
                    <div
                      key={emprestimo.id}
                      className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {emprestimo.colaborador.nome}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {emprestimo.epi.nome}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {new Date(emprestimo.dataVencimento).toLocaleDateString(
                          "pt-BR",
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/emprestimos?status=proximo-vencimento">
                    Ver todos
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades principais do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <Link href="/colaboradores/novo">
                <Users className="h-6 w-6" />
                <span className="text-sm">Novo Colaborador</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <Link href="/emprestimos/devolucao">
                <Package className="h-6 w-6" />
                <span className="text-sm">Registrar Devolução</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <Link href="/relatorios">
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Relatórios</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              asChild
            >
              <Link href="/epis">
                <Shield className="h-6 w-6" />
                <span className="text-sm">Gerenciar EPIs</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
