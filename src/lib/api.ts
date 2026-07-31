const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") detail = body.detail;
      else if (Array.isArray(body.detail)) detail = body.detail.map((d: { msg?: string }) => d.msg ?? JSON.stringify(d)).join(", ");
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json();
}

// ---------- Types (match backend) ----------

export type ApiFolder = {
  id: number;
  name: string;
  created_at: string;
  document_count?: number;
};

export type ApiDocument = {
  id: number;
  folder_id: number | null;
  filename: string;
  file_path: string;
  file_type: string;
  status: "processing" | "indexed" | "failed";
  error_message: string | null;
  uploaded_at: string;
  requirement_count?: number;
};

export type ApiRequirement = {
  id: number;
  req_code: string;
  title: string;
  description: string;
};

export type ApiSearchDocument = {
  id: number;
  display_name: string;
  filename: string;
  folder_name: string | null;
};

// ---------- Folders ----------

export async function listFolders(): Promise<ApiFolder[]> {
  const data = await request<{ status: string; folders: ApiFolder[] }>("/api/folders");
  return data.folders;
}

export async function createFolder(name: string): Promise<ApiFolder> {
  const data = await request<{ status: string; folder: ApiFolder }>("/api/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return data.folder;
}

export async function deleteFolder(folderId: number): Promise<void> {
  await request(`/api/folders/${folderId}`, { method: "DELETE" });
}

// ---------- Documents ----------

export async function listDocuments(opts?: {
  folderId?: number | null;
  rootOnly?: boolean;
}): Promise<ApiDocument[]> {
  const params = new URLSearchParams();
  if (opts?.rootOnly) params.set("root_only", "true");
  else if (opts?.folderId != null) params.set("folder_id", String(opts.folderId));
  const q = params.toString() ? `?${params}` : "";
  const data = await request<{ status: string; documents: ApiDocument[] }>(`/api/documents${q}`);
  return data.documents;
}

export async function getDocument(
  documentId: number,
): Promise<ApiDocument & { requirements: ApiRequirement[] }> {
  const data = await request<{
    status: string;
    document: ApiDocument & { requirements: ApiRequirement[] };
  }>(`/api/documents/${documentId}`);
  return data.document;
}

export async function uploadDocument(
  file: File,
  folderId?: number | null,
): Promise<ApiDocument> {
  const form = new FormData();
  form.append("file", file);
  if (folderId != null) form.append("folder_id", String(folderId));
  const data = await request<{ status: string; document: ApiDocument }>(
    "/api/documents/upload",
    { method: "POST", body: form },
  );
  return data.document;
}

export async function moveDocument(
  documentId: number,
  folderId: number | null,
): Promise<ApiDocument> {
  const data = await request<{ status: string; document: ApiDocument }>(
    `/api/documents/${documentId}/move`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder_id: folderId }),
    },
  );
  return data.document;
}

export async function renameDocument(
  documentId: number,
  filename: string,
): Promise<ApiDocument> {
  const data = await request<{ status: string; document: ApiDocument }>(
    `/api/documents/${documentId}/rename`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    },
  );
  return data.document;
}

export async function deleteDocument(documentId: number): Promise<void> {
  await request(`/api/documents/${documentId}`, { method: "DELETE" });
}

export async function searchDocuments(): Promise<ApiSearchDocument[]> {
  const data = await request<{ status: string; documents: ApiSearchDocument[] }>(
    "/api/documents/search",
  );
  return data.documents;
}
export async function renameFolder(folderId: number, name: string): Promise<ApiFolder> {
  const data = await request<{ status: string; folder: ApiFolder }>(
    `/api/folders/${folderId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    },
  );
  return data.folder;
}