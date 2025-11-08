import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "COLABORADOR";
}

export async function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const session = await getServerSession(authOptions);

  // Se não está logado, redireciona para login
  if (!session) {
    redirect("/login");
  }

  // Se tem role específica requerida, verifica
  if (requiredRole && session.user.role !== requiredRole) {
    // Se é COLABORADOR tentando acessar rota de ADMIN, redireciona para página do colaborador
    if (session.user.role === "COLABORADOR" && requiredRole === "ADMIN") {
      redirect("/colaborador");
    }
    // Se é ADMIN tentando acessar rota de COLABORADOR (não deveria acontecer), permite
    // pois ADMIN tem acesso a tudo
  }

  return <>{children}</>;
}
