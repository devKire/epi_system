import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Se não tem token e não está na página de login, redireciona para login
    if (!token && path !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Se tem token e está na página de login, redireciona baseado no role
    if (token && path === "/login") {
      if (token.role === "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      } else {
        return NextResponse.redirect(new URL("/colaborador", req.url));
      }
    }

    // Se é COLABORADOR tentando acessar rotas de ADMIN
    if (token?.role === "COLABORADOR" && path !== "/colaborador") {
      return NextResponse.redirect(new URL("/colaborador", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Rotas públicas
        if (path === "/login") {
          return true;
        }

        // Se não está autenticado, não permite acesso a rotas protegidas
        if (!token) {
          return false;
        }

        // ADMIN tem acesso a tudo
        if (token.role === "ADMIN") {
          return true;
        }

        // COLABORADOR só tem acesso à página do colaborador
        if (token.role === "COLABORADOR") {
          return path === "/colaborador";
        }

        return false;
      },
    },
  },
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
