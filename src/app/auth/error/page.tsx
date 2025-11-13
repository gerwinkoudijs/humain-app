"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: { [key: string]: string } = {
    AccessDenied:
      "This account is not recognized. Please contact us to get access.",
    Signin: "Try signing in with a different account.",
    OAuthSignin: "Try signing in with a different account.",
    OAuthCallback: "Try signing in with a different account.",
    OAuthCreateAccount: "Try signing in with a different account.",
    EmailCreateAccount: "Try signing in with a different account.",
    Callback: "Try signing in with a different account.",
    OAuthAccountNotLinked:
      "To confirm your identity, sign in with the same account you used originally.",
    EmailSignin: "Check your email address.",
    CredentialsSignin:
      "Sign in failed. Check the details you provided are correct.",
    default: "Unable to sign in.",
  };

  const errorMessage = error && (errorMessages[error] ?? errorMessages.default);

  return (
    <div className="w-full max-w-xs text-center">
      <h1 className="text-2xl font-bold">Sign in failed</h1>
      <p className="mt-2 text-destructive">{errorMessage}</p>
    </div>
  );
}

export default function AuthError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Suspense fallback={<div>Loading error message...</div>}>
        <ErrorMessage />
      </Suspense>
    </div>
  );
}
