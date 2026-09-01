import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, Factory, Plus } from "lucide-react";
import { AssetStatusBadge, CriticalityBadge, HealthBar } from "@/components/status";
import { EmptyState, FilterBar, FilterControl, PageHeader, TableSkeleton, TableWrap, useMockLoading } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCmms } from "@/store/cmms";
import type { Asset, AssetStatus, Criticality } from "@/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/assets")({
  component: AssetsPage,
});

const PAGE_SIZE = 8;

function AssetTreeNode({ asset, assets, depth = 0 }: { asset: Asset; assets: Asset[]; depth?: number }) {
  const children = assets.filter((a) => a.parentId === asset.id);
  return (
    <div>
      <Link
        to={asset.level === "equipment" ? "/assets/$id" : "/assets"}
        params={asset.level === "equipment" ? { id: asset.id } : undefined}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted/60",
          asset.level === "equipment" && "font-medium",
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <Factory className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <span className="truncate">{asset.id}</span>
        <span className="truncate text-muted-foreground">· {asset.name}</span>
        {asset.level === "equipment" ? <ChevronRight className="ml-auto size-3.5 text-muted-foreground" /> : null}
      </Link>
      {children.map((c) => (
        <AssetTreeNode key={c.id} asset={c} assets={assets} depth={depth + 1} />
      ))}
    </div>
  );
}

function AssetsPage() {
  const ready = useMockLoading();
  const { assets } = useCmms();
  const equipment = useMemo(() => assets.filter((a) => a.level === "equipment"), [assets]);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [status, setStatus] = useState<AssetStatus | "all">("all");
  const [criticality, setCriticality] = useState<Criticality | "all">("all");
  const [sort, setSort] = useState<"id" | "health" | "name">("id");
  const [page, setPage] = useState(1);

  const locations = [...new Set(equipment.map((a) => a.location))];

  const filtered = useMemo(() => {
    let list = [...equipment];
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((a) => `${a.id} ${a.name} ${a.category}`.toLowerCase().includes(q));
    if (location !== "all") list = list.filter((a) => a.location === location);
    if (status !== "all") list = list.filter((a) => a.status === status);
    if (criticality !== "all") list = list.filter((a) => a.criticality === criticality);
    list.sort((a, b) => {
      if (sort === "health") return b.healthScore - a.healthScore;
      if (sort === "name") return a.name.localeCompare(b.name);
      return a.id.localeCompare(b.id);
    });
    return list;
  }, [equipment, search, location, status, criticality, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const root = assets.find((a) => a.parentId === null);

  if (!ready) {
    return (
      <div>
        <PageHeader title="Assets" />
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Assets"
        description="Equipment register for Lagos Processing Plant"
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link to="/work-orders/new">
              <Plus className="size-4" aria-hidden /> Raise work order
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="surface-card hidden p-3 lg:block">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hierarchy</p>
          {root ? <AssetTreeNode asset={root} assets={assets} /> : null}
        </aside>

        <div className="min-w-0 space-y-4">
          <FilterBar>
            <FilterControl className="min-[360px]:col-span-2 lg:col-span-1">
              <Input
                placeholder="Search assets…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-10"
                aria-label="Search assets"
              />
            </FilterControl>
            <FilterControl>
              <Select value={location} onValueChange={(v) => { setLocation(v); setPage(1); }}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Location" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {locations.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterControl>
            <FilterControl>
              <Select value={status} onValueChange={(v) => { setStatus(v as AssetStatus | "all"); setPage(1); }}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {(["operating", "warning", "degraded", "critical", "offline"] as AssetStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterControl>
            <FilterControl>
              <Select value={criticality} onValueChange={(v) => { setCriticality(v as Criticality | "all"); setPage(1); }}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Criticality" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All criticality</SelectItem>
                  {(["low", "medium", "high"] as Criticality[]).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterControl>
            <FilterControl>
              <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Sort" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Sort: ID</SelectItem>
                  <SelectItem value="name">Sort: Name</SelectItem>
                  <SelectItem value="health">Sort: Health</SelectItem>
                </SelectContent>
              </Select>
            </FilterControl>
          </FilterBar>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Factory}
              title="No assets match"
              message="Try clearing filters or adjusting your search terms."
              action={
                <Button variant="outline" onClick={() => { setSearch(""); setLocation("all"); setStatus("all"); setCriticality("all"); }}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <ul className="space-y-3 md:hidden">
                {pageItems.map((a) => (
                  <li key={a.id}>
                    <Link
                      to="/assets/$id"
                      params={{ id: a.id }}
                      className="block rounded-lg border bg-card p-4 shadow-sm transition-colors active:bg-muted/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-primary">{a.id}</p>
                        <AssetStatusBadge status={a.status} />
                      </div>
                      <p className="mt-1 text-sm font-medium leading-snug">{a.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{a.category} · {a.location}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <CriticalityBadge criticality={a.criticality} />
                        <HealthBar value={a.healthScore} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="hidden md:block">
                <TableWrap minWidth={720}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criticality</TableHead>
                        <TableHead>Health</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pageItems.map((a) => (
                        <TableRow key={a.id} className="cursor-pointer hover:bg-muted/40">
                          <TableCell>
                            <Link to="/assets/$id" params={{ id: a.id }} className="font-semibold text-primary hover:underline">
                              {a.id}
                            </Link>
                          </TableCell>
                          <TableCell>{a.name}</TableCell>
                          <TableCell>{a.category}</TableCell>
                          <TableCell>{a.location}</TableCell>
                          <TableCell><AssetStatusBadge status={a.status} /></TableCell>
                          <TableCell><CriticalityBadge criticality={a.criticality} /></TableCell>
                          <TableCell><HealthBar value={a.healthScore} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableWrap>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border bg-card px-3 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <span className="text-center sm:text-left">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-10 flex-1 sm:flex-none" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="h-10 flex-1 sm:flex-none" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
