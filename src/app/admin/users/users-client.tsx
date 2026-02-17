"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Shield, AlertTriangle, Ban, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserWithModeration {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  moderation: {
    action: string;
    reason: string;
    expires_at: string | null;
  } | null;
}

interface UsersClientProps {
  users: UserWithModeration[];
}

type ModerationAction = "warning" | "suspended" | "banned";

const SUSPENSION_DURATIONS = [
  { value: "1", label: "1 day" },
  { value: "3", label: "3 days" },
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "permanent", label: "Permanent" },
];

export function UsersClient({ users }: UsersClientProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "suspended" | "banned" | "admin">("all");
  const [selectedUser, setSelectedUser] = useState<UserWithModeration | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [action, setAction] = useState<ModerationAction>("warning");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("7");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  const filteredUsers = users.filter((user) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !user.username.toLowerCase().includes(searchLower) &&
        !(user.display_name?.toLowerCase().includes(searchLower))
      ) {
        return false;
      }
    }

    if (filter === "suspended" && user.moderation?.action !== "suspended") return false;
    if (filter === "banned" && user.moderation?.action !== "banned") return false;
    if (filter === "admin" && user.role !== "admin" && user.role !== "moderator") return false;

    return true;
  });

  const openActionDialog = (user: UserWithModeration) => {
    setSelectedUser(user);
    setAction("warning");
    setReason("");
    setDuration("7");
    setActionDialogOpen(true);
  };

  const handleModerationAction = async () => {
    if (!selectedUser || !reason.trim()) return;

    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let expiresAt: string | null = null;
      if (action === "suspended" && duration !== "permanent") {
        const days = parseInt(duration);
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + days);
        expiresAt = expiry.toISOString();
      }

      const { error } = await supabase.from("user_moderation").insert({
        user_id: selectedUser.id,
        moderator_id: user.id,
        action,
        reason: reason.trim(),
        expires_at: expiresAt,
      });

      if (!error) {
        setActionDialogOpen(false);
        setSelectedUser(null);
        router.refresh();
      }
    });
  };

  const handleLiftModeration = async (userId: string) => {
    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("user_moderation")
        .update({ expires_at: new Date().toISOString() })
        .eq("user_id", userId)
        .or("expires_at.is.null,expires_at.gt.now()");

      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
            <SelectItem value="admin">Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No users match your search</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <Card key={user.id} className={cn(user.moderation && "border-red-500/50")}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">@{user.username}</p>
                        {user.role === "admin" && (
                          <Badge variant="default" className="bg-purple-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {user.role === "moderator" && (
                          <Badge variant="secondary">
                            <Shield className="h-3 w-3 mr-1" />
                            Mod
                          </Badge>
                        )}
                        {user.moderation?.action === "suspended" && (
                          <Badge variant="destructive">
                            <Clock className="h-3 w-3 mr-1" />
                            Suspended
                          </Badge>
                        )}
                        {user.moderation?.action === "banned" && (
                          <Badge variant="destructive">
                            <Ban className="h-3 w-3 mr-1" />
                            Banned
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {user.display_name || "No display name"} • Joined{" "}
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                      {user.moderation && (
                        <p className="text-xs text-red-500 mt-1">
                          Reason: {user.moderation.reason}
                          {user.moderation.expires_at && (
                            <> • Expires: {new Date(user.moderation.expires_at).toLocaleDateString()}</>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/profile/${user.username}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>

                    {user.moderation ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLiftModeration(user.id)}
                        disabled={isPending}
                      >
                        Lift Restriction
                      </Button>
                    ) : (
                      user.role === "user" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActionDialog(user)}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Moderate
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Moderate User: @{selectedUser?.username}</DialogTitle>
            <DialogDescription>
              Take moderation action against this user
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select value={action} onValueChange={(v) => setAction(v as ModerationAction)}>
                <SelectTrigger id="action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="suspended">Suspend</SelectItem>
                  <SelectItem value="banned">Ban</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {action === "suspended" && (
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUSPENSION_DURATIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this action is being taken..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleModerationAction}
              disabled={isPending || !reason.trim()}
              variant={action === "banned" ? "destructive" : "default"}
            >
              {isPending ? "Processing..." : "Confirm Action"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
