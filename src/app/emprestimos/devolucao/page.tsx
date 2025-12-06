// epi_system\src\app\emprestimos\devolucao\page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
import { registrarDevolucao } from "@/lib/actions";

export default function DevolucaoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emprestimoId = searchParams.get("emprestimoId") || "";
  
  const [state, formAction, pending] = useActionState(registrarDevolucao, {
    message: "",
    errors: {},
  });

  const [status, setStatus] = useState<string>("DEVOLVIDO");
  const showDevolucaoFields = ["DEVOLVIDO", "DANIFICADO", "PERDIDO"].includes(status);

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/emprestimos");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  return (
    <div className="p-6">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Registrar Devolução/Status</CardTitle>
          <CardDescription>
            Atualize o status e registre a devolução de um EPI
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
            <input type="hidden" name="emprestimoId" value={emprestimoId} />

            <div className="grid gap-2">
              <Label htmlFor="emprestimoIdDisplay">ID do Empréstimo</Label>
              <Input
                id="emprestimoIdDisplay"
                value={emprestimoId}
                className="bg-gray-50"
              />
              {state.errors?.emprestimoId && (
                <div className="text-sm text-red-600">
                  {state.errors.emprestimoId[0]}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status da Devolução *</Label>
              <Select 
                name="status" 
                defaultValue="DEVOLVIDO"
                onValueChange={setStatus}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEVOLVIDO">Devolvido</SelectItem>
                  <SelectItem value="DANIFICADO">Danificado</SelectItem>
                  <SelectItem value="PERDIDO">Perdido</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-500">
                {status === "DEVOLVIDO" && "• EPI devolvido em bom estado"}
                {status === "DANIFICADO" && "• EPI devolvido com danos"}
                {status === "PERDIDO" && "• EPI não pode ser devolvido"}
              </div>
              {state.errors?.status && (
                <div className="text-sm text-red-600">
                  {state.errors.status[0]}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantidadeDevolvida">Quantidade *</Label>
              <Input
                id="quantidadeDevolvida"
                name="quantidadeDevolvida"
                type="number"
                min="1"
                required
                aria-describedby="quantidadeDevolvida-error"
                placeholder="Ex: 1"
              />
              <div className="text-sm text-gray-500">
                Quantidade que está sendo devolvida
              </div>
              {state.errors?.quantidadeDevolvida && (
                <div
                  id="quantidadeDevolvida-error"
                  className="text-sm text-red-600"
                >
                  {state.errors.quantidadeDevolvida[0]}
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
                    defaultValue={new Date().toISOString().split('T')[0]}
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
                  <Label htmlFor="observacaoDevolucao">
                    {status === "DANIFICADO" ? "Descrição do Dano" : 
                     status === "PERDIDO" ? "Motivo da Perda" : 
                     "Observações da Devolução"}
                  </Label>
                  <Textarea
                    id="observacaoDevolucao"
                    name="observacaoDevolucao"
                    placeholder={
                      status === "DANIFICADO" ? "Descreva o dano encontrado no EPI..." :
                      status === "PERDIDO" ? "Explique as circunstâncias da perda..." :
                      "Observações sobre o estado do EPI devolvido..."
                    }
                    rows={3}
                  />
                  <div className="text-sm text-gray-500">
                    {status === "DANIFICADO" && "• Esta informação será usada para manutenção"}
                    {status === "PERDIDO" && "• Registro importante para controle patrimonial"}
                  </div>
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label htmlFor="observacao">Observação Geral (Opcional)</Label>
              <Textarea
                id="observacao"
                name="observacao"
                placeholder="Observações adicionais sobre o empréstimo..."
                rows={2}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={pending} className="flex-1">
                {pending ? "Registrando..." : "Confirmar Devolução"}
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