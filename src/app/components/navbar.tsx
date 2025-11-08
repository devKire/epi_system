import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { AdminNavbar } from "./admin-navbar";
import { ColaboradorNavbar } from "./colaborador-navbar";

export async function Navbar() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  if (session.user.role === "ADMIN") {
    return <AdminNavbar />;
  }

  return <ColaboradorNavbar />;
}
