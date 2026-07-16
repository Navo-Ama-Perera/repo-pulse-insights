import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Zap, GitBranch, Activity, PanelLeftClose, PanelLeft } from "lucide-react";
import { useSidebar } from "@/lib/sidebar-store";

const items = [
  { title: "BA Performance Overview", url: "/", icon: BarChart3, emoji: "📊" },
  { title: "Impact Analysis Task", url: "/analysis", icon: Zap, emoji: "⚡" },
  { title: "Connected Repositories", url: "/repositories", icon: GitBranch, emoji: "🔗" },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={`hidden md:flex fixed inset-y-0 left-0 z-30 flex-col border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-5 border-b border-sidebar-border">
        <div className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center bg-gradient-to-br from-[oklch(0.65_0.24_295)] to-[oklch(0.80_0.15_210)] shadow-[0_0_18px_oklch(0.65_0.24_295/0.5)]">
          <Activity className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div className="leading-tight flex-1 min-w-0">
            <div className="font-semibold tracking-tight text-sm">RepoPulse</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              BA Impact Suite
            </div>
          </div>
        )}
        <button
          onClick={toggle}
          aria-label="Toggle sidebar"
          className="p-1.5 rounded-md hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Workspace
          </div>
        )}
        {items.map((item) => {
          const active = pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              title={collapsed ? item.title : undefined}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                active
                  ? "bg-gradient-to-r from-[oklch(0.65_0.24_295/0.20)] to-[oklch(0.80_0.15_210/0.10)] text-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-r bg-gradient-to-b from-[oklch(0.65_0.24_295)] to-[oklch(0.80_0.15_210)]" />
              )}
              <span className="text-base shrink-0">{item.emoji}</span>
              {!collapsed && <span className="truncate">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="m-3 rounded-xl p-4 bg-[oklch(0.22_0.03_265/0.6)] border border-sidebar-border">
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
      )}
    </aside>
  );
}

export function MobileNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <div className="md:hidden fixed bottom-3 inset-x-3 z-40 rounded-2xl bg-[oklch(0.14_0.028_265)] border border-sidebar-border p-1.5 flex gap-1">
      {items.map((i) => {
        const active = pathname === i.url;
        return (
          <Link
            key={i.url}
            to={i.url}
            className={`flex-1 text-center py-2 rounded-xl text-xs ${
              active ? "bg-[oklch(0.65_0.24_295/0.22)] text-foreground" : "text-muted-foreground"
            }`}
          >
            <div className="text-base">{i.emoji}</div>
          </Link>
        );
      })}
    </div>
  );
}

export function MainShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return <main className={collapsed ? "md:pl-16 transition-[padding] duration-200" : "md:pl-64 transition-[padding] duration-200"}>{children}</main>;
}
