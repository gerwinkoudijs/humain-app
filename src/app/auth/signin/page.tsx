"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="w-full max-w-xs">
        <div className="text-center text-2xl font-semibold mb-8">
          Ai Post Generator 3000
        </div>
        <div className="space-y-4">
          <Button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full"
          >
            Sign in with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full " />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                - Or continue with -
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            onClick={() => signIn("email", { email, callbackUrl: "/" })}
            className="w-full"
          >
            Sign in with Email
          </Button>
        </div>
      </div>
    </div>
  );
}
