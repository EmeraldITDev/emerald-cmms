import type {
  Asset,
  ActivityEntry,
  Part,
  PMSchedule,
  StockTransaction,
  Technician,
  WorkOrder,
} from "./types";

/** Day-precision "today" so SSR and client render identical strings. */
export const TODAY = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z");

export function shiftDays(days: number, from: Date = TODAY): string {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Deterministic pseudo-random so the demo dataset never shifts between renders. */
function makeRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
const rng = makeRng(20260901);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

export const SITE = "Emerald Industrial Co. — Lagos Processing Plant";

export const assets: Asset[] = [
  {
    id: "PLANT-LAG",
    name: "Lagos Processing Plant",
    category: "Electrical",
    status: "operating",
    criticality: "high",
    healthScore: 88,
    location: "Ikeja, Lagos",
    parentId: null,
    level: "plant",
    manufacturer: "—",
    model: "—",
    serial: "—",
    installedOn: "2012-03-04",
    documents: [],
  },
  ...(
    [
      ["UNIT-PRC", "Process Unit A", "Block A"],
      ["UNIT-UTL", "Utilities Unit", "Block B"],
      ["UNIT-PWR", "Power House", "Block C"],
    ] as const
  ).map(
    ([id, name, location]): Asset => ({
      id,
      name,
      category: "Electrical",
      status: "operating",
      criticality: "high",
      healthScore: 90,
      location,
      parentId: "PLANT-LAG",
      level: "unit",
      manufacturer: "—",
      model: "—",
      serial: "—",
      installedOn: "2013-06-01",
      documents: [],
    }),
  ),
];

const equipmentSeed: [string, string, Asset["category"], string, Asset["status"], Asset["criticality"], number][] = [
  ["PMP-001", "Feed Water Pump", "Pumps", "UNIT-PRC", "operating", "high", 92],
  ["PMP-002", "Boiler Circulation Pump", "Pumps", "UNIT-UTL", "warning", "high", 71],
  ["PMP-003", "Cooling Water Pump A", "Pumps", "UNIT-UTL", "operating", "medium", 86],
  ["PMP-004", "Cooling Water Pump B", "Pumps", "UNIT-UTL", "degraded", "medium", 58],
  ["PMP-005", "Product Transfer Pump", "Pumps", "UNIT-PRC", "operating", "medium", 90],
  ["PMP-006", "Sludge Dosing Pump", "Pumps", "UNIT-PRC", "critical", "high", 34],
  ["CMP-001", "Instrument Air Compressor", "Compressors", "UNIT-UTL", "operating", "high", 89],
  ["CMP-002", "Plant Air Compressor", "Compressors", "UNIT-UTL", "warning", "medium", 68],
  ["CMP-003", "Nitrogen Booster Compressor", "Compressors", "UNIT-PRC", "operating", "low", 94],
  ["CMP-004", "Refrigeration Compressor", "Compressors", "UNIT-PRC", "degraded", "high", 61],
  ["GEN-001", "Primary Diesel Generator", "Generators", "UNIT-PWR", "operating", "high", 91],
  ["GEN-002", "Standby Generator", "Generators", "UNIT-PWR", "warning", "high", 74],
  ["GEN-003", "Emergency Generator", "Generators", "UNIT-PWR", "offline", "medium", 45],
  ["ELE-001", "11kV Main Switchgear", "Electrical", "UNIT-PWR", "operating", "high", 95],
  ["ELE-002", "Transformer T1 (2.5 MVA)", "Electrical", "UNIT-PWR", "operating", "high", 88],
  ["ELE-003", "MCC Panel — Process", "Electrical", "UNIT-PRC", "warning", "medium", 72],
  ["ELE-004", "UPS System — Control Room", "Electrical", "UNIT-PWR", "operating", "high", 93],
  ["ELE-005", "Lighting Distribution Board", "Electrical", "UNIT-PRC", "operating", "low", 97],
];

const makers = ["Grundfos", "Atlas Copco", "Caterpillar", "Siemens", "ABB", "KSB"];

equipmentSeed.forEach(([id, name, category, parentId, status, criticality, healthScore], i) => {
  assets.push({
    id,
    name,
    category,
    status,
    criticality,
    healthScore,
    location: parentId === "UNIT-PRC" ? "Block A" : parentId === "UNIT-UTL" ? "Block B" : "Block C",
    parentId,
    level: "equipment",
    manufacturer: makers[i % makers.length],
    model: `${category.slice(0, 3).toUpperCase()}-${900 + i}`,
    serial: `EM${2018 + (i % 6)}-${1000 + i * 7}`,
    installedOn: shiftDays(-(600 + i * 97)),
    documents: [
      { name: `${id}_operating_manual.pdf`, type: "PDF", size: "2.4 MB", updatedOn: shiftDays(-320) },
      { name: `${id}_pid_drawing.dwg`, type: "DWG", size: "860 KB", updatedOn: shiftDays(-210) },
      { name: `${id}_last_inspection.pdf`, type: "PDF", size: "540 KB", updatedOn: shiftDays(-40) },
    ],
  });
});

export const technicians: Technician[] = [
  ["TEC-01", "Adebayo Ogunlade", "Senior Mechanical Tech", ["Mechanical", "Pumps", "Alignment"], "on_job"],
  ["TEC-02", "Chinelo Okafor", "Electrical Technician", ["Electrical", "Switchgear", "UPS"], "available"],
  ["TEC-03", "Ibrahim Musa", "Rotating Equipment Tech", ["Vibration", "Compressors", "Mechanical"], "on_job"],
  ["TEC-04", "Funmi Adeyemi", "Instrumentation Tech", ["Instrumentation", "Calibration", "PLC"], "available"],
  ["TEC-05", "Emeka Nwosu", "Generator Specialist", ["Generators", "Diesel Engines"], "on_job"],
  ["TEC-06", "Zainab Bello", "Maintenance Technician", ["Mechanical", "Welding", "Lubrication"], "off_shift"],
  ["TEC-07", "Tunde Bakare", "Electrical Technician", ["Electrical", "Motors", "Cabling"], "available"],
  ["TEC-08", "Grace Etim", "Predictive Maintenance Analyst", ["Thermography", "Vibration", "Reporting"], "available"],
].map(([id, name, role, skills, availability], i) => ({
  id: id as string,
  name: name as string,
  role: role as string,
  skills: skills as string[],
  availability: availability as Technician["availability"],
  phone: `+234 80${i + 1} 4${i}2 88${10 + i}`,
  email: `${(name as string).split(" ")[0].toLowerCase()}@emeraldindustrial.co`,
  shift: i % 2 === 0 ? "Day (07:00 – 19:00)" : "Night (19:00 – 07:00)",
  completedJobs: 34 + i * 9,
  avgCompletionHours: 3 + ((i * 7) % 5) + 0.5,
}));

export const parts: Part[] = [
  ["SPR-1001", "Mechanical Seal 45mm", 14, 6, 42000, "A-01-03", ["PMP-001", "PMP-002"]],
  ["SPR-1002", "Pump Bearing SKF 6208", 3, 8, 18500, "A-01-07", ["PMP-001", "PMP-003", "PMP-004"]],
  ["SPR-1003", "Impeller — Feed Water Pump", 2, 2, 320000, "A-02-01", ["PMP-001"]],
  ["SPR-1004", "Gland Packing (per m)", 26, 10, 5400, "A-02-05", ["PMP-002", "PMP-005"]],
  ["SPR-1005", "Coupling Element", 9, 4, 26000, "A-03-02", ["PMP-003", "CMP-002"]],
  ["SPR-1006", "Air Filter Element", 5, 12, 15800, "B-01-01", ["CMP-001", "CMP-002"]],
  ["SPR-1007", "Compressor Oil 20L", 11, 5, 48000, "B-01-04", ["CMP-001", "CMP-003"]],
  ["SPR-1008", "Oil Separator Cartridge", 4, 3, 92000, "B-02-02", ["CMP-002"]],
  ["SPR-1009", "Suction Valve Kit", 6, 4, 76000, "B-02-06", ["CMP-004"]],
  ["SPR-1010", "Diesel Fuel Filter", 18, 8, 12000, "C-01-01", ["GEN-001", "GEN-002", "GEN-003"]],
  ["SPR-1011", "Engine Oil Filter", 15, 8, 9800, "C-01-02", ["GEN-001", "GEN-002"]],
  ["SPR-1012", "Battery 12V 100Ah", 2, 4, 145000, "C-01-08", ["GEN-002", "GEN-003"]],
  ["SPR-1013", "Alternator Belt", 7, 4, 21000, "C-02-01", ["GEN-001"]],
  ["SPR-1014", "Radiator Coolant 20L", 9, 4, 33000, "C-02-04", ["GEN-001", "GEN-003"]],
  ["SPR-1015", "Contactor 110A", 6, 5, 58000, "D-01-01", ["ELE-003", "ELE-005"]],
  ["SPR-1016", "MCCB 250A", 1, 3, 210000, "D-01-05", ["ELE-001", "ELE-003"]],
  ["SPR-1017", "UPS Battery Module", 4, 2, 265000, "D-02-02", ["ELE-004"]],
  ["SPR-1018", "Control Fuse 10A (pack of 10)", 22, 10, 7200, "D-02-07", ["ELE-003", "ELE-004"]],
  ["SPR-1019", "Transformer Oil 25L", 3, 2, 118000, "D-03-01", ["ELE-002"]],
  ["SPR-1020", "Grease Cartridge EP2", 30, 12, 4600, "A-04-01", ["PMP-004", "PMP-005", "CMP-004"]],
].map(([id, name, quantity, reorderLevel, unitCost, bin, linkedAssetIds]) => ({
  id: id as string,
  name: name as string,
  partNumber: `EM-${(id as string).split("-")[1]}`,
  quantity: quantity as number,
  reorderLevel: reorderLevel as number,
  unitCost: unitCost as number,
  bin: bin as string,
  uom: "ea",
  linkedAssetIds: linkedAssetIds as string[],
}));

const woTitles: [string, string][] = [
  ["Replace mechanical seal", "Seal weeping at the gland area; replace and re-align."],
  ["Vibration analysis follow-up", "Elevated vibration on drive end bearing — investigate and correct."],
  ["Quarterly lubrication service", "Grease bearings per lubrication schedule and record readings."],
  ["Bearing temperature high", "Bearing running hot; inspect lubrication and clearances."],
  ["Air filter replacement", "Differential pressure above limit; replace filter element."],
  ["Load bank test", "Perform 2-hour load bank test and record parameters."],
  ["Thermography inspection", "Scan panel terminations and log hotspots."],
  ["Coupling alignment check", "Laser alignment check after last overhaul."],
  ["Oil change and sampling", "Drain, refill and send oil sample to lab."],
  ["Panel cleaning and torque check", "Clean panel interior and torque all terminations."],
  ["Leak repair on discharge line", "Repair leaking flange joint on discharge header."],
  ["Battery bank replacement", "Replace failing battery modules and test autonomy."],
  ["Emergency shutdown investigation", "Unit tripped on overload — determine cause and restore."],
  ["Valve kit overhaul", "Replace suction/discharge valve kit and test."],
];

const equipmentIds = equipmentSeed.map((e) => e[0]);
const statuses: WorkOrder["status"][] = ["backlog", "scheduled", "in_progress", "completed", "closed"];
const priorities: WorkOrder["priority"][] = ["low", "medium", "high", "critical"];
const workTypes: WorkOrder["workType"][] = ["corrective", "preventive", "emergency"];

export const workOrders: WorkOrder[] = Array.from({ length: 36 }, (_, i) => {
  const [title, description] = woTitles[i % woTitles.length];
  const assetId = equipmentIds[(i * 5) % equipmentIds.length];
  const status = statuses[i % statuses.length];
  const priority = priorities[(i * 3) % priorities.length];
  const workType = workTypes[i % workTypes.length];
  const done = status === "completed" || status === "closed";
  const overdue = !done && i % 4 === 1;
  const dueOffset = done ? -(4 + (i % 25)) : overdue ? -(1 + (i % 9)) : 1 + (i % 21);
  const tech = technicians[(i * 3) % technicians.length];
  const createdAt = shiftDays(dueOffset - 7);
  const checklist = ["Isolate equipment and apply tags", "Perform the corrective task", "Function test after work", "Update logbook and close out"].map(
    (label, ci) => ({ id: `${i}-${ci}`, label, done: done || (status === "in_progress" && ci === 0) }),
  );
  return {
    id: `WO-${1000 + i}`,
    title: `${title} — ${assetId}`,
    description,
    assetId,
    status,
    priority,
    workType,
    technicianId: status === "backlog" && i % 3 === 0 ? null : tech.id,
    dueDate: shiftDays(dueOffset),
    createdAt,
    completedAt: done ? shiftDays(dueOffset + 1) : null,
    estimatedHours: 2 + (i % 6),
    cost: done ? 45000 + Math.floor(rng() * 380000) : 0,
    checklist,
    parts: [{ partId: parts[(i * 7) % parts.length].id, qty: 1 + (i % 3) }],
    photos: done ? ["before.jpg", "after.jpg"] : [],
    completionNotes: done ? "Work completed, equipment tested and returned to service." : "",
    pmId: workType === "preventive" ? `PM-${100 + (i % 8)}` : null,
    activity: [
      { at: createdAt, actor: "Kemi Balogun (Manager)", text: "Work order created" },
      ...(status !== "backlog" ? [{ at: shiftDays(dueOffset - 5), actor: "Kemi Balogun (Manager)", text: `Assigned to ${tech.name}` }] : []),
      ...(done ? [{ at: shiftDays(dueOffset + 1), actor: tech.name, text: "Marked complete on mobile" }] : []),
    ],
  };
});

export const pmSchedules: PMSchedule[] = [
  ["PM-100", "Monthly pump lubrication", "PMP-001", "time", 30, -34],
  ["PM-101", "Compressor 500-hour service", "CMP-001", "meter", 500, -2],
  ["PM-102", "Generator load bank test", "GEN-001", "time", 90, 5],
  ["PM-103", "Switchgear thermography", "ELE-001", "time", 180, 21],
  ["PM-104", "Cooling pump alignment check", "PMP-003", "time", 60, -6],
  ["PM-105", "Transformer oil test", "ELE-002", "time", 365, 44],
  ["PM-106", "Refrigeration compressor service", "CMP-004", "meter", 1000, 2],
  ["PM-107", "UPS battery autonomy test", "ELE-004", "time", 120, 12],
  ["PM-108", "Standby generator weekly run", "GEN-002", "time", 7, -1],
  ["PM-109", "Plant air compressor filter change", "CMP-002", "time", 45, 9],
].map(([id, title, assetId, frequencyType, interval, dueOffset], i) => ({
  id: id as string,
  title: title as string,
  assetId: assetId as string,
  frequencyType: frequencyType as "time" | "meter",
  intervalDays: frequencyType === "time" ? (interval as number) : undefined,
  intervalHours: frequencyType === "meter" ? (interval as number) : undefined,
  meterReading: frequencyType === "meter" ? 4200 + i * 130 : undefined,
  lastDone: shiftDays((dueOffset as number) - (frequencyType === "time" ? (interval as number) : 30)),
  nextDue: shiftDays(dueOffset as number),
  technicianId: technicians[i % technicians.length].id,
  generatedWorkOrderId: (dueOffset as number) < 0 ? `WO-${1000 + i}` : null,
  tasks: ["Inspect for leaks and abnormal noise", "Check and record operating parameters", "Lubricate/replace consumables", "Sign off checklist"],
}));

export const stockTransactions: StockTransaction[] = Array.from({ length: 14 }, (_, i) => {
  const part = parts[(i * 3) % parts.length];
  const type: StockTransaction["type"] = i % 3 === 0 ? "receive" : "issue";
  return {
    id: `TRX-${500 + i}`,
    partId: part.id,
    type,
    qty: 1 + (i % 4),
    at: shiftDays(-(i + 1)),
    actor: type === "receive" ? "Sade Iwu (Storekeeper)" : technicians[i % technicians.length].name,
    reference: type === "receive" ? `GRN-${2200 + i}` : `WO-${1000 + ((i * 4) % 36)}`,
  };
});

export const activityFeed: ActivityEntry[] = [
  { id: "AC-1", at: shiftDays(0), actor: "Emeka Nwosu", text: "Completed WO-1013 · Load bank test on GEN-001", kind: "work_order" },
  { id: "AC-2", at: shiftDays(0), actor: "Sade Iwu", text: "Issued 2 × Diesel Fuel Filter to WO-1010", kind: "inventory" },
  { id: "AC-3", at: shiftDays(-1), actor: "System", text: "PM-108 came due — WO-1008 auto-generated", kind: "pm" },
  { id: "AC-4", at: shiftDays(-1), actor: "Kemi Balogun", text: "Raised emergency WO on PMP-006 (critical)", kind: "work_order" },
  { id: "AC-5", at: shiftDays(-2), actor: "Chinelo Okafor", text: "Logged hotspot finding on ELE-003 panel", kind: "asset" },
  { id: "AC-6", at: shiftDays(-2), actor: "Sade Iwu", text: "Received 10 × Control Fuse 10A (GRN-2205)", kind: "inventory" },
  { id: "AC-7", at: shiftDays(-3), actor: "Ibrahim Musa", text: "Started WO-1002 · Vibration analysis on CMP-002", kind: "work_order" },
];

export const costTrend = [
  { month: "Apr", cost: 4120000, budget: 4500000 },
  { month: "May", cost: 3860000, budget: 4500000 },
  { month: "Jun", cost: 5210000, budget: 4500000 },
  { month: "Jul", cost: 4480000, budget: 4500000 },
  { month: "Aug", cost: 3990000, budget: 4500000 },
  { month: "Sep", cost: 4340000, budget: 4500000 },
];

export const pmComplianceTrend = [
  { month: "Apr", compliance: 78 },
  { month: "May", compliance: 82 },
  { month: "Jun", compliance: 74 },
  { month: "Jul", compliance: 86 },
  { month: "Aug", compliance: 89 },
  { month: "Sep", compliance: 91 },
];
