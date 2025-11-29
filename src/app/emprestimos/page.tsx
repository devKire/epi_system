import { AuthGuard } from "../components/auth-guard";
import { Navbar } from "../components/navbar";
import EmprestimosListPage from "./emprestimos-list-page";


export default function ColaboradoresPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <Navbar />
      <EmprestimosListPage searchParams={Promise.resolve({})} />
    </AuthGuard>
  );
}
