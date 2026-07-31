import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Zap,
  Download,
  FileCode2,
  Sparkles,
  ChevronRight,
  ChevronsUpDown,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { UploadDocumentModal } from "@/components/UploadDocumentModal";
import { listFolders, searchDocuments, type ApiSearchDocument } from "@/lib/api";
import { mapFolder, type KbFolder } from "@/lib/knowledge-data";

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

// Still mock — backend has no connected-repos / impact-analysis APIs yet
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

const MATCHED_REQUIREMENTS = [
  { id: "FR-14", title: "Booking Engine", relevance: "Direct Match" as const },
  { id: "FR-21", title: "Refund Initiation Window", relevance: "Direct Match" as const },
  { id: "FR-11", title: "Guest Checkout Entry Point", relevance: "Related" as const },
  { id: "NFR-03", title: "Checkout Latency Budget", relevance: "Related" as const },
];

type Mode = "code" | "docs" | "hybrid";
const MODES: { id: Mode; label: string }[] = [
  { id: "code", label: "Code-based" },
  { id: "docs", label: "Documentation-based" },
  { id: "hybrid", label: "Hybrid" },
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
 const [prompt, setPrompt] = useState("");
const [errors, setErrors] = useState<{ mode?: string; prompt?: string }>({});
  const [showFiles, setShowFiles] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ score: number } | null>(null);
  /** Empty until user picks a mode */
  const [mode, setMode] = useState<Mode | "">("");

  const [docOptions, setDocOptions] = useState<ApiSearchDocument[]>([]);
  const [folders, setFolders] = useState<KbFolder[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [docSearch, setDocSearch] = useState("");
  const [docPickerOpen, setDocPickerOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const loadDocs = useCallback(async () => {
    setDocsLoading(true);
    try {
      const [docs, apiFolders] = await Promise.all([searchDocuments(), listFolders()]);
      setDocOptions(docs);
      setFolders(apiFolders.map(mapFolder));
      setSelectedDocs((prev) => prev.filter((id) => docs.some((d) => d.id === id)));
    } catch (e) {
      toast.error("Could not load documents", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setDocsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const branches = useMemo(() => REPOS[repo], [repo]);
  const showCode = mode === "code" || mode === "hybrid";
  const showDocs = mode === "docs" || mode === "hybrid";

  const filteredDocs = useMemo(
    () =>
      docOptions.filter((o) =>
        o.display_name.toLowerCase().includes(docSearch.trim().toLowerCase()),
      ),
    [docOptions, docSearch],
  );

  const toggleDoc = (id: number) =>
    setSelectedDocs((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

 const run = () => {
  const nextErrors: { mode?: string; prompt?: string } = {};

  if (!mode) {
    nextErrors.mode = "Please select an analysis mode.";
  }
  if (!prompt.trim()) {
    nextErrors.prompt = "Describe the proposed business change to continue.";
  }

  if (Object.keys(nextErrors).length > 0) {
    setErrors(nextErrors);
    return;
  }

  setErrors({});
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
      <div className="p-4 sm:p-6 md:p-10 pb-24 md:pb-10 max-w-[1400px]">
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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div
              className="text-[11px] uppercase tracking-[0.16em] font-semibold"
              style={{ color: SUBTEXT }}
            >
              Input · configure analysis
            </div>
           <div className="w-full sm:w-56">
  <Select
    value={mode || undefined}
    onValueChange={(v) => {
      setMode(v as Mode);
      setErrors((e) => ({ ...e, mode: undefined }));
    }}
  >
    <SelectTrigger
      className={`h-9 bg-white ${
        errors.mode ? "border-[#EF4444] ring-1 ring-[#EF4444]/50" : "border-[#E5E7EB]"
      }`}
    >
      <SelectValue placeholder="Select mode" />
    </SelectTrigger>
    <SelectContent>
      {MODES.map((m) => (
        <SelectItem key={m.id} value={m.id}>
          {m.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  {errors.mode && (
    <div className="mt-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium bg-[#FEE2E2] text-[#991B1B]">
      {errors.mode}
    </div>
  )}
</div>
          </div>

          {mode && showDocs && (
            <div className="mb-4">
              <label className="text-xs font-medium" style={{ color: SUBTEXT }}>
                Select Document(s)
              </label>
              <Popover open={docPickerOpen} onOpenChange={setDocPickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="mt-2 w-full h-10 px-3 rounded-md border bg-white flex items-center justify-between text-sm"
                    style={{ borderColor: BORDER, color: selectedDocs.length ? INK : SUBTEXT }}
                  >
                    <span className="truncate">
                      {docsLoading
                        ? "Loading documents…"
                        : selectedDocs.length
                          ? `${selectedDocs.length} document${selectedDocs.length === 1 ? "" : "s"} selected`
                          : "Search and select documents…"}
                    </span>
                    {docsLoading ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" style={{ color: SUBTEXT }} />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 shrink-0" style={{ color: SUBTEXT }} />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-[--radix-popover-trigger-width] p-0 bg-white"
                >
                  <div className="p-2 border-b" style={{ borderColor: BORDER }}>
                    <Input
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                      placeholder="Search folder or file name…"
                      className="h-9 bg-white border-[#E5E7EB]"
                    />
                  </div>
                  <ul className="max-h-60 overflow-auto py-1">
                    {filteredDocs.length === 0 && (
                      <li className="px-3 py-3 text-xs" style={{ color: SUBTEXT }}>
                        {docsLoading
                          ? "Loading…"
                          : docOptions.length === 0
                            ? "No indexed documents yet. Upload one from Knowledge Base."
                            : `No documents match "${docSearch}".`}
                      </li>
                    )}
                    {filteredDocs.map((o) => (
                      <li key={o.id}>
                        <label className="flex items-center gap-2 px-3 py-2 hover:bg-[#F8FAFC] cursor-pointer">
                          <Checkbox
                            checked={selectedDocs.includes(o.id)}
                            onCheckedChange={() => toggleDoc(o.id)}
                          />
                          <span className="text-[12px] font-mono truncate" style={{ color: INK }}>
                            {o.display_name}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>

              {selectedDocs.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedDocs.map((id) => {
                    const opt = docOptions.find((o) => o.id === id);
                    if (!opt) return null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-mono bg-[#EEF2FF] text-[#1E40AF]"
                      >
                        {opt.display_name}
                        <button
                          onClick={() => toggleDoc(id)}
                          aria-label={`Remove ${opt.display_name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => setUploadOpen(true)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#1E40AF] hover:underline"
              >
                <Plus className="h-3 w-3" /> Upload new document
              </button>
            </div>
          )}

          {mode && showCode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium" style={{ color: SUBTEXT }}>
                  Select Repository
                </label>
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
          )}

          <div className="mt-5">
  <label className="text-xs font-medium" style={{ color: SUBTEXT }}>
    Proposed Business Requirement Change{" "}
    <span className="text-[#EF4444]">*</span>
  </label>
  <Textarea
    value={prompt}
    onChange={(e) => {
      setPrompt(e.target.value);
      if (e.target.value.trim()) {
        setErrors((err) => ({ ...err, prompt: undefined }));
      }
    }}
    rows={6}
    placeholder="e.g. Introduce a mandatory 3DS challenge for EU-issued cards over €100…"
    className={`mt-2 min-h-[140px] font-mono text-sm resize-none bg-white ${
      errors.prompt ? "border-[#EF4444] ring-1 ring-[#EF4444]/50" : "border-[#E5E7EB]"
    }`}
  />
  {errors.prompt ? (
    <div className="mt-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium bg-[#FEE2E2] text-[#991B1B]">
      {errors.prompt}
    </div>
  ) : (
    <div className="mt-1 flex justify-between text-[11px]" style={{ color: SUBTEXT }}>
      <span className="inline-flex items-center gap-1">
        <Sparkles className="h-3 w-3" /> Tip: reference specific business rules or SLAs.
      </span>
      <span className="font-mono">{prompt.length} chars</span>
    </div>
  )}
</div>

          <div
            className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t"
            style={{ borderColor: BORDER }}
          >
            {/* Toggle only for code / hybrid — not needed for documentation-based */}
            {mode && showCode ? (
              <label className="flex items-center gap-3 cursor-pointer">
                <Switch checked={showFiles} onCheckedChange={setShowFiles} />
                <span className="text-sm" style={{ color: INK }}>
                  Show technical file paths in results
                </span>
              </label>
            ) : (
              <div />
            )}
            <Button
              onClick={run}
              disabled={running}
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
              <div
                className="text-[11px] uppercase tracking-[0.16em] font-semibold"
                style={{ color: SUBTEXT }}
              >
                Output
              </div>
              <div className="text-lg font-semibold mt-0.5" style={{ color: INK }}>
                Analysis Results
              </div>
            </div>
            <Button
              variant="outline"
              disabled={!result}
              onClick={() =>
                toast.success("Impact report downloaded", { description: "impact-report.pdf" })
              }
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
                {showCode ? `Traversing ${repo}@${branch}…` : "Parsing selected documents…"}
              </div>
            </div>
          ) : !result ? (
            <div
              className="py-20 border border-dashed rounded-md flex flex-col items-center justify-center text-center"
              style={{ borderColor: BORDER }}
            >
              <div className="h-11 w-11 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-3">
                <Zap className="h-5 w-5" style={{ color: SUBTEXT }} />
              </div>
              <div className="text-sm font-medium" style={{ color: INK }}>
                Run an analysis to see impact results here
              </div>
              <div className="text-xs mt-1" style={{ color: SUBTEXT }}>
                Configure inputs above and click Run Impact Analysis.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div
                className="rounded-md p-5 bg-white border flex flex-col items-center justify-center"
                style={{ borderColor: BORDER }}
              >
                <div
                  className="text-[10px] uppercase tracking-[0.2em] mb-2 font-semibold"
                  style={{ color: SUBTEXT }}
                >
                  Risk Score
                </div>
                <Gauge value={result.score} />
                <div
                  className="mt-3 grid grid-cols-3 gap-1.5 w-full text-center text-[9px] uppercase tracking-widest font-semibold"
                  style={{ color: SUBTEXT }}
                >
                  <div className="rounded-sm py-1" style={{ background: "#DCFCE7", color: "#166534" }}>
                    Low
                  </div>
                  <div className="rounded-sm py-1" style={{ background: "#FEF3C7", color: "#92400E" }}>
                    Elev
                  </div>
                  <div className="rounded-sm py-1" style={{ background: "#FEE2E2", color: "#991B1B" }}>
                    High
                  </div>
                </div>
              </div>

              {showDocs && (
                <div
                  className="rounded-md p-5 bg-white border lg:col-span-2"
                  style={{ borderColor: BORDER }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold" style={{ color: INK }}>
                      Matched Requirements
                    </div>
                    <span className="text-[11px]" style={{ color: SUBTEXT }}>
                      {MATCHED_REQUIREMENTS.length} matches
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {MATCHED_REQUIREMENTS.map((r) => {
                      const direct = r.relevance === "Direct Match";
                      return (
                        <li
                          key={r.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-md px-3 py-2.5 border"
                          style={{ borderColor: BORDER }}
                        >
                          <span className="text-sm min-w-0" style={{ color: INK }}>
                            <span className="font-mono font-semibold" style={{ color: NAVY }}>
                              {r.id}
                            </span>
                            {" — "}
                            {r.title}
                          </span>
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded"
                            style={
                              direct
                                ? { color: "#1E40AF", background: "#EEF2FF" }
                                : { color: "#475569", background: "#F1F5F9" }
                            }
                          >
                            {r.relevance}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {showCode && (
                <div
                  className="rounded-md p-5 bg-white border lg:col-span-2"
                  style={{ borderColor: BORDER }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold" style={{ color: INK }}>
                      Impacted Business Features
                    </div>
                    <span className="text-[11px]" style={{ color: SUBTEXT }}>
                      {FEATURES.length} touched · {repo}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {FEATURES.map((f) => {
                      const color =
                        f.severity === "High" ? "#EF4444" : f.severity === "Medium" ? "#F59E0B" : "#10B981";
                      const bg =
                        f.severity === "High" ? "#FEE2E2" : f.severity === "Medium" ? "#FEF3C7" : "#DCFCE7";
                      return (
                        <li
                          key={f.name}
                          className="flex items-center justify-between rounded-md px-3 py-2.5 border"
                          style={{ borderColor: BORDER }}
                        >
                          <span className="text-sm" style={{ color: INK }}>
                            {f.name}
                          </span>
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
              )}

              {showCode && showFiles && (
                <div
                  className="rounded-md p-5 bg-white border lg:col-span-3"
                  style={{ borderColor: BORDER }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold" style={{ color: INK }}>
                      Affected Code Paths
                    </div>
                    <span className="text-[11px]" style={{ color: SUBTEXT }}>
                      {FILES.length} files
                    </span>
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

      <UploadDocumentModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        folders={folders}
        defaultFolderId={null}
        onUploaded={() => {
          loadDocs();
          toast.success("Document uploaded — available in the picker once indexed");
        }}
      />
    </div>
  );
}