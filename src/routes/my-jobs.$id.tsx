import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Camera, CheckCircle2, PenLine } from "lucide-react";
import { PriorityBadge, WorkOrderStatusBadge } from "@/components/status";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useCmms } from "@/store/cmms";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/my-jobs/$id")({
  component: MyJobDetailPage,
});

function MyJobDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { workOrders, assetById, toggleChecklistItem, updateWorkOrder, setWorkOrderStatus } = useCmms();
  const wo = workOrders.find((w) => w.id === id);
  const [notes, setNotes] = useState(wo?.completionNotes ?? "");
  const [signed, setSigned] = useState(false);

  if (!wo) throw notFound();

  const asset = assetById(wo.assetId);
  const allDone = wo.checklist.every((c) => c.done);

  const complete = () => {
    if (!allDone) {
      toast.error("Complete all checklist items first");
      return;
    }
    if (!signed) {
      toast.error("Add your signature to complete");
      return;
    }
    updateWorkOrder(wo.id, { completionNotes: notes, photos: [...wo.photos, "field-photo.jpg"] }, "Completed via mobile");
    setWorkOrderStatus(wo.id, "completed");
    toast.success("Job marked complete");
    navigate({ to: "/my-jobs" });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/my-jobs"><ArrowLeft className="size-5" /></Link>
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{wo.id}</p>
            <p className="truncate text-xs text-muted-foreground">{asset?.name}</p>
          </div>
          <WorkOrderStatusBadge status={wo.status} />
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-6 px-4 py-4">
        <div>
          <h1 className="text-xl font-bold leading-snug">{wo.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{wo.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <PriorityBadge priority={wo.priority} />
            <span className="text-xs text-muted-foreground">Due {formatDate(wo.dueDate)}</span>
          </div>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Checklist</h2>
          <ul className="space-y-2">
            {wo.checklist.map((item) => (
              <li key={item.id}>
                <label className="flex min-h-12 items-center gap-3 rounded-xl border bg-card px-4 py-3 text-sm active:bg-muted/50">
                  <Checkbox
                    checked={item.done}
                    onCheckedChange={() => toggleChecklistItem(wo.id, item.id)}
                    className="size-5"
                  />
                  <span className={item.done ? "text-muted-foreground line-through" : "font-medium"}>{item.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Photos</h2>
          <Button variant="outline" className="h-24 w-full border-dashed" onClick={() => toast.info("Photo upload simulated")}>
            <Camera className="mr-2 size-5" aria-hidden /> Tap to add photo
          </Button>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Notes</h2>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Completion notes…"
            rows={4}
            className="text-base"
          />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Signature</h2>
          <button
            type="button"
            onClick={() => setSigned(true)}
            className="flex h-28 w-full flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground"
          >
            <PenLine className="mb-2 size-6" aria-hidden />
            {signed ? <span className="font-semibold text-foreground">Signed ✓</span> : "Tap to sign"}
          </button>
        </section>
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t bg-background/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-lg">
          <Button size="lg" className="h-12 w-full text-base" onClick={complete} disabled={wo.status === "completed" || wo.status === "closed"}>
            <CheckCircle2 className="size-5" aria-hidden /> Mark job complete
          </Button>
        </div>
      </footer>
    </div>
  );
}
