import { createFileRoute, Link } from "@tanstack/react-router";
import { HardHat } from "lucide-react";
import { AvailabilityBadge } from "@/components/status";
import { EmptyState, PageHeader, TableSkeleton, TableWrap, useMockLoading } from "@/components/ui-bits";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCmms } from "@/store/cmms";

export const Route = createFileRoute("/_app/technicians")({
  component: TechniciansPage,
});

function TechniciansPage() {
  const ready = useMockLoading();
  const { technicians, workOrders } = useCmms();

  if (!ready) {
    return (
      <div>
        <PageHeader title="Technicians" />
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Technicians" description="Maintenance team roster and workload" />

      {technicians.length === 0 ? (
        <EmptyState icon={HardHat} title="No technicians" message="Technician profiles will appear here." />
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {technicians.map((t) => {
              const workload = workOrders.filter(
                (w) => w.technicianId === t.id && !["completed", "closed"].includes(w.status),
              ).length;
              return (
                <li key={t.id}>
                  <Link
                    to="/technicians/$id"
                    params={{ id: t.id }}
                    className="block rounded-lg border bg-card p-4 shadow-sm transition-colors active:bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-primary">{t.name}</p>
                      <AvailabilityBadge availability={t.availability} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{t.role}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.skills.join(" · ")}</p>
                    <p className="mt-3 text-sm">
                      <span className="font-semibold tabular-nums">{workload}</span> open jobs ·{" "}
                      <span className="font-semibold tabular-nums">{t.completedJobs}</span> completed
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="hidden md:block">
            <TableWrap minWidth={720}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Assigned jobs</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {technicians.map((t) => {
                    const workload = workOrders.filter(
                      (w) => w.technicianId === t.id && !["completed", "closed"].includes(w.status),
                    ).length;
                    return (
                      <TableRow key={t.id}>
                        <TableCell>
                          <Link to="/technicians/$id" params={{ id: t.id }} className="font-semibold text-primary hover:underline">
                            {t.name}
                          </Link>
                        </TableCell>
                        <TableCell>{t.role}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs">{t.skills.join(", ")}</TableCell>
                        <TableCell className="font-semibold tabular-nums">{workload}</TableCell>
                        <TableCell><AvailabilityBadge availability={t.availability} /></TableCell>
                        <TableCell>{t.completedJobs}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableWrap>
          </div>
        </>
      )}
    </div>
  );
}
