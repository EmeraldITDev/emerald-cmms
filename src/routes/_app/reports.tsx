import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart, Download } from "lucide-react";
import { PageHeader, SectionCard, TableSkeleton, useMockLoading } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useCmms } from "@/store/cmms";
import { costTrend, pmComplianceTrend } from "@/data/seed";
import { compactCurrency, titleCase } from "@/lib/format";
import { LowStockBadge } from "@/components/status";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function ExportButton({ label }: { label: string }) {
  return (
    <Button variant="outline" size="sm" onClick={() => toast.info(`Exporting ${label}… (demo only)`)}>
      <Download className="size-4" aria-hidden /> Export
    </Button>
  );
}

function ReportsPage() {
  const ready = useMockLoading();
  const { workOrders, parts, pmSchedules, today } = useCmms();

  const statusSummary = ["backlog", "scheduled", "in_progress", "completed", "closed"].map((s) => ({
    status: titleCase(s),
    count: workOrders.filter((w) => w.status === s).length,
  }));

  const lowStockParts = parts.filter((p) => p.quantity < p.reorderLevel);
  const pmDue = pmSchedules.filter((p) => p.nextDue <= today).length;
  const pmCompliance = Math.round(((pmSchedules.length - pmDue) / pmSchedules.length) * 100);

  if (!ready) {
    return (
      <div>
        <PageHeader title="Reports" />
        <TableSkeleton rows={10} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Reports" description="Canned maintenance reports for demos and reviews" />

      <div className="space-y-6">
        <SectionCard title="Work order summary" actions={<ExportButton label="Work Order Summary" />}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statusSummary.map((r) => (
                <TableRow key={r.status}>
                  <TableCell>{r.status}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{r.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>

        <SectionCard title="PM compliance" actions={<ExportButton label="PM Compliance" />}>
          <p className="mb-4 text-3xl font-bold text-success">{pmCompliance}%</p>
          <ChartContainer config={{ compliance: { label: "Compliance %", color: "hsl(var(--success))" } }} className="h-[200px] w-full">
            <BarChart data={pmComplianceTrend}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis domain={[60, 100]} hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="compliance" fill="var(--color-compliance)" radius={4} />
            </BarChart>
          </ChartContainer>
        </SectionCard>

        <SectionCard title="Inventory status" actions={<ExportButton label="Inventory Status" />}>
          {lowStockParts.length === 0 ? (
            <p className="text-sm text-muted-foreground">All parts above reorder level.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part</TableHead>
                  <TableHead>On hand</TableHead>
                  <TableHead>Reorder</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockParts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.partNumber} · {p.name}</TableCell>
                    <TableCell className="font-semibold text-destructive">{p.quantity}</TableCell>
                    <TableCell>{p.reorderLevel}</TableCell>
                    <TableCell><LowStockBadge /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>

        <SectionCard title="Maintenance cost" actions={<ExportButton label="Maintenance Cost" />}>
          <ChartContainer
            config={{
              cost: { label: "Actual", color: "hsl(var(--primary))" },
              budget: { label: "Budget", color: "hsl(var(--muted-foreground))" },
            }}
            className="h-[220px] w-full"
          >
            <BarChart data={costTrend}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => compactCurrency(v)} width={56} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="cost" fill="var(--color-cost)" radius={4} />
              <Bar dataKey="budget" fill="var(--color-budget)" radius={4} opacity={0.4} />
            </BarChart>
          </ChartContainer>
        </SectionCard>
      </div>
    </div>
  );
}
