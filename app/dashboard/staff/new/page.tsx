"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { UserForm } from "@/components/users/user-form"
import type { User } from "@/lib/types"
import { generateTempPassword } from "@/lib/utils" // <-- IMPORTED FROM UTILS

export default function NewStaffPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (userData: Partial<User>) => {
    if (!user?.schoolId) {
      throw new Error("School ID not found")
    }

    setIsLoading(true)
    try {
      // RECOMMENDATION: Use a more robust unique ID generation method if high concurrency is expected.
      const userId = `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const tempPassword = generateTempPassword()

      const userDoc: Partial<User> = {
        ...userData,
        schoolId: user.schoolId,
        // The role will be set within the UserForm component, defaulting to "receptionist" for staff
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        authStatus: "pending",
        tempPasswordSent: false,
        tempPassword: tempPassword,
      }

      await setDoc(doc(db, "users", userId), userDoc)

      console.log("[v0] Staff member created successfully:", userId)
      console.log("[v0] Temporary password generated:", tempPassword)
      console.log("[v0] Firebase functions will create auth account and send temp password via email")

      router.push("/dashboard/staff")
    } catch (error: any) {
      console.error("Error creating staff member:", error)
      throw new Error("Failed to create staff member. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Staff", href: "/dashboard/staff" },
          { title: "New Staff Member" },
        ]}
      />

      <div className="space-y-6">
        <UserForm userType="staff" onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  )
}
