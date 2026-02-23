import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "WOD Analyzer",
  description: "Análisis exhaustivo de WODs de CrossFit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <div className="max-w-3xl mx-auto px-5 py-6">
          {/* Nav */}
          <nav className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="text-[0.7em] font-semibold tracking-[4px] uppercase"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              🏋️ WOD Analyzer
            </Link>
            <div className="flex gap-1">
              <Link
                href="/"
                className="glass-sm !py-2 !px-4 text-[0.78em] font-medium hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Analizar
              </Link>
              <Link
                href="/historial"
                className="glass-sm !py-2 !px-4 text-[0.78em] font-medium hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Historial
              </Link>
            </div>
          </nav>

          {children}
        </div>
      </body>
    </html>
  );
}
