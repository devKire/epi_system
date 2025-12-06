// epi_system\src\app\emprestimos\editar\[id]\editar-form.tsx
"use client";

import type { Emprestimo, EmprestimoStatus } from "@prisma/client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateEmprestimo } from "@/lib/actions";

interface EditarEmprestimoFormProps {
  emprestimo: Emprestimo & {
    colaborador: { nome: string; matricula: string };
    epi: { nome: string; categoria: string };
  };
}

const statusLabels: Record<EmprestimoStatus, string> = {
  EMPRESTADO: "Emprestado",
  EM_USO: "Em Uso",
  FORNECIDO: "Fornecido",
  DEVOLVIDO: "Devolvido",
  DANIFICADO: "Danificado",
  PERDIDO: "Perdido",
};

export default function EditarEmprestimoForm({
  emprestimo,
}: EditarEmprestimoFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prevState: any, formData: FormData) => 
      updateEmprestimo(emprestimo.id, prevState, formData),
    {
      message: "",
      errors: {},
    }
  );
  
  const [status, setStatus] = useState<EmprestimoStatus>(emprestimo.status);

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/emprestimos");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  const statusDevolucao = ["DEVOLVIDO", "DANIFICADO", "PERDIDO"];
  const showDevolucaoFields = statusDevolucao.includes(status);

  return (
    <div className="p-6">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Editar Empréstimo</CardTitle>
          <CardDescription>
            Atualize as informações do empréstimo
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
              <Label>Colaborador</Label>
              <Input
                value={`${emprestimo.colaborador.nome} - ${emprestimo.colaborador.matricula}`}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="grid gap-2">
              <Label>EPI</Label>
              <Input
                value={`${emprestimo.epi.nome} - ${emprestimo.quantidade}x`}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select 
                name="status" 
                defaultValue={emprestimo.status}
                onValueChange={(value) => setStatus(value as EmprestimoStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.status && (
                <div className="text-sm text-red-600">
                  {state.errors.status[0]}
                </div>
              )}
            </div>

            {showDevolucaoFields && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="dataDevolucao">Data da Devolução *</Label>
                  <Input
                    id="dataDevolucao"
                    name="dataDevolucao"
                    type="date"
                    defaultValue={emprestimo.dataDevolucao?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]}
                    required={showDevolucaoFields}
                    aria-describedby="dataDevolucao-error"
                  />
                  {state.errors?.dataDevolucao && (
                    <div id="dataDevolucao-error" className="text-sm text-red-600">
                      {state.errors.dataDevolucao[0]}
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="observacaoDevolucao">Observação na Devolução</Label>
                  <Textarea
                    id="observacaoDevolucao"
                    name="observacaoDevolucao"
                    placeholder="Descreva o estado do item, motivo do dano, etc..."
                    rows={3}
                    defaultValue={emprestimo.observacaoDevolucao || ""}
                  />
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label htmlFor="observacao">Observação Geral</Label>
              <Textarea
                id="observacao"
                name="observacao"
                placeholder="Observações sobre o empréstimo..."
                rows={3}
                defaultValue={emprestimo.observacao || ""}
              />
            </div>

            <div className="grid gap-2">
              <Label>Data do Empréstimo</Label>
              <Input
                value={new Date(emprestimo.dataEmprestimo).toLocaleDateString('pt-BR')}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="grid gap-2">
              <Label>Data de Vencimento</Label>
              <Input
                value={new Date(emprestimo.dataVencimento).toLocaleDateString('pt-BR')}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={pending}>
                {pending ? "Atualizando..." : "Atualizar Empréstimo"}
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