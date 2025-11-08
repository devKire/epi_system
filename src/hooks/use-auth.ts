"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function useAuth(requiredRole?: "ADMIN" | "COLABORADOR") {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (requiredRole && session.user.role !== requiredRole) {
      if (session.user.role === "COLABORADOR" && requiredRole === "ADMIN") {
        router.push("/colaborador");
      }
    }
  }, [session, status, requiredRole, router]);

  return {
    session,
    status,
    isAuthenticated: !!session,
    isAdmin: session?.user.role === "ADMIN",
    isColaborador: session?.user.role === "COLABORADOR",
  };
}
