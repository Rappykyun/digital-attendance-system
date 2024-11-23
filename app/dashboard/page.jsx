"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/");
    }
    if (session?.user?.role === "admin") {
      redirect("/admin");
    }
  }, [session, status]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1>Welcome {session?.user?.name}</h1>
      <p>Email: {session?.user?.email}</p>
      {session?.user?.department && (
        <p>Department: {session?.user?.department}</p>
      )}
      {!session?.user?.faceData?.length && (
        <p className="text-yellow-600 mt-4">
          Face data not registered yet. Please contact an administrator.
        </p>
      )}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Sign Out
      </button>
    </div>
  );
}
