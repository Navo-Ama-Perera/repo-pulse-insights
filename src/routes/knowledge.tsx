import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Folder,
  FolderPlus,
  Upload,
  FileText,
  FileSpreadsheet,
  FileType2,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Loader2,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { UploadDocumentModal } from "@/components/UploadDocumentModal";
import {
  INITIAL_DOCUMENTS,
  INITIAL_FOLDERS,
  type KbDocument,
  type KbFolder,
} from "@/lib/knowledge-data";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge Base — RepoPulse" },
      {
        name: "description",
        content:
          "Organize BRDs, SRS, and FRDs into project folders and track extracted requirements.",
      },
      { property: "og:title", content: "Knowledge Base — RepoPulse" },
      {
        property: "og:description",
        content: "Project document folders with parsed requirement extraction in RepoPulse.",
      },
    ],
  }),
  component: KnowledgeBase,
});

const INK = "#0F172A";
const SUBTEXT = "#64748B";
const BORDER = "#E5E7EB";

function docIcon(name: string) {
  if (name.endsWith(".xlsx")) return FileSpreadsheet;
  if (name.endsWith(".pdf")) return FileType2;
  return FileText;
}

function StatusBadge({ status }: { status: KbDocument["status"] }) {
  if (status === "Indexed")
    return (
      <span
        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded"
        style={{ color: "#166534", background: "#DCFCE7" }}
      >
        Indexed
      </span>
    );
  if (status === "Processing")
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded"
        style={{ color: "#92400E", background: "#FEF3C7" }}
      >
        <Loader2 className="h-3 w-3 animate-spin" /> Processing…
      </span>
    );
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded"
      style={{ color: "#991B1B", background: "#FEE2E2" }}
    >
      Failed
    </span>
  );
}

