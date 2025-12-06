//epi_system\src\app\emprestimos\page.tsx

import { AuthGuard } from "../components/auth-guard";
import { Navbar } from "../components/navbar";
import EmprestimosListPage from "./emprestimos-list-page";


interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EmprestimosPage(props: PageProps) {
   const searchParams = await props.searchParams;
  return (
    <AuthGuard requiredRole="ADMIN">
      <Navbar />
      <EmprestimosListPage searchParams={Promise.resolve(searchParams)}/>
    </AuthGuard>
  );
}

