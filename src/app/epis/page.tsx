import { AuthGuard } from "../components/auth-guard";
import { Navbar } from "../components/navbar";
import EPIsListPage from "./epis-list-page";

export default function EPIsPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
        <Navbar />
      <EPIsListPage searchParams={Promise.resolve({})} />
    </AuthGuard>
  );
}
