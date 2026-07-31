import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Zap,
  GitBranch,
  Activity,
  BookOpen,
  PanelLeftClose,
  PanelLeft,
  Menu,
  X,
} from "lucide-react";
import { useEffect } from "react";
import { useSidebar } from "@/lib/sidebar-store";

const items = [
  { title: "Performance Overview", url: "/", icon: BarChart3 },
  { title: "Impact Analysis", url: "/analysis", icon: Zap },
  { title: "Knowledge Base", url: "/knowledge", icon: BookOpen },
  { title: "Connected Repositories", url: "/repositories", icon: GitBranch },
];

function Brand({ collapsed, onClose }: { collapsed?: boolean; onClose?: () => void }) {
  return (
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
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close navigation"
          className="p-1.5 rounded-md hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function NavItems({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
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
            onClick={onNavigate}
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
  );
}

function StatusCard() {
  return (
    <div className="m-3 rounded-md p-3 bg-[#F8FAFC] border border-[#E5E7EB]">
      <div className="text-[10px] uppercase tracking-[0.14em] text-[#64748B]">System status</div>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#10B981]" />
        <span className="text-xs text-[#0F172A]">All engines online</span>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={`hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="relative">
        <Brand collapsed={collapsed} />
        <button
          onClick={toggle}
          aria-label="Toggle sidebar"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
      <NavItems collapsed={collapsed} />
      {!collapsed && <StatusCard />}
    </aside>
  );
}

export function MobileNav() {
  const { mobileOpen, setMobileOpen } = useSidebar();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    setMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 flex items-center gap-3 border-b border-[#E5E7EB] bg-white px-3 py-2.5">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="p-2 rounded-md text-[#334155] hover:bg-[#F1F5F9]"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 shrink-0 rounded-md flex items-center justify-center bg-[#1E40AF]">
            <Activity className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm text-[#0F172A] truncate">RepoPulse</span>
        </div>
      </header>

      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-250 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-250 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Brand onClose={() => setMobileOpen(false)} />
        <NavItems onNavigate={() => setMobileOpen(false)} />
        <StatusCard />
      </aside>
    </>
  );
}

export function MainShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <main
      className={
        collapsed
          ? "lg:pl-16 transition-[padding] duration-200"
          : "lg:pl-60 transition-[padding] duration-200"
      }
    >
      {children}
    </main>
  );
}
