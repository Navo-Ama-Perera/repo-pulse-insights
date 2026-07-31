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
  defaultFolderId?: string | null;
  onUploaded?: (args: { fileName: string; folderId: string | null; requirements: number }) => void;
}) {
  const [target, setTarget] = useState(defaultFolderId ?? ROOT);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<"idle" | "processing" | "done">("idle");
  const [extracted, setExtracted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTarget(defaultFolderId ?? ROOT);
      setFileName(null);
      setPhase("idle");
      setDragging(false);
    }
  }, [open, defaultFolderId]);

  const submit = () => {
    setPhase("processing");
    setTimeout(() => {
      const count = 5 + Math.floor(Math.random() * 12);
      setExtracted(count);
      setPhase("done");
      onUploaded?.({
        fileName: fileName ?? "untitled.docx",
        folderId: target === ROOT ? null : target,
        requirements: count,
      });
      setTimeout(() => onOpenChange(false), 1400);
    }, 1200);
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
              {extracted} requirements extracted from {fileName ?? "your document"}.
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
                const f = e.dataTransfer.files?.[0];
                if (f) setFileName(f.name);
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
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
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
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {phase !== "done" && (
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-md">
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={phase === "processing"}
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
