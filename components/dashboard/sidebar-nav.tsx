"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { cn } from "@/lib/utils"
import {
  Users,
  Home,
  Book,
  FileText,
  Settings,
  Shield,
  BarChart,
  DollarSign,
  Megaphone,
  Calendar,
  UserCheck,
  ClipboardList,
  MessageSquare,
  UploadCloud,
  GraduationCap,
} from "lucide-react"

// Define navigation items with roles that can see them
const navItems = [
  { href: "/dashboard", icon: Home, label: "Overview", roles: ["school_admin", "teacher", "student", "parent"] },
  { href: "/dashboard/students", icon: Users, label: "Students", roles: ["school_admin", "teacher"] },
  { href: "/dashboard/teachers", icon: GraduationCap, label: "Teachers", roles: ["school_admin"] },
  { href: "/dashboard/parents", icon: UserCheck, label: "Parents", roles: ["school_admin", "teacher"] },
  { href: "/dashboard/staff", icon: Users, label: "Staff", roles: ["school_admin"] },
  { href: "/dashboard/classes", icon: ClipboardList, label: "Classes", roles: ["school_admin", "teacher"] },
  { href: "/dashboard/subjects", icon: Book, label: "Subjects", roles: ["school_admin", "teacher"] },
  { href: "/dashboard/attendance", icon: Calendar, label: "Attendance", roles: ["school_admin", "teacher"] },
  { href: "/dashboard/announcements", icon: Megaphone, label: "Announcements", roles: ["school_admin", "teacher", "student", "parent"] },
  { href: "/dashboard/messages", icon: MessageSquare, label: "Messages", roles: ["school_admin", "teacher", "student", "parent"] },
  { href: "/dashboard/billing", icon: DollarSign, label: "Billing", roles: ["school_admin", "parent"] },
  { href: "/dashboard/reports", icon: FileText, label: "Reports", roles: ["school_admin", "teacher"] },
  { href: "/dashboard/analytics", icon: BarChart, label: "Analytics", roles: ["school_admin"] },
  { href: "/dashboard/import", icon: UploadCloud, label: "Bulk Import", roles: ["school_admin"] },
  { href: "/dashboard/roles", icon: Shield, label: "Roles & Permissions", roles: ["school_admin"] },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", roles: ["school_admin"] },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { user } = useAuth() // Get the current user from your auth context

  // If there's no user or user role, don't render the nav
  if (!user?.role) {
    return null
  }

  return (
    <nav className="grid items-start gap-1 px-2 text-sm font-medium">
      {navItems.map((item) =>
        // Check if the user's role is included in the item's roles array
        item.roles.includes(user.role) ? (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === item.href && "bg-muted text-primary",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ) : null, // If the role doesn't match, render nothing
      )}
    </nav>
  )
}