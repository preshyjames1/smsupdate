"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { UserTable } from "@/components/users/user-table"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { User } from "@/lib/types"

export default function TeachersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [teachers, setTeachers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.schoolId) return

    const fetchTeachers = async () => {
      try {
        setLoading(true)
        const q = query(
          collection(db, "users"),
          where("schoolId", "==", user.schoolId),
          where("role", "==", "teacher")
        )
        const querySnapshot = await getDocs(q)
        const teachersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[]
        setTeachers(teachersData)
      } catch (error) {
        console.error("Error fetching teachers:", error)
        toast({
          title: "Error",
          description: "Failed to fetch teachers. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTeachers()
  }, [user?.schoolId, toast])

  const handleEdit = (teacher: User) => {
    // Navigate to an edit page if it exists, otherwise log it
    console.log("Editing teacher:", teacher)
    // router.push(`/dashboard/teachers/${teacher.id}/edit`);
  }

  const handleDelete = async (teacher: User) => {
    try {
      // Best practice: Deactivate the user instead of deleting to maintain data integrity
      const userDocRef = doc(db, "users", teacher.id)
      await updateDoc(userDocRef, { isActive: false })

      // Update local state to reflect the change immediately
      setTeachers(teachers.map(t => t.id === teacher.id ? { ...t, isActive: false } : t))
      
      toast({
        title: "Success",
        description: `${teacher.profile.firstName} ${teacher.profile.lastName} has been deactivated.`,
      })
    } catch (error) {
      console.error("Error deactivating teacher:", error)
      toast({
        title: "Error",
        description: "Failed to deactivate teacher. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleView = (teacher: User) => {
    // Navigate to a profile/view page if it exists
    console.log("Viewing teacher:", teacher)
    // router.push(`/dashboard/teachers/${teacher.id}`);
  }

  if (loading) {
    return <div>Loading teachers...</div> // You can replace this with a skeleton loader
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader
        title="Teachers"
        description="Manage all teacher profiles and information."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Teachers" }]}
      >
        <Link href="/dashboard/teachers/new">
          <Button>Add New Teacher</Button>
        </Link>
      </DashboardHeader>

      <UserTable
        users={teachers}
        userType="teachers"
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
