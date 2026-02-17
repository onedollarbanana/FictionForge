import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BordersClient } from "./borders-client";

export const dynamic = "force-dynamic";

export default async function BordersSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's profile to check equipped border
  const { data: profile } = await supabase
    .from("profiles")
    .select("equipped_border_id")
    .eq("id", user.id)
    .single();

  // Get all borders
  const { data: allBorders } = await supabase
    .from("profile_borders")
    .select("*")
    .order("sort_order", { ascending: true });

  // Get user's unlocked borders
  const { data: unlockedBorders } = await supabase
    .from("user_borders")
    .select("border_id, unlocked_at")
    .eq("user_id", user.id);

  // Map unlocked border IDs for quick lookup
  const unlockedBorderIds = new Set(unlockedBorders?.map(ub => ub.border_id) || []);

  // Transform borders to include unlock status
  // Default borders are always unlocked
  const borders = (allBorders || []).map(border => ({
    id: border.id,
    name: border.name,
    description: border.description,
    cssClass: border.css_class,
    unlockType: border.unlock_type,
    unlockValue: border.unlock_value,
    rarity: border.rarity,
    sortOrder: border.sort_order,
    isUnlocked: border.unlock_type === 'default' || unlockedBorderIds.has(border.id),
  }));

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Profile Borders</h2>
      <p className="text-muted-foreground mb-6">
        Customize your profile with decorative borders. Unlock new borders by reaching experience tiers or earning achievements.
      </p>
      <BordersClient 
        borders={borders} 
        equippedBorderId={profile?.equipped_border_id || null} 
      />
    </div>
  );
}
