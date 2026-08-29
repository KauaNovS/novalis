import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Sidebar from "@/components/layout/Sidebar";
import AIAssistant from "@/components/ai/AIAssistant";
import RouteGuard from "@/components/layout/RouteGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Plataforma Imobiliária Inteligente",
  description: "Gestão inteligente de empreendimentos imobiliários",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          <RouteGuard>
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <main className="flex-1">{children}</main>
            </div>
            <AIAssistant />
          </RouteGuard>
        </Providers>
      </body>
    </html>
  );
}
