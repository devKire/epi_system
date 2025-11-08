"use client";

import { BarChart3, Home, Menu, Package, Shield, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { LogoutButton } from "./logout-button";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Colaboradores", href: "/colaboradores", icon: Users },
  { name: "EPIs", href: "/epis", icon: Shield },
  { name: "Empréstimos", href: "/emprestimos", icon: Package },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
];

export function AdminNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="border-b bg-white shadow-sm">
        <div className="flex h-16 items-center px-4">
          {/* Logo e título */}
          <div className="flex items-center space-x-4">
            <div className="hidden items-center space-x-2 md:flex">
              <Shield className="text-primary h-8 w-8" />
              <div>
                <h1 className="text-xl font-bold">Sistema de EPIs</h1>
                <span className="text-muted-foreground text-xs">
                  Administração
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="mx-6 hidden space-x-1 md:flex">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={active ? "secondary" : "ghost"}
                    className={`flex items-center space-x-2 ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="ml-auto md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2 border-b pb-4">
                    <Shield className="text-primary h-8 w-8" />
                    <div>
                      <h1 className="text-lg font-bold">Sistema de EPIs</h1>
                      <span className="text-muted-foreground text-xs">
                        Administração
                      </span>
                    </div>
                  </div>

                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                      >
                        <Button
                          variant={active ? "secondary" : "ghost"}
                          className={`w-full justify-start space-x-2 ${
                            active
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* User info and logout - Desktop */}
          <div className="ml-auto hidden items-center space-x-4 md:flex">
            <div className="text-right">
              <p className="text-sm font-medium">Administrador</p>
              <p className="text-muted-foreground text-xs">Acesso total</p>
            </div>
            <LogoutButton />
          </div>

          {/* Mobile logout */}
          <div className="ml-2 md:hidden">
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <nav className="fixed right-0 bottom-0 left-0 border-t bg-white md:hidden">
        <div className="flex h-16 items-center justify-around">
          {navigation.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`flex h-14 w-14 flex-col items-center space-y-1 ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}
