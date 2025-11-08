"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useActionState } from "react";

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
import { createEPI } from "@/lib/actions";

export default function AddEpi() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createEPI, {
    message: "",
    errors: {},
  });

  // Redirecionar se criado com sucesso
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/epis");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  return (
    <div className="p-6">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Nova EPI</CardTitle>
          <CardDescription>Adicione uma nova EPI ao sistema</CardDescription>
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
                required
                placeholder="Ex: Capacete de segurança, Luvas de proteção..."
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
                required
                placeholder="Ex: Proteção cranial, Proteção das mãos..."
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
                required
                placeholder="0"
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
                placeholder="Descreva as características da EPI..."
                rows={3}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={pending}>
                {pending ? "Criando..." : "Adicionar EPI"}
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
