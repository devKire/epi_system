"use client";

import { useSession } from "next-auth/react";

import { AdminNavbar } from "./admin-navbar";
import { ColaboradorNavbar } from "./colaborador-navbar";
import { NavbarSkeleton } from "./navbar-skeleton"; 

export function Navbar() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <NavbarSkeleton />;
  }

  if (!session) {
    return null;
  }

  if (session.user.role === "ADMIN") {
    return <AdminNavbar />;
  }

  return <ColaboradorNavbar />;
}