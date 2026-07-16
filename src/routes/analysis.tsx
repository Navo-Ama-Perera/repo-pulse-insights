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

const NAVY = "#1E40AF";
const INK = "#0F172A";
const SUBTEXT = "#64748B";
const BORDER = "#E5E7EB";

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
  const color = clamped >= 75 ? "#EF4444" : clamped >= 50 ? "#F59E0B" : "#10B981";
  const label = clamped >= 75 ? "HIGH RISK" : clamped >= 50 ? "ELEVATED RISK" : "LOW RISK";
  // Split arc into three flat colored segments (green 0-50%, amber 50-75%, red 75-100%)
  const arc = (from: number, to: number) => {
    const a1 = ((180 - (from / 100) * 180) * Math.PI) / 180;
    const a2 = ((180 - (to / 100) * 180) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy - r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy - r * Math.sin(a2);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };
  return (
    <div className="relative">
      <svg width="220" height="140" viewBox="0 0 220 140">
        <path d={arc(0, 50)} stroke="#10B981" strokeWidth="14" fill="none" strokeLinecap="butt" />
        <path d={arc(50, 75)} stroke="#F59E0B" strokeWidth="14" fill="none" strokeLinecap="butt" />
        <path d={arc(75, 100)} stroke="#EF4444" strokeWidth="14" fill="none" strokeLinecap="butt" />
        <circle cx={x} cy={y} r={8} fill="#FFFFFF" stroke={color} strokeWidth="3" />
      </svg>
      <div className="absolute inset-x-0 bottom-1 text-center">
        <div className="text-4xl font-bold tabular-nums" style={{ color: INK }}>
          {clamped}
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] mt-1 font-semibold" style={{ color }}>
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
    }, 1000);
  };

  return (
    <div className="light-surface">
      <div className="p-6 md:p-10 pb-28 md:pb-10 max-w-[1400px]">
        <header className="mb-6">
          <div className="text-xs uppercase tracking-[0.18em]" style={{ color: SUBTEXT }}>
            Workspace / Task
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight" style={{ color: INK }}>
            Impact Analysis
          </h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: SUBTEXT }}>
            Describe a proposed business change. RepoPulse maps it against the selected repository
            and surfaces blast radius, affected features, and code paths.
          </p>
        </header>

        {/* INPUT ZONE */}
        <section className="light-card p-6 mb-6">
          <div className="text-[11px] uppercase tracking-[0.16em] mb-4 font-semibold" style={{ color: SUBTEXT }}>
            Input · configure analysis
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium" style={{ color: SUBTEXT }}>Select Repository</label>
              <Select
                value={repo}
                onValueChange={(v) => {
                  setRepo(v as keyof typeof REPOS);
                  setBranch(REPOS[v as keyof typeof REPOS][0]);
                }}
              >
                <SelectTrigger className="mt-2 h-10 bg-white border-[#E5E7EB]">
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
              <label className="text-xs font-medium" style={{ color: SUBTEXT }}>
                Select Branch <span className="text-[10px] opacity-70">(from {repo})</span>
              </label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger className="mt-2 h-10 bg-white border-[#E5E7EB]">
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
            <label className="text-xs font-medium" style={{ color: SUBTEXT }}>
              Proposed Business Requirement Change
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              placeholder="e.g. Introduce a mandatory 3DS challenge for EU-issued cards over €100…"
              className="mt-2 min-h-[140px] font-mono text-sm resize-none bg-white border-[#E5E7EB]"
            />
            <div className="mt-1 flex justify-between text-[11px]" style={{ color: SUBTEXT }}>
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Tip: reference specific business rules or SLAs.
              </span>
              <span className="font-mono">{prompt.length} chars</span>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t" style={{ borderColor: BORDER }}>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={showFiles} onCheckedChange={setShowFiles} />
              <span className="text-sm" style={{ color: INK }}>Show technical file paths in results</span>
            </label>
            <Button
              onClick={run}
              disabled={running || !prompt.trim()}
              className="h-10 px-5 text-sm font-semibold text-white bg-[#1E40AF] hover:bg-[#1E3A8A] disabled:opacity-50 shadow-none rounded-md"
            >
              <Zap className="h-4 w-4 mr-2" />
              {running ? "Analyzing…" : "Run Impact Analysis"}
            </Button>
          </div>
        </section>

        {/* RESULTS ZONE */}
        <section className="light-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] font-semibold" style={{ color: SUBTEXT }}>
                Output
              </div>
              <div className="text-lg font-semibold mt-0.5" style={{ color: INK }}>Analysis Results</div>
            </div>
            <Button
              variant="outline"
              disabled={!result}
              onClick={() => toast.success("Impact report downloaded", { description: "impact-report.pdf" })}
              className="border-[#1E40AF] text-[#1E40AF] hover:bg-[#EEF2FF] hover:text-[#1E40AF] shadow-none rounded-md"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>

          {running ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="h-10 w-10 rounded-full border-2 border-[#1E40AF] border-t-transparent animate-spin" />
              <div className="text-xs font-mono" style={{ color: SUBTEXT }}>
                Traversing {repo}@{branch}…
              </div>
            </div>
          ) : !result ? (
            <div className="py-20 border border-dashed rounded-md flex flex-col items-center justify-center text-center" style={{ borderColor: BORDER }}>
              <div className="h-11 w-11 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-3">
                <Zap className="h-5 w-5" style={{ color: SUBTEXT }} />
              </div>
              <div className="text-sm font-medium" style={{ color: INK }}>Run an analysis to see impact results here</div>
              <div className="text-xs mt-1" style={{ color: SUBTEXT }}>
                Configure inputs above and click Run Impact Analysis.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Gauge */}
              <div className="rounded-md p-5 bg-white border flex flex-col items-center justify-center" style={{ borderColor: BORDER }}>
                <div className="text-[10px] uppercase tracking-[0.2em] mb-2 font-semibold" style={{ color: SUBTEXT }}>
                  Risk Score
                </div>
                <Gauge value={result.score} />
                <div className="mt-3 grid grid-cols-3 gap-1.5 w-full text-center text-[9px] uppercase tracking-widest font-semibold" style={{ color: SUBTEXT }}>
                  <div className="rounded-sm py-1" style={{ background: "#DCFCE7", color: "#166534" }}>Low</div>
                  <div className="rounded-sm py-1" style={{ background: "#FEF3C7", color: "#92400E" }}>Elev</div>
                  <div className="rounded-sm py-1" style={{ background: "#FEE2E2", color: "#991B1B" }}>High</div>
                </div>
              </div>

              {/* Features */}
              <div className="rounded-md p-5 bg-white border lg:col-span-2" style={{ borderColor: BORDER }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold" style={{ color: INK }}>Impacted Business Features</div>
                  <span className="text-[11px]" style={{ color: SUBTEXT }}>
                    {FEATURES.length} touched · {repo}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {FEATURES.map((f) => {
                    const color = f.severity === "High" ? "#EF4444" : f.severity === "Medium" ? "#F59E0B" : "#10B981";
                    const bg = f.severity === "High" ? "#FEE2E2" : f.severity === "Medium" ? "#FEF3C7" : "#DCFCE7";
                    return (
                      <li
                        key={f.name}
                        className="flex items-center justify-between rounded-md px-3 py-2.5 border"
                        style={{ borderColor: BORDER }}
                      >
                        <span className="text-sm" style={{ color: INK }}>{f.name}</span>
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded"
                          style={{ color, background: bg }}
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
                <div className="rounded-md p-5 bg-white border lg:col-span-3" style={{ borderColor: BORDER }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold" style={{ color: INK }}>Affected Code Paths</div>
                    <span className="text-[11px]" style={{ color: SUBTEXT }}>{FILES.length} files</span>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 font-mono text-[12px]">
                    {FILES.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#F8FAFC]"
                        style={{ color: INK }}
                      >
                        <FileCode2 className="h-3.5 w-3.5 shrink-0" style={{ color: NAVY }} />
                        <span className="truncate">{f}</span>
                        <ChevronRight className="h-3 w-3 ml-auto" style={{ color: SUBTEXT }} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
