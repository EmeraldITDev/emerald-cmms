import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-[1.75rem]">{title}</h1>
        {description ? <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="blueprint-grid flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-lg border bg-card text-muted-foreground">
        <Icon className="size-6" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "critical" | "info";
}) {
  const tones = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    critical: "text-destructive",
    info: "text-info",
  } as const;
  return (
    <div className="surface-card group p-4 transition-shadow hover:shadow-raised sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">{label}</p>
        <span className={cn("shrink-0 rounded-md border bg-muted/60 p-1.5 transition-colors group-hover:bg-accent", tones[tone])}>
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className={cn("mt-3 text-2xl font-bold tabular-nums tracking-tight sm:text-3xl", tones[tone])}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card flex min-w-0 flex-col", className)}>
      <header className="flex flex-col gap-2 border-b px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:px-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{title}</h2>
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </header>
      <div className="min-w-0 flex-1 p-3 sm:p-4">{children}</div>
    </section>
  );
}

/** Full-width stacked filters on small screens; inline from sm up. */
export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 lg:flex lg:flex-wrap", className)}>{children}</div>;
}

export function FilterControl({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("w-full min-w-0 [&_button]:w-full [&_input]:w-full lg:[&_button]:w-auto lg:[&_input]:max-w-xs", className)}>{children}</div>;
}

/** Horizontally scrollable table wrapper — avoids squashing columns on narrow viewports. */
export function TableWrap({ children, minWidth = 640 }: { children: ReactNode; minWidth?: number }) {
  return (
    <div className="surface-card min-w-0 overflow-hidden">
      <div className="table-scroll">
        <div style={{ minWidth }}>{children}</div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function useMockLoading(ms = 450) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return ready;
}
