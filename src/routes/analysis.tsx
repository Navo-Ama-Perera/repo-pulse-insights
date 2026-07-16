import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Download, FileCode2, Sparkles, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "Impact Analysis — RepoPulse" },
      {
        name: "description",
        content:
          "Run repo-aware impact analysis: risk score, impacted features, and affected code paths.",
      },
    ],
  }),
  component: Analysis,
});

const REPOS = {
  "ecommerce-frontend": ["main", "develop", "release/v4.2", "feature/guest-checkout"],
  "payment-service": ["main", "hotfix/3ds", "release/v2.8", "feature/refund-sla"],
  "core-auth-api": ["main", "develop", "feature/jwt-rotation", "release/v1.9"],
};

const FEATURES = [
  { name: "Guest checkout flow", severity: "High" },
  { name: "Saved card wallet", severity: "Medium" },
  { name: "Refund initiation", severity: "High" },
  { name: "Order confirmation email", severity: "Low" },
  { name: "Fraud rules engine", severity: "Medium" },
];

const FILES = [
  "apps/checkout/src/pages/GuestCheckout.tsx",
  "apps/checkout/src/hooks/usePayment.ts",
  "services/payment/src/routes/refund.ts",
  "services/payment/src/lib/3ds-challenge.ts",
  "packages/shared/types/order.ts",
  "services/auth/src/middleware/jwt.ts",
];

