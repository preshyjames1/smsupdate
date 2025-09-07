"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  School,
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronUp,
  UserCheck,
  Building,
  CreditCard,
  Shield,
  Upload,
} from "lucide-react"
import type { UserRole } from "@/lib/types"

const navigationGroups = [
  {
    title: "Overview",
    roles: ["school_admin", "teacher", "student", "parent", "sub_admin"],
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        roles: ["school_admin", "teacher", "student", "parent", "sub_admin"],
      },
    ],
  },
  {
    title: "User Management",
    roles: ["school_admin", "sub_admin"],
    items: [
      { title: "Students", url: "/dashboard/students", icon: GraduationCap, roles: ["school_admin", "sub_admin", "teacher"] },
      { title: "Teachers", url: "/dashboard/teachers", icon: UserCheck, roles: ["school_admin", "sub_admin"] },
      { title: "Parents", url: "/dashboard/parents", icon: Users, roles: ["school_admin", "sub_admin"] },
      { title: "Staff", url: "/dashboard/staff", icon: Building, roles: ["school_admin"] },
      { title: "Bulk Import", url: "/dashboard/import", icon: Upload, roles: ["school_admin"] },
    ],
  },
  {
    title: "Academic",
    roles: ["school_admin", "sub_admin", "teacher", "student"],
    items: [
      { title: "Classes", url: "/dashboard/classes", icon: BookOpen, roles: ["school_admin", "sub_admin", "teacher", "student"] },
      { title: "Subjects", url: "/dashboard/subjects", icon: FileText, roles: ["school_admin", "sub_admin", "teacher"] },
      { title: "Timetable", url: "/dashboard/timetable", icon: Calendar, roles: ["school_admin", "sub_admin", "teacher", "student"] },
      { title: "Attendance", url: "/dashboard/attendance", icon: ClipboardCheck, roles: ["school_admin", "sub_admin", "teacher", "student"] },
    ],
  },
  {
    title: "Communication",
    roles: ["school_admin", "teacher", "student", "parent", "sub_admin"],
    items: [
      { title: "Messages", url: "/dashboard/messages", icon: MessageSquare, roles: ["school_admin", "teacher", "student", "parent", "sub_admin"] },
      { title: "Announcements", url: "/dashboard/announcements", icon: Megaphone, roles: ["school_admin", "teacher", "student", "parent", "sub_admin"] },
    ],
  },
  {
    title: "Reports & Analytics",
    roles: ["school_admin", "sub_admin"],
    items: [
      { title: "Reports", url: "/dashboard/reports", icon: BarChart3, roles: ["school_admin", "sub_admin"] },
      { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3, roles: ["school_admin"] },
    ],
  },
];


export function SidebarNav() {
  const pathname = usePathname()
  const { user, schoolData, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }
  
  const userRole = user?.role as UserRole;
  if (!userRole) return null;

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <School className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <span className="font-bold text-sm">{schoolData?.name || "School Portal"}</span>
            <span className="text-xs text-muted-foreground">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigationGroups
          .filter(group => group.roles.includes(userRole))
          .map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items
                  .filter(item => item.roles.includes(userRole))
                  .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarSeparator />

        {userRole === 'school_admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/roles"} tooltip="Roles & Permissions">
                      <Link href="/dashboard/roles">
                        <Shield />
                        <span>Roles & Permissions</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"} tooltip="Settings">
                    <Link href="/dashboard/settings">
                      <Settings />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/billing"} tooltip="Billing">
                    <Link href="/dashboard/billing">
                      <CreditCard />
                      <span>Billing</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.profile?.avatar || "/placeholder-user.jpg"} alt={user?.profile?.firstName} />
                    <AvatarFallback className="rounded-lg">
                      {user?.profile?.firstName?.[0]}
                      {user?.profile?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.profile?.firstName} {user?.profile?.lastName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.profile?.avatar || "/placeholder-user.jpg"} alt={user?.profile?.firstName} />
                      <AvatarFallback className="rounded-lg">
                        {user?.profile?.firstName?.[0]}
                        {user?.profile?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.profile?.firstName} {user?.profile?.lastName}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <Users className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
