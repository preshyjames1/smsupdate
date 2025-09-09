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

export default function NewTeacherPage() {
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
      // For now, this is sufficient for most cases.
      const userId = `teacher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const tempPassword = generateTempPassword()

      const userDoc: Partial<User> = {
        ...userData,
        schoolId: user.schoolId,
        role: "teacher",
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        authStatus: "pending",
        tempPasswordSent: false,
        tempPassword: tempPassword,
      }

      await setDoc(doc(db, "users", userId), userDoc)

      console.log("[v0] Teacher created successfully:", userId)
      console.log("[v0] Temporary password generated:", tempPassword)
      console.log("[v0] Firebase functions will create auth account and send temp password via email")

      router.push("/dashboard/teachers")
    } catch (error: any) {
      console.error("Error creating teacher:", error)
      throw new Error("Failed to create teacher. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Teachers", href: "/dashboard/teachers" },
          { title: "New Teacher" },
        ]}
      />

      <div className="space-y-6">
        <UserForm userType="teachers" onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  )
}