function Gauge({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const angle = (clamped / 100) * 180;
  const r = 90;
  const cx = 110;
  const cy = 110;
  const rad = ((180 - angle) * Math.PI) / 180;
  const x = cx + r * Math.cos(rad);
  const y = cy - r * Math.sin(rad);
  const color =
    clamped >= 75 ? "#EF4444" : clamped >= 50 ? "#F59E0B" : "#10B981";
  const label = clamped >= 75 ? "HIGH RISK" : clamped >= 50 ? "ELEVATED RISK" : "LOW RISK";
  return (
    <div className="relative">
      <svg width="220" height="140" viewBox="0 0 220 140">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="55%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          stroke="oklch(0.28 0.03 265)"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${x} ${y}`}
          stroke="url(#gaugeGrad)"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx={x} cy={y} r={7} fill={color} stroke="#12151F" strokeWidth="3" />
      </svg>
      <div className="absolute inset-x-0 bottom-1 text-center">
        <div className="text-4xl font-bold tabular-nums" style={{ color }}>
          {clamped}
        </div>
        <div className="text-[10px] uppercase tracking-[0.24em] mt-1" style={{ color }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function Analysis() {
  const [repo, setRepo] = useState<keyof typeof REPOS>("payment-service");
  const [branch, setBranch] = useState<string>("main");
  const [prompt, setPrompt] = useState(
    "Introduce a mandatory 3DS challenge for EU-issued cards over €100, with fallback to OTP if the issuer bank does not respond within 4s.",
  );
  const [showFiles, setShowFiles] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ score: number } | null>(null);

  const branches = useMemo(() => REPOS[repo], [repo]);

  const run = () => {
    setRunning(true);
    setResult(null);
    setTimeout(() => {
      const score = 40 + Math.floor(Math.random() * 55);
      setResult({ score });
      setRunning(false);
      toast.success("Impact analysis complete", {
        description: `Risk score ${score} · ${FEATURES.length} features touched`,
      });
    }, 1200);
  };

  return (
    <div className="p-6 md:p-10 pb-28 md:pb-10 max-w-[1400px]">
      <header className="mb-6">
        <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Workspace / Task
        </div>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
          Impact <span className="neon-text">Analysis</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Describe a proposed business change. RepoPulse maps it against the selected repository
          and surfaces blast radius, affected features, and code paths.
        </p>
      </header>

      {/* INPUT ZONE */}
      <section className="glass-card rounded-2xl p-6 mb-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Input · configure analysis
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Select Repository</label>
            <Select
              value={repo}
              onValueChange={(v) => {
                setRepo(v as keyof typeof REPOS);
                setBranch(REPOS[v as keyof typeof REPOS][0]);
              }}
            >
              <SelectTrigger className="mt-2 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(REPOS).map((r) => (
                  <SelectItem key={r} value={r} className="font-mono text-sm">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Select Branch <span className="text-[10px] opacity-60">(from {repo})</span>
            </label>
            <Select value={branch} onValueChange={setBranch}>
              <SelectTrigger className="mt-2 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b} value={b} className="font-mono text-sm">
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-5">
          <label className="text-xs font-medium text-muted-foreground">
            Proposed Business Requirement Change
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            placeholder="e.g. Introduce a mandatory 3DS challenge for EU-issued cards over €100…"
            className="mt-2 min-h-[140px] font-mono text-sm resize-none"
          />
          <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Tip: reference specific business rules or SLAs.
            </span>
            <span className="font-mono">{prompt.length} chars</span>
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/50">
          <label className="flex items-center gap-3 cursor-pointer">
            <Switch checked={showFiles} onCheckedChange={setShowFiles} />
            <span className="text-sm">Show technical file paths in results</span>
          </label>
          <Button
            onClick={run}
            disabled={running || !prompt.trim()}
            className="h-12 px-6 text-sm font-semibold text-white bg-gradient-to-r from-[oklch(0.65_0.24_295)] to-[oklch(0.80_0.15_210)] hover:opacity-95 neon-glow disabled:opacity-50"
          >
            <Zap className="h-4 w-4 mr-2" />
            {running ? "Analyzing repository…" : "Run Impact Analysis"}
          </Button>
        </div>
      </section>

      {/* RESULTS ZONE */}
      <section className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Output
            </div>
            <div className="text-lg font-semibold mt-0.5">Analysis Results</div>
          </div>
          <Button
            variant="outline"
            disabled={!result}
            onClick={() => toast.success("Impact report downloaded", { description: "impact-report.pdf" })}
            className="border-[oklch(0.65_0.24_295/0.5)] text-[oklch(0.80_0.15_210)] hover:bg-[oklch(0.65_0.24_295/0.1)] hover:text-[oklch(0.80_0.15_210)]"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Impact Report
          </Button>
        </div>

        {running ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="h-14 w-14 rounded-full border-2 border-[oklch(0.65_0.24_295)] border-t-transparent animate-spin" />
            <div className="text-xs font-mono text-muted-foreground">
              Traversing {repo}@{branch}…
            </div>
          </div>
        ) : !result ? (
          <div className="py-20 border-2 border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-[oklch(0.22_0.03_265)] flex items-center justify-center mb-3">
              <Zap className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-sm font-medium">Run an analysis to see impact results here</div>
            <div className="text-xs text-muted-foreground mt-1">
              Configure inputs above and click Run Impact Analysis.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Gauge */}
            <div className="rounded-xl p-5 bg-[oklch(0.22_0.03_265/0.5)] border border-border/40 flex flex-col items-center justify-center">
              <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-2">
                Risk Score
              </div>
              <Gauge value={result.score} />
              <div className="mt-2 grid grid-cols-3 gap-1.5 w-full text-center text-[9px] uppercase tracking-widest text-muted-foreground">
                <div className="rounded-md py-1" style={{ background: "#10B98122" }}>Low</div>
                <div className="rounded-md py-1" style={{ background: "#F59E0B22" }}>Elev</div>
                <div className="rounded-md py-1" style={{ background: "#EF444422" }}>High</div>
              </div>
            </div>

            {/* Features */}
            <div className="rounded-xl p-5 bg-[oklch(0.22_0.03_265/0.5)] border border-border/40 lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">Impacted Business Features</div>
                <span className="text-[11px] text-muted-foreground">
                  {FEATURES.length} touched · {repo}
                </span>
              </div>
              <ul className="space-y-2">
                {FEATURES.map((f) => {
                  const color = f.severity === "High" ? "#EF4444" : f.severity === "Medium" ? "#F59E0B" : "#10B981";
                  return (
                    <li
                      key={f.name}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 bg-[oklch(0.18_0.028_265)] border border-border/40"
                    >
                      <span className="text-sm">{f.name}</span>
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded"
                        style={{ color, background: color + "1F" }}
                      >
                        {f.severity}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Affected files */}
            {showFiles && (
              <div className="rounded-xl p-5 bg-[oklch(0.22_0.03_265/0.5)] border border-border/40 lg:col-span-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold">Affected Code Paths</div>
                  <span className="text-[11px] text-muted-foreground">{FILES.length} files</span>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 font-mono text-[12px]">
                  {FILES.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[oklch(0.28_0.04_265/0.4)]"
                    >
                      <FileCode2 className="h-3.5 w-3.5 text-[oklch(0.80_0.15_210)] shrink-0" />
                      <span className="truncate">{f}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
