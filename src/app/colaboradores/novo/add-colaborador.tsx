"use client";

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
import { createColaborador } from "@/lib/actions";

export default function AddColaborador() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createColaborador, {
    message: "",
    errors: {},
  });

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
          <CardTitle>Novo Colaborador</CardTitle>
          <CardDescription>
            Adicione um novo colaborador ao sistema
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
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                name="nome"
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
              <Switch id="ativo" name="ativo" defaultChecked />
              <Label htmlFor="ativo">Colaborador ativo</Label>
            </div>

            <div className="flex items-center space-x-2 rounded-lg border bg-blue-50 p-4">
              <Switch id="criarUsuario" name="criarUsuario" defaultChecked />
              <div>
                <Label htmlFor="criarUsuario" className="font-semibold">
                  Criar usuário de acesso
                </Label>
                <p className="text-muted-foreground text-sm">
                  O colaborador poderá acessar o sistema com este email e senha
                  padrão: 123456
                </p>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={pending}>
                {pending ? "Criando..." : "Criar Colaborador"}
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
