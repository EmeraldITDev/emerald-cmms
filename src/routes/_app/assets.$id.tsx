import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { FileText, Wrench } from "lucide-react";
import { AssetStatusBadge, CriticalityBadge, HealthBar, PriorityBadge, WorkOrderStatusBadge } from "@/components/status";
import { PageHeader, SectionCard } from "@/components/ui-bits";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useCmms } from "@/store/cmms";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_app/assets/$id")({
  component: AssetDetailPage,
});

function AssetDetailPage() {
  const { id } = Route.useParams();
  const { assetById, assets, workOrders, pmSchedules, parts } = useCmms();
  const asset = assetById(id);

  if (!asset || asset.level !== "equipment") throw notFound();

  const breadcrumbAssets = (() => {
    const chain: typeof asset[] = [];
    let node = asset;
    chain.unshift(node);
    while (node.parentId) {
      const parent = assetById(node.parentId);
      if (!parent) break;
      chain.unshift(parent);
      node = parent;
    }
    return chain;
  })();

  const assetWorkOrders = workOrders.filter((w) => w.assetId === id);
  const assetPm = pmSchedules.filter((p) => p.assetId === id);
  const linkedParts = parts.filter((p) => p.linkedAssetIds.includes(id));

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to="/assets">Assets</Link></BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbAssets.map((a, i) => (
            <span key={a.id} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {i === breadcrumbAssets.length - 1 ? (
                  <BreadcrumbPage>{a.id}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={a.level === "equipment" ? "/assets/$id" : "/assets"} params={a.level === "equipment" ? { id: a.id } : undefined}>
                      {a.name}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title={`${asset.id} · ${asset.name}`}
        description={`${asset.category} · ${asset.location}`}
        actions={
          <Button asChild>
            <Link to="/work-orders/new" search={{ assetId: id }}>
              <Wrench className="size-4" aria-hidden /> New work order
            </Link>
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <AssetStatusBadge status={asset.status} />
        <CriticalityBadge criticality={asset.criticality} />
        <HealthBar value={asset.healthScore} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="work-orders">Work order history ({assetWorkOrders.length})</TabsTrigger>
          <TabsTrigger value="pm">PM schedule ({assetPm.length})</TabsTrigger>
          <TabsTrigger value="parts">Parts used ({linkedParts.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({asset.documents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <SectionCard title="Equipment details">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Manufacturer</dt><dd className="font-medium">{asset.manufacturer}</dd></div>
                <div><dt className="text-muted-foreground">Model</dt><dd className="font-medium">{asset.model}</dd></div>
                <div><dt className="text-muted-foreground">Serial</dt><dd className="font-medium">{asset.serial}</dd></div>
                <div><dt className="text-muted-foreground">Installed</dt><dd className="font-medium">{formatDate(asset.installedOn)}</dd></div>
                <div><dt className="text-muted-foreground">Parent unit</dt><dd className="font-medium">{assetById(asset.parentId!)?.name ?? "—"}</dd></div>
                <div><dt className="text-muted-foreground">Plant</dt><dd className="font-medium">{assets.find((a) => a.level === "plant")?.name}</dd></div>
              </dl>
            </SectionCard>
            <SectionCard title="Maintenance summary">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Open work orders</dt><dd className="text-2xl font-bold">{assetWorkOrders.filter((w) => !["completed", "closed"].includes(w.status)).length}</dd></div>
                <div><dt className="text-muted-foreground">PM schedules</dt><dd className="text-2xl font-bold">{assetPm.length}</dd></div>
                <div><dt className="text-muted-foreground">Linked spare parts</dt><dd className="text-2xl font-bold">{linkedParts.length}</dd></div>
                <div><dt className="text-muted-foreground">Documents on file</dt><dd className="text-2xl font-bold">{asset.documents.length}</dd></div>
              </dl>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="work-orders" className="mt-4">
          {assetWorkOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No work orders recorded for this asset.</p>
          ) : (
            <div className="surface-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetWorkOrders.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell><Link to="/work-orders/$id" params={{ id: w.id }} className="font-semibold text-primary hover:underline">{w.id}</Link></TableCell>
                      <TableCell>{w.title}</TableCell>
                      <TableCell><WorkOrderStatusBadge status={w.status} /></TableCell>
                      <TableCell><PriorityBadge priority={w.priority} /></TableCell>
                      <TableCell>{formatDate(w.dueDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pm" className="mt-4">
          {assetPm.length === 0 ? (
            <p className="text-sm text-muted-foreground">No PM schedules linked.</p>
          ) : (
            <div className="surface-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next due</TableHead>
                    <TableHead>Generated WO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetPm.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell>{p.frequencyType === "time" ? `Every ${p.intervalDays} days` : `Every ${p.intervalHours} hrs`}</TableCell>
                      <TableCell>{formatDate(p.nextDue)}</TableCell>
                      <TableCell>{p.generatedWorkOrderId ? <Link to="/work-orders/$id" params={{ id: p.generatedWorkOrderId }} className="text-primary hover:underline">{p.generatedWorkOrderId}</Link> : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="parts" className="mt-4">
          {linkedParts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No spare parts linked to this asset.</p>
          ) : (
            <div className="surface-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>On hand</TableHead>
                    <TableHead>Bin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linkedParts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.partNumber}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.quantity} {p.uom}</TableCell>
                      <TableCell>{p.bin}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <ul className="space-y-2">
            {asset.documents.map((doc) => (
              <li key={doc.name} className="flex items-center justify-between rounded-md border px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileText className="size-4 text-muted-foreground" aria-hidden />
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.type} · {doc.size} · Updated {formatDate(doc.updatedOn)}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled>Download</Button>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
