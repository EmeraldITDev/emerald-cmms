import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCmms } from "@/store/cmms";
import type { Priority, WorkType } from "@/data/types";
import { shiftDays } from "@/data/seed";
import { toast } from "sonner";

type Search = { assetId?: string };

export const Route = createFileRoute("/_app/work-orders/new")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    assetId: typeof s.assetId === "string" ? s.assetId : undefined,
  }),
  component: NewWorkOrderPage,
});

function NewWorkOrderPage() {
  const navigate = useNavigate();
  const { assetId: presetAsset } = Route.useSearch();
  const { assets, technicians, parts, createWorkOrder } = useCmms();
  const equipment = assets.filter((a) => a.level === "equipment");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assetId, setAssetId] = useState(presetAsset ?? equipment[0]?.id ?? "");
  const [priority, setPriority] = useState<Priority>("medium");
  const [workType, setWorkType] = useState<WorkType>("corrective");
  const [technicianId, setTechnicianId] = useState<string>("unassigned");
  const [dueDate, setDueDate] = useState(shiftDays(7));
  const [checklist, setChecklist] = useState(["Isolate equipment", "Perform work", "Test and restore"]);
  const [selectedParts, setSelectedParts] = useState<{ partId: string; qty: number }[]>([]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    const wo = createWorkOrder({
      title,
      description,
      assetId,
      priority,
      workType,
      technicianId: technicianId === "unassigned" ? null : technicianId,
      dueDate,
      checklist: checklist.filter(Boolean).map((label, i) => ({ id: `new-${i}`, label, done: false })),
      parts: selectedParts,
    });
    toast.success(`${wo.id} created`);
    navigate({ to: "/work-orders/$id", params: { id: wo.id } });
  };

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/work-orders"><ArrowLeft className="size-4" aria-hidden /> Back to work orders</Link>
      </Button>

      <PageHeader title="Create work order" description="Raise a new maintenance job" />

      <form onSubmit={submit} className="surface-card max-w-3xl space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Replace mechanical seal" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Asset</Label>
            <Select value={assetId} onValueChange={setAssetId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {equipment.map((a) => <SelectItem key={a.id} value={a.id}>{a.id} · {a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["low", "medium", "high", "critical"] as Priority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Work type</Label>
            <Select value={workType} onValueChange={(v) => setWorkType(v as WorkType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["corrective", "preventive", "emergency"] as WorkType[]).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Assigned technician</Label>
            <Select value={technicianId} onValueChange={setTechnicianId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {technicians.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="due">Due date</Label>
            <Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Checklist items</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => setChecklist((c) => [...c, ""])}>
              <Plus className="size-4" aria-hidden /> Add item
            </Button>
          </div>
          {checklist.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input value={item} onChange={(e) => setChecklist((c) => c.map((x, j) => (j === i ? e.target.value : x)))} />
              <Button type="button" variant="ghost" size="icon" onClick={() => setChecklist((c) => c.filter((_, j) => j !== i))} aria-label="Remove item">
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Label>Parts needed</Label>
          <div className="space-y-2">
            {parts.slice(0, 8).map((p) => {
              const selected = selectedParts.find((sp) => sp.partId === p.id);
              return (
                <label key={p.id} className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
                  <Checkbox
                    checked={!!selected}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedParts((prev) => [...prev, { partId: p.id, qty: 1 }]);
                      else setSelectedParts((prev) => prev.filter((sp) => sp.partId !== p.id));
                    }}
                  />
                  <span className="flex-1">{p.partNumber} · {p.name}</span>
                  {selected ? (
                    <Input
                      type="number"
                      min={1}
                      className="w-16"
                      value={selected.qty}
                      onChange={(e) =>
                        setSelectedParts((prev) =>
                          prev.map((sp) => (sp.partId === p.id ? { ...sp, qty: Number(e.target.value) || 1 } : sp)),
                        )
                      }
                    />
                  ) : null}
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit">Create work order</Button>
          <Button type="button" variant="outline" asChild><Link to="/work-orders">Cancel</Link></Button>
        </div>
      </form>
    </div>
  );
}
