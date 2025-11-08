/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRelatoriosData } from "@/lib/actions";

// Skeleton loader para os gráficos
const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-[300px] rounded bg-gray-200"></div>
  </div>
);

// Função auxiliar para formatar meses
const formatarMes = (mesString: string) => {
  const [ano, mes] = mesString.split("-");
  const meses = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  return `${meses[parseInt(mes) - 1]}/${ano}`;
};

export default function RelatoriosPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const relatoriosData = await getRelatoriosData();
        setData(relatoriosData);
      } catch (err) {
        setError("Erro ao carregar dados dos relatórios");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const exportarRelatorio = () => {
    try {
      setExporting(true);

      if (!data) {
        alert("Nenhum dado disponível para exportar");
        return;
      }

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Relatório de EPIs", 14, 20);
      doc.setFontSize(11);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 28);

      // Formatar dados para o PDF (igual ao usado nos gráficos)
      const chartData = (data.emprestimosPorMes as any[]).map((item: any) => ({
        mes: item.mes,
        total: Number(item.total),
      }));

      const pieData = (data.statusEmprestimos as any[]).map((item: any) => ({
        name:
          item.status === "ATIVO"
            ? "Ativos"
            : item.status === "DEVOLVIDO"
              ? "Devolvidos"
              : "Vencidos",
        value: item._count._all,
      }));

      const epiData = data.episMaisEmprestados.map((epi: any) => ({
        name:
          epi.nome.length > 15 ? epi.nome.substring(0, 15) + "..." : epi.nome,
        emprestimos: epi._count.emprestimos,
        quantidade: epi.quantidade,
      }));

      const colaboradoresData = data.colaboradoresMaisAtivos.map(
        (colab: any) => ({
          name:
            colab.nome.length > 15
              ? colab.nome.substring(0, 15) + "..."
              : colab.nome,
          emprestimos: colab._count.emprestimos,
        }),
      );

      const categoriasData = (data.categoriasMaisEmprestadas as any[]).map(
        (item: any) => ({
          name:
            item.categoria.length > 12
              ? item.categoria.substring(0, 12) + "..."
              : item.categoria,
          total: Number(item.total),
        }),
      );

      const stats = data.stats;

      // Variável para controlar a posição Y
      let currentY = 40;

      // Seção 1 — Estatísticas Gerais
      doc.setFontSize(14);
      doc.text("📊 Estatísticas Gerais", 14, currentY);
      currentY += 10;

      const statsData = [
        ["Total de Empréstimos", stats[0]],
        ["Ativos", stats[1]],
        ["Vencidos", stats[2]],
        ["Colaboradores Ativos", stats[3]],
        ["EPIs Cadastradas", stats[4]],
        ["Estoque Crítico", stats[5]],
      ];

      autoTable(doc, {
        startY: currentY,
        head: [["Indicador", "Valor"]],
        body: statsData,
        styles: { fontSize: 10 },
      });

      // Seção 2 — Empréstimos por Mês
      currentY = (doc as any).lastAutoTable.finalY + 15;
      doc.text("📅 Empréstimos por Mês", 14, currentY);
      currentY += 5;

      autoTable(doc, {
        startY: currentY,
        head: [["Mês", "Total"]],
        body: chartData.map((c) => [formatarMes(c.mes), c.total]),
        styles: { fontSize: 10 },
      });

      // Seção 3 — Status dos Empréstimos
      currentY = (doc as any).lastAutoTable.finalY + 15;
      doc.text("📌 Status dos Empréstimos", 14, currentY);
      currentY += 5;

      autoTable(doc, {
        startY: currentY,
        head: [["Status", "Quantidade"]],
        body: pieData.map((s) => [s.name, s.value]),
        styles: { fontSize: 10 },
      });

      // Seção 4 — EPIs Mais Emprestadas
      currentY = (doc as any).lastAutoTable.finalY + 15;
      doc.text("🦺 EPIs Mais Emprestadas", 14, currentY);
      currentY += 5;

      autoTable(doc, {
        startY: currentY,
        head: [["EPI", "Empréstimos", "Estoque"]],
        body: epiData.map((e: any) => [e.name, e.emprestimos, e.quantidade]),
        styles: { fontSize: 10 },
      });

      // Seção 5 — Colaboradores Mais Ativos
      currentY = (doc as any).lastAutoTable.finalY + 15;
      doc.text("👷 Colaboradores Mais Ativos", 14, currentY);
      currentY += 5;

      autoTable(doc, {
        startY: currentY,
        head: [["Colaborador", "Empréstimos"]],
        body: colaboradoresData.map((c: any) => [c.name, c.emprestimos]),
        styles: { fontSize: 10 },
      });

      // Seção 6 — Categorias Mais Emprestadas
      currentY = (doc as any).lastAutoTable.finalY + 15;
      doc.text("🏷️ Categorias Mais Emprestadas", 14, currentY);
      currentY += 5;

      autoTable(doc, {
        startY: currentY,
        head: [["Categoria", "Total"]],
        body: categoriasData.map((c) => [c.name, c.total]),
        styles: { fontSize: 10 },
      });

      // Salvar PDF
      doc.save("relatorio-epis.pdf");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar relatório");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
          <Button variant="outline" onClick={exportarRelatorio} disabled>
            Exportar Relatório
          </Button>
        </div>

        {/* Skeletons para os cards de estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
                <div className="h-4 w-4 rounded bg-gray-200"></div>
              </CardHeader>
              <CardContent>
                <div className="mb-2 h-8 w-16 rounded bg-gray-200"></div>
                <div className="h-3 w-32 rounded bg-gray-200"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skeletons para os gráficos */}
        <div className="grid gap-6 lg:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="mb-2 h-6 w-32 rounded bg-gray-200"></div>
                <div className="h-4 w-24 rounded bg-gray-200"></div>
              </CardHeader>
              <CardContent>
                <ChartSkeleton />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="py-8 text-center">
              <h2 className="mb-2 text-xl font-bold text-red-600">
                Erro ao carregar relatórios
              </h2>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="py-8 text-center">
              <h2 className="mb-2 text-xl font-bold">Nenhum dado disponível</h2>
              <p className="text-muted-foreground">
                Não há dados para exibir nos relatórios.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formatar dados para os gráficos
  const chartData = (data.emprestimosPorMes as any[]).map((item: any) => ({
    mes: item.mes,
    total: Number(item.total),
  }));

  const pieData = (data.statusEmprestimos as any[]).map((item: any) => ({
    name:
      item.status === "ATIVO"
        ? "Ativos"
        : item.status === "DEVOLVIDO"
          ? "Devolvidos"
          : "Vencidos",
    value: item._count._all,
  }));

  const epiData = data.episMaisEmprestados.map((epi: any) => ({
    name: epi.nome.length > 15 ? epi.nome.substring(0, 15) + "..." : epi.nome,
    emprestimos: epi._count.emprestimos,
    quantidade: epi.quantidade,
  }));

  const colaboradoresData = data.colaboradoresMaisAtivos.map((colab: any) => ({
    name:
      colab.nome.length > 15 ? colab.nome.substring(0, 15) + "..." : colab.nome,
    emprestimos: colab._count.emprestimos,
  }));

  const vencidosData = (data.emprestimosVencidosPorMes as any[]).map(
    (item: any) => ({
      mes: item.mes,
      total: Number(item.total),
    }),
  );

  const categoriasData = (data.categoriasMaisEmprestadas as any[]).map(
    (item: any) => ({
      name:
        item.categoria.length > 12
          ? item.categoria.substring(0, 12) + "..."
          : item.categoria,
      total: Number(item.total),
    }),
  );

  const stats = data.stats;

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
            Análises e estatísticas do sistema de EPIs
          </p>
        </div>
        <Button
          variant="outline"
          onClick={exportarRelatorio}
          disabled={exporting}
        >
          {exporting ? "Gerando PDF..." : "Exportar Relatório"}
        </Button>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Empréstimos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[0]}</div>
            <p className="text-muted-foreground text-xs">
              Desde o início do sistema
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Empréstimos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[1]}</div>
            <p className="text-muted-foreground text-xs">{stats[2]} vencidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Colaboradores Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[3]}</div>
            <p className="text-muted-foreground text-xs">No sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              EPIs Cadastradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats[4]}</div>
            <p className="text-muted-foreground text-xs">
              {stats[5]} com estoque crítico
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Devolução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats[0] > 0
                ? Math.round(
                    ((pieData.find((d) => d.name === "Devolvidos")?.value ||
                      0) /
                      stats[0]) *
                      100,
                  )
                : 0}
              %
            </div>
            <p className="text-muted-foreground text-xs">
              Empréstimos devolvidos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {chartData.length > 0
                ? Math.round(
                    chartData.reduce((acc, curr) => acc + curr.total, 0) /
                      chartData.length,
                  )
                : 0}
            </div>
            <p className="text-muted-foreground text-xs">Empréstimos por mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Empréstimos por Mês */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Empréstimos por Mês</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="mes"
                  tickFormatter={(value) => {
                    const [year, month] = value.split("-");
                    return `${month}/${year.slice(2)}`;
                  }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} empréstimos`, "Total"]}
                  labelFormatter={(label) => {
                    const [year, month] = label.split("-");
                    return `Mês: ${month}/${year}`;
                  }}
                />
                <Bar dataKey="total" fill="#8884d8" name="Empréstimos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status dos Empréstimos */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Empréstimos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => {
                    const { percent } = props as { percent?: number };
                    return percent ? `${(percent * 100).toFixed(0)}%` : "";
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} empréstimos`, "Quantidade"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Empréstimos Vencidos */}
        <Card>
          <CardHeader>
            <CardTitle>Empréstimos Vencidos</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={vencidosData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="mes"
                  tickFormatter={(value) => {
                    const [year, month] = value.split("-");
                    return `${month}/${year.slice(2)}`;
                  }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} vencidos`, "Total"]}
                  labelFormatter={(label) => {
                    const [year, month] = label.split("-");
                    return `Mês: ${month}/${year}`;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#ff7300"
                  name="Vencidos"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* EPIs Mais Emprestados */}
        <Card>
          <CardHeader>
            <CardTitle>EPIs Mais Emprestados</CardTitle>
            <CardDescription>Top 8 EPIs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={epiData} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "emprestimos")
                      return [`${value} empréstimos`, "Total"];
                    return [`${value} unidades`, "Estoque"];
                  }}
                />
                <Bar dataKey="emprestimos" fill="#8884d8" name="Empréstimos" />
                <Bar dataKey="quantidade" fill="#82ca9d" name="Estoque" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Colaboradores Mais Ativos */}
        <Card>
          <CardHeader>
            <CardTitle>Colaboradores Mais Ativos</CardTitle>
            <CardDescription>Top 8 colaboradores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={colaboradoresData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="emprestimos" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip
                  formatter={(value) => [`${value} empréstimos`, "Total"]}
                />
                <Bar dataKey="emprestimos" fill="#0088FE" name="Empréstimos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Categorias Mais Emprestadas */}
        <Card>
          <CardHeader>
            <CardTitle>Categorias Mais Emprestadas</CardTitle>
            <CardDescription>Top 6 categorias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoriasData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => {
                    const { percent } = props as { percent?: number };
                    return percent ? `${(percent * 100).toFixed(0)}%` : "";
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {categoriasData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} empréstimos`, "Total"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoriasData.map((categoria, index) => (
                <div
                  key={categoria.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{categoria.name}</span>
                  </div>
                  <Badge variant="outline">{categoria.total}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Executivo</CardTitle>
          <CardDescription>
            Visão geral do desempenho do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Desempenho Mensal</h4>
              <p className="text-muted-foreground text-sm">
                {chartData.length > 0
                  ? `Média de ${Math.round(chartData.reduce((acc, curr) => acc + curr.total, 0) / chartData.length)} empréstimos/mês`
                  : "Sem dados suficientes"}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Taxa de Vencimento</h4>
              <p className="text-muted-foreground text-sm">
                {stats[1] > 0
                  ? `${Math.round((stats[2] / stats[1]) * 100)}% dos empréstimos ativos estão vencidos`
                  : "Nenhum empréstimo ativo"}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">EPI Mais Popular</h4>
              <p className="text-muted-foreground text-sm">
                {epiData.length > 0
                  ? `${epiData[0].name} (${epiData[0].emprestimos} empréstimos)`
                  : "Sem dados"}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Colaborador Mais Ativo</h4>
              <p className="text-muted-foreground text-sm">
                {colaboradoresData.length > 0
                  ? `${colaboradoresData[0].name} (${colaboradoresData[0].emprestimos} empréstimos)`
                  : "Sem dados"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
