"use client";

import type { Colaborador, EPI } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEmprestimo } from "@/lib/actions";

interface NovoEmprestimoFormProps {
  colaboradores: Colaborador[];
  epis: EPI[];
}

export default function NovoEmprestimoForm({
  colaboradores,
  epis,
}: NovoEmprestimoFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createEmprestimo, {
    message: "",
    errors: {},
  });

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/emprestimos");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  // Calcular data mínima (amanhã)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split("T")[0];

  return (
    <div className="p-6">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Novo Empréstimo</CardTitle>
          <CardDescription>Registre um novo empréstimo de EPI</CardDescription>
        </CardHeader>
        <CardContent>
          {state.message && (
            <Alert
              variant={state.success ? "default" : "destructive"}
              className="mb-4"
            >
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <form action={formAction} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="colaboradorId">Colaborador</Label>
              <Select name="colaboradorId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores.map((colaborador) => (
                    <SelectItem key={colaborador.id} value={colaborador.id}>
                      {colaborador.nome} - {colaborador.matricula}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.colaboradorId && (
                <div className="text-sm text-red-600">
                  {state.errors.colaboradorId[0]}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="epiId">EPI</Label>
              <Select name="epiId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma EPI" />
                </SelectTrigger>
                <SelectContent>
                  {epis.map((epi) => (
                    <SelectItem key={epi.id} value={epi.id}>
                      {epi.nome} - {epi.quantidade} disponíveis
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.epiId && (
                <div className="text-sm text-red-600">
                  {state.errors.epiId[0]}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                name="quantidade"
                type="number"
                min="1"
                required
                placeholder="1"
                aria-describedby="quantidade-error"
              />
              {state.errors?.quantidade && (
                <div id="quantidade-error" className="text-sm text-red-600">
                  {state.errors.quantidade[0]}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dataVencimento">Data de Vencimento</Label>
              <Input
                id="dataVencimento"
                name="dataVencimento"
                type="date"
                min={minDateString}
                required
                aria-describedby="dataVencimento-error"
              />
              {state.errors?.dataVencimento && (
                <div id="dataVencimento-error" className="text-sm text-red-600">
                  {state.errors.dataVencimento[0]}
                </div>
              )}
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={pending}>
                {pending ? "Registrando..." : "Registrar Empréstimo"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={pending}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
