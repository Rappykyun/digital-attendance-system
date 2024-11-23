import { Users, UserPlus, Calendar, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Students",
    href: "/admin/students",
    icon: Users,
  },
  {
    title: "Register",
    href: "/admin/register",
    icon: UserPlus,
  },
  {
    title: "Attendance",
    href: "/admin/attendance",
    icon: Calendar,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center px-4 py-2 text-sm font-medium rounded-md",
            pathname === item.href
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <item.icon className="mr-3 h-5 w-5" />
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
