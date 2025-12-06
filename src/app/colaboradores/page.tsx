// app/colaboradores/page.tsx
import { AuthGuard } from "../components/auth-guard";
import { Navbar } from "../components/navbar";
import ColaboradoresListPage from "./colaboradores-list-page";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ColaboradoresPage(props: PageProps) {
  const searchParams = await props.searchParams;
  
  return (
    <AuthGuard requiredRole="ADMIN">
      <Navbar />
      <ColaboradoresListPage searchParams={Promise.resolve(searchParams)} />
    </AuthGuard>
  );
}