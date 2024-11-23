"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import AdminNav from "@/components/AdminNav";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/");
    },
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>

          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar>
                <AvatarImage
                  src={session?.user?.image}
                  alt={session?.user?.name}
                />
                <AvatarFallback>
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2 text-sm">
                <p className="font-medium">{session?.user?.name}</p>
                <p className="text-muted-foreground">{session?.user?.email}</p>
              </div>
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 shrink-0">
          <AdminNav />
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 Face Recognition Attendance System - Admin Panel
        </div>
      </footer>
    </div>
  );
}