function DocumentRow({
  doc,
  folders,
  onMove,
  onRename,
  onDelete,
}: {
  doc: KbDocument;
  folders: KbFolder[];
  onMove: (doc: KbDocument, folderId: string | null) => void;
  onRename: (doc: KbDocument) => void;
  onDelete: (doc: KbDocument) => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = docIcon(doc.name);
  return (
    <li className="border-b last:border-b-0" style={{ borderColor: BORDER }}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Collapse requirements" : "Expand requirements"}
          className="p-1 rounded hover:bg-[#F1F5F9] shrink-0"
        >
          {open ? (
            <ChevronDown className="h-4 w-4" style={{ color: SUBTEXT }} />
          ) : (
            <ChevronRight className="h-4 w-4" style={{ color: SUBTEXT }} />
          )}
        </button>
        <Icon className="h-4 w-4 shrink-0" style={{ color: "#1E40AF" }} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-mono truncate" style={{ color: INK }}>
            {doc.name}
          </div>
          <div className="text-[11px] mt-0.5 flex flex-wrap gap-x-3" style={{ color: SUBTEXT }}>
            <span>{doc.requirementCount} requirements extracted</span>
            <span>Uploaded {doc.uploadedAt}</span>
          </div>
        </div>
        <StatusBadge status={doc.status} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Document actions"
              className="p-1.5 rounded-md hover:bg-[#F1F5F9] shrink-0"
            >
              <MoreHorizontal className="h-4 w-4" style={{ color: SUBTEXT }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white">
            <DropdownMenuItem onSelect={() => onMove(doc, null)}>
              Move to Knowledge Base (root)
            </DropdownMenuItem>
            {folders
              .filter((f) => f.id !== doc.folderId)
              .map((f) => (
                <DropdownMenuItem key={f.id} onSelect={() => onMove(doc, f.id)}>
                  Move to {f.name}
                </DropdownMenuItem>
              ))}
            <DropdownMenuItem onSelect={() => onRename(doc)}>Rename</DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onDelete(doc)}
              className="text-[#B91C1C] focus:text-[#B91C1C]"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {open && (
        <div className="px-3 pb-3 pl-10">
          {doc.requirements.length === 0 ? (
            <div className="text-xs" style={{ color: SUBTEXT }}>
              No requirements extracted yet.
            </div>
          ) : (
            <ul className="rounded-md border divide-y" style={{ borderColor: BORDER }}>
              {doc.requirements.map((r) => (
                <li
                  key={r.id}
                  className="px-3 py-2 text-[12px] flex flex-wrap gap-x-2"
                  style={{ borderColor: BORDER, color: INK }}
                >
                  <span className="font-mono font-semibold" style={{ color: "#1E40AF" }}>
                    {r.id}
                  </span>
                  <span style={{ color: SUBTEXT }}>—</span>
                  <span>{r.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

function KnowledgeBase() {
  const [folders, setFolders] = useState<KbFolder[]>(INITIAL_FOLDERS);
  const [documents, setDocuments] = useState<KbDocument[]>(INITIAL_DOCUMENTS);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderModal, setFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const activeFolder = folders.find((f) => f.id === currentFolder) ?? null;
  const visibleDocs = useMemo(
    () => documents.filter((d) => d.folderId === currentFolder),
    [documents, currentFolder],
  );

  const createFolder = () => {
    const name = folderName.trim();
    if (!name) return;
    setFolders((f) => [...f, { id: `f-${Date.now()}`, name }]);
    setFolderName("");
    setFolderModal(false);
    toast.success("Folder created", { description: name });
  };

  const moveDoc = (doc: KbDocument, folderId: string | null) => {
    setDocuments((docs) => docs.map((d) => (d.id === doc.id ? { ...d, folderId } : d)));
    toast.success("Document moved");
  };

  const renameDoc = (doc: KbDocument) => {
    const next = window.prompt("Rename document", doc.name);
    if (!next?.trim()) return;
    setDocuments((docs) => docs.map((d) => (d.id === doc.id ? { ...d, name: next.trim() } : d)));
  };

  const deleteDoc = (doc: KbDocument) => {
    setDocuments((docs) => docs.filter((d) => d.id !== doc.id));
    toast.success("Document deleted", { description: doc.name });
  };

  const isEmpty = folders.length === 0 && documents.length === 0;

  return (
    <div className="light-surface">
      <div className="p-4 sm:p-6 md:p-10 pb-24 md:pb-10 max-w-[1400px]">
        <header className="mb-6">
          <div className="text-xs uppercase tracking-[0.18em]" style={{ color: SUBTEXT }}>
            Workspace / Knowledge Base
          </div>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight" style={{ color: INK }}>
            Knowledge Base
          </h1>
          <p className="mt-2 text-sm max-w-2xl" style={{ color: SUBTEXT }}>
            Organize your BRDs, SRS, and FRDs into project folders, or upload directly.
          </p>
        </header>

        <div className="flex flex-wrap justify-end gap-2 mb-4">
          <Button
            variant="outline"
            onClick={() => setFolderModal(true)}
            className="h-10 border-[#1E40AF] text-[#1E40AF] hover:bg-[#EEF2FF] hover:text-[#1E40AF] shadow-none rounded-md"
          >
            <FolderPlus className="h-4 w-4 mr-2" /> New Folder
          </Button>
          <Button
            onClick={() => setUploadOpen(true)}
            className="h-10 px-5 text-sm font-semibold text-white bg-[#1E40AF] hover:bg-[#1E3A8A] shadow-none rounded-md"
          >
            <Upload className="h-4 w-4 mr-2" /> Upload Document
          </Button>
        </div>

        <nav className="mb-4 text-sm flex flex-wrap items-center gap-1" style={{ color: SUBTEXT }}>
          <button
            onClick={() => setCurrentFolder(null)}
            className={activeFolder ? "text-[#1E40AF] hover:underline" : "font-medium text-[#0F172A]"}
          >
            Knowledge Base
          </button>
          {activeFolder && (
            <>
              <span>/</span>
              <span className="font-medium" style={{ color: INK }}>
                {activeFolder.name}
              </span>
            </>
          )}
        </nav>

        <section className="light-card p-4 sm:p-6">
          {isEmpty ? (
            <div
              className="py-20 border border-dashed rounded-md flex flex-col items-center justify-center text-center"
              style={{ borderColor: BORDER }}
            >
              <div className="h-11 w-11 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-3">
                <Inbox className="h-5 w-5" style={{ color: SUBTEXT }} />
              </div>
              <div className="text-sm font-medium max-w-sm" style={{ color: INK }}>
                No documents yet. Create a project folder or upload a document to get started.
              </div>
            </div>
          ) : (
            <>
              {!activeFolder && folders.length > 0 && (
                <div className="mb-6">
                  <div
                    className="text-[11px] uppercase tracking-[0.16em] mb-3 font-semibold"
                    style={{ color: SUBTEXT }}
                  >
                    Project folders
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {folders.map((f) => {
                      const count = documents.filter((d) => d.folderId === f.id).length;
                      return (
                        <button
                          key={f.id}
                          onClick={() => setCurrentFolder(f.id)}
                          className="text-left rounded-md border bg-white px-4 py-3 hover:bg-[#F8FAFC] transition-colors flex items-center gap-3"
                          style={{ borderColor: BORDER }}
                        >
                          <Folder className="h-5 w-5 shrink-0" style={{ color: "#1E40AF" }} />
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate" style={{ color: INK }}>
                              {f.name}
                            </div>
                            <div className="text-[11px]" style={{ color: SUBTEXT }}>
                              {count} document{count === 1 ? "" : "s"}
                            </div>
                          </div>
                          <ChevronRight
                            className="h-4 w-4 ml-auto shrink-0"
                            style={{ color: SUBTEXT }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div
                className="text-[11px] uppercase tracking-[0.16em] mb-3 font-semibold"
                style={{ color: SUBTEXT }}
              >
                {activeFolder ? `${activeFolder.name} · documents` : "Documents"}
              </div>
              {visibleDocs.length === 0 ? (
                <div
                  className="py-14 border border-dashed rounded-md text-center text-sm"
                  style={{ borderColor: BORDER, color: SUBTEXT }}
                >
                  No documents here yet.
                </div>
              ) : (
                <ul className="rounded-md border" style={{ borderColor: BORDER }}>
                  {visibleDocs.map((d) => (
                    <DocumentRow
                      key={d.id}
                      doc={d}
                      folders={folders}
                      onMove={moveDoc}
                      onRename={renameDoc}
                      onDelete={deleteDoc}
                    />
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>

      <Dialog open={folderModal} onOpenChange={setFolderModal}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle style={{ color: INK }}>New Folder</DialogTitle>
          </DialogHeader>
          <div>
            <label className="text-xs font-medium" style={{ color: SUBTEXT }}>
              Folder name
            </label>
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. Billing Platform"
              className="mt-2 h-10 bg-white border-[#E5E7EB]"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setFolderModal(false)} className="rounded-md">
              Cancel
            </Button>
            <Button
              onClick={createFolder}
              className="rounded-md bg-[#1E40AF] hover:bg-[#1E3A8A] text-white shadow-none"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UploadDocumentModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        folders={folders}
        defaultFolderId={currentFolder}
        onUploaded={({ fileName, folderId, requirements }) =>
          setDocuments((docs) => [
            ...docs,
            {
              id: `d-${Date.now()}`,
              name: fileName,
              folderId,
              status: "Indexed",
              requirementCount: requirements,
              uploadedAt: new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              requirements: Array.from({ length: Math.min(requirements, 4) }, (_, i) => ({
                id: `FR-${40 + i}`,
                title: "Extracted requirement",
              })),
            },
          ])
        }
      />
    </div>
  );
}
