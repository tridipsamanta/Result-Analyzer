import { Link } from 'react-router-dom';
import { BarChart3, FileText, Users, GitCompare, TrendingUp, Database, Zap, ArrowRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PasteAreaCard } from '@/components/paste/PasteAreaCard';
import { useDatasetStore } from '@/store/datasetStore';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: FileText,
    title: 'Smart Parsing',
    description: 'Paste your result table and watch it transform into structured data instantly.',
  },
  {
    icon: Users,
    title: 'Student Search',
    description: 'Find any student by name, roll number, or ABC ID in milliseconds.',
  },
  {
    icon: GitCompare,
    title: 'Compare Results',
    description: 'Compare two students side-by-side across all subjects.',
  },
  {
    icon: TrendingUp,
    title: 'Rich Analytics',
    description: 'Visualize performance with charts, stats, and distributions.',
  },
];

export default function Home() {
  const { datasets, currentDataset } = useDatasetStore();
  
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-16 pb-16 pt-6">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 px-6 py-12 shadow-card backdrop-blur-md">
          <div className="pointer-events-none absolute inset-0 opacity-60 blur-3xl" aria-hidden="true" style={{ background: 'radial-gradient(circle at 20% 20%, hsl(187 85% 53% / 0.18), transparent 35%), radial-gradient(circle at 80% 0%, hsl(260 90% 75% / 0.12), transparent 30%)' }} />
          <div className="relative flex flex-col items-center gap-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm">
              <Zap className="h-4 w-4" />
              <span>Smart result analysis</span>
            </div>

            <div className="space-y-3 max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-gradient">Text Result Analyzer</span>
          </h1>
              <h3 className="text-4xl md:text-3xl font-bold tracking-tight text-foreground">
                Turn Pasted Result Tables into Actionable Dashboards
              </h3>
              <p className="text-lg text-muted-foreground">
                Paste any exam table, clean it in seconds, then search, compare, and visualize every student without spreadsheets.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button asChild className="gradient-primary text-primary-foreground shadow-glow">
                <a href="#import">Start analyzing</a>
              </Button>
              <Button asChild variant="outline" disabled={!currentDataset} className="border-border/70">
                <Link to="/dashboard" className="inline-flex items-center gap-2">
                  <span>{currentDataset ? 'Go to dashboard' : 'Dashboard (import first)'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {datasets.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto pt-4">
                <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-left">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground/70">Datasets</p>
                  <p className="text-xl font-semibold text-foreground">{datasets.length}</p>
                </div>
                {currentDataset && (
                  <>
                    <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-left">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground/70">Students</p>
                      <p className="text-xl font-semibold text-foreground">{currentDataset.totalStudents}</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-left">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground/70">Subjects</p>
                      <p className="text-xl font-semibold text-foreground">{currentDataset.subjects.length}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Separator */}
        <div className="mx-auto h-px w-full bg-gradient-to-r from-transparent via-border/60 to-transparent" aria-hidden="true" />
        
        {/* Paste Area */}
        <section id="import" className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Database className="w-5 h-5 text-primary" />
            <h2>Import result data</h2>
          </div>
          
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-6 shadow-card">
            <div className="pointer-events-none absolute inset-0 opacity-40 blur-3xl" aria-hidden="true" style={{ background: 'radial-gradient(circle at 80% 0%, hsl(210 80% 60% / 0.18), transparent 45%)' }} />
            <div className="relative">
              <PasteAreaCard />
            </div>
          </div>
        </section>

        {/* Separator */}
        <div className="mx-auto h-px w-full bg-gradient-to-r from-transparent via-border/60 to-transparent" aria-hidden="true" />
        
        {/* Features Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">What you can do</h2>
            <p className="text-muted-foreground">Everything you need for clean, comparable, and visual result insights.</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-80" aria-hidden="true" style={{ background: 'radial-gradient(circle at 20% 20%, hsl(187 85% 53% / 0.08), transparent 35%)' }} />
                <div className="relative flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
