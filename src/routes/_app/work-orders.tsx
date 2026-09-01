import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ClipboardList, LayoutGrid, List, Plus } from "lucide-react";
import { EmptyState, PageHeader, TableSkeleton, useMockLoading } from "@/components/ui-bits";
import { PriorityBadge, WorkOrderStatusBadge } from "@/components/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCmms } from "@/store/cmms";
import type { Priority, WorkOrder, WorkOrderStatus } from "@/data/types";
import { formatDate, relativeDue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/work-orders")({
  component: WorkOrdersPage,
});

const COLUMNS: { status: WorkOrderStatus; label: string }[] = [
  { status: "backlog", label: "Backlog" },
  { status: "scheduled", label: "Scheduled" },
  { status: "in_progress", label: "In Progress" },
  { status: "completed", label: "Completed" },
  { status: "closed", label: "Closed" },
];

function KanbanCard({ wo, assetName, techName, today, onDragStart }: {
  wo: WorkOrder;
  assetName: string;
  techName: string;
  today: string;
  onDragStart: (e: React.DragEvent, id: string) => void;
}) {
  const overdue = wo.dueDate < today && !["completed", "closed"].includes(wo.status);
  return (
    <Link
      to="/work-orders/$id"
      params={{ id: wo.id }}
      draggable
      onDragStart={(e) => onDragStart(e, wo.id)}
      className="block rounded-md border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">{wo.id}</p>
        <PriorityBadge priority={wo.priority} />
      </div>
      <p className="mt-1 text-sm font-medium leading-snug">{wo.title}</p>
      <p className="mt-2 text-xs text-muted-foreground">{assetName}</p>
      <p className="mt-1 text-xs text-muted-foreground">{techName || "Unassigned"}</p>
      <p className={cn("mt-2 text-xs font-medium", overdue && "text-destructive")}>{relativeDue(wo.dueDate, today)}</p>
    </Link>
  );
}

function WorkOrdersPage() {
  const ready = useMockLoading();
  const { workOrders, assets, technicians, today, setWorkOrderStatus } = useCmms();
  const [view, setView] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [techFilter, setTechFilter] = useState("all");
  const [assetFilter, setAssetFilter] = useState("all");
  const [dragId, setDragId] = useState<string | null>(null);

  const equipment = assets.filter((a) => a.level === "equipment");

  const filtered = useMemo(() => {
    let list = [...workOrders];
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((w) => `${w.id} ${w.title}`.toLowerCase().includes(q));
    if (statusFilter !== "all") list = list.filter((w) => w.status === statusFilter);
    if (priorityFilter !== "all") list = list.filter((w) => w.priority === priorityFilter);
    if (techFilter !== "all") list = list.filter((w) => w.technicianId === techFilter);
    if (assetFilter !== "all") list = list.filter((w) => w.assetId === assetFilter);
    return list;
  }, [workOrders, search, statusFilter, priorityFilter, techFilter, assetFilter]);

  const onDrop = (status: WorkOrderStatus) => {
    if (!dragId) return;
    setWorkOrderStatus(dragId, status);
    toast.success(`Moved ${dragId} to ${status.replace("_", " ")}`);
    setDragId(null);
  };

  if (!ready) {
    return (
      <div>
        <PageHeader title="Work orders" />
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Work orders"
        description="Corrective, preventive, and emergency maintenance jobs"
        actions={
          <Button asChild>
            <Link to="/work-orders/new"><Plus className="size-4" aria-hidden /> Create work order</Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
          <TabsList>
            <TabsTrigger value="list"><List className="mr-1.5 size-4" aria-hidden /> List</TabsTrigger>
            <TabsTrigger value="kanban"><LayoutGrid className="mr-1.5 size-4" aria-hidden /> Kanban</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Input placeholder="Search work orders…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as WorkOrderStatus | "all")}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {COLUMNS.map((c) => <SelectItem key={c.status} value={c.status}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as Priority | "all")}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {(["low", "medium", "high", "critical"] as Priority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={techFilter} onValueChange={setTechFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Technician" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All technicians</SelectItem>
            {technicians.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={assetFilter} onValueChange={setAssetFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Asset" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All assets</SelectItem>
            {equipment.map((a) => <SelectItem key={a.id} value={a.id}>{a.id}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No work orders found"
          message="Adjust your filters or create a new work order."
          action={<Button asChild><Link to="/work-orders/new">Create work order</Link></Button>}
        />
      ) : view === "list" ? (
        <div className="surface-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((w) => (
                <TableRow key={w.id}>
                  <TableCell><Link to="/work-orders/$id" params={{ id: w.id }} className="font-semibold text-primary hover:underline">{w.id}</Link></TableCell>
                  <TableCell className="max-w-[240px] truncate">{w.title}</TableCell>
                  <TableCell>{w.assetId}</TableCell>
                  <TableCell><WorkOrderStatusBadge status={w.status} /></TableCell>
                  <TableCell><PriorityBadge priority={w.priority} /></TableCell>
                  <TableCell>{technicians.find((t) => t.id === w.technicianId)?.name ?? "—"}</TableCell>
                  <TableCell>{formatDate(w.dueDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid gap-3 overflow-x-auto pb-2 md:grid-cols-3 xl:grid-cols-5">
          {COLUMNS.map((col) => {
            const items = filtered.filter((w) => w.status === col.status);
            return (
              <div
                key={col.status}
                className="flex min-w-[220px] flex-col rounded-lg border bg-muted/30"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(col.status)}
              >
                <header className="flex items-center justify-between border-b px-3 py-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider">{col.label}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">{items.length}</span>
                </header>
                <div className="flex flex-col gap-2 p-2">
                  {items.map((wo) => (
                    <KanbanCard
                      key={wo.id}
                      wo={wo}
                      assetName={assets.find((a) => a.id === wo.assetId)?.name ?? wo.assetId}
                      techName={technicians.find((t) => t.id === wo.technicianId)?.name ?? ""}
                      today={today}
                      onDragStart={(_e, id) => setDragId(id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
