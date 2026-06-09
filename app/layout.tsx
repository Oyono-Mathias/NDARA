import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Optimisation des polices natives pour éradiquer le CLS
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NDARA | La Plateforme d'Éducation Nouvelle Génération",
  description: "Formez-vous avec les meilleurs experts. Transition vers une architecture Next.js optimisée pour des performances maximales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="font-sans antialiased bg-black text-white selection:bg-[#10B981]/30 selection:text-[#10B981]">
        {/*
          Les Providers (AuthContext, RoleContext) devront être introduits dans un composant "ClientProvider" séparé 
          et injectés ici pour maintenir ce layout en tant que Server Component (RSC).
          Pour la Phase 1 (Landing), nous restons strictement Server-Side.
        */}
        <main className="min-h-screen relative overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
