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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Download, FileCode2, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "Impact Analysis — RepoPulse" },
      {
        name: "description",
        content:
          "Run repo-aware impact analysis on a proposed business requirement and see risk score, affected features, and technical files.",
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
  // Semi-circle gauge
  const clamped = Math.max(0, Math.min(100, value));
  const angle = (clamped / 100) * 180;
  const r = 90;
  const cx = 110;
  const cy = 110;
  const rad = ((180 - angle) * Math.PI) / 180;
  const x = cx + r * Math.cos(rad);
  const y = cy - r * Math.sin(rad);
  const color =
    clamped >= 75
      ? "oklch(0.68 0.22 25)"
      : clamped >= 50
      ? "oklch(0.80 0.18 60)"
      : "oklch(0.78 0.18 155)";
  const label = clamped >= 75 ? "High" : clamped >= 50 ? "Elevated" : "Low";
  return (
    <div className="relative">
      <svg width="220" height="140" viewBox="0 0 220 140">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.78 0.18 155)" />
            <stop offset="55%" stopColor="oklch(0.80 0.18 60)" />
            <stop offset="100%" stopColor="oklch(0.68 0.22 25)" />
          </linearGradient>
        </defs>
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          stroke="oklch(0.28 0.04 265)"
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
        <circle cx={x} cy={y} r={7} fill={color} stroke="oklch(0.16 0.028 265)" strokeWidth="3" />
      </svg>
      <div className="absolute inset-x-0 bottom-2 text-center">
        <div className="font-mono text-4xl font-semibold" style={{ color }}>
          {clamped}
        </div>
        <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          {label} risk
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
  const [result, setResult] = useState<{ score: number } | null>({ score: 74 });

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
    }, 1400);
  };

  return (
    <div className="p-6 md:p-10 pb-28 md:pb-10 max-w-[1400px]">
      <header className="mb-6">
        <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          Workspace / Task
        </div>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
          Impact <span className="neon-text">Analysis</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Describe a proposed business change. RepoPulse maps it against the selected repository
          and surfaces blast radius, affected features, and code paths.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Input panel */}
        <section className="glass-card rounded-2xl p-5 lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Select Repository
              </label>
              <Select
                value={repo}
                onValueChange={(v) => {
                  setRepo(v as keyof typeof REPOS);
                  setBranch(REPOS[v as keyof typeof REPOS][0]);
                }}
              >
                <SelectTrigger className="mt-2 bg-[oklch(0.22_0.03_265)] border-border/60 h-11">
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
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Select Branch
              </label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger className="mt-2 bg-[oklch(0.22_0.03_265)] border-border/60 h-11">
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
            <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Proposed Business Requirement Change
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={7}
              placeholder="e.g. Introduce a mandatory 3DS challenge for EU-issued cards over €100…"
              className="mt-2 min-h-[160px] bg-[oklch(0.20_0.03_265)] border-border/60 font-mono text-sm resize-none"
            />
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Tip: reference specific business rules or SLAs.
              </span>
              <span className="font-mono">{prompt.length} chars</span>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              onClick={run}
              disabled={running || !prompt.trim()}
              className="h-12 px-6 text-sm font-semibold text-[oklch(0.14_0.03_265)] bg-gradient-to-r from-[oklch(0.88_0.17_200)] to-[oklch(0.68_0.24_300)] hover:opacity-95 neon-glow disabled:opacity-50"
            >
              <Zap className="h-4 w-4 mr-2" />
              {running ? "Analyzing repository…" : "Run Impact Analysis"}
            </Button>
          </div>
        </section>

        {/* Risk gauge */}
        <section className="glass-card rounded-2xl p-5 lg:col-span-2 flex flex-col">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Risk Score
          </div>
          <div className="flex-1 flex items-center justify-center py-2">
            {running ? (
              <div className="text-center">
                <div className="h-20 w-20 mx-auto rounded-full border-2 border-[oklch(0.85_0.16_205)] border-t-transparent animate-spin" />
                <div className="mt-4 text-xs font-mono text-muted-foreground">
                  Traversing {repo}@{branch}…
                </div>
              </div>
            ) : result ? (
              <Gauge value={result.score} />
            ) : (
              <div className="text-sm text-muted-foreground">Run an analysis to see results.</div>
            )}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="rounded-md py-1.5 bg-[oklch(0.78_0.18_155/0.12)]">Low 0–49</div>
            <div className="rounded-md py-1.5 bg-[oklch(0.80_0.18_60/0.12)]">Elev 50–74</div>
            <div className="rounded-md py-1.5 bg-[oklch(0.68_0.22_25/0.12)]">High 75+</div>
          </div>
        </section>

        {/* Impacted features */}
        <section className="glass-card rounded-2xl p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Impacted Business Features
              </div>
              <div className="text-lg font-semibold">
                {result ? FEATURES.length : 0} touched across {repo}
              </div>
            </div>
            <AlertTriangle className="h-5 w-5 text-[oklch(0.80_0.18_60)]" />
          </div>
          <ul className="space-y-2">
            {(result ? FEATURES : []).map((f) => {
              const c =
                f.severity === "High"
                  ? "text-[oklch(0.78_0.20_25)] bg-[oklch(0.68_0.22_25/0.12)] border-[oklch(0.68_0.22_25/0.35)]"
                  : f.severity === "Medium"
                  ? "text-[oklch(0.85_0.16_65)] bg-[oklch(0.80_0.18_60/0.12)] border-[oklch(0.80_0.18_60/0.35)]"
                  : "text-[oklch(0.82_0.18_155)] bg-[oklch(0.78_0.18_155/0.12)] border-[oklch(0.78_0.18_155/0.35)]";
              return (
                <li
                  key={f.name}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 bg-[oklch(0.22_0.03_265/0.6)] border border-border/50"
                >
                  <span className="text-sm">{f.name}</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded border ${c}`}>
                    {f.severity}
                  </span>
                </li>
              );
            })}
            {!result && (
              <li className="text-sm text-muted-foreground py-6 text-center">
                Waiting for analysis…
              </li>
            )}
          </ul>
        </section>

        {/* Files toggle + report */}
        <section className="glass-card rounded-2xl p-5 lg:col-span-2 flex flex-col">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Technical Files
              </div>
              <div className="text-lg font-semibold">Affected code paths</div>
            </div>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <Checkbox
                checked={showFiles}
                onCheckedChange={(v) => setShowFiles(!!v)}
                className="border-[oklch(0.85_0.16_205)] data-[state=checked]:bg-[oklch(0.85_0.16_205)] data-[state=checked]:text-[oklch(0.14_0.03_265)]"
              />
              <span>Show affected files</span>
            </label>
          </div>

          {showFiles && result ? (
            <ul className="mt-3 space-y-1.5 font-mono text-[12px] flex-1 overflow-auto max-h-56">
              {FILES.map((f) => (
                <li key={f} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[oklch(0.28_0.04_265/0.4)]">
                  <FileCode2 className="h-3.5 w-3.5 text-[oklch(0.85_0.16_205)] shrink-0" />
                  <span className="truncate">{f}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 flex-1 flex items-center justify-center text-xs text-muted-foreground">
              {result ? "File list hidden" : "Waiting for analysis…"}
            </div>
          )}

          <Button
            variant="outline"
            disabled={!result}
            onClick={() => toast.success("Impact report downloaded", { description: "impact-report.pdf" })}
            className="mt-4 border-[oklch(0.85_0.16_205/0.6)] text-[oklch(0.88_0.17_200)] hover:bg-[oklch(0.85_0.16_205/0.1)] hover:text-[oklch(0.88_0.17_200)]"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Impact Report
          </Button>
        </section>
      </div>
    </div>
  );
}
