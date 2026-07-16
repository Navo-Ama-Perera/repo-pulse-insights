import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { GitBranch, Plus, CheckCircle2, GitCommit, Search, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/repositories")({
  head: () => ({
    meta: [
      { title: "Connected Repositories — RepoPulse" },
      {
        name: "description",
        content:
          "Manage repositories connected to RepoPulse — view scan health, branch coverage, and connect new sources.",
      },
    ],
  }),
  component: Repos,
});

type Repo = {
  name: string;
  provider: "GitHub" | "GitLab" | "Bitbucket";
  visibility: "Private" | "Public";
  branches: number;
  lastScanned: string;
  status: "Healthy" | "Scanning" | "Attention";
  language: string;
};

const initial: Repo[] = [
  { name: "ecommerce-frontend", provider: "GitHub", visibility: "Private", branches: 24, lastScanned: "12 min ago", status: "Healthy", language: "TypeScript" },
  { name: "payment-service", provider: "GitHub", visibility: "Private", branches: 18, lastScanned: "2 hours ago", status: "Healthy", language: "Go" },
  { name: "core-auth-api", provider: "GitLab", visibility: "Private", branches: 11, lastScanned: "Scanning now", status: "Scanning", language: "Kotlin" },
  { name: "notifications-worker", provider: "GitHub", visibility: "Private", branches: 7, lastScanned: "Yesterday", status: "Healthy", language: "Python" },
  { name: "search-index", provider: "Bitbucket", visibility: "Private", branches: 5, lastScanned: "3 days ago", status: "Attention", language: "Rust" },
  { name: "admin-portal", provider: "GitHub", visibility: "Private", branches: 9, lastScanned: "1 hour ago", status: "Healthy", language: "TypeScript" },
];

const STATUS = {
  Healthy: { color: "#10B981", label: "Healthy", pulse: true },
  Scanning: { color: "#8B5CF6", label: "Scanning", pulse: true },
  Attention: { color: "#F59E0B", label: "Attention", pulse: false },
} as const;

function StatusPill({ status }: { status: Repo["status"] }) {
  const s = STATUS[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded-full border"
      style={{ color: s.color, background: s.color + "1A", borderColor: s.color + "55" }}
    >
      <span className="relative flex h-1.5 w-1.5">
        {s.pulse && (
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-70 animate-ping"
            style={{ background: s.color }}
          />
        )}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      </span>
      {s.label}
    </span>
  );
}

function RepoRow({ r }: { r: Repo }) {
  return (
    <div className="group grid grid-cols-12 items-center gap-4 px-5 py-4 hover:bg-[oklch(0.22_0.03_265/0.5)] transition-colors cursor-pointer">
      <div className="col-span-12 md:col-span-4 flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-[oklch(0.28_0.04_265)] to-[oklch(0.22_0.03_265)] border border-border/60 flex items-center justify-center">
          <GitCommit className="h-4 w-4 text-[oklch(0.80_0.15_210)]" />
        </div>
        <div className="min-w-0">
          <div className="font-mono text-sm font-semibold truncate">{r.name}</div>
          <div className="text-[11px] text-muted-foreground">
            {r.provider} · {r.visibility}
          </div>
        </div>
      </div>

      <div className="col-span-4 md:col-span-2">
        <StatusPill status={r.status} />
      </div>

      <div className="col-span-4 md:col-span-1 text-sm">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Branches</div>
        <div className="font-mono tabular-nums">{r.branches}</div>
      </div>

      <div className="col-span-4 md:col-span-2 text-sm">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Language</div>
        <div>{r.language}</div>
      </div>

      <div className="col-span-8 md:col-span-2 text-sm">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Last scanned</div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" style={{ color: STATUS[r.status].color }} />
          <span className="text-xs">{r.lastScanned}</span>
        </div>
      </div>

      <div className="col-span-4 md:col-span-1 text-right">
        <button className="inline-flex items-center gap-0.5 text-xs font-medium text-[oklch(0.80_0.15_210)] hover:underline">
          Configure <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function Repos() {
  const [repos, setRepos] = useState(initial);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const [provider, setProvider] = useState("GitHub");
  const [url, setUrl] = useState("");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [token, setToken] = useState("");

  const filtered = repos.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));

  const submit = () => {
    if (!url.trim()) {
      toast.error("Repository URL is required");
      return;
    }
    const name = url.split("/").filter(Boolean).pop() ?? "new-repo";
    setRepos((prev) => [
      {
        name: name.replace(/\.git$/, ""),
        provider: provider as Repo["provider"],
        visibility: "Private",
        branches: 1,
        lastScanned: "Just now",
        status: "Scanning",
        language: "—",
      },
      ...prev,
    ]);
    setUrl("");
    setToken("");
    setOpen(false);
    toast.success("Repository connected", { description: `Initial scan queued for ${name}` });
  };

  return (
    <div className="p-6 md:p-10 pb-28 md:pb-10 max-w-[1400px]">
      <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            System / Sources
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
            Connected <span className="neon-text">Repositories</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            RepoPulse continuously scans these sources to keep impact maps fresh.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search repos…"
              className="pl-9 h-11 w-full md:w-64 font-mono text-sm"
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 px-5 font-semibold text-white bg-gradient-to-r from-[oklch(0.65_0.24_295)] to-[oklch(0.80_0.15_210)] hover:opacity-95 neon-glow">
                <Plus className="h-4 w-4 mr-2" />
                Connect New Repository
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl">Connect a repository</DialogTitle>
                <DialogDescription>
                  RepoPulse will run an initial scan and index branches within a few minutes.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Provider
                  </Label>
                  <Select value={provider} onValueChange={setProvider}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GitHub">GitHub</SelectItem>
                      <SelectItem value="GitLab">GitLab</SelectItem>
                      <SelectItem value="Bitbucket">Bitbucket</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Repository URL
                  </Label>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://github.com/acme/orders-service"
                    className="mt-2 font-mono text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Default branch
                    </Label>
                    <Input
                      value={defaultBranch}
                      onChange={(e) => setDefaultBranch(e.target.value)}
                      className="mt-2 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Access token
                    </Label>
                    <Input
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="•••••••"
                      className="mt-2 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={submit}
                  className="font-semibold text-white bg-gradient-to-r from-[oklch(0.65_0.24_295)] to-[oklch(0.80_0.15_210)]"
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border/50 hidden md:grid">
          <div className="col-span-4">Repository</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Branches</div>
          <div className="col-span-2">Language</div>
          <div className="col-span-2">Last scanned</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        <div className="divide-y divide-border/40">
          {filtered.map((r) => (
            <RepoRow key={r.name} r={r} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-16">
              No repositories match "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
