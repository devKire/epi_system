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

// Tipos dos dados
interface RelatoriosData {
  estatisticas: {
    totalEPIs: number;
    totalEmprestimos: number;
    colaboradoresAtivos: number;
    emprestimosAtrasados: number;
    emprestimosAtivos: number;
    emprestimosConcluidos: number;
  };
  emprestimosPorStatus: Array<{
    status: string;
    quantidade: number;
  }>;
  emprestimosPorMes: Array<{
    mes: string;
    quantidade: number;
  }>;
  episPorCategoria: Array<{
    categoria: string;
    quantidade: number;
  }>;
  topColaboradores: Array<{
    nome: string;
    quantidade: number;
  }>;
  episBaixoEstoque: Array<{
    nome: string;
    quantidade: number;
    categoria: string;
  }>;
  emprestimosAtrasadosDetalhes: Array<{
    colaborador: string;
    epi: string;
    dataVencimento: string;
    diasAtraso: number;
  }>;
}

// Skeleton loader para os gráficos
const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-[300px] rounded bg-gray-200"></div>
  </div>
);

// Cores para gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Função para formatar data
const formatarData = (data: string) => {
  return new Date(data).toLocaleDateString('pt-BR');
};

export default function RelatoriosPage() {
  const [data, setData] = useState<RelatoriosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const resultado = await getRelatoriosData();
      
      if (resultado.success && resultado.data) {
        setData(resultado.data);
      } else {
        throw new Error(resultado.error || "Erro ao carregar dados");
      }
    } catch (err) {
      console.error("Erro ao carregar relatórios:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const exportarRelatorio = async () => {
    if (!data) return;
    
    setExporting(true);
    try {
      const doc = new jsPDF();
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      const horaAtual = new Date().toLocaleTimeString('pt-BR');
      
      // Título
      doc.setFontSize(20);
      doc.text("Relatório do Sistema de EPIs", 20, 20);
      doc.setFontSize(12);
      doc.text(`Gerado em: ${dataAtual} às ${horaAtual}`, 20, 30);
      
      let yPos = 40;
      
      // Estatísticas Gerais
      doc.setFontSize(16);
      doc.text("Estatísticas Gerais", 20, yPos);
      yPos += 10;
      
      const estatisticas = [
        ['Total de EPIs', data.estatisticas.totalEPIs.toString()],
        ['Total de Empréstimos', data.estatisticas.totalEmprestimos.toString()],
        ['Colaboradores Ativos', data.estatisticas.colaboradoresAtivos.toString()],
        ['Empréstimos Ativos', data.estatisticas.emprestimosAtivos.toString()],
        ['Empréstimos Atrasados', data.estatisticas.emprestimosAtrasados.toString()],
        ['Empréstimos Concluídos', data.estatisticas.emprestimosConcluidos.toString()],
      ];
      
      autoTable(doc, {
        startY: yPos,
        head: [['Métrica', 'Valor']],
        body: estatisticas,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
      
      // Empréstimos por Status
      doc.setFontSize(16);
      doc.text("Empréstimos por Status", 20, yPos);
      yPos += 10;
      
      autoTable(doc, {
        startY: yPos,
        head: [['Status', 'Quantidade']],
        body: data.emprestimosPorStatus.map(item => [item.status, item.quantidade.toString()]),
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] },
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
      
      // EPIs por Categoria
      doc.setFontSize(16);
      doc.text("EPIs por Categoria", 20, yPos);
      yPos += 10;
      
      autoTable(doc, {
        startY: yPos,
        head: [['Categoria', 'Quantidade']],
        body: data.episPorCategoria.map(item => [item.categoria, item.quantidade.toString()]),
        theme: 'grid',
        headStyles: { fillColor: [168, 85, 247] },
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
      
      // Top Colaboradores
      doc.setFontSize(16);
      doc.text("Top 5 Colaboradores com Mais Empréstimos", 20, yPos);
      yPos += 10;
      
      autoTable(doc, {
        startY: yPos,
        head: [['Colaborador', 'Quantidade de Empréstimos']],
        body: data.topColaboradores.map(item => [item.nome, item.quantidade.toString()]),
        theme: 'grid',
        headStyles: { fillColor: [245, 158, 11] },
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
      
      // EPIs com Baixo Estoque
      if (data.episBaixoEstoque.length > 0) {
        doc.setFontSize(16);
        doc.text("EPIs com Baixo Estoque (< 10 unidades)", 20, yPos);
        yPos += 10;
        
        autoTable(doc, {
          startY: yPos,
          head: [['EPI', 'Categoria', 'Quantidade Disponível']],
          body: data.episBaixoEstoque.map(item => [item.nome, item.categoria, item.quantidade.toString()]),
          theme: 'grid',
          headStyles: { fillColor: [239, 68, 68] },
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 10;
      }
      
      // Empréstimos Atrasados
      if (data.emprestimosAtrasadosDetalhes.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Empréstimos Atrasados", 20, 20);
        yPos = 30;
        
        autoTable(doc, {
          startY: yPos,
          head: [['Colaborador', 'EPI', 'Data de Vencimento', 'Dias de Atraso']],
          body: data.emprestimosAtrasadosDetalhes.map(item => [
            item.colaborador,
            item.epi,
            formatarData(item.dataVencimento),
            item.diasAtraso.toString()
          ]),
          theme: 'grid',
          headStyles: { fillColor: [239, 68, 68] },
        });
      }
      
      doc.save(`relatorio-epis-${dataAtual.replace(/\//g, '-')}.pdf`);
    } catch (err) {
      console.error("Erro ao exportar PDF:", err);
      alert("Erro ao gerar PDF. Tente novamente.");
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

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de EPIs</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.estatisticas.totalEPIs}</div>
            <p className="text-xs text-muted-foreground">
              Itens disponíveis no estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Empréstimos</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.estatisticas.totalEmprestimos}</div>
            <p className="text-xs text-muted-foreground">
              Empréstimos realizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colaboradores Ativos</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.estatisticas.colaboradoresAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Colaboradores no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empréstimos Ativos</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.estatisticas.emprestimosAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Empréstimos em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empréstimos Atrasados</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.estatisticas.emprestimosAtrasados}</div>
            <p className="text-xs text-muted-foreground">
              Empréstimos fora do prazo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empréstimos Concluídos</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.estatisticas.emprestimosConcluidos}</div>
            <p className="text-xs text-muted-foreground">
              Empréstimos finalizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de Pizza - Empréstimos por Status */}
        {/* Gráfico de Pizza - Empréstimos por Status */}
<Card>
  <CardHeader>
    <CardTitle>Empréstimos por Status</CardTitle>
    <CardDescription>
      Distribuição dos empréstimos por situação
    </CardDescription>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data.emprestimosPorStatus}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props) => {
            const { status } = props.payload; // Acessa status do payload
            const percent = props.percent || 0; // Valor padrão se for undefined
            return `${status}: ${(percent * 100).toFixed(0)}%`;
          }}
          outerRadius={80}
          fill="#8884d8"
          dataKey="quantidade"
        >
          {data.emprestimosPorStatus.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [value, 'Quantidade']}
          labelFormatter={(label, payload) => {
            // payload[0] contém os dados do item
            return payload[0]?.payload?.status || label;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  </CardContent>
</Card>

        {/* Gráfico de Barras - Empréstimos por Mês */}
        <Card>
          <CardHeader>
            <CardTitle>Empréstimos por Mês</CardTitle>
            <CardDescription>
              Quantidade de empréstimos realizados por mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.emprestimosPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Linhas - EPIs por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>EPIs por Categoria</CardTitle>
            <CardDescription>
              Distribuição de EPIs por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.episPorCategoria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="quantidade" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Top Colaboradores */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Colaboradores</CardTitle>
            <CardDescription>
              Colaboradores com mais empréstimos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topColaboradores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabela de EPIs com Baixo Estoque */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>EPIs com Baixo Estoque</CardTitle>
            <CardDescription>
              EPIs com menos de 10 unidades disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.episBaixoEstoque.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">EPI</th>
                      <th className="text-left py-3 px-4">Categoria</th>
                      <th className="text-left py-3 px-4">Quantidade</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.episBaixoEstoque.map((epi, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{epi.nome}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{epi.categoria}</Badge>
                        </td>
                        <td className="py-3 px-4">{epi.quantidade}</td>
                        <td className="py-3 px-4">
                          <Badge variant={epi.quantidade < 5 ? "default" : "destructive"}>
                            {epi.quantidade < 5 ? "Crítico" : "Baixo"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Todos os EPIs estão com estoque adequado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Empréstimos Atrasados */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Empréstimos Atrasados</CardTitle>
            <CardDescription>
              Empréstimos com data de vencimento expirada
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.emprestimosAtrasadosDetalhes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Colaborador</th>
                      <th className="text-left py-3 px-4">EPI</th>
                      <th className="text-left py-3 px-4">Data de Vencimento</th>
                      <th className="text-left py-3 px-4">Dias de Atraso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.emprestimosAtrasadosDetalhes.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{item.colaborador}</td>
                        <td className="py-3 px-4">{item.epi}</td>
                        <td className="py-3 px-4">{formatarData(item.dataVencimento)}</td>
                        <td className="py-3 px-4">
                          <Badge variant="destructive">{item.diasAtraso} dias</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum empréstimo atrasado
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}