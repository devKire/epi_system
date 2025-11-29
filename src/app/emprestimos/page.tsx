import { AuthGuard } from "../components/auth-guard";
import EmprestimosListPage from "./emprestimos-list-page";


export default function ColaboradoresPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <EmprestimosListPage searchParams={Promise.resolve({})} />
    </AuthGuard>
  );
}
