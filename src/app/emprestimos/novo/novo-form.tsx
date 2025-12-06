// epi_system\src\app\emprestimos\novo\novo-form.tsx
"use client";

import type { Colaborador, EPI } from "@prisma/client";
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
  const [selectedEpi, setSelectedEpi] = useState<string>("");
  const [quantidade, setQuantidade] = useState<string>("1");

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

  // Encontrar EPI selecionada
  const epiSelecionada = epis.find(epi => epi.id === selectedEpi);
  const quantidadeDisponivel = epiSelecionada?.quantidade || 0;

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
              <Label htmlFor="colaboradorId">Colaborador *</Label>
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
              <Label htmlFor="epiId">EPI *</Label>
              <Select 
                name="epiId" 
                required
                onValueChange={setSelectedEpi}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma EPI" />
                </SelectTrigger>
                <SelectContent>
                  {epis.map((epi) => (
                    <SelectItem key={epi.id} value={epi.id}>
                      {epi.nome} - {epi.quantidade} disponíveis
                      {epi.validade && new Date(epi.validade) < new Date() && (
                        <span className="text-red-500"> (Vencida)</span>
                      )}
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
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                name="quantidade"
                type="number"
                min="1"
                max={quantidadeDisponivel}
                required
                placeholder="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                aria-describedby="quantidade-error"
              />
              <div className="text-sm text-gray-500">
                Disponível: {quantidadeDisponivel} unidades
              </div>
              {state.errors?.quantidade && (
                <div id="quantidade-error" className="text-sm text-red-600">
                  {state.errors.quantidade[0]}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue="EMPRESTADO">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPRESTADO">Emprestado</SelectItem>
                  <SelectItem value="EM_USO">Em Uso</SelectItem>
                  <SelectItem value="FORNECIDO">Fornecido</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-500">
                {selectedEpi && (
                  <>
                    {epiSelecionada?.validade && new Date(epiSelecionada.validade) < new Date() ? (
                      <span className="text-red-500">
                        Atenção: EPI vencida. Use &quot;Fornecido&quot; com cautela.
                      </span>
                    ) : (
                      <span>
                        • Emprestado: EPI será devolvido<br/>
                        • Em Uso: EPI em uso temporário<br/>
                        • Fornecido: EPI entregue permanentemente
                      </span>
                    )}
                  </>
                )}
              </div>
              {state.errors?.status && (
                <div className="text-sm text-red-600">
                  {state.errors.status[0]}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
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

            <div className="grid gap-2">
              <Label htmlFor="observacao">Observação</Label>
              <Textarea
                id="observacao"
                name="observacao"
                placeholder="Observações sobre o empréstimo..."
                rows={3}
              />
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