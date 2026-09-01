import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Boxes, Minus, Plus } from "lucide-react";
import { EmptyState, PageHeader, SectionCard, TableSkeleton, TableWrap, useMockLoading } from "@/components/ui-bits";
import { LowStockBadge } from "@/components/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCmms } from "@/store/cmms";
import { currency, formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/inventory")({
  component: InventoryPage,
});

function StockDialog({
  partId,
  type,
  trigger,
}: {
  partId?: string;
  type: "issue" | "receive";
  trigger: React.ReactNode;
}) {
  const { parts, adjustStock } = useCmms();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(partId ?? parts[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [reference, setReference] = useState("");

  const submit = () => {
    if (!selected || qty < 1) return;
    adjustStock(selected, type, qty, reference || (type === "receive" ? "Manual receipt" : "Manual issue"));
    toast.success(type === "receive" ? "Stock received" : "Part issued");
    setOpen(false);
    setQty(1);
    setReference("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle>{type === "receive" ? "Receive stock" : "Issue part"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Part</Label>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {parts.map((p) => <SelectItem key={p.id} value={p.id}>{p.partNumber} · {p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value) || 1)} />
          </div>
          <div className="space-y-2">
            <Label>Reference</Label>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder={type === "receive" ? "GRN number" : "Work order #"} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit}>{type === "receive" ? "Receive" : "Issue"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InventoryPage() {
  const ready = useMockLoading();
  const { parts, transactions, partById } = useCmms();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return parts;
    return parts.filter((p) => `${p.partNumber} ${p.name} ${p.bin}`.toLowerCase().includes(q));
  }, [parts, search]);

  const lowStock = parts.filter((p) => p.quantity < p.reorderLevel).length;

  if (!ready) {
    return (
      <div>
        <PageHeader title="Inventory" />
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Inventory"
        description={`${parts.length} spare parts · ${lowStock} below reorder level`}
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <StockDialog type="receive" trigger={<Button variant="outline" className="h-10 w-full sm:w-auto"><Plus className="size-4" aria-hidden /> Receive stock</Button>} />
            <StockDialog type="issue" trigger={<Button className="h-10 w-full sm:w-auto"><Minus className="size-4" aria-hidden /> Issue part</Button>} />
          </div>
        }
      />

      <Input placeholder="Search parts…" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4 h-10 w-full" />

      {filtered.length === 0 ? (
        <EmptyState icon={Boxes} title="No parts found" message="Try a different search term." />
      ) : (
        <>
          <ul className="space-y-3 lg:hidden">
            {filtered.map((p) => (
              <li key={p.id} className="rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{p.partNumber}</p>
                  {p.quantity < p.reorderLevel ? <LowStockBadge /> : null}
                </div>
                <p className="mt-1 text-sm leading-snug">{p.name}</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div><dt className="text-muted-foreground">On hand</dt><dd className="font-semibold">{p.quantity} {p.uom}</dd></div>
                  <div><dt className="text-muted-foreground">Reorder</dt><dd className="font-semibold">{p.reorderLevel}</dd></div>
                  <div><dt className="text-muted-foreground">Bin</dt><dd className="font-semibold">{p.bin}</dd></div>
                  <div><dt className="text-muted-foreground">Cost</dt><dd className="font-semibold">{currency(p.unitCost)}</dd></div>
                </dl>
                <div className="mt-3 flex gap-2">
                  <StockDialog partId={p.id} type="issue" trigger={<Button size="sm" variant="outline" className="h-9 flex-1">Issue</Button>} />
                  <StockDialog partId={p.id} type="receive" trigger={<Button size="sm" variant="outline" className="h-9 flex-1">Receive</Button>} />
                </div>
              </li>
            ))}
          </ul>
          <div className="hidden lg:block">
            <TableWrap minWidth={900}>
              <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>On hand</TableHead>
                <TableHead>Reorder</TableHead>
                <TableHead>Bin</TableHead>
                <TableHead>Unit cost</TableHead>
                <TableHead>Linked assets</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold">{p.partNumber}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>
                    <span className={p.quantity < p.reorderLevel ? "font-semibold text-destructive" : ""}>
                      {p.quantity} {p.uom}
                    </span>
                    {p.quantity < p.reorderLevel ? <div className="mt-1"><LowStockBadge /></div> : null}
                  </TableCell>
                  <TableCell>{p.reorderLevel}</TableCell>
                  <TableCell>{p.bin}</TableCell>
                  <TableCell>{currency(p.unitCost)}</TableCell>
                  <TableCell className="max-w-[120px] truncate text-xs text-muted-foreground">{p.linkedAssetIds.join(", ")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <StockDialog partId={p.id} type="issue" trigger={<Button size="sm" variant="ghost">Issue</Button>} />
                      <StockDialog partId={p.id} type="receive" trigger={<Button size="sm" variant="ghost">Receive</Button>} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </TableWrap>
          </div>
        </>
      )}

      <SectionCard title="Stock transaction history" className="mt-6">
        <TableWrap minWidth={560}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Part</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Actor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 12).map((t) => {
                const part = partById(t.partId);
                return (
                  <TableRow key={t.id}>
                    <TableCell>{formatDate(t.at)}</TableCell>
                    <TableCell className="capitalize">{t.type}</TableCell>
                    <TableCell>{part?.partNumber} · {part?.name}</TableCell>
                    <TableCell>{t.qty}</TableCell>
                    <TableCell>{t.reference}</TableCell>
                    <TableCell>{t.actor}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableWrap>
      </SectionCard>
    </div>
  );
}
