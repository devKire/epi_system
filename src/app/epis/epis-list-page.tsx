import { AlertTriangle, Edit, Plus, Shield } from "lucide-react";
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

import DeleteEPIButton from "./delete-epi-button";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EPIsListPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const estoque = searchParams.estoque as string;

  const epis = await db.ePI.findMany({
    where: {
      AND: [
        estoque === "critico" ? { quantidade: { lt: 5 } } : {},
        estoque === "baixo" ? { quantidade: { lt: 10 } } : {},
      ],
    },
    orderBy: { nome: "asc" },
  });

  const totalEPIs = await db.ePI.count();
  const estoqueCritico = await db.ePI.count({
    where: { quantidade: { lt: 5 } },
  });
  const estoqueBaixo = await db.ePI.count({
    where: { quantidade: { lt: 10 } },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">EPIs</h1>
          <p className="text-muted-foreground">
            Gerencie os Equipamentos de Proteção Individual
          </p>
        </div>
        <Button asChild>
          <Link href="/epis/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo EPI
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de EPIs</CardTitle>
            <Shield className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEPIs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {estoqueBaixo}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estoque Crítico
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {estoqueCritico}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de EPIs</CardTitle>
          <CardDescription>{epis.length} EPI(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {epis.map((epi) => (
              <Card key={epi.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{epi.nome}</span>
                    <Badge
                      variant={
                        epi.quantidade < 5
                          ? "destructive"
                          : epi.quantidade < 10
                            ? "secondary"
                            : "default"
                      }
                    >
                      {epi.quantidade} un
                    </Badge>
                  </CardTitle>
                  <CardDescription className="font-medium">
                    {epi.categoria}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {epi.descricao && (
                    <p className="text-muted-foreground text-sm">
                      {epi.descricao}
                    </p>
                  )}

                  <div className="text-muted-foreground flex items-center justify-between text-sm">
                    <span>
                      {epi.validade
                        ? `Validade: ${new Date(epi.validade).toLocaleDateString("pt-BR")}`
                        : "Sem validade"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/epis/${epi.id}`}>
                          <Edit className="mr-1 h-3 w-3" />
                          Editar
                        </Link>
                      </Button>
                      <DeleteEPIButton epiId={epi.id} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
