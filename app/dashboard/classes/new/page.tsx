// src/app/dashboard/classes/new/page.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
// This is a NAMED import, using curly braces
import { ClassForm } from "@/components/academic/class-form"
import { useToast } from "@/components/ui/use-toast"
import type { Class } from "@/lib/types/academic"

export default function NewClassPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (classData: Partial<Class>) => {
    if (!user?.schoolId) {
      toast({
        title: "Error",
        description: "Could not find your school information. Please try again.",
        variant: "destructive",
      })
      throw new Error("School ID not found")
    }

    setIsLoading(true)
    try {
      const classToCreate = {
        ...classData,
        schoolId: user.schoolId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      }

      const docRef = await addDoc(collection(db, "classes"), classToCreate)
      console.log("Class created with ID:", docRef.id)

      toast({
        title: "Success!",
        description: `Class "${classData.name}" has been created successfully.`,
      })
      
      router.refresh(); // Refresh data on the classes page
      router.push("/dashboard/classes")
    } catch (error) {
      console.error("Error creating class:", error)
      toast({
        title: "Error",
        description: "Failed to create the class. Please try again.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Classes", href: "/dashboard/classes" },
          { title: "Add New Class" },
        ]}
      />

      <ClassForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  )
}