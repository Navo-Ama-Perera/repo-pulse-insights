export type DocStatus = "Indexed" | "Processing" | "Failed";

export type Requirement = { id: string; title: string };

export type KbDocument = {
  id: string;
  name: string;
  folderId: string | null;
  status: DocStatus;
  requirementCount: number;
  uploadedAt: string;
  requirements: Requirement[];
};

export type KbFolder = { id: string; name: string };

export const INITIAL_FOLDERS: KbFolder[] = [
  { id: "f-ecom", name: "Ecommerce Platform" },
  { id: "f-leadxo", name: "LeadXO CRM" },
];

export const INITIAL_DOCUMENTS: KbDocument[] = [
  {
    id: "d1",
    name: "checkout-brd.docx",
    folderId: "f-ecom",
    status: "Indexed",
    requirementCount: 14,
    uploadedAt: "12 Jun 2026",
    requirements: [
      { id: "FR-11", title: "Guest Checkout Entry Point" },
      { id: "FR-12", title: "Human Handoff Notification" },
      { id: "FR-14", title: "Booking Engine" },
      { id: "NFR-03", title: "Checkout Latency Budget" },
    ],
  },
  {
    id: "d2",
    name: "payments-srs.pdf",
    folderId: "f-ecom",
    status: "Processing",
    requirementCount: 0,
    uploadedAt: "24 Jun 2026",
    requirements: [],
  },
  {
    id: "d3",
    name: "refund-policy-frd.xlsx",
    folderId: "f-ecom",
    status: "Indexed",
    requirementCount: 9,
    uploadedAt: "02 Jul 2026",
    requirements: [
      { id: "FR-21", title: "Refund Initiation Window" },
      { id: "FR-22", title: "Partial Refund Approval" },
      { id: "FR-25", title: "Refund SLA Escalation" },
    ],
  },
  {
    id: "d4",
    name: "lead-scoring-brd.docx",
    folderId: "f-leadxo",
    status: "Indexed",
    requirementCount: 11,
    uploadedAt: "18 May 2026",
    requirements: [
      { id: "FR-31", title: "Lead Score Recalculation" },
      { id: "FR-33", title: "Owner Reassignment Rules" },
    ],
  },
  {
    id: "d5",
    name: "crm-integration-srs.pdf",
    folderId: "f-leadxo",
    status: "Failed",
    requirementCount: 0,
    uploadedAt: "20 May 2026",
    requirements: [],
  },
  {
    id: "d6",
    name: "portfolio-governance-frd.docx",
    folderId: null,
    status: "Indexed",
    requirementCount: 6,
    uploadedAt: "05 Jul 2026",
    requirements: [
      { id: "FR-01", title: "Portfolio Intake Gate" },
      { id: "FR-04", title: "Change Board Sign-off" },
    ],
  },
];

export function docLabel(doc: KbDocument, folders: KbFolder[]) {
  const folder = folders.find((f) => f.id === doc.folderId);
  return folder ? `${folder.name}/${doc.name}` : doc.name;
}
