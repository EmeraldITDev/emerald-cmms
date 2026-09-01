import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Gauge, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCmms } from "@/store/cmms";
import type { Role } from "@/data/types";
import { SITE } from "@/data/seed";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<Role, string> = {
  manager: "Maintenance Manager",
  technician: "Technician",
  storekeeper: "Storekeeper",
};

export const Route = createFileRoute("/")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { role, setRole } = useCmms();
  const [email, setEmail] = useState("kemi.balogun@emeraldindustrial.co");
  const [password, setPassword] = useState("demo");

  const signIn = () => {
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen min-w-0 flex-col lg:flex-row">
      <div className="blueprint-grid flex flex-col justify-between bg-sidebar px-4 py-8 text-sidebar-foreground sm:px-6 sm:py-10 lg:flex-1 lg:p-12">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Gauge className="size-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-sidebar-accent-foreground">Emerald CMMS</p>
            <p className="truncate text-sm text-sidebar-foreground/70">Emerald Industrial Co.</p>
          </div>
        </div>

        <div className="my-8 max-w-lg sm:my-10 lg:my-12">
          <h1 className="text-2xl font-extrabold tracking-tight text-sidebar-accent-foreground sm:text-3xl lg:text-4xl">
            Control room for plant maintenance
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/80 sm:text-base">
            Manage assets, work orders, preventive maintenance, and spare parts inventory for{" "}
            <span className="font-semibold text-sidebar-accent-foreground">{SITE}</span>.
          </p>
        </div>

        <p className="text-xs leading-relaxed text-sidebar-foreground/50">Demo build · mock data only · no live plant connection</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-md">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Sign in</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Use any credentials — this is a frontend demo.
          </p>

          <form
            className="mt-6 space-y-5 sm:mt-8"
            onSubmit={(e) => {
              e.preventDefault();
              signIn();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-9 text-base sm:text-sm"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-9 text-base sm:text-sm"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Demo role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className={cn(
                  "flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-base shadow-sm sm:text-sm",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                )}
              >
                {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" className="h-11 w-full text-base sm:text-sm" size="lg">
              Sign in to Emerald CMMS
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
