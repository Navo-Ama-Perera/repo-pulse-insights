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
import { GitBranch, Plus, CheckCircle2, Search, ChevronRight, FolderGit2 } from "lucide-react";
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

const INK = "#0F172A";
const SUBTEXT = "#64748B";
const BORDER = "#E5E7EB";
const NAVY = "#1E40AF";

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
  Healthy: { color: "#166534", bg: "#DCFCE7", label: "Healthy" },
  Scanning: { color: "#1E40AF", bg: "#DBEAFE", label: "Scanning" },
  Attention: { color: "#92400E", bg: "#FEF3C7", label: "Attention" },
} as const;

function StatusPill({ status }: { status: Repo["status"] }) {
  const s = STATUS[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
      style={{ color: s.color, background: s.bg }}
    >
      <span className="inline-flex h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

function RepoRow({ r }: { r: Repo }) {
  return (
    <div className="grid grid-cols-12 items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors cursor-pointer">
      <div className="col-span-12 md:col-span-4 flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 shrink-0 rounded-md bg-[#F1F5F9] border flex items-center justify-center" style={{ borderColor: BORDER }}>
          <FolderGit2 className="h-4 w-4" style={{ color: NAVY }} />
        </div>
        <div className="min-w-0">
          <div className="font-mono text-sm font-semibold truncate" style={{ color: INK }}>{r.name}</div>
          <div className="text-[11px]" style={{ color: SUBTEXT }}>
            {r.provider} · {r.visibility}
          </div>
        </div>
      </div>

      <div className="col-span-4 md:col-span-2">
        <StatusPill status={r.status} />
      </div>

      <div className="col-span-4 md:col-span-1 text-sm">
        <div className="text-[10px] uppercase tracking-wider" style={{ color: SUBTEXT }}>Branches</div>
        <div className="font-mono tabular-nums" style={{ color: INK }}>{r.branches}</div>
      </div>

      <div className="col-span-4 md:col-span-2 text-sm">
        <div className="text-[10px] uppercase tracking-wider" style={{ color: SUBTEXT }}>Language</div>
        <div style={{ color: INK }}>{r.language}</div>
      </div>

      <div className="col-span-8 md:col-span-2 text-sm">
        <div className="text-[10px] uppercase tracking-wider" style={{ color: SUBTEXT }}>Last scanned</div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" style={{ color: STATUS[r.status].color }} />
          <span className="text-xs" style={{ color: INK }}>{r.lastScanned}</span>
        </div>
      </div>

      <div className="col-span-4 md:col-span-1 text-right">
        <button className="inline-flex items-center gap-0.5 text-xs font-medium hover:underline" style={{ color: NAVY }}>
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
    <div className="light-surface">
      <div className="p-6 md:p-10 pb-28 md:pb-10 max-w-[1400px]">
        <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em]" style={{ color: SUBTEXT }}>
              System / Sources
            </div>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight" style={{ color: INK }}>
              Connected Repositories
            </h1>
            <p className="mt-2 text-sm max-w-2xl" style={{ color: SUBTEXT }}>
              RepoPulse continuously scans these sources to keep impact maps fresh.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: SUBTEXT }} />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search repos…"
                className="pl-9 h-10 w-full md:w-64 font-mono text-sm bg-white border-[#E5E7EB]"
              />
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="h-10 px-4 font-semibold text-white bg-[#1E40AF] hover:bg-[#1E3A8A] shadow-none rounded-md">
                  <Plus className="h-4 w-4 mr-2" />
                  Connect New Repository
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg bg-white">
                <DialogHeader>
                  <DialogTitle className="text-xl">Connect a repository</DialogTitle>
                  <DialogDescription>
                    RepoPulse will run an initial scan and index branches within a few minutes.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div>
                    <Label className="text-xs uppercase tracking-wider" style={{ color: SUBTEXT }}>
                      Provider
                    </Label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger className="mt-2 bg-white border-[#E5E7EB]">
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
                    <Label className="text-xs uppercase tracking-wider" style={{ color: SUBTEXT }}>
                      Repository URL
                    </Label>
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://github.com/acme/orders-service"
                      className="mt-2 font-mono text-sm bg-white border-[#E5E7EB]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs uppercase tracking-wider" style={{ color: SUBTEXT }}>
                        Default branch
                      </Label>
                      <Input
                        value={defaultBranch}
                        onChange={(e) => setDefaultBranch(e.target.value)}
                        className="mt-2 font-mono text-sm bg-white border-[#E5E7EB]"
                      />
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider" style={{ color: SUBTEXT }}>
                        Access token
                      </Label>
                      <Input
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="•••••••"
                        className="mt-2 font-mono text-sm bg-white border-[#E5E7EB]"
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
                    className="font-semibold text-white bg-[#1E40AF] hover:bg-[#1E3A8A] shadow-none"
                  >
                    <GitBranch className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="light-card overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 text-[10px] uppercase tracking-wider font-semibold border-b hidden md:grid" style={{ color: SUBTEXT, borderColor: BORDER }}>
            <div className="col-span-4">Repository</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Branches</div>
            <div className="col-span-2">Language</div>
            <div className="col-span-2">Last scanned</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          <div className="divide-y" style={{ borderColor: BORDER }}>
            {filtered.map((r) => (
              <div key={r.name} className="border-t first:border-t-0" style={{ borderColor: BORDER }}>
                <RepoRow r={r} />
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-sm py-16" style={{ color: SUBTEXT }}>
                No repositories match "{query}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
