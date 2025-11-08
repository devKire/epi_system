"use client";

import { Shield, User } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { LogoutButton } from "./logout-button";

export function ColaboradorNavbar() {
  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="flex h-16 items-center px-4">
        {/* Logo e título */}
        <div className="flex items-center space-x-3">
          <Shield className="text-primary h-8 w-8" />
          <div>
            <h1 className="text-xl font-bold">Sistema de EPIs</h1>
            <span className="text-muted-foreground text-xs">
              Área do Colaborador
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="ml-6">
          <Link href="/colaborador">
            <Button variant="secondary" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Meus Empréstimos</span>
            </Button>
          </Link>
        </div>

        {/* User info and logout */}
        <div className="ml-auto flex items-center space-x-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">Colaborador</p>
            <p className="text-muted-foreground text-xs">Acesso limitado</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
