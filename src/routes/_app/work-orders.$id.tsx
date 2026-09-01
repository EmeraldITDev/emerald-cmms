import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Camera, CheckCircle2 } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/ui-bits";
import { PriorityBadge, WorkOrderStatusBadge } from "@/components/status";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useCmms } from "@/store/cmms";
import type { WorkOrderStatus } from "@/data/types";
import { currency, formatDate, titleCase } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/work-orders/$id")({
  component: WorkOrderDetailPage,
});

const STATUSES: WorkOrderStatus[] = ["backlog", "scheduled", "in_progress", "completed", "closed"];

function WorkOrderDetailPage() {
  const { id } = Route.useParams();
  const { workOrders, assetById, technicianById, partById, setWorkOrderStatus, toggleChecklistItem, updateWorkOrder } = useCmms();
  const wo = workOrders.find((w) => w.id === id);
  if (!wo) throw notFound();

  const asset = assetById(wo.assetId);
  const tech = technicianById(wo.technicianId);

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/work-orders"><ArrowLeft className="size-4" aria-hidden /> Back to work orders</Link>
      </Button>

      <PageHeader
        title={wo.title}
        description={`${wo.id} · ${asset?.name ?? wo.assetId}`}
        actions={
          <Select value={wo.status} onValueChange={(v) => { setWorkOrderStatus(wo.id, v as WorkOrderStatus); toast.success("Status updated"); }}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{titleCase(s)}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <WorkOrderStatusBadge status={wo.status} />
        <PriorityBadge priority={wo.priority} />
        <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold">{titleCase(wo.workType)}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <SectionCard title="Details">
            <p className="text-sm leading-relaxed text-muted-foreground">{wo.description || "No description provided."}</p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted-foreground">Asset</dt><dd className="font-medium"><Link to="/assets/$id" params={{ id: wo.assetId }} className="text-primary hover:underline">{wo.assetId}</Link></dd></div>
              <div><dt className="text-muted-foreground">Technician</dt><dd className="font-medium">{tech?.name ?? "Unassigned"}</dd></div>
              <div><dt className="text-muted-foreground">Due date</dt><dd className="font-medium">{formatDate(wo.dueDate)}</dd></div>
              <div><dt className="text-muted-foreground">Created</dt><dd className="font-medium">{formatDate(wo.createdAt)}</dd></div>
              <div><dt className="text-muted-foreground">Est. hours</dt><dd className="font-medium">{wo.estimatedHours}h</dd></div>
              <div><dt className="text-muted-foreground">Cost</dt><dd className="font-medium">{wo.cost ? currency(wo.cost) : "—"}</dd></div>
            </dl>
          </SectionCard>

          <SectionCard title="Checklist">
            <ul className="space-y-2">
              {wo.checklist.map((item) => (
                <li key={item.id}>
                  <label className="flex items-start gap-3 rounded-md border px-3 py-2 text-sm">
                    <Checkbox checked={item.done} onCheckedChange={() => toggleChecklistItem(wo.id, item.id)} className="mt-0.5" />
                    <span className={item.done ? "text-muted-foreground line-through" : ""}>{item.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </SectionCard>

          {wo.parts.length > 0 ? (
            <SectionCard title="Parts needed">
              <ul className="space-y-2 text-sm">
                {wo.parts.map((p) => {
                  const part = partById(p.partId);
                  return (
                    <li key={p.partId} className="flex justify-between rounded-md border px-3 py-2">
                      <span>{part?.partNumber} · {part?.name}</span>
                      <span className="font-semibold">× {p.qty}</span>
                    </li>
                  );
                })}
              </ul>
            </SectionCard>
          ) : null}

          <SectionCard title="Completion notes">
            <Textarea
              value={wo.completionNotes}
              onChange={(e) => updateWorkOrder(wo.id, { completionNotes: e.target.value })}
              placeholder="Add completion notes…"
              rows={3}
            />
          </SectionCard>

          {wo.photos.length > 0 ? (
            <SectionCard title="Attached photos">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {wo.photos.map((photo) => (
                  <div key={photo} className="flex aspect-video items-center justify-center rounded-md border bg-muted/40 text-xs text-muted-foreground">
                    <Camera className="mr-1 size-4" aria-hidden /> {photo}
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}
        </div>

        <div className="space-y-4">
          <SectionCard title="Status timeline">
            <ol className="relative space-y-4 border-l pl-4">
              {STATUSES.map((s) => {
                const reached =
                  STATUSES.indexOf(s) <= STATUSES.indexOf(wo.status);
                return (
                  <li key={s} className="relative">
                    <span className={`absolute -left-[21px] top-0.5 flex size-3 rounded-full ${reached ? "bg-primary" : "bg-muted"}`} />
                    <p className={`text-sm font-medium ${reached ? "" : "text-muted-foreground"}`}>{titleCase(s)}</p>
                    {reached && s === wo.status ? <p className="text-xs text-muted-foreground">Current</p> : null}
                  </li>
                );
              })}
            </ol>
          </SectionCard>

          <SectionCard title="Activity log">
            <ul className="space-y-3">
              {wo.activity.map((a, i) => (
                <li key={i} className="text-sm">
                  <p>{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.actor} · {formatDate(a.at)}</p>
                </li>
              ))}
            </ul>
          </SectionCard>

          {wo.status !== "completed" && wo.status !== "closed" ? (
            <Button className="w-full" onClick={() => { setWorkOrderStatus(wo.id, "completed"); toast.success("Work order marked complete"); }}>
              <CheckCircle2 className="size-4" aria-hidden /> Mark complete
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
