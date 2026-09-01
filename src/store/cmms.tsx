import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as seed from "@/data/seed";
import type {
  ActivityEntry,
  Asset,
  Part,
  PMSchedule,
  Role,
  StockTransaction,
  Technician,
  WorkOrder,
  WorkOrderStatus,
} from "@/data/types";

/**
 * Single mock "API" layer. Every screen reads and writes through this store, so a
 * real backend can replace the internals here without touching components.
 */
interface CmmsState {
  today: string;
  role: Role;
  setRole: (role: Role) => void;
  currentTechnicianId: string;
  theme: "light" | "dark";
  toggleTheme: () => void;
  assets: Asset[];
  workOrders: WorkOrder[];
  pmSchedules: PMSchedule[];
  technicians: Technician[];
  parts: Part[];
  transactions: StockTransaction[];
  activity: ActivityEntry[];
  assetById: (id: string) => Asset | undefined;
  technicianById: (id: string | null) => Technician | undefined;
  partById: (id: string) => Part | undefined;
  createWorkOrder: (input: Partial<WorkOrder> & { title: string }) => WorkOrder;
  updateWorkOrder: (id: string, patch: Partial<WorkOrder>, note?: string) => void;
  setWorkOrderStatus: (id: string, status: WorkOrderStatus) => void;
  toggleChecklistItem: (workOrderId: string, itemId: string) => void;
  generateWorkOrderFromPm: (pmId: string) => WorkOrder | undefined;
  adjustStock: (partId: string, type: "issue" | "receive", qty: number, reference: string) => void;
}

const CmmsContext = createContext<CmmsState | null>(null);

const ROLE_ACTOR: Record<Role, string> = {
  manager: "Kemi Balogun (Manager)",
  technician: "Adebayo Ogunlade (Technician)",
  storekeeper: "Sade Iwu (Storekeeper)",
};

export function CmmsProvider({ children }: { children: ReactNode }) {
  const today = seed.shiftDays(0);
  const [role, setRole] = useState<Role>("manager");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [assets] = useState<Asset[]>(seed.assets);
  const [technicians] = useState<Technician[]>(seed.technicians);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(seed.workOrders);
  const [pmSchedules, setPmSchedules] = useState<PMSchedule[]>(seed.pmSchedules);
  const [parts, setParts] = useState<Part[]>(seed.parts);
  const [transactions, setTransactions] = useState<StockTransaction[]>(seed.stockTransactions);
  const [activity, setActivity] = useState<ActivityEntry[]>(seed.activityFeed);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const log = useCallback(
    (text: string, kind: ActivityEntry["kind"]) => {
      setActivity((prev) => [
        { id: `AC-${Date.now()}`, at: seed.shiftDays(0), actor: ROLE_ACTOR[role].split(" (")[0], text, kind },
        ...prev,
      ]);
    },
    [role],
  );

  const value = useMemo<CmmsState>(() => {
    const assetById = (id: string) => assets.find((a) => a.id === id);
    const technicianById = (id: string | null) => (id ? technicians.find((t) => t.id === id) : undefined);
    const partById = (id: string) => parts.find((p) => p.id === id);

    const createWorkOrder: CmmsState["createWorkOrder"] = (input) => {
      const id = `WO-${1100 + workOrders.filter((w) => Number(w.id.slice(3)) >= 1100).length}`;
      const wo: WorkOrder = {
        id,
        title: input.title,
        description: input.description ?? "",
        assetId: input.assetId ?? assets[4].id,
        status: input.status ?? "backlog",
        priority: input.priority ?? "medium",
        workType: input.workType ?? "corrective",
        technicianId: input.technicianId ?? null,
        dueDate: input.dueDate ?? seed.shiftDays(7),
        createdAt: today,
        completedAt: null,
        estimatedHours: input.estimatedHours ?? 2,
        cost: 0,
        checklist: input.checklist ?? [],
        parts: input.parts ?? [],
        photos: [],
        completionNotes: "",
        pmId: input.pmId ?? null,
        activity: [{ at: today, actor: ROLE_ACTOR[role], text: "Work order created" }],
      };
      setWorkOrders((prev) => [wo, ...prev]);
      log(`Created ${id} · ${wo.title}`, "work_order");
      return wo;
    };

    const updateWorkOrder: CmmsState["updateWorkOrder"] = (id, patch, note) => {
      setWorkOrders((prev) =>
        prev.map((w) =>
          w.id === id
            ? {
                ...w,
                ...patch,
                activity: note ? [...w.activity, { at: today, actor: ROLE_ACTOR[role], text: note }] : w.activity,
              }
            : w,
        ),
      );
      if (note) log(`${id} · ${note}`, "work_order");
    };

    return {
      today,
      role,
      setRole,
      currentTechnicianId: "TEC-01",
      theme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      assets,
      workOrders,
      pmSchedules,
      technicians,
      parts,
      transactions,
      activity,
      assetById,
      technicianById,
      partById,
      createWorkOrder,
      updateWorkOrder,
      setWorkOrderStatus: (id, status) => {
        const done = status === "completed" || status === "closed";
        updateWorkOrder(
          id,
          { status, completedAt: done ? today : null, cost: done ? 120000 : 0 },
          `Status changed to ${status.replace("_", " ")}`,
        );
      },
      toggleChecklistItem: (workOrderId, itemId) =>
        setWorkOrders((prev) =>
          prev.map((w) =>
            w.id === workOrderId
              ? { ...w, checklist: w.checklist.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c)) }
              : w,
          ),
        ),
      generateWorkOrderFromPm: (pmId) => {
        const pm = pmSchedules.find((p) => p.id === pmId);
        if (!pm) return undefined;
        const wo = createWorkOrder({
          title: `${pm.title} — ${pm.assetId}`,
          description: `Auto-generated from preventive maintenance schedule ${pm.id}.`,
          assetId: pm.assetId,
          status: "scheduled",
          priority: "medium",
          workType: "preventive",
          technicianId: pm.technicianId,
          dueDate: pm.nextDue,
          pmId: pm.id,
          checklist: pm.tasks.map((label, i) => ({ id: `${pm.id}-${i}`, label, done: false })),
        });
        setPmSchedules((prev) => prev.map((p) => (p.id === pmId ? { ...p, generatedWorkOrderId: wo.id } : p)));
        log(`${pm.id} came due — ${wo.id} generated`, "pm");
        return wo;
      },
      adjustStock: (partId, type, qty, reference) => {
        setParts((prev) =>
          prev.map((p) =>
            p.id === partId ? { ...p, quantity: Math.max(0, p.quantity + (type === "receive" ? qty : -qty)) } : p,
          ),
        );
        setTransactions((prev) => [
          { id: `TRX-${Date.now()}`, partId, type, qty, at: today, actor: ROLE_ACTOR[role], reference },
          ...prev,
        ]);
        const part = parts.find((p) => p.id === partId);
        log(`${type === "receive" ? "Received" : "Issued"} ${qty} × ${part?.name ?? partId}`, "inventory");
      },
    };
  }, [assets, technicians, workOrders, pmSchedules, parts, transactions, activity, role, theme, today, log]);

  return <CmmsContext.Provider value={value}>{children}</CmmsContext.Provider>;
}

export function useCmms() {
  const ctx = useContext(CmmsContext);
  if (!ctx) throw new Error("useCmms must be used inside CmmsProvider");
  return ctx;
}
