"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Mail, Check } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailValid, setEmailValid] = useState(false);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValid(validateEmail(value));
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-20 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                {/* <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                  <path d="M2 17L12 22L22 17" />
                  <path d="M2 12L12 17L22 12" />
                </svg> */}
              </div>
              <span className="text-xl font-semibold text-gray-900">
                YourStyle AI
              </span>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500">
              Welcome Back, Please enter Your details
            </p>
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
              //    onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors opacity-30 ${
                isSignUp
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Signup
            </button>
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

          {/* Continue Button */}
          <Button
            onClick={() => signIn("email", { email, callbackUrl: "/" })}
            disabled={!emailValid}
            className="w-full py-6 text-base font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed mb-6"
          >
            Continue
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
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
            {/* <button className="flex-1 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </button> */}
          </div>

          {/* Footer Text */}
          <p className="text-sm text-gray-500 text-center leading-relaxed">
            Join the millions of smart investors who trust us to manage their
            finances. Log in to access your personalized dashboard, track your
            portfolio performance, and make informed investment decisions.
          </p>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-50 items-center justify-center p-12 bg-[url(/images/yourstyle_ai_login_bg.png)] bg-cover "></div>
    </div>
  );
}
