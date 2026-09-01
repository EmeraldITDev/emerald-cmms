import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarClock, Wrench } from "lucide-react";
import { EmptyState, PageHeader, SectionCard, TableSkeleton, useMockLoading } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { useCmms } from "@/store/cmms";
import { formatDate, relativeDue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/preventive-maintenance")({
  component: PreventiveMaintenancePage,
});

function PreventiveMaintenancePage() {
  const ready = useMockLoading();
  const { pmSchedules, assets, technicians, today, generateWorkOrderFromPm } = useCmms();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(today + "T00:00:00"));

  const dueDates = useMemo(() => {
    const map = new Map<string, number>();
    pmSchedules.forEach((p) => {
      map.set(p.nextDue, (map.get(p.nextDue) ?? 0) + 1);
    });
    return map;
  }, [pmSchedules]);

  const selectedIso = selectedDate?.toISOString().slice(0, 10);
  const calendarItems = selectedIso ? pmSchedules.filter((p) => p.nextDue === selectedIso) : [];

  const handleGenerate = (pmId: string) => {
    const wo = generateWorkOrderFromPm(pmId);
    if (wo) toast.success(`${wo.id} generated from ${pmId}`);
    else toast.error("Could not generate work order");
  };

  if (!ready) {
    return (
      <div>
        <PageHeader title="Preventive maintenance" />
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Preventive maintenance" description="Time-based and meter-based PM schedules" />

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Schedule list</TabsTrigger>
          <TabsTrigger value="calendar">Calendar view</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          {pmSchedules.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No PM schedules" message="Preventive maintenance schedules will appear here." />
          ) : (
            <div className="surface-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next due</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Work order</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pmSchedules.map((p) => {
                    const overdue = p.nextDue < today && !p.generatedWorkOrderId;
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.title}</TableCell>
                        <TableCell>
                          <Link to="/assets/$id" params={{ id: p.assetId }} className="text-primary hover:underline">
                            {p.assetId}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {p.frequencyType === "time" ? `Every ${p.intervalDays} days` : `Every ${p.intervalHours} hrs`}
                        </TableCell>
                        <TableCell className={cn(overdue && "font-semibold text-destructive")}>
                          {formatDate(p.nextDue)}
                          <span className="block text-xs text-muted-foreground">{relativeDue(p.nextDue, today)}</span>
                        </TableCell>
                        <TableCell>{technicians.find((t) => t.id === p.technicianId)?.name ?? "—"}</TableCell>
                        <TableCell>
                          {p.generatedWorkOrderId ? (
                            <Link to="/work-orders/$id" params={{ id: p.generatedWorkOrderId }} className="text-primary hover:underline">
                              {p.generatedWorkOrderId}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {!p.generatedWorkOrderId && p.nextDue <= today ? (
                            <Button size="sm" variant="outline" onClick={() => handleGenerate(p.id)}>
                              <Wrench className="size-3.5" aria-hidden /> Generate WO
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <SectionCard title="Upcoming PM tasks">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{
                  due: (date) => dueDates.has(date.toISOString().slice(0, 10)),
                }}
                modifiersClassNames={{ due: "bg-primary/20 font-bold" }}
              />
            </SectionCard>
            <SectionCard title={selectedIso ? `Tasks on ${formatDate(selectedIso)}` : "Select a date"}>
              {calendarItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No PM tasks scheduled for this date.</p>
              ) : (
                <ul className="space-y-3">
                  {calendarItems.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                      <div>
                        <p className="text-sm font-semibold">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{assets.find((a) => a.id === p.assetId)?.name}</p>
                      </div>
                      {!p.generatedWorkOrderId && p.nextDue <= today ? (
                        <Button size="sm" onClick={() => handleGenerate(p.id)}>Generate WO</Button>
                      ) : p.generatedWorkOrderId ? (
                        <Button size="sm" variant="outline" asChild>
                          <Link to="/work-orders/$id" params={{ id: p.generatedWorkOrderId }}>View WO</Link>
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
