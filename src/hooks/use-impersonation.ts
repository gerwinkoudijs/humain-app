"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function useImpersonation() {
  const router = useRouter();
  const [isImpersonating, setIsImpersonating] = useState(false);

  const startImpersonation = async (userId: string, userName: string) => {
    try {
      // Step 1: Create impersonation session
      const response = await fetch("/api/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start impersonation");
      }

      // Step 2: Switch to the new session token via server-side cookie setting
      const switchResponse = await fetch("/api/impersonate/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: data.sessionToken }),
      });

      if (!switchResponse.ok) {
        throw new Error("Failed to switch session");
      }

      setIsImpersonating(true);
      toast.success(`Nu ingelogd als ${userName}`);

      // Hard reload to refresh the session
      window.location.href = "/";
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Kon niet inloggen als gebruiker"
      );
    }
  };

  const stopImpersonation = async () => {
    try {
      // Step 1: Get original session token
      const response = await fetch("/api/impersonate", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to stop impersonation");
      }

      // Step 2: Switch back to original session
      const switchResponse = await fetch("/api/impersonate/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: data.sessionToken }),
      });

      if (!switchResponse.ok) {
        throw new Error("Failed to restore session");
      }

      setIsImpersonating(false);
      toast.success("Terug naar admin account");

      // Hard reload to refresh the session
      window.location.href = "/admin/dashboard";
    } catch (error) {
      toast.error("Kon impersonatie niet stoppen");
    }
  };

  return {
    startImpersonation,
    stopImpersonation,
    isImpersonating,
  };
}
