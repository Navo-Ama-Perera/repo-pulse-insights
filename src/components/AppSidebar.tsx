import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Zap, GitBranch, Activity } from "lucide-react";

const items = [
  { title: "BA Performance Overview", url: "/", icon: BarChart3, emoji: "📊" },
  { title: "Impact Analysis Task", url: "/analysis", icon: Zap, emoji: "⚡" },
  { title: "Connected Repositories", url: "/repositories", icon: GitBranch, emoji: "🔗" },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-5 py-6 border-b border-sidebar-border">
        <div className="relative">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-[oklch(0.85_0.16_205)] to-[oklch(0.68_0.24_300)] neon-glow">
            <Activity className="h-4 w-4 text-[oklch(0.14_0.03_265)]" />
          </div>
        </div>
        <div className="leading-tight">
          <div className="font-semibold tracking-tight text-sm">RepoPulse</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            BA Impact Suite
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Workspace
        </div>
        {items.map((item) => {
          const active = pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                active
                  ? "bg-gradient-to-r from-[oklch(0.85_0.16_205/0.15)] to-[oklch(0.68_0.24_300/0.10)] text-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-r bg-gradient-to-b from-[oklch(0.85_0.16_205)] to-[oklch(0.68_0.24_300)] shadow-[0_0_10px_oklch(0.85_0.16_205)]" />
              )}
              <span className="text-base">{item.emoji}</span>
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-xl p-4 glass-card">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          System status
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[oklch(0.78_0.18_155)] opacity-70 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[oklch(0.78_0.18_155)]" />
          </span>
          <span className="text-xs">All engines online</span>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <div className="md:hidden fixed bottom-3 inset-x-3 z-40 rounded-2xl glass-card p-1.5 flex gap-1">
      {items.map((i) => {
        const active = pathname === i.url;
        return (
          <Link
            key={i.url}
            to={i.url}
            className={`flex-1 text-center py-2 rounded-xl text-xs ${
              active ? "bg-[oklch(0.85_0.16_205/0.18)] text-foreground" : "text-muted-foreground"
            }`}
          >
            <div className="text-base">{i.emoji}</div>
          </Link>
        );
      })}
    </div>
  );
}
