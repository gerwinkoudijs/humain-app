"use client";

import { api } from "@/trpc/react";
import { LoaderCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

export const Profile = () => {
  const { data: session, update } = useSession();
  const { data: user, isLoading } = api.user.me.useQuery();
  const { mutate: updateUser, isPending } = api.user.update.useMutation({
    onSuccess: () => {
      update();
    },
  });

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col grow">
        <div className="flex flex-col items-center justify-center my-[100px]">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-end justify-center font-bold tracking-tight">
              <LoaderCircle size={64} className="animate-spin opacity-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col grow p-8">
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} disabled />
        </div>
        <Button onClick={() => updateUser({ name })} disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
};
