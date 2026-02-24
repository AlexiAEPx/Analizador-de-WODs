import type { Metadata } from "next";
import Link from "next/link";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "WOD Analyzer",
  description: "Análisis exhaustivo de WODs de CrossFit",
};

const themeScript = `(function(){try{var t=localStorage.getItem("theme");var r;if(t==="dark"||t==="light"){r=t}else{r=window.matchMedia("(prefers-color-scheme:light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",r)}catch(e){}})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <div className="max-w-3xl mx-auto px-5 py-6">
            {/* Nav */}
            <nav className="flex items-center justify-between mb-8">
              <Link
                href="/"
                className="text-[0.7em] font-semibold tracking-[4px] uppercase"
                style={{ color: "rgba(var(--base-rgb), 0.5)" }}
              >
                🏋️ WOD Analyzer
              </Link>
              <div className="flex gap-1 items-center">
                <Link
                  href="/"
                  className="glass-sm !py-2 !px-4 text-[0.78em] font-medium hover:bg-[rgba(var(--base-rgb),0.06)] transition-colors"
                  style={{ color: "rgba(var(--base-rgb), 0.5)" }}
                >
                  Analizar
                </Link>
                <Link
                  href="/historial"
                  className="glass-sm !py-2 !px-4 text-[0.78em] font-medium hover:bg-[rgba(var(--base-rgb),0.06)] transition-colors"
                  style={{ color: "rgba(var(--base-rgb), 0.5)" }}
                >
                  Historial
                </Link>
                <ThemeToggle />
              </div>
            </nav>

            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
