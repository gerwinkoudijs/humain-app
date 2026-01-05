"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/hooks/use-current-user";

interface ProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ isOpen, onOpenChange }: ProfileDialogProps) {
  const { update } = useSession();
  const { data: user } = api.user.me.useQuery();
  const { refetchCurrentUser } = useCurrentUser();

  const [name, setName] = useState(user?.name ?? "");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const updateUser = api.user.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");

      onOpenChange(false);
      update();
      refetchCurrentUser();
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  const setPassword = api.auth.setPassword.useMutation({
    onSuccess: () => {
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      updateUser.mutate({ name });
    },
    onError: (error) => {
      toast.error(`Failed to update password: ${error.message}`);
    },
  });

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
    }
  }, [user]);

  const handleProfileSave = () => {
    if (newPassword) {
      handlePasswordChange();
      return;
    }

    updateUser.mutate({ name });
  };

  const handlePasswordChange = () => {
    if (!newPassword || !confirmPassword || setPassword.isPending) {
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPassword.mutate({
      currentPassword: currentPassword || undefined,
      newPassword,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Update your profile information and password.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email ?? ""}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newPassword && confirmPassword) {
                    handlePasswordChange();
                  }
                }}
              />
            </div>

            <Button
              onClick={handleProfileSave}
              disabled={updateUser.isPending}
              className="w-full"
            >
              {setPassword.isPending
                ? "Updating password..."
                : updateUser.isPending
                ? "Saving..."
                : "Save Profile"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
