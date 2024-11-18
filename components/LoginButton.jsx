"use client";
import { signIn } from "next-auth/react";

export default function LoginButton() {
  const handleSignIn = async () => {
    try {
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: true,
      });
      
      if (result?.error) {
        console.error("Sign in error:", result.error);
      }
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
    >
      Sign in with Google
    </button>
  );
}
