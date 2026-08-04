import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Search,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { UploadDocumentModal } from "@/components/UploadDocumentModal";
import {
  listFolders,
  listDocuments,
  createFolder as apiCreateFolder,
  renameFolder as apiRenameFolder,
  deleteFolder as apiDeleteFolder,
  moveDocument,
  renameDocument,
  deleteDocument,
  getDocument,
  addRequirement,
  updateRequirement,
  deleteRequirement,
  type ApiDocument,
} from "@/lib/api";
import {
  mapFolder,
  mapDocument,
  mapRequirement,
  type KbDocument,
  type KbFolder,
  type Requirement,
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
    ],
  }),
  component: KnowledgeBase,
});

const INK = "#0F172A";
const SUBTEXT = "#64748B";
const BORDER = "#E5E7EB";
const ROOT_VALUE = "__root__";

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
  onMoveClick,
  onRename,
  onDelete,
  onToggleExpand,
  onEditRequirement,
  onDeleteRequirement,
  onAddRequirement,
}: {
  doc: KbDocument;
  onMoveClick: (doc: KbDocument) => void;
  onRename: (doc: KbDocument) => void;
  onDelete: (doc: KbDocument) => void;
  onToggleExpand: (doc: KbDocument) => void;
  onEditRequirement: (doc: KbDocument, req: Requirement) => void;
  onDeleteRequirement: (doc: KbDocument, req: Requirement) => void;
  onAddRequirement: (doc: KbDocument) => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = docIcon(doc.name);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) onToggleExpand(doc);
  };

  return (
    <li className="border-b last:border-b-0" style={{ borderColor: BORDER }}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3">
        <button
          onClick={handleToggle}
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
            <span>
              {doc.requirementCount} requirement{doc.requirementCount === 1 ? "" : "s"} extracted
            </span>
            <span>Uploaded {doc.uploadedAt}</span>
          </div>
          {doc.status === "Failed" && doc.errorMessage && (
            <div className="text-[11px] mt-0.5 text-[#B91C1C]">{doc.errorMessage}</div>
          )}
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
          <DropdownMenuContent align="end" className="w-40 bg-white">
            <DropdownMenuItem onSelect={() => onMoveClick(doc)}>Move</DropdownMenuItem>
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
        <div className="px-3 pb-3 pl-10 space-y-2">
          {!doc.requirementsLoaded && doc.status === "Indexed" ? (
            <div className="text-xs flex items-center gap-2" style={{ color: SUBTEXT }}>
              <Loader2 className="h-3 w-3 animate-spin" /> Loading requirements…
            </div>
          ) : (
            <>
              {doc.requirements.length === 0 ? (
                <div className="text-xs" style={{ color: SUBTEXT }}>
                  No requirements yet. Add one below.
                </div>
              ) : (
                <ul className="rounded-md border divide-y" style={{ borderColor: BORDER }}>
                  {doc.requirements.map((r) => (
                    <li key={r.id} className="px-3 py-2.5" style={{ borderColor: BORDER }}>
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-[12px] flex flex-wrap gap-x-2" style={{ color: INK }}>
                            <span className="font-mono font-semibold" style={{ color: "#1E40AF" }}>
                              {r.reqCode}
                            </span>
                            <span style={{ color: SUBTEXT }}>—</span>
                            <span className="font-medium">{r.title}</span>
                          </div>
                          {r.description && (
                            <p
                              className="mt-1 text-[11px] leading-relaxed"
                              style={{ color: SUBTEXT }}
                            >
                              {r.description}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-0.5">
                          <button
                            type="button"
                            aria-label="Edit requirement"
                            onClick={() => onEditRequirement(doc, r)}
                            className="p-1.5 rounded hover:bg-[#F1F5F9]"
                          >
                            <Pencil className="h-3.5 w-3.5" style={{ color: SUBTEXT }} />
                          </button>
                          <button
                            type="button"
                            aria-label="Delete requirement"
                            onClick={() => onDeleteRequirement(doc, r)}
                            className="p-1.5 rounded hover:bg-[#FEF2F2]"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-[#B91C1C]" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAddRequirement(doc)}
                className="h-8 text-xs border-[#1E40AF] text-[#1E40AF] hover:bg-[#EEF2FF] shadow-none rounded-md"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add requirement
              </Button>
            </>
          )}
        </div>
      )}
    </li>
  );
}

function KnowledgeBase() {
  const [folders, setFolders] = useState<KbFolder[]>([]);
  const [documents, setDocuments] = useState<KbDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const [folderModal, setFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const [renameFolderModal, setRenameFolderModal] = useState<KbFolder | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");
  const [renamingFolder, setRenamingFolder] = useState(false);

  const [moveDocModal, setMoveDocModal] = useState<KbDocument | null>(null);
  const [moveTarget, setMoveTarget] = useState(ROOT_VALUE);
  const [moving, setMoving] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);

  const [docToDelete, setDocToDelete] = useState<KbDocument | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<KbFolder | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Requirement add / edit / delete
  const [reqModal, setReqModal] = useState<{
    mode: "add" | "edit";
    doc: KbDocument;
    req?: Requirement;
  } | null>(null);
  const [reqCode, setReqCode] = useState("");
  const [reqTitle, setReqTitle] = useState("");
  const [reqDescription, setReqDescription] = useState("");
  const [reqSaving, setReqSaving] = useState(false);
  const [reqToDelete, setReqToDelete] = useState<{
    doc: KbDocument;
    req: Requirement;
  } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [apiFolders, apiDocs] = await Promise.all([listFolders(), listDocuments()]);
      setFolders(apiFolders.map(mapFolder));
      setDocuments(apiDocs.map((d) => mapDocument(d)));
    } catch (e) {
      toast.error("Failed to load knowledge base", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setSearch("");
  }, [currentFolder]);

  const activeFolder = folders.find((f) => f.id === currentFolder) ?? null;
  const q = search.trim().toLowerCase();

  const filteredFolders = useMemo(() => {
    if (currentFolder != null) return [];
    if (!q) return folders;
    return folders.filter((f) => f.name.toLowerCase().includes(q));
  }, [folders, currentFolder, q]);

  const visibleDocs = useMemo(() => {
    let docs = documents.filter((d) => d.folderId === currentFolder);
    if (q) docs = docs.filter((d) => d.name.toLowerCase().includes(q));
    return docs;
  }, [documents, currentFolder, q]);

  const createFolder = async () => {
    const name = folderName.trim();
    if (!name) return;
    setCreatingFolder(true);
    try {
      const folder = await apiCreateFolder(name);
      setFolders((prev) => [...prev, mapFolder(folder)]);
      setFolderName("");
      setFolderModal(false);
      toast.success("Folder created", { description: name });
    } catch (e) {
      toast.error("Could not create folder", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setCreatingFolder(false);
    }
  };

  const openRenameFolder = (f: KbFolder) => {
    setRenameFolderName(f.name);
    setRenameFolderModal(f);
  };

  const submitRenameFolder = async () => {
    if (!renameFolderModal) return;
    const name = renameFolderName.trim();
    if (!name) return;
    setRenamingFolder(true);
    try {
      const updated = await apiRenameFolder(renameFolderModal.id, name);
      setFolders((prev) => prev.map((f) => (f.id === updated.id ? mapFolder(updated) : f)));
      setRenameFolderModal(null);
      toast.success("Folder renamed", { description: name });
    } catch (e) {
      toast.error("Rename failed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setRenamingFolder(false);
    }
  };

  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return;
    setDeleting(true);
    try {
      await apiDeleteFolder(folderToDelete.id);
      setFolders((prev) => prev.filter((x) => x.id !== folderToDelete.id));
      setDocuments((docs) =>
        docs.map((d) => (d.folderId === folderToDelete.id ? { ...d, folderId: null } : d)),
      );
      if (currentFolder === folderToDelete.id) setCurrentFolder(null);
      toast.success("Folder deleted", { description: folderToDelete.name });
      setFolderToDelete(null);
    } catch (e) {
      toast.error("Delete failed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const openMoveDoc = (doc: KbDocument) => {
    setMoveTarget(ROOT_VALUE);
    setMoveDocModal(doc);
  };

  const submitMoveDoc = async () => {
    if (!moveDocModal) return;
    const folderId = moveTarget === ROOT_VALUE ? null : Number(moveTarget);
    if (folderId === moveDocModal.folderId) {
      setMoveDocModal(null);
      return;
    }
    setMoving(true);
    try {
      const updated = await moveDocument(moveDocModal.id, folderId);
      setDocuments((docs) =>
        docs.map((d) =>
          d.id === moveDocModal.id
            ? {
                ...mapDocument(updated),
                requirements: d.requirements,
                requirementsLoaded: d.requirementsLoaded,
              }
            : d,
        ),
      );
      setMoveDocModal(null);
      toast.success("Document moved");
    } catch (e) {
      toast.error("Move failed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setMoving(false);
    }
  };

  const renameDoc = async (doc: KbDocument) => {
    const next = window.prompt("Rename document", doc.name);
    if (!next?.trim()) return;
    try {
      const updated = await renameDocument(doc.id, next.trim());
      setDocuments((docs) =>
        docs.map((d) => (d.id === doc.id ? { ...d, name: updated.filename } : d)),
      );
      toast.success("Document renamed");
    } catch (e) {
      toast.error("Rename failed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  };

  const confirmDeleteDoc = async () => {
    if (!docToDelete) return;
    setDeleting(true);
    try {
      await deleteDocument(docToDelete.id);
      setDocuments((docs) => docs.filter((d) => d.id !== docToDelete.id));
      toast.success("Document deleted", { description: docToDelete.name });
      setDocToDelete(null);
    } catch (e) {
      toast.error("Delete failed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const onToggleExpand = async (doc: KbDocument) => {
    if (doc.requirementsLoaded || doc.status !== "Indexed") return;
    try {
      const full = await getDocument(doc.id);
      setDocuments((docs) =>
        docs.map((d) => (d.id === doc.id ? mapDocument(full, full.requirements, true) : d)),
      );
    } catch (e) {
      toast.error("Could not load requirements", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  };

  const applyRequirementToDoc = (docId: number, requirements: Requirement[]) => {
    setDocuments((docs) =>
      docs.map((d) =>
        d.id === docId
          ? {
              ...d,
              requirements,
              requirementCount: requirements.length,
              requirementsLoaded: true,
            }
          : d,
      ),
    );
  };

  const openAddRequirement = (doc: KbDocument) => {
    setReqCode("");
    setReqTitle("");
    setReqDescription("");
    setReqModal({ mode: "add", doc });
  };

  const openEditRequirement = (doc: KbDocument, req: Requirement) => {
    setReqCode(req.reqCode);
    setReqTitle(req.title);
    setReqDescription(req.description);
    setReqModal({ mode: "edit", doc, req });
  };

  const submitRequirement = async () => {
    if (!reqModal) return;
    const code = reqCode.trim();
    const title = reqTitle.trim();
    if (!code || !title) {
      toast.error("Code and title are required");
      return;
    }
    setReqSaving(true);
    try {
      const payload = {
        req_code: code,
        title,
        description: reqDescription.trim(),
      };
      // Use latest doc from state so we don't overwrite concurrent edits
      const current = documents.find((d) => d.id === reqModal.doc.id) ?? reqModal.doc;

      if (reqModal.mode === "add") {
        const created = await addRequirement(reqModal.doc.id, payload);
        applyRequirementToDoc(reqModal.doc.id, [...current.requirements, mapRequirement(created)]);
        toast.success("Requirement added", { description: code });
      } else if (reqModal.req) {
        const updated = await updateRequirement(reqModal.doc.id, reqModal.req.id, payload);
        applyRequirementToDoc(
          reqModal.doc.id,
          current.requirements.map((r) =>
            r.id === updated.id ? mapRequirement(updated) : r,
          ),
        );
        toast.success("Requirement updated", { description: code });
      }
      setReqModal(null);
    } catch (e) {
      toast.error(
        reqModal.mode === "add" ? "Could not add requirement" : "Could not update requirement",
        { description: e instanceof Error ? e.message : "Unknown error" },
      );
    } finally {
      setReqSaving(false);
    }
  };

  const confirmDeleteRequirement = async () => {
    if (!reqToDelete) return;
    setDeleting(true);
    try {
      await deleteRequirement(reqToDelete.doc.id, reqToDelete.req.id);
      const current = documents.find((d) => d.id === reqToDelete.doc.id) ?? reqToDelete.doc;
      applyRequirementToDoc(
        reqToDelete.doc.id,
        current.requirements.filter((r) => r.id !== reqToDelete.req.id),
      );
      toast.success("Requirement deleted", { description: reqToDelete.req.reqCode });
      setReqToDelete(null);
    } catch (e) {
      toast.error("Could not delete requirement", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const onUploaded = (_apiDoc: ApiDocument) => {
    refresh();
  };

  const isEmpty = !loading && folders.length === 0 && documents.length === 0;

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

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: SUBTEXT }}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeFolder
                  ? `Search documents in ${activeFolder.name}…`
                  : "Search folders and documents…"
              }
              className="h-10 pl-9 bg-white border-[#E5E7EB]"
            />
          </div>
          <div className="flex flex-wrap gap-2 ml-auto">
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
          {loading ? (
            <div
              className="py-20 flex flex-col items-center justify-center gap-2"
              style={{ color: SUBTEXT }}
            >
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Loading knowledge base…</span>
            </div>
          ) : isEmpty ? (
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
              {!activeFolder && (
                <div className="mb-6">
                  <div
                    className="text-[11px] uppercase tracking-[0.16em] mb-3 font-semibold"
                    style={{ color: SUBTEXT }}
                  >
                    Project folders
                  </div>
                  {filteredFolders.length === 0 ? (
                    <div
                      className="py-8 border border-dashed rounded-md text-center text-sm"
                      style={{ borderColor: BORDER, color: SUBTEXT }}
                    >
                      {q ? `No folders match “${search.trim()}”.` : "No folders yet."}
                    </div>
                  ) : (
                    <ul className="rounded-md border" style={{ borderColor: BORDER }}>
                      {filteredFolders.map((f) => {
                        const count = documents.filter((d) => d.folderId === f.id).length;
                        return (
                          <li
                            key={f.id}
                            className="border-b last:border-b-0 flex items-center gap-3 px-3 py-3"
                            style={{ borderColor: BORDER }}
                          >
                            <button
                              onClick={() => setCurrentFolder(f.id)}
                              className="flex items-center gap-3 min-w-0 flex-1 text-left hover:opacity-80"
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  aria-label="Folder actions"
                                  className="p-1.5 rounded-md hover:bg-[#F1F5F9] shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-4 w-4" style={{ color: SUBTEXT }} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 bg-white">
                                <DropdownMenuItem onSelect={() => openRenameFolder(f)}>
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => setFolderToDelete(f)}
                                  className="text-[#B91C1C] focus:text-[#B91C1C]"
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}

              <div
                className="text-[11px] uppercase tracking-[0.16em] mb-3 font-semibold"
                style={{ color: SUBTEXT }}
              >
                {activeFolder ? `${activeFolder.name} · documents` : "Documents (root)"}
              </div>
              {visibleDocs.length === 0 ? (
                <div
                  className="py-14 border border-dashed rounded-md text-center text-sm"
                  style={{ borderColor: BORDER, color: SUBTEXT }}
                >
                  {q ? `No documents match “${search.trim()}”.` : "No documents here yet."}
                </div>
              ) : (
                <ul className="rounded-md border" style={{ borderColor: BORDER }}>
                  {visibleDocs.map((d) => (
                    <DocumentRow
                      key={d.id}
                      doc={d}
                      onMoveClick={openMoveDoc}
                      onRename={renameDoc}
                      onDelete={(doc) => setDocToDelete(doc)}
                      onToggleExpand={onToggleExpand}
                      onEditRequirement={openEditRequirement}
                      onDeleteRequirement={(doc, req) => setReqToDelete({ doc, req })}
                      onAddRequirement={openAddRequirement}
                    />
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>

      {/* New folder */}
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
              onKeyDown={(e) => {
                if (e.key === "Enter") createFolder();
              }}
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
              disabled={creatingFolder || !folderName.trim()}
              className="rounded-md bg-[#1E40AF] hover:bg-[#1E3A8A] text-white shadow-none"
            >
              {creatingFolder ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating…
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename folder */}
      <Dialog
        open={!!renameFolderModal}
        onOpenChange={(o) => {
          if (!o) setRenameFolderModal(null);
        }}
      >
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle style={{ color: INK }}>Rename Folder</DialogTitle>
          </DialogHeader>
          <div>
            <label className="text-xs font-medium" style={{ color: SUBTEXT }}>
              Folder name
            </label>
            <Input
              value={renameFolderName}
              onChange={(e) => setRenameFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitRenameFolder();
              }}
              className="mt-2 h-10 bg-white border-[#E5E7EB]"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setRenameFolderModal(null)}
              className="rounded-md"
            >
              Cancel
            </Button>
            <Button
              onClick={submitRenameFolder}
              disabled={renamingFolder || !renameFolderName.trim()}
              className="rounded-md bg-[#1E40AF] hover:bg-[#1E3A8A] text-white shadow-none"
            >
              {renamingFolder ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move document */}
      <Dialog
        open={!!moveDocModal}
        onOpenChange={(o) => {
          if (!o) setMoveDocModal(null);
        }}
      >
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle style={{ color: INK }}>Move document</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-sm mb-3" style={{ color: SUBTEXT }}>
              Move <strong style={{ color: INK }}>{moveDocModal?.name}</strong>
            </p>
            <label className="text-xs font-medium" style={{ color: SUBTEXT }}>
              Destination
            </label>
            <Select value={moveTarget} onValueChange={setMoveTarget}>
              <SelectTrigger className="mt-2 h-10 bg-white border-[#E5E7EB]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ROOT_VALUE}>Knowledge Base (root)</SelectItem>
                {folders
                  .filter((f) => f.id !== moveDocModal?.folderId)
                  .map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      {f.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setMoveDocModal(null)} className="rounded-md">
              Cancel
            </Button>
            <Button
              onClick={submitMoveDoc}
              disabled={moving}
              className="rounded-md bg-[#1E40AF] hover:bg-[#1E3A8A] text-white shadow-none"
            >
              {moving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Moving…
                </>
              ) : (
                "Move"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit requirement */}
      <Dialog
        open={!!reqModal}
        onOpenChange={(o) => {
          if (!o) setReqModal(null);
        }}
      >
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle style={{ color: INK }}>
              {reqModal?.mode === "edit" ? "Edit requirement" : "Add requirement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium" style={{ color: SUBTEXT }}>
                Code
              </label>
              <Input
                value={reqCode}
                onChange={(e) => setReqCode(e.target.value)}
                placeholder="e.g. FR-12"
                className="mt-1.5 h-10 bg-white border-[#E5E7EB] font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: SUBTEXT }}>
                Title
              </label>
              <Input
                value={reqTitle}
                onChange={(e) => setReqTitle(e.target.value)}
                placeholder="Short title"
                className="mt-1.5 h-10 bg-white border-[#E5E7EB]"
              />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: SUBTEXT }}>
                Description
              </label>
              <Textarea
                value={reqDescription}
                onChange={(e) => setReqDescription(e.target.value)}
                placeholder="Full requirement text…"
                rows={4}
                className="mt-1.5 resize-none bg-white border-[#E5E7EB] text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setReqModal(null)} className="rounded-md">
              Cancel
            </Button>
            <Button
              onClick={submitRequirement}
              disabled={reqSaving || !reqCode.trim() || !reqTitle.trim()}
              className="rounded-md bg-[#1E40AF] hover:bg-[#1E3A8A] text-white shadow-none"
            >
              {reqSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…
                </>
              ) : reqModal?.mode === "edit" ? (
                "Save"
              ) : (
                "Add"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete requirement */}
      <AlertDialog
        open={!!reqToDelete}
        onOpenChange={(open) => {
          if (!open && !deleting) setReqToDelete(null);
        }}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: INK }}>Delete requirement?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: SUBTEXT }}>
              {reqToDelete
                ? `Remove “${reqToDelete.req.reqCode} — ${reqToDelete.req.title}” from this document. This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="rounded-md">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteRequirement();
              }}
              disabled={deleting}
              className="rounded-md bg-[#B91C1C] hover:bg-[#991B1B] text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete document */}
      <AlertDialog
        open={!!docToDelete}
        onOpenChange={(open) => {
          if (!open && !deleting) setDocToDelete(null);
        }}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: INK }}>Delete document?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: SUBTEXT }}>
              This will permanently remove <strong>{docToDelete?.name}</strong> and all of its
              extracted requirements. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="rounded-md">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteDoc();
              }}
              disabled={deleting}
              className="rounded-md bg-[#B91C1C] hover:bg-[#991B1B] text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete folder */}
      <AlertDialog
        open={!!folderToDelete}
        onOpenChange={(open) => {
          if (!open && !deleting) setFolderToDelete(null);
        }}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: INK }}>Delete folder?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: SUBTEXT }}>
              Delete <strong>{folderToDelete?.name}</strong>? Documents inside will move to
              Knowledge Base (root). This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="rounded-md">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteFolder();
              }}
              disabled={deleting}
              className="rounded-md bg-[#B91C1C] hover:bg-[#991B1B] text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UploadDocumentModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        folders={folders}
        defaultFolderId={currentFolder}
        onUploaded={onUploaded}
      />
    </div>
  );
}