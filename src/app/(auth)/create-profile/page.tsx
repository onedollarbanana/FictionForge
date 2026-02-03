"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function CreateProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );

  const validateUsername = (value: string) => {
    if (value.length < 3) return "Username must be at least 3 characters";
    if (value.length > 20) return "Username must be 20 characters or less";
    if (!/^[a-z0-9_]+$/.test(value))
      return "Only lowercase letters, numbers, and underscores";
    return null;
  };

  const checkUsername = useCallback(async (value: string) => {
    const validationError = validateUsername(value);
    if (validationError) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", value)
      .single();

    setUsernameAvailable(!data);
    setCheckingUsername(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        checkUsername(username);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!usernameAvailable) {
      setError("Username is not available");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      username: username.toLowerCase(),
      display_name: displayName || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/browse");
    router.refresh();
  };

  const usernameError = username ? validateUsername(username) : null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Complete your profile</CardTitle>
        <CardDescription>
          Choose a username for your FictionForge account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                placeholder="your_username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/\s/g, "_"))
                }
                required
                className="pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checkingUsername && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {!checkingUsername &&
                  usernameAvailable === true &&
                  !usernameError && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                {!checkingUsername &&
                  usernameAvailable === false &&
                  !usernameError && (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
              </div>
            </div>
            {usernameError && (
              <p className="text-sm text-destructive">{usernameError}</p>
            )}
            {!usernameError && usernameAvailable === false && (
              <p className="text-sm text-destructive">Username is taken</p>
            )}
            {!usernameError && usernameAvailable === true && (
              <p className="text-sm text-green-500">Username is available!</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name (optional)</Label>
            <Input
              id="displayName"
              placeholder="How you want to be known"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
            />
            <p className="text-sm text-muted-foreground">
              This is shown on your profile. Leave blank to use your username.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !usernameAvailable || !!usernameError}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Setup
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
