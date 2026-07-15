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
import { GitBranch, Plus, CheckCircle2, GitCommit, Clock, Search } from "lucide-react";
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
  {
    name: "ecommerce-frontend",
    provider: "GitHub",
    visibility: "Private",
    branches: 24,
    lastScanned: "12 min ago",
    status: "Healthy",
    language: "TypeScript",
  },
  {
    name: "payment-service",
    provider: "GitHub",
    visibility: "Private",
    branches: 18,
    lastScanned: "2 hours ago",
    status: "Healthy",
    language: "Go",
  },
  {
    name: "core-auth-api",
    provider: "GitLab",
    visibility: "Private",
    branches: 11,
    lastScanned: "Scanning now",
    status: "Scanning",
    language: "Kotlin",
  },
  {
    name: "notifications-worker",
    provider: "GitHub",
    visibility: "Private",
    branches: 7,
    lastScanned: "Yesterday",
    status: "Healthy",
    language: "Python",
  },
  {
    name: "search-index",
    provider: "Bitbucket",
    visibility: "Private",
    branches: 5,
    lastScanned: "3 days ago",
    status: "Attention",
    language: "Rust",
  },
  {
    name: "admin-portal",
    provider: "GitHub",
    visibility: "Private",
    branches: 9,
    lastScanned: "1 hour ago",
    status: "Healthy",
    language: "TypeScript",
  },
];

function StatusPill({ status }: { status: Repo["status"] }) {
  const map = {
    Healthy: {
      c: "text-[oklch(0.82_0.18_155)] bg-[oklch(0.78_0.18_155/0.12)] border-[oklch(0.78_0.18_155/0.4)]",
      dot: "bg-[oklch(0.78_0.18_155)]",
      pulse: true,
    },
    Scanning: {
      c: "text-[oklch(0.88_0.17_200)] bg-[oklch(0.85_0.16_205/0.12)] border-[oklch(0.85_0.16_205/0.4)]",
      dot: "bg-[oklch(0.85_0.16_205)]",
      pulse: true,
    },
    Attention: {
      c: "text-[oklch(0.85_0.16_65)] bg-[oklch(0.80_0.18_60/0.12)] border-[oklch(0.80_0.18_60/0.4)]",
      dot: "bg-[oklch(0.80_0.18_60)]",
      pulse: false,
    },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold px-2 py-1 rounded border ${map.c}`}>
      <span className="relative flex h-1.5 w-1.5">
        {map.pulse && (
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-70 animate-ping ${map.dot}`} />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${map.dot}`} />
      </span>
      {status}
    </span>
  );
}

function RepoCard({ r }: { r: Repo }) {
  return (
    <div className="glass-card rounded-2xl p-5 group hover:border-[oklch(0.85_0.16_205/0.4)] transition-all relative overflow-hidden">
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br from-[oklch(0.85_0.16_205)] to-[oklch(0.68_0.24_300)] opacity-0 group-hover:opacity-10 blur-2xl transition-opacity" />
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[oklch(0.28_0.04_265)] to-[oklch(0.22_0.03_265)] border border-border/60 flex items-center justify-center">
            <GitCommit className="h-4 w-4 text-[oklch(0.88_0.17_200)]" />
          </div>
          <div>
            <div className="font-mono text-sm font-semibold">{r.name}</div>
            <div className="text-[11px] text-muted-foreground">
              {r.provider} · {r.visibility}
            </div>
          </div>
        </div>
        <StatusPill status={r.status} />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg py-2 bg-[oklch(0.22_0.03_265/0.6)] border border-border/40">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Branches</div>
          <div className="font-mono text-lg font-semibold">{r.branches}</div>
        </div>
        <div className="rounded-lg py-2 bg-[oklch(0.22_0.03_265/0.6)] border border-border/40">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Lang</div>
          <div className="text-sm mt-0.5">{r.language}</div>
        </div>
        <div className="rounded-lg py-2 bg-[oklch(0.22_0.03_265/0.6)] border border-border/40">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Scans</div>
          <div className="font-mono text-lg font-semibold text-[oklch(0.82_0.18_155)]">
            <CheckCircle2 className="inline h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3 w-3" /> Last scanned {r.lastScanned}
        </span>
        <button className="text-[oklch(0.88_0.17_200)] hover:underline">Configure →</button>
      </div>
    </div>
  );
}

function Repos() {
  const [repos, setRepos] = useState(initial);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  // form
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
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
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
              className="pl-9 h-11 w-full md:w-64 bg-[oklch(0.22_0.03_265)] border-border/60 font-mono text-sm"
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 px-5 font-semibold text-[oklch(0.14_0.03_265)] bg-gradient-to-r from-[oklch(0.88_0.17_200)] to-[oklch(0.68_0.24_300)] hover:opacity-95 neon-glow">
                <Plus className="h-4 w-4 mr-2" />
                Connect New Repository
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[oklch(0.18_0.03_265)] border-border/60 max-w-lg">
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
                    <SelectTrigger className="mt-2 bg-[oklch(0.22_0.03_265)] border-border/60">
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
                    className="mt-2 font-mono text-sm bg-[oklch(0.22_0.03_265)] border-border/60"
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
                      className="mt-2 font-mono text-sm bg-[oklch(0.22_0.03_265)] border-border/60"
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
                      className="mt-2 font-mono text-sm bg-[oklch(0.22_0.03_265)] border-border/60"
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
                  className="font-semibold text-[oklch(0.14_0.03_265)] bg-gradient-to-r from-[oklch(0.88_0.17_200)] to-[oklch(0.68_0.24_300)]"
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <RepoCard key={r.name} r={r} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-16 glass-card rounded-2xl">
            No repositories match "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
