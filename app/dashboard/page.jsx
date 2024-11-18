"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { signOut } from "next-auth/react";

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/");
    },
  });

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session?.user?.role !== "student") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1>Welcome Student: {session?.user?.name}</h1>
      <p>Role: {session?.user?.role}</p>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Sign Out
      </button>
    </div>
  );
}
