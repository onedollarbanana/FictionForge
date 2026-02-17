import { createClient } from "@/lib/supabase/server";
import { UsersClient } from "./users-client";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const supabase = await createClient();

  // Fetch users with their moderation history
  const { data: users } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      display_name,
      avatar_url,
      role,
      created_at
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  // Fetch active moderation actions
  const { data: moderationActions } = await supabase
    .from("user_moderation")
    .select("*")
    .or("expires_at.is.null,expires_at.gt.now()")
    .order("created_at", { ascending: false });

  // Create a map of user_id to active actions
  const activeActions = new Map<string, { action: string; reason: string; expires_at: string | null }>();
  moderationActions?.forEach((action) => {
    if (!activeActions.has(action.user_id)) {
      activeActions.set(action.user_id, {
        action: action.action,
        reason: action.reason,
        expires_at: action.expires_at,
      });
    }
  });

  // Merge moderation info into users
  const usersWithModeration = users?.map((user) => ({
    ...user,
    moderation: activeActions.get(user.id) || null,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">View and moderate users</p>
      </div>

      <UsersClient users={usersWithModeration} />
    </div>
  );
}
