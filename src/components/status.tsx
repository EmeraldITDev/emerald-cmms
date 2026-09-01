import { AlertOctagon, AlertTriangle, CheckCircle2, CircleDot, Clock, PauseCircle, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { titleCase } from "@/lib/format";
import type { AssetStatus, Criticality, Priority, WorkOrderStatus } from "@/data/types";

const base =
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap";

const tone = {
  success: "border-success/40 bg-success/12 text-success",
  warning: "border-warning/45 bg-warning/15 text-warning",
  degraded: "border-degraded/45 bg-degraded/15 text-degraded",
  critical: "border-destructive/45 bg-destructive/12 text-destructive",
  info: "border-info/40 bg-info/12 text-info",
  neutral: "border-border bg-muted text-muted-foreground",
} as const;

export function AssetStatusBadge({ status, className }: { status: AssetStatus; className?: string }) {
  const map: Record<AssetStatus, [keyof typeof tone, typeof CheckCircle2, string]> = {
    operating: ["success", CheckCircle2, "Operating"],
    warning: ["warning", AlertTriangle, "Warning"],
    degraded: ["degraded", TrendingDown, "Degraded"],
    critical: ["critical", AlertOctagon, "Critical"],
    offline: ["neutral", PauseCircle, "Offline"],
  };
  const [t, Icon, label] = map[status];
  return (
    <span className={cn(base, tone[t], className)}>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}

export function WorkOrderStatusBadge({ status, className }: { status: WorkOrderStatus; className?: string }) {
  const map: Record<WorkOrderStatus, keyof typeof tone> = {
    backlog: "neutral",
    scheduled: "info",
    in_progress: "warning",
    completed: "success",
    closed: "neutral",
  };
  const Icon = status === "completed" ? CheckCircle2 : status === "in_progress" ? Clock : CircleDot;
  return (
    <span className={cn(base, tone[map[status]], className)}>
      <Icon className="size-3.5" aria-hidden />
      {titleCase(status)}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const map: Record<Priority, keyof typeof tone> = {
    low: "neutral",
    medium: "info",
    high: "degraded",
    critical: "critical",
  };
  return (
    <span className={cn(base, tone[map[priority]], className)}>
      <span aria-hidden>•</span>
      {titleCase(priority)}
    </span>
  );
}

export function CriticalityBadge({ criticality }: { criticality: Criticality }) {
  const map: Record<Criticality, keyof typeof tone> = { low: "neutral", medium: "info", high: "degraded" };
  return <span className={cn(base, tone[map[criticality]])}>{titleCase(criticality)} criticality</span>;
}

export function HealthBar({ value, className }: { value: number; className?: string }) {
  const t = value >= 80 ? "bg-success" : value >= 65 ? "bg-warning" : value >= 50 ? "bg-degraded" : "bg-destructive";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted" role="img" aria-label={`Health ${value}%`}>
        <div className={cn("h-full rounded-full transition-all", t)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums">{value}%</span>
    </div>
  );
}

export function LowStockBadge() {
  return (
    <span className={cn(base, tone.critical)}>
      <AlertTriangle className="size-3.5" aria-hidden />
      Low stock
    </span>
  );
}

export function AvailabilityBadge({ availability }: { availability: "available" | "on_job" | "off_shift" }) {
  const map = { available: "success", on_job: "info", off_shift: "neutral" } as const;
  return <span className={cn(base, tone[map[availability]])}>{titleCase(availability)}</span>;
}
