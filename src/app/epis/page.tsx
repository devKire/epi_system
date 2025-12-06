//epi_system\src\app\epis\page.tsx

import { AuthGuard } from "../components/auth-guard";
import { Navbar } from "../components/navbar";
import EPIsListPage from "./epis-list-page";


interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EPIsPage(props: PageProps) {
   const searchParams = await props.searchParams;
  return (
    <AuthGuard requiredRole="ADMIN">
        <Navbar />
      <EPIsListPage searchParams={Promise.resolve(searchParams)}/>
    </AuthGuard>
  );
}
