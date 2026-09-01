import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Boxes,
  ClipboardList,
  Cog,
  Factory,
  Gauge,
  HardHat,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  Smartphone,
  Sun,
  CalendarClock,
  FileBarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useCmms } from "@/store/cmms";
import type { Role } from "@/data/types";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/assets", label: "Assets", icon: Factory },
  { to: "/work-orders", label: "Work Orders", icon: ClipboardList },
  { to: "/preventive-maintenance", label: "Preventive Maintenance", icon: CalendarClock },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/technicians", label: "Technicians", icon: HardHat },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/settings", label: "Settings", icon: Cog },
] as const;

const ROLE_LABEL: Record<Role, string> = {
  manager: "Maintenance Manager",
  technician: "Technician",
  storekeeper: "Storekeeper",
};

function Wordmark() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 px-1 py-1">
      <span className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <Gauge className="size-5" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold text-sidebar-accent-foreground">Emerald CMMS</span>
        <span className="block text-[11px] text-sidebar-foreground/70">Emerald Industrial Co.</span>
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1" aria-label="Main navigation">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to || pathname.startsWith(to + "/");
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-primary/15 text-sidebar-accent-foreground ring-1 ring-sidebar-primary/40",
            )}
          >
            <Icon className={cn("size-4 shrink-0", active && "text-sidebar-primary")} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 bg-sidebar p-4">
      <Wordmark />
      <NavList onNavigate={onNavigate} />
      <div className="mt-auto rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3">
        <p className="flex items-center gap-2 text-xs font-semibold text-sidebar-accent-foreground">
          <Smartphone className="size-3.5" aria-hidden /> Field mode
        </p>
        <p className="mt-1 text-[11px] text-sidebar-foreground/70">Mobile-optimised job flow for technicians.</p>
        <Button asChild size="sm" variant="secondary" className="mt-2 w-full">
          <Link to="/my-jobs" onClick={onNavigate}>
            Open My Jobs
          </Link>
        </Button>
      </div>
    </div>
  );
}

function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const { assets, workOrders, parts } = useCmms();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (to: string) => {
    setOpen(false);
    navigate({ to });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-xs items-center gap-2 rounded-md border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Search className="size-4" aria-hidden />
        <span className="truncate">Search assets, work orders, parts…</span>
        <kbd className="ml-auto hidden rounded border bg-muted px-1.5 text-[10px] font-semibold sm:block">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Global search" description="Search the plant">
        <CommandInput placeholder="Search assets, work orders, parts…" />
        <CommandList>
          <CommandEmpty>No matches found.</CommandEmpty>
          <CommandGroup heading="Assets">
            {assets
              .filter((a) => a.level === "equipment")
              .slice(0, 20)
              .map((a) => (
                <CommandItem key={a.id} value={`${a.id} ${a.name}`} onSelect={() => go(`/assets/${a.id}`)}>
                  <Factory className="size-4" aria-hidden /> {a.id} · {a.name}
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandGroup heading="Work orders">
            {workOrders.slice(0, 25).map((w) => (
              <CommandItem key={w.id} value={`${w.id} ${w.title}`} onSelect={() => go(`/work-orders/${w.id}`)}>
                <ClipboardList className="size-4" aria-hidden /> {w.id} · {w.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Parts">
            {parts.map((p) => (
              <CommandItem key={p.id} value={`${p.partNumber} ${p.name}`} onSelect={() => go("/inventory")}>
                <Boxes className="size-4" aria-hidden /> {p.partNumber} · {p.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { role, setRole, theme, toggleTheme } = useCmms();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-sidebar-border lg:block">
        <SidebarBody />
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/85 px-4 py-3 backdrop-blur">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarBody onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <GlobalSearch />

          <div className="ml-auto flex items-center gap-2">
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="w-[180px]" aria-label="Switch demo role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle colour mode">
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
