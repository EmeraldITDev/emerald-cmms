export type Role = "manager" | "technician" | "storekeeper";

export type AssetStatus = "operating" | "warning" | "degraded" | "critical" | "offline";
export type Criticality = "low" | "medium" | "high";

export interface Asset {
  id: string;
  name: string;
  category: "Pumps" | "Compressors" | "Generators" | "Electrical";
  status: AssetStatus;
  criticality: Criticality;
  healthScore: number;
  location: string;
  parentId: string | null;
  level: "plant" | "unit" | "equipment";
  manufacturer: string;
  model: string;
  serial: string;
  installedOn: string;
  documents: { name: string; type: string; size: string; updatedOn: string }[];
}

export type WorkOrderStatus = "backlog" | "scheduled" | "in_progress" | "completed" | "closed";
export type Priority = "low" | "medium" | "high" | "critical";
export type WorkType = "corrective" | "preventive" | "emergency";

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  assetId: string;
  status: WorkOrderStatus;
  priority: Priority;
  workType: WorkType;
  technicianId: string | null;
  dueDate: string;
  createdAt: string;
  completedAt: string | null;
  estimatedHours: number;
  cost: number;
  checklist: ChecklistItem[];
  parts: { partId: string; qty: number }[];
  photos: string[];
  completionNotes: string;
  pmId?: string | null;
  activity: { at: string; actor: string; text: string }[];
}

export interface PMSchedule {
  id: string;
  title: string;
  assetId: string;
  frequencyType: "time" | "meter";
  intervalDays?: number;
  intervalHours?: number;
  meterReading?: number;
  lastDone: string;
  nextDue: string;
  technicianId: string | null;
  generatedWorkOrderId: string | null;
  tasks: string[];
}

export interface Technician {
  id: string;
  name: string;
  role: string;
  skills: string[];
  availability: "available" | "on_job" | "off_shift";
  phone: string;
  email: string;
  shift: string;
  completedJobs: number;
  avgCompletionHours: number;
}

export interface Part {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  bin: string;
  uom: string;
  linkedAssetIds: string[];
}

export interface StockTransaction {
  id: string;
  partId: string;
  type: "issue" | "receive";
  qty: number;
  at: string;
  actor: string;
  reference: string;
}

export interface ActivityEntry {
  id: string;
  at: string;
  actor: string;
  text: string;
  kind: "work_order" | "inventory" | "pm" | "asset";
}
