import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardList, Gauge } from "lucide-react";
import { PriorityBadge, WorkOrderStatusBadge } from "@/components/status";
import { EmptyState } from "@/components/ui-bits";
import { useCmms } from "@/store/cmms";
import { formatDate, relativeDue } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/my-jobs")({
  component: MyJobsPage,
});

function MyJobsPage() {
  const { workOrders, currentTechnicianId, assetById, today } = useCmms();
  const myJobs = workOrders.filter(
    (w) => w.technicianId === currentTechnicianId && !["completed", "closed"].includes(w.status),
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Gauge className="size-5" aria-hidden />
          </span>
          <div className="flex-1">
            <p className="text-sm font-bold">My Jobs</p>
            <p className="text-xs text-muted-foreground">Emerald CMMS · Field mode</p>
          </div>
          <Link to="/dashboard" className="text-xs font-medium text-primary">Desktop</Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4">
        {myJobs.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No assigned jobs"
            message="You're all caught up. Check back later for new assignments."
          />
        ) : (
          <ul className="space-y-3">
            {myJobs.map((w) => {
              const asset = assetById(w.assetId);
              const overdue = w.dueDate < today;
              return (
                <li key={w.id}>
                  <Link
                    to="/my-jobs/$id"
                    params={{ id: w.id }}
                    className="block rounded-xl border bg-card p-4 shadow-sm transition-shadow active:scale-[0.99] hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-muted-foreground">{w.id}</p>
                      <WorkOrderStatusBadge status={w.status} />
                    </div>
                    <p className="mt-2 text-base font-semibold leading-snug">{w.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{asset?.name ?? w.assetId}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <PriorityBadge priority={w.priority} />
                      <span className={cn("text-xs font-semibold", overdue && "text-destructive")}>
                        {relativeDue(w.dueDate, today)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
