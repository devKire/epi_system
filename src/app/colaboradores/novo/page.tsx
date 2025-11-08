import { AuthGuard } from "@/app/components/auth-guard";

import AddColaborador from "./add-colaborador";

export default function AddColaboradorPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <AddColaborador />
    </AuthGuard>
  );
}
