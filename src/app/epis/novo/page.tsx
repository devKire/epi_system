//epi_system\src\app\epis\novo\page.tsx

import { AuthGuard } from "@/app/components/auth-guard";

import AddEpi from "./add-epi";

export default function AddEpiPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <AddEpi />
    </AuthGuard>
  );
}
