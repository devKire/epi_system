"use client";

import type { Colaborador } from "@prisma/client";
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
import { Switch } from "@/components/ui/switch";
import { updateColaborador } from "@/lib/actions";

interface EditarColaboradorFormProps {
  colaborador: Colaborador;
}

export default function EditarColaboradorForm({
  colaborador,
}: EditarColaboradorFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateColaborador.bind(null, colaborador.id),
    { message: "", errors: {} },
  );

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/colaboradores");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  return (
    <div className="p-6">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Editar Colaborador</CardTitle>
          <CardDescription>Atualize os dados do colaborador</CardDescription>
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
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                name="nome"
                defaultValue={colaborador.nome}
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={colaborador.email}
                required
                aria-describedby="email-error"
              />
              {state.errors?.email && (
                <div id="email-error" className="text-sm text-red-600">
                  {state.errors.email[0]}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                name="matricula"
                defaultValue={colaborador.matricula}
                required
                aria-describedby="matricula-error"
              />
              {state.errors?.matricula && (
                <div id="matricula-error" className="text-sm text-red-600">
                  {state.errors.matricula[0]}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                name="cargo"
                defaultValue={colaborador.cargo}
                required
                aria-describedby="cargo-error"
              />
              {state.errors?.cargo && (
                <div id="cargo-error" className="text-sm text-red-600">
                  {state.errors.cargo[0]}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                name="ativo"
                defaultChecked={colaborador.ativo}
              />
              <Label htmlFor="ativo">Colaborador ativo</Label>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={pending}>
                {pending ? "Atualizando..." : "Atualizar Colaborador"}
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
