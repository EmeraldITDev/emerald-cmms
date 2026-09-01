import { createFileRoute, Link } from "@tanstack/react-router";
import { HardHat } from "lucide-react";
import { AvailabilityBadge } from "@/components/status";
import { EmptyState, PageHeader, TableSkeleton, useMockLoading } from "@/components/ui-bits";
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
        <div className="surface-card overflow-hidden">
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
        </div>
      )}
    </div>
  );
}
