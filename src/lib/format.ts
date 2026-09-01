export const currency = (n: number) =>
  "₦" + Math.round(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });

export const compactCurrency = (n: number) =>
  n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `₦${Math.round(n / 1000)}k` : `₦${n}`;

export const formatDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[m - 1]} ${y}`;
};

export const daysFromToday = (iso: string, today: string) => {
  const a = Date.parse(iso.slice(0, 10));
  const b = Date.parse(today.slice(0, 10));
  return Math.round((a - b) / 86_400_000);
};

export const relativeDue = (iso: string, today: string) => {
  const d = daysFromToday(iso, today);
  if (d === 0) return "Due today";
  if (d < 0) return `${Math.abs(d)} day${Math.abs(d) === 1 ? "" : "s"} overdue`;
  return `Due in ${d} day${d === 1 ? "" : "s"}`;
};

export const titleCase = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
