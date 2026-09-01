import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Gauge, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCmms } from "@/store/cmms";
import type { Role } from "@/data/types";
import { SITE } from "@/data/seed";

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

  const signIn = () => {
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      <div className="blueprint-grid relative flex flex-1 flex-col justify-between bg-sidebar p-8 text-sidebar-foreground lg:p-12">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Gauge className="size-6" aria-hidden />
          </span>
          <div>
            <p className="text-lg font-bold text-sidebar-accent-foreground">Emerald CMMS</p>
            <p className="text-sm text-sidebar-foreground/70">Emerald Industrial Co.</p>
          </div>
        </div>

        <div className="my-12 max-w-lg">
          <h1 className="text-3xl font-extrabold tracking-tight text-sidebar-accent-foreground sm:text-4xl">
            Control room for plant maintenance
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/80 sm:text-base">
            Manage assets, work orders, preventive maintenance, and spare parts inventory for{" "}
            <span className="font-semibold text-sidebar-accent-foreground">{SITE}</span>.
          </p>
        </div>

        <p className="text-xs text-sidebar-foreground/50">Demo build · mock data only · no live plant connection</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold tracking-tight">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use any credentials — this is a frontend demo.</p>

          <form
            className="mt-8 space-y-5"
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
                  className="pl-9"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" defaultValue="demo" className="pl-9" autoComplete="current-password" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Demo role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger id="role">
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
            </div>

            <Button type="submit" className="w-full" size="lg">
              Sign in to Emerald CMMS
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
