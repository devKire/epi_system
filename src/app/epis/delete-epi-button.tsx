"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteEPI } from "@/lib/actions";

interface DeleteEPIButtonProps {
  epiId: string;
}

export default function DeleteEPIButton({ epiId }: DeleteEPIButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Tem certeza que deseja excluir esta EPI?")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteEPI(epiId);
      if (result.success) {
        router.refresh();
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
      <Trash2 className="h-3 w-3" />
    </Button>
  );
}
