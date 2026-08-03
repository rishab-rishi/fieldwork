import Link from "next/link";
import {
  Briefcase,
  Users,
  FolderKanban,
  FileText,
  Upload,
  ShieldCheck,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { PLAN_FEATURES } from "@/lib/plan";

const features = [
  {
    icon: Users,
    title: "Client management",
    description: "Keep every client's contact info, notes, and history in one place.",
  },
  {
    icon: FolderKanban,
    title: "Project tracking",
    description: "Track status, budget, and deadlines for every engagement.",
  },
  {
    icon: FileText,
    title: "Invoicing & PDFs",
    description: "Build invoices with line items and export clean, downloadable PDFs.",
  },
  {
    icon: Upload,
    title: "File sharing",
    description: "Attach deliverables and documents to clients and projects.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based permissions",
    description: "Owners, admins, and members each get the right level of access.",
  },
  {
    icon: CreditCard,
    title: "Client portal",
    description: "Invite clients to a read-only portal to check on their own work.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col overflow-x-clip">
      <header className="sticky top-0 z-40 border-b border-transparent bg-background/70 backdrop-blur-md supports-backdrop-filter:bg-background/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Briefcase className="h-4 w-4" />
            </span>
            Fieldwork
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button render={<Link href="/login" />} variant="ghost">
              Log in
            </Button>
            <Button render={<Link href="/register" />}>Get started</Button>
          </div>
        </div>
      </header>

      <section className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center sm:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden"
        >
          <div className="h-128 w-lg -translate-y-1/3 rounded-full bg-primary/20 blur-3xl" />
          <div className="h-96 w-96 -translate-y-1/4 translate-x-1/3 rounded-full bg-chart-2/20 blur-3xl" />
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <Badge variant="secondary" className="h-6 px-3 text-xs">
            Built for independent freelancers
          </Badge>
        </div>

        <h1 className="animate-in fade-in slide-in-from-bottom-4 mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-balance duration-700 sm:text-5xl">
          Run your freelance business from{" "}
          <span className="bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent">
            one place
          </span>
        </h1>
        <p className="animate-in fade-in slide-in-from-bottom-4 mt-4 max-w-xl text-lg text-muted-foreground duration-700 delay-100 fill-mode-both">
          Manage clients, track projects, send professional invoices, and share files —
          without juggling five different tools.
        </p>
        <div className="animate-in fade-in slide-in-from-bottom-4 mt-8 flex flex-col gap-3 duration-700 delay-200 fill-mode-both sm:flex-row">
          <Button render={<Link href="/register" />} size="lg" className="group">
            Start for free
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button render={<Link href="/login" />} size="lg" variant="outline">
            Log in to demo
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Card
              key={feature.title}
              style={{ animationDelay: `${i * 75}ms` }}
              className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
            >
              <CardHeader>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent transition-colors group-hover:bg-primary/15">
                  <feature.icon className="h-5 w-5 text-accent-foreground transition-colors group-hover:text-primary" />
                </span>
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {feature.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Simple pricing</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start free. Upgrade when you outgrow it.
          </p>
        </div>
        <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
          <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <CardHeader>
              <CardTitle>Free</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-2xl font-semibold">$0</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {PLAN_FEATURES.FREE.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="relative overflow-visible border-primary/50 ring-1 ring-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
            <Badge className="absolute -top-2.5 right-4">Most popular</Badge>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-2xl font-semibold">$29/mo</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {PLAN_FEATURES.PRO.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="mt-auto border-t py-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 text-sm text-muted-foreground">
          <span>Fieldwork — a portfolio project.</span>
          <span>Built with Next.js, Prisma & Postgres</span>
        </div>
      </footer>
    </div>
  );
}
