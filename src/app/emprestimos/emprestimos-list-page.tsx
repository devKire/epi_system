// epi_system\src\app\emprestimos\emprestimos-list-page.tsx
import { Calendar, Edit, Filter,Package, Plus, RotateCcw, UserCheck } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/lib/prisma";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EmprestimosPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const status = searchParams.status as string;
  const filterType = searchParams.filter as string;

  // Construir where clause baseado nos filtros
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {};

  if (status === "vencido") {
    whereClause.status = { in: ["EMPRESTADO", "EM_USO"] };
    whereClause.dataVencimento = { lt: new Date() };
  } else if (status === "ativos") {
    whereClause.status = { in: ["EMPRESTADO", "EM_USO", "FORNECIDO"] };
  } else if (status === "devolvidos") {
    whereClause.status = { in: ["DEVOLVIDO", "DANIFICADO", "PERDIDO"] };
  } else if (status === "emprestados") {
    whereClause.status = "EMPRESTADO";
  } else if (status === "em_uso") {
    whereClause.status = "EM_USO";
  } else if (status === "fornecidos") {
    whereClause.status = "FORNECIDO";
  } else if (status === "danificados") {
    whereClause.status = "DANIFICADO";
  } else if (status === "perdidos") {
    whereClause.status = "PERDIDO";
  }

  // Aplicar filtro adicional por tipo
  if (filterType === "com_devolucao") {
    whereClause.dataDevolucao = { not: null };
  } else if (filterType === "sem_devolucao") {
    whereClause.dataDevolucao = null;
  }

  const emprestimos = await db.emprestimo.findMany({
    where: whereClause,
    include: {
      colaborador: { select: { nome: true, matricula: true } },
      epi: { select: { nome: true, categoria: true } },
    },
    orderBy: { dataEmprestimo: "desc" },
  });

  const statusColors: Record<string, string> = {
    EMPRESTADO: "bg-blue-100 text-blue-800 border-blue-200",
    EM_USO: "bg-yellow-100 text-yellow-800 border-yellow-200",
    FORNECIDO: "bg-green-100 text-green-800 border-green-200",
    DEVOLVIDO: "bg-gray-100 text-gray-800 border-gray-200",
    DANIFICADO: "bg-orange-100 text-orange-800 border-orange-200",
    PERDIDO: "bg-red-100 text-red-800 border-red-200",
  };

  const statusLabels: Record<string, string> = {
    EMPRESTADO: "Emprestado",
    EM_USO: "Em Uso",
    FORNECIDO: "Fornecido",
    DEVOLVIDO: "Devolvido",
    DANIFICADO: "Danificado",
    PERDIDO: "Perdido",
  };

  // Buscar estatísticas
  const [totalAtivos, totalVencidos, totalDevolvidos, totalEmprestados, totalEmUso, totalFornecidos] = await Promise.all([
    db.emprestimo.count({
      where: { status: { in: ["EMPRESTADO", "EM_USO", "FORNECIDO"] } },
    }),
    db.emprestimo.count({
      where: {
        status: { in: ["EMPRESTADO", "EM_USO"] },
        dataVencimento: { lt: new Date() },
      },
    }),
    db.emprestimo.count({
      where: { status: { in: ["DEVOLVIDO", "DANIFICADO", "PERDIDO"] } },
    }),
    db.emprestimo.count({
      where: { status: "EMPRESTADO" },
    }),
    db.emprestimo.count({
      where: { status: "EM_USO" },
    }),
    db.emprestimo.count({
      where: { status: "FORNECIDO" },
    }),
  ]);

  // Calcular quantos empréstimos estão aptos para devolução
  const emprestimosAptosDevolucao = await db.emprestimo.count({
    where: {
      status: { in: ["EMPRESTADO", "EM_USO"] },
      dataDevolucao: null,
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Empréstimos</h1>
          <p className="text-muted-foreground">
            Gerencie os empréstimos de EPIs
          </p>
        </div>
        <div className="flex space-x-2">
          {/* Botão de Registrar Devolução Rápida */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Registrar Devolução
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/emprestimos/devolucao" className="cursor-pointer">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Registrar nova devolução
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/emprestimos?status=ativos" className="cursor-pointer">
                  <Package className="mr-2 h-4 w-4" />
                  Ver empréstimos ativos ({totalAtivos})
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/emprestimos?status=vencido" className="cursor-pointer">
                  <Calendar className="mr-2 h-4 w-4 text-red-600" />
                  Ver empréstimos vencidos ({totalVencidos})
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button asChild>
            <Link href="/emprestimos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Empréstimo
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAtivos}</div>
            <p className="text-muted-foreground text-xs">
              {totalEmprestados} Emprestados • {totalEmUso} Em Uso • {totalFornecidos} Fornecidos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalVencidos}</div>
            <p className="text-muted-foreground text-xs">
              Emprestados ou Em Uso com data vencida
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalDevolvidos}</div>
            <p className="text-muted-foreground text-xs">
              Devolvidos, Danificados ou Perdidos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Para Devolver</CardTitle>
            <RotateCcw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{emprestimosAptosDevolucao}</div>
            <p className="text-muted-foreground text-xs">
              Empréstados ou Em Uso sem devolução
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Filtros</h3>
          {status && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/emprestimos">
                Limpar filtros
              </Link>
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!status ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href="/emprestimos">Todos</Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-3 w-3" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/emprestimos?status=ativos" className="cursor-pointer">
                  Ativos ({totalAtivos})
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/emprestimos?status=emprestados" className="cursor-pointer">
                  Emprestados ({totalEmprestados})
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/emprestimos?status=em_uso" className="cursor-pointer">
                  Em Uso ({totalEmUso})
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/emprestimos?status=fornecidos" className="cursor-pointer">
                  Fornecidos ({totalFornecidos})
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/emprestimos?status=devolvidos" className="cursor-pointer">
                  Finalizados ({totalDevolvidos})
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/emprestimos?status=vencido" className="cursor-pointer">
                  Vencidos ({totalVencidos})
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-3 w-3" />
                Tipo
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem asChild>
                <Link 
                  href={`/emprestimos?${new URLSearchParams({
                    ...(status && { status }),
                    filter: "com_devolucao"
                  }).toString()}`} 
                  className="cursor-pointer"
                >
                  Com data de devolução
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link 
                  href={`/emprestimos?${new URLSearchParams({
                    ...(status && { status }),
                    filter: "sem_devolucao"
                  }).toString()}`} 
                  className="cursor-pointer"
                >
                  Sem data de devolução
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={status === "vencido" ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href="/emprestimos?status=vencido">
              <Calendar className="mr-2 h-3 w-3" />
              Vencidos
            </Link>
          </Button>
          
          <Button
            variant={status === "devolvidos" ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href="/emprestimos?status=devolvidos">
              <UserCheck className="mr-2 h-3 w-3" />
              Finalizados
            </Link>
          </Button>
        </div>

        {/* Status ativo do filtro */}
        {status && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Filtro ativo:</span>
            <Badge variant="secondary">
              {status === "ativos" && "Ativos"}
              {status === "vencido" && "Vencidos"}
              {status === "devolvidos" && "Finalizados"}
              {status === "emprestados" && "Emprestados"}
              {status === "em_uso" && "Em Uso"}
              {status === "fornecidos" && "Fornecidos"}
              {status === "danificados" && "Danificados"}
              {status === "perdidos" && "Perdidos"}
            </Badge>
            {filterType && (
              <>
                <span>•</span>
                <Badge variant="outline">
                  {filterType === "com_devolucao" && "Com devolução"}
                  {filterType === "sem_devolucao" && "Sem devolução"}
                </Badge>
              </>
            )}
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Histórico de Empréstimos</CardTitle>
            <CardDescription>
              {emprestimos.length} empréstimo(s) encontrado(s)
            </CardDescription>
          </div>
          {emprestimos.length > 0 && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/emprestimos/devolucao">
                <RotateCcw className="mr-2 h-4 w-4" />
                Registrar Devolução
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(
              emprestimos.map((emprestimo) => {
                const isVencido =
                  ["EMPRESTADO", "EM_USO"].includes(emprestimo.status) &&
                  new Date(emprestimo.dataVencimento) < new Date();

                const podeDevolver = ["EMPRESTADO", "EM_USO"].includes(emprestimo.status);

                return (
                  <div
                    key={emprestimo.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`rounded-full p-2 ${
                        podeDevolver 
                          ? "bg-blue-100 text-blue-600" 
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        <Package className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">
                              {emprestimo.colaborador.nome}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {emprestimo.epi.nome} • {emprestimo.quantidade}x • Matrícula: {emprestimo.colaborador.matricula}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/emprestimos/editar/${emprestimo.id}`}>
                                <Edit className="h-4 w-4" />
                                <span className="ml-2 hidden sm:inline">Editar</span>
                              </Link>
                            </Button>
                            {podeDevolver && (
                              <Button size="sm" asChild>
                                <Link
                                  href={`/emprestimos/devolucao?emprestimoId=${emprestimo.id}`}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                  <span className="ml-2 hidden sm:inline">Devolver</span>
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge
                            className={`${statusColors[emprestimo.status]} border`}
                          >
                            {isVencido ? "Vencido" : statusLabels[emprestimo.status]}
                            {isVencido && " ⚠️"}
                          </Badge>
                          <span className="text-muted-foreground text-xs">
                            <span className="font-medium">Empréstimo:</span>{" "}
                            {new Date(
                              emprestimo.dataEmprestimo,
                            ).toLocaleDateString("pt-BR")}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            <span className="font-medium">Vencimento:</span>{" "}
                            {new Date(
                              emprestimo.dataVencimento,
                            ).toLocaleDateString("pt-BR")}
                            {isVencido && " ⚠️"}
                          </span>
                          {emprestimo.dataDevolucao && (
                            <span className="text-muted-foreground text-xs">
                              <span className="font-medium">Devolução:</span>{" "}
                              {new Date(
                                emprestimo.dataDevolucao,
                              ).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}