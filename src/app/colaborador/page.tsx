// epi_system\src\app\colaborador\page.tsx

import { AlertTriangle, Calendar, Filter, History, Package } from "lucide-react";
import Image from "next/image";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/prisma";

import { Navbar } from "../components/navbar";

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
        include: {
          epi: true,
        },
        orderBy: {
          dataEmprestimo: "desc",
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

  // Filtrar empréstimos
  const emprestimosAtivos = colaborador.emprestimos.filter(
    (emp) => emp.status === "EMPRESTADO" || emp.status === "EM_USO" || emp.status === "FORNECIDO"
  );

  const emprestimosFinalizados = colaborador.emprestimos.filter(
    (emp) => emp.status === "DEVOLVIDO" || emp.status === "DANIFICADO" || emp.status === "PERDIDO"
  );

  const emprestimosVencidos = emprestimosAtivos.filter(
    (emp) => new Date(emp.dataVencimento) < new Date()
  );

  const emprestimosProximos = emprestimosAtivos.filter((emp) => {
    const diasParaVencer = Math.ceil(
      (new Date(emp.dataVencimento).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return diasParaVencer <= 7 && diasParaVencer > 0;
  });

  // Função para obter a cor do badge baseado no status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "EMPRESTADO":
        return "default";
      case "EM_USO":
        return "secondary";
      case "FORNECIDO":
        return "outline";
      case "DEVOLVIDO":
        return "secondary";
      case "DANIFICADO":
        return "destructive";
      case "PERDIDO":
        return "destructive";
      default:
        return "default";
    }
  };

  // Função para traduzir o status
  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      EMPRESTADO: "Emprestado",
      EM_USO: "Em Uso",
      FORNECIDO: "Fornecido",
      DEVOLVIDO: "Devolvido",
      DANIFICADO: "Danificado",
      PERDIDO: "Perdido",
    };
    return statusMap[status] || status;
  };

  return (
    <>
      <Navbar />
      <div className="space-y-6 p-6">
        {/* Header do Colaborador */}
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={colaborador.avatarUrl}
              alt="Foto de Perfil"
              width={100}
              height={100}
              className="rounded-full object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold">Meus Empréstimos</h1>
              <p className="text-muted-foreground">
                Bem-vindo, {colaborador.nome}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={colaborador.ativo ? "default" : "secondary"}>
                  {colaborador.ativo ? "Ativo" : "Inativo"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {colaborador.matricula} • {colaborador.cargo}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Total de empréstimos: {colaborador.emprestimos.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Desde {new Date(colaborador.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Empréstimos Ativos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {emprestimosAtivos.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {colaborador.emprestimos.filter(emp => emp.status === "EM_USO").length} em uso
              </p>
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
              <p className="text-xs text-muted-foreground">Vence em até 7 dias</p>
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
              <p className="text-xs text-muted-foreground">Precisa regularizar</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Histórico</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {emprestimosFinalizados.length}
              </div>
              <p className="text-xs text-muted-foreground">Empréstimos finalizados</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para Empréstimos Ativos e Histórico */}
        <Tabs defaultValue="ativos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ativos" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Ativos ({emprestimosAtivos.length})
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico ({emprestimosFinalizados.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab de Empréstimos Ativos */}
          <TabsContent value="ativos">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Meus EPIs Ativos</CardTitle>
                  <CardDescription>
                    {emprestimosAtivos.length} empréstimo(s) ativo(s)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="EMPRESTADO">Emprestado</SelectItem>
                      <SelectItem value="EM_USO">Em Uso</SelectItem>
                      <SelectItem value="FORNECIDO">Fornecido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emprestimosAtivos.map((emprestimo) => {
                    const isVencido =
                      new Date(emprestimo.dataVencimento) < new Date();
                    const diasParaVencer = Math.ceil(
                      (new Date(emprestimo.dataVencimento).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                    return (
                      <div
                        key={emprestimo.id}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{emprestimo.epi.nome}</h3>
                              <Badge variant={getStatusBadgeVariant(emprestimo.status)}>
                                {translateStatus(emprestimo.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {emprestimo.epi.categoria} • {emprestimo.quantidade}x
                              {emprestimo.observacao && (
                                <span className="ml-2 text-xs">
                                  Obs: {emprestimo.observacao}
                                </span>
                              )}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-4">
                              <Badge
                                variant={
                                  isVencido
                                    ? "destructive"
                                    : diasParaVencer <= 7
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-xs"
                              >
                                {isVencido
                                  ? `Vencido há ${Math.abs(diasParaVencer)} dias`
                                  : diasParaVencer <= 7
                                    ? `Vence em ${diasParaVencer} dias`
                                    : `Vence em ${diasParaVencer} dias`}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Empréstimo:{" "}
                                {new Date(
                                  emprestimo.dataEmprestimo
                                ).toLocaleDateString("pt-BR")}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Vencimento:{" "}
                                {new Date(
                                  emprestimo.dataVencimento
                                ).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {emprestimosAtivos.length === 0 && (
                    <div className="py-8 text-center">
                      <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        Nenhum empréstimo ativo
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Histórico */}
          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Empréstimos</CardTitle>
                <CardDescription>
                  {emprestimosFinalizados.length} empréstimo(s) finalizado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emprestimosFinalizados.map((emprestimo) => (
                    <div
                      key={emprestimo.id}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`rounded-full p-2 ${
                          emprestimo.status === "DEVOLVIDO" 
                            ? "bg-green-100" 
                            : "bg-red-100"
                        }`}>
                          <Package className={`h-6 w-6 ${
                            emprestimo.status === "DEVOLVIDO" 
                              ? "text-green-600" 
                              : "text-red-600"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{emprestimo.epi.nome}</h3>
                            <Badge variant={getStatusBadgeVariant(emprestimo.status)}>
                              {translateStatus(emprestimo.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {emprestimo.epi.categoria} • {emprestimo.quantidade}x
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-4">
                            <span className="text-xs text-muted-foreground">
                              Empréstimo:{" "}
                              {new Date(
                                emprestimo.dataEmprestimo
                              ).toLocaleDateString("pt-BR")}
                            </span>
                            {emprestimo.dataDevolucao && (
                              <span className="text-xs text-muted-foreground">
                                Devolução:{" "}
                                {new Date(
                                  emprestimo.dataDevolucao
                                ).toLocaleDateString("pt-BR")}
                              </span>
                            )}
                            {emprestimo.observacaoDevolucao && (
                              <span className="text-xs text-muted-foreground">
                                Obs devolução: {emprestimo.observacaoDevolucao}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {emprestimosFinalizados.length === 0 && (
                    <div className="py-8 text-center">
                      <History className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        Nenhum empréstimo no histórico
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Alertas - Apenas se houver empréstimos ativos com problemas */}
        {(emprestimosVencidos.length > 0 || emprestimosProximos.length > 0) && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-800">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Alertas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {emprestimosVencidos.length > 0 && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
                  <div>
                    <p className="font-medium text-red-700">
                      ⚠️ Você tem {emprestimosVencidos.length} EPI(s) com devolução vencida.
                    </p>
                    <p className="text-sm text-red-600">
                      Regularize sua situação o mais breve possível para evitar penalidades.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {emprestimosVencidos.map((emp) => (
                        <Badge key={emp.id} variant="destructive" className="text-xs">
                          {emp.epi.nome} ({emp.quantidade}x)
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {emprestimosProximos.length > 0 && (
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-700">
                      📅 Você tem {emprestimosProximos.length} EPI(s) com vencimento próximo.
                    </p>
                    <p className="text-sm text-amber-600">
                      Prepare-se para a devolução ou renovação do empréstimo.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {emprestimosProximos.map((emp) => {
                        const diasParaVencer = Math.ceil(
                          (new Date(emp.dataVencimento).getTime() - new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        return (
                          <Badge key={emp.id} variant="secondary" className="text-xs">
                            {emp.epi.nome} ({emp.quantidade}x) - {diasParaVencer} dias
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}