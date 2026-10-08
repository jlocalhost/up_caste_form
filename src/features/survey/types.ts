export type Booth = {
  id: string;
  assemblyId: string;
  number: string;
  name: string;
  voters: number;
};

export type Assembly = {
  id: string;
  name: string;
  boothCount: number;
};

export type District = {
  id: string;
  name: string;
  assemblies: Assembly[];
};

/** Master data shipped with the page. Booths are fetched per assembly (there are ~1.6 lakh). */
export type SurveyConfig = {
  districts: District[];
  castes: string[];
};

export type CasteRow = {
  id: string;
  caste: string;
  otherName: string;
  count: string;
};

/** Everything the user types — the single source of truth for the form. */
export type SurveyDraft = {
  districtId: string;
  assemblyId: string;
  /** Snapshot of the chosen booth so a restored draft can render without refetching. */
  booth: Booth | null;
  rows: CasteRow[];
  comment: string;
};

export type ToastTone = "success" | "info";
export type Toast = { message: string; tone: ToastTone };
