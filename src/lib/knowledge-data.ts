import type { ApiDocument, ApiFolder, ApiRequirement } from "./api";

export type DocStatus = "Indexed" | "Processing" | "Failed";

export type Requirement = {
  id: number;
  reqCode: string;
  title: string;
  description: string;
};

export type KbDocument = {
  id: number;
  name: string;
  folderId: number | null;
  status: DocStatus;
  requirementCount: number;
  uploadedAt: string;
  errorMessage: string | null;
  requirements: Requirement[];
  requirementsLoaded: boolean;
};

export type KbFolder = {
  id: number;
  name: string;
  documentCount?: number;
};

export function mapStatus(s: ApiDocument["status"]): DocStatus {
  if (s === "indexed") return "Indexed";
  if (s === "processing") return "Processing";
  return "Failed";
}

export function mapFolder(f: ApiFolder): KbFolder {
  return {
    id: f.id,
    name: f.name,
    documentCount: f.document_count,
  };
}

export function mapRequirement(r: ApiRequirement): Requirement {
  return {
    id: r.id,
    reqCode: r.req_code,
    title: r.title,
    description: r.description,
  };
}

export function mapDocument(
  d: ApiDocument,
  requirements: ApiRequirement[] = [],
  requirementsLoaded = false,
): KbDocument {
  return {
    id: d.id,
    name: d.filename,
    folderId: d.folder_id,
    status: mapStatus(d.status),
    requirementCount: d.requirement_count ?? requirements.length,
    uploadedAt: formatDate(d.uploaded_at),
    errorMessage: d.error_message,
    requirements: requirements.map(mapRequirement),
    requirementsLoaded,
  };
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function docLabel(doc: { name: string; folderId: number | null }, folders: KbFolder[]) {
  const folder = folders.find((f) => f.id === doc.folderId);
  return folder ? `${folder.name}/${doc.name}` : doc.name;
}