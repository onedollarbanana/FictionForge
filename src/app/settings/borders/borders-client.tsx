"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Lock, User } from "lucide-react";
import { ProfileBorder, getRarityColor, type ProfileBorderData } from "@/components/profile/profile-border";
import { cn } from "@/lib/utils";

interface BorderWithUnlock extends ProfileBorderData {
  isUnlocked: boolean;
}

interface BordersClientProps {
  borders: BorderWithUnlock[];
  equippedBorderId: string | null;
}

export function BordersClient({ borders, equippedBorderId }: BordersClientProps) {
  const [equipped, setEquipped] = useState(equippedBorderId);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  const handleEquip = async (borderId: string | null) => {
    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ equipped_border_id: borderId })
        .eq("id", user.id);

      if (!error) {
        setEquipped(borderId);
        router.refresh();
      }
    });
  };

  const equippedBorder = borders.find(b => b.id === equipped) || null;

  return (
    <div className="space-y-8">
      {/* Current Border Preview */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Current Border</h3>
          <div className="flex items-center gap-6">
            <ProfileBorder border={equippedBorder} size="xl">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <User className="h-12 w-12 text-muted-foreground" />
              </div>
            </ProfileBorder>
            <div>
              <p className="font-medium">{equippedBorder?.name || "No Border"}</p>
              {equippedBorder && (
                <>
                  <p className="text-sm text-muted-foreground">{equippedBorder.description}</p>
                  <Badge variant="outline" className={cn("mt-2 capitalize", getRarityColor(equippedBorder.rarity))}>
                    {equippedBorder.rarity}
                  </Badge>
                </>
              )}
              {equipped && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => handleEquip(null)}
                  disabled={isPending}
                >
                  Remove Border
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unlocked Borders */}
      <div>
        <h3 className="text-lg font-medium mb-4">Your Borders</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {borders.filter(b => b.isUnlocked).map((border) => (
            <BorderCard
              key={border.id}
              border={border}
              isEquipped={border.id === equipped}
              isLocked={false}
              onEquip={() => handleEquip(border.id)}
              isPending={isPending}
            />
          ))}
        </div>
      </div>

      {/* Locked Borders */}
      {borders.some(b => !b.isUnlocked) && (
        <div>
          <h3 className="text-lg font-medium mb-4">Locked Borders</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {borders.filter(b => !b.isUnlocked).map((border) => (
              <BorderCard
                key={border.id}
                border={border}
                isEquipped={false}
                isLocked={true}
                isPending={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface BorderCardProps {
  border: BorderWithUnlock;
  isEquipped: boolean;
  isLocked: boolean;
  onEquip?: () => void;
  isPending: boolean;
}

function BorderCard({ border, isEquipped, isLocked, onEquip, isPending }: BorderCardProps) {
  return (
    <Card className={cn(
      "relative transition-all",
      isEquipped && "ring-2 ring-primary",
      isLocked && "opacity-60"
    )}>
      <CardContent className="pt-6 flex flex-col items-center text-center">
        {/* Border Preview */}
        <ProfileBorder border={border} size="lg">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            {isLocked ? (
              <Lock className="h-8 w-8 text-muted-foreground" />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
        </ProfileBorder>

        {/* Border Info */}
        <p className="font-medium mt-3 text-sm">{border.name}</p>
        <Badge variant="outline" className={cn("mt-1 text-xs capitalize", getRarityColor(border.rarity))}>
          {border.rarity}
        </Badge>
        
        {isLocked && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {border.description}
          </p>
        )}

        {/* Action Button */}
        {!isLocked && (
          <Button
            variant={isEquipped ? "secondary" : "outline"}
            size="sm"
            className="mt-3 w-full"
            onClick={onEquip}
            disabled={isPending || isEquipped}
          >
            {isEquipped ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Equipped
              </>
            ) : (
              "Equip"
            )}
          </Button>
        )}

        {/* Equipped indicator */}
        {isEquipped && (
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
