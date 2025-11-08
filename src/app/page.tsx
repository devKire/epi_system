import { AuthGuard } from "./components/auth-guard";
import DashboardPage from "./dashboard-page";

export default function Home() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <DashboardPage />
    </AuthGuard>
  );
}
