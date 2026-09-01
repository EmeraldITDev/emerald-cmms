import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, User } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCmms } from "@/store/cmms";
import type { Role } from "@/data/types";
import { SITE } from "@/data/seed";
import { toast } from "sonner";

const ROLE_LABEL: Record<Role, string> = {
  manager: "Maintenance Manager",
  technician: "Technician",
  storekeeper: "Storekeeper",
};

const PROFILE: Record<Role, { name: string; email: string }> = {
  manager: { name: "Kemi Balogun", email: "kemi.balogun@emeraldindustrial.co" },
  technician: { name: "Adebayo Ogunlade", email: "adebayo@emeraldindustrial.co" },
  storekeeper: { name: "Sade Iwu", email: "sade.iwu@emeraldindustrial.co" },
};

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { role, setRole, theme, toggleTheme } = useCmms();
  const profile = PROFILE[role];

  return (
    <div>
      <PageHeader title="Settings" description="Profile and demo preferences" />

      <div className="grid max-w-2xl gap-4">
        <SectionCard title="Profile">
          <div className="flex items-start gap-4">
            <span className="flex size-14 items-center justify-center rounded-full border bg-muted">
              <User className="size-7 text-muted-foreground" aria-hidden />
            </span>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-muted-foreground">Name</dt><dd className="text-lg font-semibold">{profile.name}</dd></div>
              <div><dt className="text-muted-foreground">Email</dt><dd className="font-medium">{profile.email}</dd></div>
              <div><dt className="text-muted-foreground">Site</dt><dd className="font-medium">{SITE}</dd></div>
              <div><dt className="text-muted-foreground">Role</dt><dd className="font-medium">{ROLE_LABEL[role]}</dd></div>
            </dl>
          </div>
        </SectionCard>

        <SectionCard title="Demo role switcher">
          <p className="mb-3 text-sm text-muted-foreground">Simulate logging in as different personas. No real auth enforcement in this MVP.</p>
          <div className="space-y-2">
            <Label htmlFor="role">Active role</Label>
            <Select value={role} onValueChange={(v) => { setRole(v as Role); toast.success(`Switched to ${ROLE_LABEL[v as Role]}`); }}>
              <SelectTrigger id="role" className="max-w-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                  <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SectionCard>

        <SectionCard title="Appearance">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Dark mode (control room)</p>
              <p className="text-xs text-muted-foreground">Toggle between light and dark themes.</p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="size-4 text-muted-foreground" aria-hidden />
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} aria-label="Toggle dark mode" />
              <Moon className="size-4 text-muted-foreground" aria-hidden />
            </div>
          </div>
          <Button variant="outline" className="mt-4" onClick={() => toast.info("Profile saved (demo)")}>
            Save preferences
          </Button>
        </SectionCard>
      </div>
    </div>
  );
}
