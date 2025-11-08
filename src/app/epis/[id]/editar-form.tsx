"use client";

import type { EPI } from "@prisma/client";
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
import { Textarea } from "@/components/ui/textarea";
import { updateEPI } from "@/lib/actions";

interface EditarEPIFormProps {
  epi: EPI;
}

export default function EditarEPIForm({ epi }: EditarEPIFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateEPI.bind(null, epi.id),
    { message: "", errors: {} },
  );
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/epis");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  // Formatar data para input type="date"
  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <div className="p-6">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Editar EPI</CardTitle>
          <CardDescription>Atualize os dados da EPI</CardDescription>
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
              <Label htmlFor="nome">Nome da EPI</Label>
              <Input
                id="nome"
                name="nome"
                defaultValue={epi.nome}
                required
                aria-describedby="nome-error"
              />
              {state.errors?.nome && (
                <div id="nome-error" className="text-sm text-red-600">
                  {state.errors.nome[0]}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                name="categoria"
                defaultValue={epi.categoria}
                required
                aria-describedby="categoria-error"
              />
              {state.errors?.categoria && (
                <div id="categoria-error" className="text-sm text-red-600">
                  {state.errors.categoria[0]}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantidade">Quantidade em Estoque</Label>
              <Input
                id="quantidade"
                name="quantidade"
                type="number"
                min="0"
                defaultValue={epi.quantidade}
                required
                aria-describedby="quantidade-error"
              />
              {state.errors?.quantidade && (
                <div id="quantidade-error" className="text-sm text-red-600">
                  {state.errors.quantidade[0]}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="validade">Data de Validade (Opcional)</Label>
              <Input
                id="validade"
                name="validade"
                type="date"
                defaultValue={formatDateForInput(epi.validade)}
                aria-describedby="validade-error"
              />
              {state.errors?.validade && (
                <div id="validade-error" className="text-sm text-red-600">
                  {state.errors.validade[0]}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição (Opcional)</Label>
              <Textarea
                id="descricao"
                name="descricao"
                defaultValue={epi.descricao || ""}
                placeholder="Descreva as características da EPI..."
                rows={3}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={pending}>
                {pending ? "Atualizando..." : "Atualizar EPI"}
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
