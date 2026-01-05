"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Mail, Check, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValid(validateEmail(value));
    setError("");
  };

  const handlePasswordLogin = async () => {
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else if (result?.ok) {
      window.location.href = "/";
    }
  };

  const handleMagicLinkLogin = () => {
    signIn("email", { email, callbackUrl: "/" });
  };

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

          {/* Tab Buttons */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                !isSignUp
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors opacity-30 ${
                isSignUp
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Signup
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="mb-4">
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

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Lock size={20} />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && password) {
                    handlePasswordLogin();
                  }
                }}
                className="pl-12 pr-12 py-6 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="mt-2 text-right">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary-dark hover:text-primary"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Login Button */}
          {emailValid ? (
            <Button
              onClick={handlePasswordLogin}
              disabled={!password || isLoading}
              className="w-full py-6 text-base font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed mb-3"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          ) : (
            <Button
              disabled
              className="w-full py-6 text-base font-medium bg-gray-300 cursor-not-allowed mb-3"
            >
              Sign In
            </Button>
          )}

          {/* Alternative login option */}
          {emailValid && (
            <button
              onClick={handleMagicLinkLogin}
              className="w-full text-sm text-gray-500 hover:text-gray-700 mb-6"
            >
              Or sign in with magic link instead
            </button>
          )}

          {/* Divider */}
          <div className="relative mb-6 mt-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">
                Or Continue With
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="flex-1 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>
          </div>

          {/* Footer Text */}
          <p className="text-sm text-gray-500 text-center leading-relaxed">
            Generative AI Social Posts powered by AI Pal / De Indruk
          </p>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-linear-to-br from-blue-100 via-blue-50 to-cyan-50 items-center justify-center p-12 bg-[url(/images/yourstyle_ai_login_bg.png)] bg-cover "></div>
    </div>
  );
}
