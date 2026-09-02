import {
  Activity,
  Bot,
  BrainCircuit,
  CalendarClock,
  HardDrive,
  MessageCircle,
  QrCode,
  Settings,
  ShieldCheck,
  Users
} from "lucide-react";

const navItems = [
  "Overview",
  "WhatsApp",
  "Live Activity",
  "Conversations",
  "Schedules",
  "Reminders",
  "Memory Library",
  "Users",
  "Groups",
  "AI Usage",
  "Logs",
  "System Health",
  "Settings"
];

const metrics = [
  { label: "Messages Today", value: "0" },
  { label: "Tom Invocations Today", value: "0" },
  { label: "Active Reminders", value: "0" },
  { label: "Stored Reactions", value: "0" },
  { label: "AI Requests", value: "0" },
  { label: "Failed Jobs", value: "0" }
];

const checks = [
  { name: "Tom API", status: "Foundation Ready", icon: Bot },
  { name: "WhatsApp", status: "Not Configured", icon: MessageCircle },
  { name: "PostgreSQL", status: "Docker Provided", icon: HardDrive },
  { name: "Redis", status: "Docker Provided", icon: Activity },
  { name: "Worker", status: "Skeleton Ready", icon: CalendarClock },
  { name: "OpenAI", status: "Not Configured", icon: BrainCircuit }
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-b bg-card lg:border-b-0 lg:border-r">
          <div className="flex h-16 items-center gap-3 border-b px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
              T
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide">TOM</div>
              <div className="text-xs text-muted-foreground">Admin Platform</div>
            </div>
          </div>
          <nav className="grid gap-1 p-3">
            {navItems.map((item) => (
              <a
                key={item}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                href={item === "WhatsApp" ? "/whatsapp" : "#"}
              >
                {item}
              </a>
            ))}
          </nav>
        </aside>

        <section className="px-5 py-6 sm:px-8">
          <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">Overview</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Phase 1 foundation status for the WhatsApp assistant platform.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Admin auth foundation enabled
            </div>
          </header>

          <div className="grid gap-4 py-6 sm:grid-cols-2 xl:grid-cols-6">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border bg-card p-4 shadow-sm">
                <div className="text-xs text-muted-foreground">{metric.label}</div>
                <div className="mt-3 text-2xl font-semibold">{metric.value}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <section className="rounded-lg border bg-card shadow-sm">
              <div className="border-b p-4">
                <h2 className="text-sm font-semibold">System Health</h2>
              </div>
              <div className="grid gap-0 divide-y">
                {checks.map((check) => {
                  const Icon = check.icon;
                  return (
                    <div key={check.name} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{check.name}</span>
                      </div>
                      <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground">
                        {check.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-semibold">Scan To Chat With TOM</h2>
              </div>
              <div className="mt-5 flex aspect-square items-center justify-center rounded-lg border bg-muted">
                <QrCode className="h-24 w-24 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Official WhatsApp chat link generation lands after Phase 2 provider verification.
              </p>
            </section>
          </div>

          <section className="mt-4 rounded-lg border bg-card shadow-sm">
            <div className="border-b p-4">
              <h2 className="text-sm font-semibold">Live Activity</h2>
            </div>
            <div className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              No events yet. SSE/WebSocket monitoring lands with the runtime event pipeline.
              <Settings className="ml-auto h-4 w-4" />
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
