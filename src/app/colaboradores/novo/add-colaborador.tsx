"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

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

  const [previewUrl, setPreviewUrl] = useState("");

  // Efeito para limpar o preview quando o componente montar (novo colaborador)
  useEffect(() => {
    setPreviewUrl("");
  }, []);

  // Efeito para redirecionar em caso de sucesso
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/colaboradores");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  // Função para validar URL
  const isValidUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Função para lidar com mudanças no input
  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPreviewUrl(url);
  };

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

            <div className="grid gap-2">
              <Label htmlFor="avatarUrl">Foto de Perfil</Label>
              <Input
                id="avatarUrl"
                name="avatarUrl"
                onChange={handleAvatarUrlChange}
                required
                aria-describedby="avatarUrl-error"
                placeholder="Cole a URL da imagem aqui"
                className={
                  previewUrl && !isValidUrl(previewUrl) ? "border-red-500" : ""
                }
              />

              {/* Mensagem de URL inválida */}
              {previewUrl && !isValidUrl(previewUrl) && (
                <p className="text-sm text-red-600">
                  URL inválida. Por favor, insira uma URL válida.
                </p>
              )}

              {/* Preview da imagem */}
              <div className="flex flex-col items-center gap-2">
                {previewUrl && isValidUrl(previewUrl) ? (
                  <div className="relative">
                    <Image
                      src={previewUrl}
                      alt="Preview do avatar"
                      width={200}
                      height={200}
                      className="h-[200px] w-[200px] rounded-full border border-white/20 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "block";
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-[200px] w-[200px] items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="px-4 text-center text-sm text-gray-500">
                      {previewUrl && !isValidUrl(previewUrl)
                        ? "URL inválida"
                        : "Preview aparecerá aqui"}
                    </span>
                  </div>
                )}
              </div>

              {state.errors?.avatarUrl && (
                <div id="avatarUrl-error" className="text-sm text-red-600">
                  {state.errors.avatarUrl[0]}
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
