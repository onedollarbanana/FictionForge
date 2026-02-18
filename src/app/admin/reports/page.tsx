import { createClient } from "@/lib/supabase/server";
import { ReportsClient } from "./reports-client";

export const dynamic = "force-dynamic";

interface ReportRow {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  reporter: { id: string; username: string; avatar_url: string | null } | null;
  resolver: { username: string } | null;
}

export default async function ReportsPage() {
  const supabase = await createClient();

  // Fetch reports with reporter info
  const { data: reports, error } = await supabase
    .from("reports")
    .select(`
      id,
      content_type,
      content_id,
      reason,
      details,
      status,
      created_at,
      resolved_at,
      resolution_notes,
      reporter:profiles!reporter_id(id, username, avatar_url),
      resolver:profiles!resolved_by(username)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching reports:", error);
  }

  // Transform data to match expected types (Supabase returns single objects for !inner joins)
  const transformedReports: ReportRow[] = (reports || []).map((r) => ({
    ...r,
    reporter: Array.isArray(r.reporter) ? r.reporter[0] || null : r.reporter,
    resolver: Array.isArray(r.resolver) ? r.resolver[0] || null : r.resolver,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports Queue</h2>
        <p className="text-muted-foreground">Review and resolve user-submitted reports</p>
      </div>

      <ReportsClient reports={transformedReports} />
    </div>
  );
}
