"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { UserForm } from "@/components/users/user-form"
import type { User } from "@/lib/types"

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*"
  let password = ""
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export default function NewStudentPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (userData: Partial<User>) => {
    if (!user?.schoolId) {
      throw new Error("School ID not found")
    }

    setIsLoading(true)
    try {
      const userId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const tempPassword = generateTempPassword()

      const userDoc: Partial<User> = {
        ...userData,
        schoolId: user.schoolId,
        role: "student",
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        authStatus: "pending",
        tempPasswordSent: false,
        tempPassword: tempPassword,
      }

      await setDoc(doc(db, "users", userId), userDoc)

      console.log("[v0] Student created successfully:", userId)
      console.log("[v0] Temporary password generated:", tempPassword)
      console.log("[v0] Firebase functions will create auth account and send temp password via email")

      router.push("/dashboard/students")
    } catch (error: any) {
      console.error("Error creating student:", error)
      throw new Error("Failed to create student. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Students", href: "/dashboard/students" },
          { title: "New Student" },
        ]}
      />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Student</h1>
          <p className="text-muted-foreground">Create a new student account</p>
        </div>

        <UserForm userType="students" onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  )
}