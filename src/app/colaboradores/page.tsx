//epi_system\src\app\colaboradores\page.tsx

import { AuthGuard } from "../components/auth-guard";
import { Navbar } from "../components/navbar";
import ColaboradoresListPage from "./colaboradores-list-page";

export default function ColaboradoresPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <Navbar />
      <ColaboradoresListPage searchParams={Promise.resolve({})} />
    </AuthGuard>
  );
}
