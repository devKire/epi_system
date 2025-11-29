import { AuthGuard } from "./components/auth-guard";
import { Navbar } from "./components/navbar";
import DashboardPage from "./dashboard-page";

export default function Home() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <Navbar />
      <DashboardPage />
    </AuthGuard>
  );
}
