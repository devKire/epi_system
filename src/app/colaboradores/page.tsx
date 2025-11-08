import { AuthGuard } from "../components/auth-guard";
import ColaboradoresListPage from "./colaboradores-list-page";

export default function ColaboradoresPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <ColaboradoresListPage searchParams={{}} />
    </AuthGuard>
  );
}
