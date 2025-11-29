import { AuthGuard } from "../components/auth-guard";
import { Navbar } from "../components/navbar";
import RelatoriosClientPage from "./relatorios-client-page";

export default function RelatoriosPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <Navbar />
      <RelatoriosClientPage />
    </AuthGuard>
  );
}
