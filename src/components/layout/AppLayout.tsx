import { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="mt-auto bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 pb-12 pt-8">
          {/* Top accent divider */}
          <div className="mx-auto mb-8 h-px w-32 rounded-full bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0" aria-hidden="true" />

          {/* Footer shell */}
          <div className="relative isolate overflow-hidden rounded-3xl border border-border/60 bg-card/70 shadow-card">
            <div className="pointer-events-none absolute inset-0 opacity-50 blur-3xl" aria-hidden="true" style={{ background: 'radial-gradient(circle at 50% 15%, hsl(187 85% 53% / 0.16), transparent 55%)' }} />

            <div className="relative px-6 py-10 md:px-10 md:py-12 flex flex-col items-center gap-5 text-center">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">Text Result Analyzer</p>
                <p className="text-base text-muted-foreground/80">Smart marks from pasted tables</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 text-sm md:text-base text-muted-foreground/80">
                <a
                  href="https://wa.me/918001326921"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Report a problem on WhatsApp"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2 font-medium text-foreground/90 transition-all duration-250 hover:border-primary/60 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-glow" aria-hidden="true" />
                  <span>Report a problem</span>
                </a>

                <span className="hidden sm:inline text-muted-foreground/40">•</span>

                <p className="flex items-center justify-center gap-2">
                  <span>Made by</span>
                  <a
                    href="https://portfolio-six-sooty-14.vercel.app/"
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1 font-medium text-foreground transition-all duration-250 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <span className="relative inline-flex items-center">
                      <span className="absolute inset-x-0 -bottom-1 h-px origin-center scale-x-0 bg-gradient-to-r from-primary/0 via-primary/70 to-primary/0 transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-300">Tridip</span>
                    </span>
                  </a>
                </p>
              </div>

              <p className="text-sm md:text-base text-muted-foreground/60">@Smart Result Analyzer · All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}