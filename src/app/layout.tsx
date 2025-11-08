import "./globals.css";

import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { Toaster } from "sonner";

import { AuthProvider } from "./components/auth-provider";
import { Navbar } from "./components/navbar";

// Fontes do Google via next/font com otimização
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

// URLs para ícones (você pode substituir por ícones próprios do sistema EPI)
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
const SYSTEM_LOGO = "/epi-system-logo.png"; // Você pode adicionar um logo próprio
const DEFAULT_ICON = "/favicon.ico";

export const metadata: Metadata = {
  title: "Sistema de Gestão de EPIs - Controle de Equipamentos de Proteção",
  description:
    "Sistema completo para gestão de Equipamentos de Proteção Individual (EPIs), controle de empréstimos, colaboradores e relatórios.",
  keywords:
    "EPI, equipamento proteção individual, gestão EPIs, controle empréstimos, segurança do trabalho, colaboradores, relatórios EPI",
  openGraph: {
    title: "Sistema de Gestão de EPIs",
    description:
      "Sistema completo para gestão e controle de Equipamentos de Proteção Individual",
    url: BASE_URL,
    siteName: "Sistema EPI",
    images: [
      {
        url: SYSTEM_LOGO,
        width: 512,
        height: 512,
        alt: "Sistema de Gestão de EPIs",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistema de Gestão de EPIs",
    description: "Controle completo de Equipamentos de Proteção Individual",
    images: [SYSTEM_LOGO],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  authors: [{ name: "Sistema de Gestão de EPIs" }],
  publisher: "Sistema EPI",
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  metadataBase: new URL(BASE_URL),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Preconnect para otimização */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        {/* Meta tags para mobile */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta name="theme-color" content="#2563eb" /> {/* Azul do sistema */}
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Favicon otimizado */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/favicon-16x16.png"
          type="image/png"
          sizes="16x16"
        />
        <link
          rel="icon"
          href="/favicon-32x32.png"
          type="image/png"
          sizes="32x32"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Ícones para Android */}
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-chrome-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/android-chrome-512x512.png"
        />
        {/* Para compatibilidade extra */}
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Meta tags para sistema empresarial */}
        <meta name="robots" content="index, follow" />
        <meta name="google" content="nositelinkssearchbox" />
        {/* Structured Data para Sistema de Gestão */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Sistema de Gestão de EPIs",
              description:
                "Sistema completo para gestão de Equipamentos de Proteção Individual",
              url: BASE_URL,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                description: "Sistema de gestão empresarial para EPIs",
              },
              featureList: [
                "Gestão de Colaboradores",
                "Controle de Estoque de EPIs",
                "Registro de Empréstimos",
                "Relatórios e Estatísticas",
                "Controle de Vencimentos",
              ],
              knowsAbout: [
                "EPI",
                "Equipamento Proteção Individual",
                "Segurança do Trabalho",
                "Gestão de Estoque",
                "Controle de Empréstimos",
                "Relatórios Gerenciais",
              ],
            }),
          }}
        />
      </head>

      <body
        className={`${inter.variable} ${montserrat.variable} min-h-screen bg-gray-50 font-sans antialiased`}
        style={{
          fontFamily: "var(--font-body)",
        }}
      >
        {/* Estrutura principal com navbar */}
        <div className="flex min-h-screen flex-col">
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
          </AuthProvider>
        </div>

        {/* Notificações */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1f2937",
              color: "white",
              border: "none",
            },
            className: "font-sans",
          }}
        />

        {/* Script de inicialização */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('Sistema de Gestão de EPIs - Carregado com sucesso');
            `,
          }}
        />
      </body>
    </html>
  );
}
