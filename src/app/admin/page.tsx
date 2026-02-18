import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning, AlertTriangle, Users, BookOpen, Eye, EyeOff, Award } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch stats in parallel
  const [
    pendingReportsResult,
    pendingDmcaResult,
    hiddenStoriesResult,
    hiddenCommentsResult,
    activeUsersResult,
    suspendedUsersResult,
    featuredCountResult,
  ] = await Promise.all([
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("dmca_claims").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("stories").select("id", { count: "exact", head: true }).eq("is_hidden", true),
    supabase.from("comments").select("id", { count: "exact", head: true }).eq("is_hidden", true),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("user_moderation").select("id", { count: "exact", head: true })
      .in("action", ["suspended", "banned"])
      .or("expires_at.is.null,expires_at.gt.now()"),
    supabase.from("featured_stories").select("id", { count: "exact", head: true }),
  ]);

  const pendingReports = pendingReportsResult.count ?? 0;
  const pendingDmca = pendingDmcaResult.count ?? 0;
  const hiddenStories = hiddenStoriesResult.count ?? 0;
  const hiddenComments = hiddenCommentsResult.count ?? 0;
  const totalUsers = activeUsersResult.count ?? 0;
  const suspendedUsers = suspendedUsersResult.count ?? 0;
  const featuredCount = featuredCountResult.count ?? 0;

  // Fetch recent reports
  const { data: recentReports } = await supabase
    .from("reports")
    .select(`
      id,
      content_type,
      reason,
      status,
      created_at,
      reporter:profiles!reporter_id(username)
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of moderation activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/reports">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <FileWarning className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReports}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/dmca">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">DMCA Claims</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingDmca}</div>
              <p className="text-xs text-muted-foreground">Pending review</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {suspendedUsers > 0 ? `${suspendedUsers} suspended/banned` : "All in good standing"}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hidden Stories</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hiddenStories}</div>
            <p className="text-xs text-muted-foreground">Removed from public view</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hidden Comments</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hiddenComments}</div>
            <p className="text-xs text-muted-foreground">Removed from public view</p>
          </CardContent>
        </Card>

        <Link href="/admin/featured">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Picks</CardTitle>
              <Award className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{featuredCount}</div>
              <p className="text-xs text-muted-foreground">Featured stories</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Latest user-submitted reports</CardDescription>
        </CardHeader>
        <CardContent>
          {recentReports && recentReports.length > 0 ? (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        report.status === "pending"
                          ? "bg-yellow-500"
                          : report.status === "resolved"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {report.content_type} - {report.reason.replace("_", " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Reported by @{(report.reporter as unknown as { username: string })?.username || "unknown"} •{" "}
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full capitalize ${
                      report.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : report.status === "resolved"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
              ))}
              <Link
                href="/admin/reports"
                className="text-sm text-primary hover:underline block text-center pt-2"
              >
                View all reports →
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No reports yet. That&apos;s a good sign! 🎉
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
