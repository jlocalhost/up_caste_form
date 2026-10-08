import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export type AdminOverview = {
  totals: {
    districts: number;
    coveredDistricts: number;
    assemblies: number;
    coveredAssemblies: number;
    booths: number;
    listedVoters: number;
    surveyedBooths: number;
    surveyedVoters: number;
    enteredCount: number;
    /** Times a booth was submitted again after its first submission. */
    resubmissions: number;
    lastSubmissionAt: string | null;
  };
  districts: { name: string; booths: number; surveyedBooths: number; listedVoters: number }[];
  castes: { caste: string; count: number; booths: number }[];
  recent: {
    district: string;
    assembly: string;
    boothNumber: string;
    boothName: string;
    totalVoters: number;
    entered: number;
    updatedAt: string;
  }[];
};

/** Live numbers for the dashboard — intentionally uncached so admins see fresh submissions. */
export async function getAdminOverview(): Promise<AdminOverview> {
  const { data, error } = await supabaseAdmin().rpc("admin_overview");
  if (error) throw error;
  return data as unknown as AdminOverview;
}
