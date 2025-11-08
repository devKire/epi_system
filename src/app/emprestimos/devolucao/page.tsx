"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
import { registrarDevolucao } from "@/lib/actions";

export default function DevolucaoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(registrarDevolucao, {
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

  return (
    <div className="p-6">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Registrar Devolução</CardTitle>
          <CardDescription>
            Registre a devolução de um EPI emprestado
          </CardDescription>
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
              <Label htmlFor="emprestimoId">ID do Empréstimo</Label>
              <Input
                id="emprestimoId"
                name="emprestimoId"
                defaultValue={searchParams.get("emprestimoId") || ""}
                required
                aria-describedby="emprestimoId-error"
              />
              {state.errors?.emprestimoId && (
                <div id="emprestimoId-error" className="text-sm text-red-600">
                  {state.errors.emprestimoId[0]}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantidadeDevolvida">Quantidade Devolvida</Label>
              <Input
                id="quantidadeDevolvida"
                name="quantidadeDevolvida"
                type="number"
                min="1"
                required
                aria-describedby="quantidadeDevolvida-error"
              />
              {state.errors?.quantidadeDevolvida && (
                <div
                  id="quantidadeDevolvida-error"
                  className="text-sm text-red-600"
                >
                  {state.errors.quantidadeDevolvida[0]}
                </div>
              )}
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={pending}>
                {pending ? "Registrando..." : "Registrar Devolução"}
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
