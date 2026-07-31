import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadDocument, type ApiDocument } from "@/lib/api";
import type { KbFolder } from "@/lib/knowledge-data";

const ROOT = "__root__";

export function UploadDocumentModal({
  open,
  onOpenChange,
  folders,
  defaultFolderId,
  onUploaded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  folders: KbFolder[];
  defaultFolderId?: number | null;
  onUploaded?: (doc: ApiDocument) => void;
}) {
  const [target, setTarget] = useState(ROOT);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<"idle" | "processing" | "done">("idle");
  const [extracted, setExtracted] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTarget(defaultFolderId != null ? String(defaultFolderId) : ROOT);
      setFile(null);
      setFileName(null);
      setPhase("idle");
      setDragging(false);
      setError(null);
      setExtracted(0);
    }
  }, [open, defaultFolderId]);

  const pickFile = (f: File | undefined | null) => {
    if (!f) return;
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (![".docx", ".pdf", ".xlsx"].includes(ext)) {
      setError("Unsupported file type. Allowed: .docx, .pdf, .xlsx");
      return;
    }
    setError(null);
    setFile(f);
    setFileName(f.name);
  };

  const submit = async () => {
    if (!file) {
      setError("Please choose a file first.");
      return;
    }
    setPhase("processing");
    setError(null);
    try {
      const folderId = target === ROOT ? null : Number(target);
      const doc = await uploadDocument(file, folderId);
      setExtracted(doc.requirement_count ?? 0);
      setPhase("done");
      onUploaded?.(doc);
      setTimeout(() => onOpenChange(false), 1400);
    } catch (e) {
      setPhase("idle");
      const msg = e instanceof Error ? e.message : "Upload failed";
      setError(msg);
      toast.error("Upload failed", { description: msg });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#0F172A]">Upload Document</DialogTitle>
          <DialogDescription className="text-[#64748B]">
            Upload a BRD, SRS, or FRD. RepoPulse parses it and extracts requirements.
          </DialogDescription>
        </DialogHeader>

        {phase === "done" ? (
          <div className="py-10 flex flex-col items-center text-center">
            <CheckCircle2 className="h-10 w-10 text-[#10B981]" />
            <div className="mt-3 text-sm font-medium text-[#0F172A]">Upload complete</div>
            <div className="mt-1 text-xs text-[#64748B]">
              {extracted} requirement{extracted === 1 ? "" : "s"} extracted from{" "}
              {fileName ?? "your document"}.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pickFile(e.dataTransfer.files?.[0]);
              }}
              className={`rounded-md border border-dashed p-8 text-center transition-colors ${
                dragging ? "border-[#1E40AF] bg-[#EEF2FF]" : "border-[#E5E7EB] bg-[#F8FAFC]"
              }`}
            >
              <UploadCloud className="h-7 w-7 mx-auto text-[#64748B]" />
              <div className="mt-2 text-sm text-[#0F172A]">
                {fileName ?? "Drag & drop a file here"}
              </div>
              <div className="mt-1 text-[11px] text-[#64748B]">
                Accepts .docx, .pdf, .xlsx —{" "}
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-[#1E40AF] underline underline-offset-2"
                >
                  browse files
                </button>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".docx,.pdf,.xlsx"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#64748B]">Save to</label>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger className="mt-2 h-10 bg-white border-[#E5E7EB]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROOT}>Knowledge Base (root)</SelectItem>
                  {folders.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-xs text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] rounded-md px-3 py-2">
                {error}
              </div>
            )}
          </div>
        )}

        {phase !== "done" && (
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-md">
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={phase === "processing" || !file}
              className="rounded-md bg-[#1E40AF] hover:bg-[#1E3A8A] text-white shadow-none"
            >
              {phase === "processing" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Parsing…
                </>
              ) : (
                "Upload & Parse"
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}