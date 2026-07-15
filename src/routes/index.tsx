import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clock, TrendingUp, Zap, ShieldAlert, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BA Performance Overview — RepoPulse" },
      {
        name: "description",
        content:
          "Portfolio-level view of BA impact analyses, module volatility, and hours saved through automated change assessment.",
      },
    ],
  }),
  component: Overview,
});

const analysesOverTime = [
  { m: "Jan", runs: 18, saved: 42 },
  { m: "Feb", runs: 24, saved: 58 },
  { m: "Mar", runs: 31, saved: 74 },
  { m: "Apr", runs: 28, saved: 66 },
  { m: "May", runs: 42, saved: 98 },
  { m: "Jun", runs: 55, saved: 128 },
  { m: "Jul", runs: 61, saved: 152 },
  { m: "Aug", runs: 74, saved: 189 },
  { m: "Sep", runs: 82, saved: 214 },
];

const volatility = [
  { mod: "Payments", score: 92 },
  { mod: "Authentication", score: 78 },
  { mod: "Checkout", score: 71 },
  { mod: "Search", score: 54 },
  { mod: "Notifications", score: 41 },
  { mod: "Profile", score: 28 },
];

const recentAnalyses = [
  { repo: "payment-service", change: "Add 3DS challenge for EU cards", risk: 82, when: "12m ago" },
  { repo: "core-auth-api", change: "Rotate JWT signing keys quarterly", risk: 64, when: "1h ago" },
  { repo: "ecommerce-frontend", change: "New guest-checkout flow", risk: 47, when: "3h ago" },
  { repo: "payment-service", change: "Refund SLA reduced to 24h", risk: 71, when: "yesterday" },
];

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "cyan" | "purple" | "green" | "amber";
}) {
  const accents = {
    cyan: "from-[oklch(0.85_0.16_205)] to-[oklch(0.55_0.15_220)]",
    purple: "from-[oklch(0.68_0.24_300)] to-[oklch(0.50_0.22_310)]",
    green: "from-[oklch(0.78_0.18_155)] to-[oklch(0.55_0.16_165)]",
    amber: "from-[oklch(0.80_0.18_60)] to-[oklch(0.60_0.18_45)]",
  };
  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
      <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${accents[accent]} opacity-20 blur-2xl`} />
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${accents[accent]} flex items-center justify-center`}>
          <Icon className="h-4 w-4 text-[oklch(0.14_0.03_265)]" />
        </div>
      </div>
      <div className="mt-3 font-mono text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
        <ArrowUpRight className="h-3 w-3 text-[oklch(0.78_0.18_155)]" />
        {sub}
      </div>
    </div>
  );
}

function Overview() {
  return (
    <div className="p-6 md:p-10 pb-28 md:pb-10 max-w-[1400px]">
      <header className="mb-8">
        <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Workspace / Portfolio
        </div>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
          BA Performance <span className="neon-text">Overview</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Live pulse across your analyst portfolio — impact runs, volatile system surfaces, and
          reclaimed hours from automated change assessment.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Analyses this qtr" value="217" sub="+34% vs Q2" icon={Zap} accent="cyan" />
        <StatCard label="Avg risk score" value="58.4" sub="−6 pts trailing 30d" icon={ShieldAlert} accent="purple" />
        <StatCard label="Hours saved" value="1,284" sub="+189 this month" icon={Clock} accent="green" />
        <StatCard label="Repos connected" value="12" sub="3 healthy scans today" icon={TrendingUp} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Impact Analyses Executed
              </div>
              <div className="text-lg font-semibold">Runs & hours saved · YTD</div>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[oklch(0.85_0.16_205)]" /> Runs
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[oklch(0.68_0.24_300)]" /> Hours saved
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analysesOverTime}>
                <defs>
                  <linearGradient id="gRuns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.85 0.16 205)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="oklch(0.85 0.16 205)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSaved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.68 0.24 300)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.68 0.24 300)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.55 0.10 260 / 0.12)" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.68 0.03 255)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.68 0.03 255)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.20 0.03 265)",
                    border: "1px solid oklch(0.55 0.10 260 / 0.3)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="runs" stroke="oklch(0.85 0.16 205)" strokeWidth={2} fill="url(#gRuns)" />
                <Area type="monotone" dataKey="saved" stroke="oklch(0.68 0.24 300)" strokeWidth={2} fill="url(#gSaved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Hours saved tracker
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="font-mono text-5xl font-semibold neon-text">1,284</div>
            <div className="text-sm text-muted-foreground">hrs</div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Equivalent to ~32 BA work-weeks reclaimed.
          </div>
          <div className="mt-5 h-3 rounded-full bg-[oklch(0.24_0.03_265)] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[oklch(0.85_0.16_205)] to-[oklch(0.68_0.24_300)]"
              style={{ width: "72%" }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>Goal 1,800 hrs</span>
            <span>72%</span>
          </div>

          <div className="mt-6 space-y-3">
            {[
              ["This week", "+62 hrs"],
              ["Last week", "+48 hrs"],
              ["Avg per analysis", "5.9 hrs"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-mono">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 lg:col-span-2">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Most volatile system modules
          </div>
          <div className="text-lg font-semibold mb-4">Change frequency × blast radius</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volatility} layout="vertical" margin={{ left: 10 }}>
                <defs>
                  <linearGradient id="gBar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="oklch(0.68 0.24 300)" />
                    <stop offset="100%" stopColor="oklch(0.85 0.16 205)" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.55 0.10 260 / 0.12)" horizontal={false} />
                <XAxis type="number" stroke="oklch(0.68 0.03 255)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="mod" stroke="oklch(0.90 0.02 250)" fontSize={12} width={110} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "oklch(0.55 0.10 260 / 0.08)" }}
                  contentStyle={{
                    background: "oklch(0.20 0.03 265)",
                    border: "1px solid oklch(0.55 0.10 260 / 0.3)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="score" fill="url(#gBar)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Recent impact runs
          </div>
          <ul className="divide-y divide-border/60">
            {recentAnalyses.map((a) => (
              <li key={a.change} className="py-3 flex items-start gap-3">
                <div
                  className={`mt-1 h-8 w-8 rounded-lg flex items-center justify-center font-mono text-xs font-semibold ${
                    a.risk >= 75
                      ? "bg-[oklch(0.65_0.24_25/0.15)] text-[oklch(0.78_0.20_25)]"
                      : a.risk >= 55
                      ? "bg-[oklch(0.80_0.18_60/0.15)] text-[oklch(0.85_0.16_65)]"
                      : "bg-[oklch(0.78_0.18_155/0.15)] text-[oklch(0.82_0.18_155)]"
                  }`}
                >
                  {a.risk}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate">{a.change}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    {a.repo} · {a.when}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
