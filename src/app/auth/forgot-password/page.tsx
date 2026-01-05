"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Mail, Check, ArrowLeft } from "lucide-react";
import { api } from "@/trpc/react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const requestReset = api.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
    },
  });

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValid(validateEmail(value));
  };

  const handleSubmit = () => {
    if (emailValid) {
      requestReset.mutate({ email });
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-20 bg-white">
          <div className="w-full max-w-md mx-auto">
            {/* Logo */}
            <div className="mb-12">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded flex items-center justify-center"></div>
                <span className="text-xl font-semibold text-gray-900">
                  YourStyle AI
                </span>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={32} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Check Your Email
              </h1>
              <p className="text-gray-500 mb-8">
                If an account exists for <strong>{email}</strong>, we&apos;ve sent a
                temporary password. Check your inbox and use it to sign in.
              </p>
              <p className="text-sm text-gray-400 mb-8">
                The temporary password will expire in 1 hour.
              </p>
              <Link href="/auth/signin">
                <Button className="w-full py-6 text-base font-medium bg-blue-600 hover:bg-blue-700">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-50 items-center justify-center p-12 bg-[url(/images/yourstyle_ai_login_bg.png)] bg-cover"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-20 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center"></div>
              <span className="text-xl font-semibold text-gray-900">
                YourStyle AI
              </span>
            </div>
          </div>

          {/* Back Link */}
          <Link
            href="/auth/signin"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-8"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Sign In
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-500">
              Enter your email address and we&apos;ll send you a temporary password.
            </p>
          </div>

          {/* Email Input */}
          <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Mail size={20} />
              </div>
              <Input
                type="email"
                placeholder="youremail@example.com"
                value={email}
                onChange={handleEmailChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && emailValid) {
                    handleSubmit();
                  }
                }}
                className="pl-12 pr-12 py-6 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              {emailValid && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check size={16} className="text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!emailValid || requestReset.isPending}
            className="w-full py-6 text-base font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {requestReset.isPending ? "Sending..." : "Send Temporary Password"}
          </Button>

          {/* Error Message */}
          {requestReset.isError && (
            <p className="mt-4 text-sm text-red-600 text-center">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-50 items-center justify-center p-12 bg-[url(/images/yourstyle_ai_login_bg.png)] bg-cover"></div>
    </div>
  );
}
