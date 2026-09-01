import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AvailabilityBadge, WorkOrderStatusBadge } from "@/components/status";
import { PageHeader, SectionCard } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCmms } from "@/store/cmms";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_app/technicians/$id")({
  component: TechnicianDetailPage,
});

function TechnicianDetailPage() {
  const { id } = Route.useParams();
  const { technicians, workOrders } = useCmms();
  const tech = technicians.find((t) => t.id === id);
  if (!tech) throw notFound();

  const assigned = workOrders.filter((w) => w.technicianId === id && !["completed", "closed"].includes(w.status));
  const history = workOrders.filter((w) => w.technicianId === id && ["completed", "closed"].includes(w.status));

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/technicians"><ArrowLeft className="size-4" aria-hidden /> Back to technicians</Link>
      </Button>

      <PageHeader title={tech.name} description={tech.role} />

      <div className="mb-6 flex flex-wrap gap-2">
        <AvailabilityBadge availability={tech.availability} />
        <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold">{tech.shift}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Profile" className="lg:col-span-1">
          <dl className="space-y-3 text-sm">
            <div><dt className="text-muted-foreground">Phone</dt><dd className="font-medium">{tech.phone}</dd></div>
            <div><dt className="text-muted-foreground">Email</dt><dd className="font-medium">{tech.email}</dd></div>
            <div><dt className="text-muted-foreground">Skills</dt><dd className="font-medium">{tech.skills.join(" · ")}</dd></div>
            <div><dt className="text-muted-foreground">Avg completion</dt><dd className="font-medium">{tech.avgCompletionHours}h</dd></div>
            <div><dt className="text-muted-foreground">Jobs completed</dt><dd className="text-2xl font-bold">{tech.completedJobs}</dd></div>
          </dl>
        </SectionCard>

        <SectionCard title={`Assigned work orders (${assigned.length})`} className="lg:col-span-2">
          {assigned.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open assignments.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assigned.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell><Link to="/work-orders/$id" params={{ id: w.id }} className="font-semibold text-primary hover:underline">{w.id}</Link></TableCell>
                    <TableCell className="max-w-[200px] truncate">{w.title}</TableCell>
                    <TableCell><WorkOrderStatusBadge status={w.status} /></TableCell>
                    <TableCell>{formatDate(w.dueDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>

        <SectionCard title={`Job history (${history.length})`} className="lg:col-span-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.slice(0, 10).map((w) => (
                <TableRow key={w.id}>
                  <TableCell><Link to="/work-orders/$id" params={{ id: w.id }} className="text-primary hover:underline">{w.id}</Link></TableCell>
                  <TableCell>{w.title}</TableCell>
                  <TableCell>{w.completedAt ? formatDate(w.completedAt) : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      </div>
    </div>
  );
}
