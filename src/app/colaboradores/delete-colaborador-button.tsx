"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteColaborador } from "@/lib/actions";

export default function DeleteColaboradorButton({
  colaboradorId,
}: {
  colaboradorId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteColaborador(colaboradorId);
      if (result.success) {
        router.refresh(); // Atualiza a lista sem recarregar a página
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <Button
      onClick={handleDelete}
      variant="destructive"
      size="sm"
      disabled={isPending}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
