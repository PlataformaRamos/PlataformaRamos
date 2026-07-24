import type { Metadata } from "next";
import "./globals.css";

import { ViewTransitions } from 'next-view-transitions'
import NextTopLoader from 'nextjs-toploader'
import SWRProvider from '@/providers/SWRProvider'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: {
    default: "Plataforma Ramos | Tu Propia Tienda Online",
    template: "%s | Plataforma Ramos",
  },
  description: "Plataforma de gestión y catálogo multi-tenant para crear tiendas virtuales y recibir pedidos por WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html
        lang="es"
        className="h-full antialiased"
        style={{
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        }}
      >
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        </head>
        <body className="min-h-full flex flex-col">
          <NextTopLoader
            color="#3B82F6"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #3B82F6,0 0 5px #3B82F6"
          />
          <SWRProvider>
            {children}
          </SWRProvider>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ViewTransitions>
  );
}
