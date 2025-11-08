import { AuthGuard } from "../components/auth-guard";
import RelatoriosClientPage from "./relatorios-client-page";

export default function RelatoriosPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <RelatoriosClientPage />
    </AuthGuard>
  );
}
