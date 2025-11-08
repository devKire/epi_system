import { AuthGuard } from "../components/auth-guard";
import EPIsListPage from "./epis-list-page";

export default function EPIsPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <EPIsListPage searchParams={{}} />
    </AuthGuard>
  );
}
