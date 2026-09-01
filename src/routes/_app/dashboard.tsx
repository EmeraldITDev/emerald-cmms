import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ClipboardList,
  DollarSign,
  Factory,
  Gauge,
  TrendingUp,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import { AssetStatusBadge, HealthBar } from "@/components/status";
import { KpiCard, PageHeader, SectionCard, TableSkeleton, useMockLoading } from "@/components/ui-bits";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useCmms } from "@/store/cmms";
import { costTrend, pmComplianceTrend, SITE } from "@/data/seed";
import { compactCurrency, formatDate } from "@/lib/format";
import type { WorkOrderStatus } from "@/data/types";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});

const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  backlog: "hsl(var(--muted-foreground))",
  scheduled: "hsl(var(--info))",
  in_progress: "hsl(var(--warning))",
  completed: "hsl(var(--success))",
  closed: "hsl(var(--border))",
};

function DashboardPage() {
  const ready = useMockLoading();
  const { assets, workOrders, today, activity, pmSchedules } = useCmms();

  const equipment = assets.filter((a) => a.level === "equipment");
  const openWo = workOrders.filter((w) => !["completed", "closed"].includes(w.status));
  const overdueWo = openWo.filter((w) => w.dueDate < today);
  const criticalAssets = equipment.filter((a) => a.status === "critical" || a.status === "offline");
  const monthCost = workOrders
    .filter((w) => w.completedAt && w.completedAt.slice(0, 7) === today.slice(0, 7))
    .reduce((s, w) => s + w.cost, 0);

  const pmDue = pmSchedules.filter((p) => p.nextDue <= today).length;
  const pmTotal = pmSchedules.length;
  const pmCompliance = Math.round(((pmTotal - pmDue) / pmTotal) * 100);

  const byStatus = (["backlog", "scheduled", "in_progress", "completed", "closed"] as WorkOrderStatus[]).map(
    (status) => ({
      status: status.replace("_", " "),
      count: workOrders.filter((w) => w.status === status).length,
      fill: STATUS_COLORS[status],
    }),
  );

  const byPriority = ["low", "medium", "high", "critical"].map((p) => ({
    priority: p,
    count: workOrders.filter((w) => w.priority === p).length,
  }));

  if (!ready) {
    return (
      <div>
        <PageHeader title="Dashboard" description={SITE} />
        <TableSkeleton rows={8} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Dashboard" description={SITE} />

      <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiCard label="Total assets" value={equipment.length} icon={Factory} />
        <KpiCard label="Open work orders" value={openWo.length} icon={ClipboardList} tone="info" />
        <KpiCard label="Overdue work orders" value={overdueWo.length} icon={AlertTriangle} tone="critical" />
        <KpiCard label="PM compliance" value={`${pmCompliance}%`} icon={TrendingUp} tone={pmCompliance >= 85 ? "success" : "warning"} />
        <KpiCard label="Critical / down" value={criticalAssets.length} icon={Gauge} tone="critical" />
        <KpiCard label="Maint. cost (month)" value={compactCurrency(monthCost || costTrend.at(-1)!.cost)} icon={DollarSign} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <SectionCard title="Work orders by status" className="xl:col-span-1">
          <ChartContainer
            config={{ count: { label: "Count", color: "hsl(var(--primary))" } }}
            className="mx-auto h-[220px] w-full max-h-[260px] sm:aspect-square"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={byStatus} dataKey="count" nameKey="status" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {byStatus.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </SectionCard>

        <SectionCard title="Work orders by priority">
          <ChartContainer config={{ count: { label: "Count", color: "hsl(var(--primary))" } }} className="h-[260px] w-full">
            <BarChart data={byPriority} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="priority" type="category" width={64} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
            </BarChart>
          </ChartContainer>
        </SectionCard>

        <SectionCard title="Maintenance cost trend" description="Last 6 months">
          <ChartContainer
            config={{
              cost: { label: "Actual", color: "hsl(var(--primary))" },
              budget: { label: "Budget", color: "hsl(var(--muted-foreground))" },
            }}
            className="h-[260px] w-full"
          >
            <LineChart data={costTrend}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis hide tickFormatter={(v) => compactCurrency(v)} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="budget" stroke="var(--color-budget)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ChartContainer>
        </SectionCard>

        <SectionCard title="PM compliance trend" className="lg:col-span-2 xl:col-span-1">
          <ChartContainer config={{ compliance: { label: "Compliance %", color: "hsl(var(--success))" } }} className="h-[260px] w-full">
            <LineChart data={pmComplianceTrend}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis domain={[60, 100]} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="compliance" stroke="var(--color-compliance)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ChartContainer>
        </SectionCard>

        <SectionCard title="Critical assets" description="Requires immediate attention">
          <ul className="space-y-3">
            {criticalAssets.length === 0 ? (
              <li className="text-sm text-muted-foreground">No critical assets right now.</li>
            ) : (
              criticalAssets.map((a) => (
                <li key={a.id}>
                  <Link to="/assets/$id" params={{ id: a.id }} className="flex items-center justify-between gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50">
                    <div>
                      <p className="text-sm font-semibold">{a.id}</p>
                      <p className="text-xs text-muted-foreground">{a.name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <AssetStatusBadge status={a.status} />
                      <HealthBar value={a.healthScore} />
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </SectionCard>

        <SectionCard title="Recent activity" className="lg:col-span-2">
          <ul className="space-y-3">
            {activity.slice(0, 8).map((item) => (
              <li key={item.id} className="flex gap-3 border-b pb-3 last:border-0 last:pb-0">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                  <Activity className="size-4 text-muted-foreground" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{item.text}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.actor} · {formatDate(item.at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
