import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Zap, GitBranch, Activity, PanelLeftClose, PanelLeft } from "lucide-react";
import { useSidebar } from "@/lib/sidebar-store";

const items = [
  { title: "Performance Overview", url: "/", icon: BarChart3 },
  { title: "Impact Analysis", url: "/analysis", icon: Zap },
  { title: "Connected Repositories", url: "/repositories", icon: GitBranch },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={`hidden md:flex fixed inset-y-0 left-0 z-30 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-4 border-b border-sidebar-border">
        <div className="h-8 w-8 shrink-0 rounded-md flex items-center justify-center bg-[#1E40AF]">
          <Activity className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div className="leading-tight flex-1 min-w-0">
            <div className="font-semibold tracking-tight text-sm text-[#0F172A]">RepoPulse</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#64748B]">
              BA Impact Suite
            </div>
          </div>
        )}
        <button
          onClick={toggle}
          aria-label="Toggle sidebar"
          className="p-1.5 rounded-md hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {!collapsed && (
          <div className="px-3 pb-2 pt-1 text-[10px] uppercase tracking-[0.16em] text-[#94A3B8]">
            Workspace
          </div>
        )}
        {items.map((item) => {
          const active = pathname === item.url;
          const Icon = item.icon;
          return (
            <Link
              key={item.url}
              to={item.url}
              title={collapsed ? item.title : undefined}
              className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-[#EEF2FF] text-[#1E40AF] font-medium"
                  : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r bg-[#1E40AF]" />
              )}
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#1E40AF]" : "text-[#64748B]"}`} />
              {!collapsed && <span className="truncate">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="m-3 rounded-md p-3 bg-[#F8FAFC] border border-[#E5E7EB]">
          <div className="text-[10px] uppercase tracking-[0.14em] text-[#64748B]">
            System status
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            <span className="text-xs text-[#0F172A]">All engines online</span>
          </div>
        </div>
      )}
    </aside>
  );
}

export function MobileNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <div className="md:hidden fixed bottom-3 inset-x-3 z-40 rounded-lg bg-white border border-[#E5E7EB] p-1 flex gap-1">
      {items.map((i) => {
        const active = pathname === i.url;
        const Icon = i.icon;
        return (
          <Link
            key={i.url}
            to={i.url}
            className={`flex-1 text-center py-2 rounded-md text-xs flex items-center justify-center ${
              active ? "bg-[#EEF2FF] text-[#1E40AF]" : "text-[#64748B]"
            }`}
          >
            <Icon className="h-4 w-4" />
          </Link>
        );
      })}
    </div>
  );
}

export function MainShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <main className={collapsed ? "md:pl-16 transition-[padding] duration-200" : "md:pl-60 transition-[padding] duration-200"}>
      {children}
    </main>
  );
}
