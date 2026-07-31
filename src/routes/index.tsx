import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BA Performance Overview — RepoPulse" },
      {
        name: "description",
        content:
          "Portfolio-level reporting: analyses executed, risk distribution, volatile modules, and hours saved.",
      },
    ],
  }),
  component: Overview,
});

const NAVY = "#1E40AF";
const CYAN = "#22D3EE";
const GREEN = "#10B981";
const AMBER = "#F59E0B";
const RED = "#EF4444";
const GRAY = "#CBD5E1";
const INK = "#0F172A";
const SUBTEXT = "#64748B";

const analyses = [
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
  { mod: "Payments", score: 92, current: true },
  { mod: "Authentication", score: 78, current: false },
  { mod: "Checkout", score: 71, current: false },
  { mod: "Search", score: 54, current: false },
  { mod: "Notifications", score: 41, current: false },
  { mod: "Profile", score: 28, current: false },
];

const riskDist = [
  { label: "Low", value: 118, color: GREEN },
  { label: "Elevated", value: 74, color: AMBER },
  { label: "High", value: 25, color: RED },
];

const recent = [
  { repo: "payment-service", change: "Add 3DS challenge for EU cards", risk: 82, when: "12m ago" },
  { repo: "core-auth-api", change: "Rotate JWT signing keys quarterly", risk: 64, when: "1h ago" },
  { repo: "ecommerce-frontend", change: "New guest-checkout flow", risk: 47, when: "3h ago" },
  { repo: "payment-service", change: "Refund SLA reduced to 24h", risk: 71, when: "yesterday" },
  { repo: "notifications-worker", change: "SMS provider fallback logic", risk: 33, when: "2 days ago" },
];

function riskColor(v: number) {
  if (v >= 75) return RED;
  if (v >= 50) return AMBER;
  return GREEN;
}

function Card({
  title,
  right,
  children,
  className = "",
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`light-card p-5 ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold" style={{ color: INK }}>
            {title}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

function FilterPill({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts = ["This Month", "This Quarter", "YTD", "All time"];
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs rounded-md border px-2 py-1 bg-white"
      style={{ borderColor: "#E2E8F0", color: SUBTEXT }}
    >
      {opts.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

function KPI({
  label,
  value,
  trend,
  trendColor,
}: {
  label: string;
  value: string;
  trend: string;
  trendColor: string;
}) {
  return (
    <div className="light-card p-5">
      <div className="text-xs font-medium uppercase tracking-wider" style={{ color: SUBTEXT }}>
        {label}
      </div>
      <div
        className="mt-3 text-4xl font-bold tracking-tight tabular-nums"
        style={{ color: INK }}
      >
        {value}
      </div>
      <div
        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{ color: trendColor, background: trendColor + "1A" }}
      >
        {trend}
      </div>
    </div>
  );
}

function Overview() {
  const [range, setRange] = useState("YTD");

  const totalRisk = riskDist.reduce((a, b) => a + b.value, 0);

  return (
    <div className="light-surface">
      <div className="p-4 sm:p-6 md:p-10 pb-24 md:pb-10 max-w-[1400px]">
        <header className="mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em]" style={{ color: SUBTEXT }}>
              Workspace / Portfolio
            </div>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight" style={{ color: INK }}>
              BA Performance Overview
            </h1>
            <p className="mt-2 text-sm max-w-2xl" style={{ color: SUBTEXT }}>
              Reporting view across your analyst portfolio — impact runs, risk mix, volatile
              modules, and reclaimed hours.
            </p>
          </div>
          <FilterPill value={range} onChange={setRange} />
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <KPI label="Analyses this qtr" value="217" trend="+34% vs Q2" trendColor={NAVY} />
          <KPI label="Avg risk score" value="58.4" trend="−6 pts vs 30d" trendColor={GREEN} />
          <KPI label="Hours saved" value="1,284" trend="+189 this month" trendColor={CYAN} />
          <KPI label="Repos connected" value="12" trend="3 healthy scans today" trendColor={SUBTEXT} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <Card
            title="Impact Analyses Executed — Runs & Hours Saved · YTD"
            className="lg:col-span-2"
            right={
              <div className="flex gap-4 text-xs" style={{ color: SUBTEXT }}>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: NAVY }} /> Runs
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: CYAN }} /> Hours saved
                </span>
              </div>
            }
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyses}>
                  <CartesianGrid stroke="#EEF2F7" vertical={false} />
                  <XAxis dataKey="m" stroke={SUBTEXT} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={SUBTEXT} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #E2E8F0",
                      borderRadius: 10,
                      fontSize: 12,
                      color: INK,
                    }}
                  />
                  <Area type="monotone" dataKey="runs" stroke={NAVY} strokeWidth={2.5} fill={NAVY} fillOpacity={0.08} />
                  <Area type="monotone" dataKey="saved" stroke={CYAN} strokeWidth={2.5} fill={CYAN} fillOpacity={0.08} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Risk Score Distribution" right={<FilterPill value={range} onChange={setRange} />}>
            <div className="flex flex-col items-center">
              <RiskDonut data={riskDist} total={totalRisk} />
              <div className="mt-4 w-full space-y-2">
                {riskDist.map((r) => (
                  <div key={r.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2" style={{ color: INK }}>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                      {r.label} risk
                    </span>
                    <span className="tabular-nums font-medium" style={{ color: SUBTEXT }}>
                      {r.value} · {Math.round((r.value / totalRisk) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card
            title="Most Volatile System Modules"
            className="lg:col-span-2"
            right={<span className="text-xs" style={{ color: SUBTEXT }}>Change frequency</span>}
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volatility} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid stroke="#EEF2F7" horizontal={false} />
                  <XAxis type="number" stroke={SUBTEXT} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="mod"
                    stroke={INK}
                    fontSize={12}
                    width={110}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#F1F5F9" }}
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #E2E8F0",
                      borderRadius: 10,
                      fontSize: 12,
                      color: INK,
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                    {volatility.map((v, i) => (
                      <Cell key={i} fill={v.current ? NAVY : GRAY} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Recent Impact Runs">
            <ul className="-mx-2">
              {recent.map((a) => (
                <li
                  key={a.change}
                  className="flex items-start gap-3 px-2 py-3 rounded-lg cursor-pointer hover:bg-[#F8FAFC] border-b last:border-b-0"
                  style={{ borderColor: "#F1F5F9" }}
                >
                  <div
                    className="mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold tabular-nums shrink-0"
                    style={{
                      background: riskColor(a.risk) + "1A",
                      color: riskColor(a.risk),
                    }}
                  >
                    {a.risk}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate" style={{ color: INK }}>
                      {a.change}
                    </div>
                    <div className="text-[11px] font-mono mt-0.5" style={{ color: SUBTEXT }}>
                      {a.repo} · {a.when}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RiskDonut({
  data,
  total,
}: {
  data: { label: string; value: number; color: string }[];
  total: number;
}) {
  const size = 180;
  const r = 70;
  const stroke = 22;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#F1F5F9" strokeWidth={stroke} fill="none" />
        {data.map((d, i) => {
          const len = (d.value / total) * c;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={d.color}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold tabular-nums" style={{ color: INK }}>
          {total}
        </div>
        <div className="text-[10px] uppercase tracking-widest" style={{ color: SUBTEXT }}>
          Analyses
        </div>
      </div>
    </div>
  );
}
