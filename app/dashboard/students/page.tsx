"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { UserTable } from "@/components/users/user-table"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { User } from "@/lib/types"

export default function StudentsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [students, setStudents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.schoolId) return

    const fetchStudents = async () => {
      try {
        setLoading(true)
        const q = query(
          collection(db, "users"),
          where("schoolId", "==", user.schoolId),
          where("role", "==", "student")
        )
        const querySnapshot = await getDocs(q)
        const studentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[]
        setStudents(studentsData)
      } catch (error) {
        console.error("Error fetching students:", error)
        toast({
          title: "Error",
          description: "Failed to fetch students. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [user?.schoolId, toast])

  const handleEdit = (student: User) => {
    router.push(`/dashboard/students/${student.id}/edit`)
  }

  const handleDelete = async (student: User) => {
    try {
      // Instead of deleting, we deactivate the user for data integrity
      const userDocRef = doc(db, "users", student.id)
      await updateDoc(userDocRef, { isActive: false })
      setStudents(students.map(s => s.id === student.id ? { ...s, isActive: false } : s))
      toast({
        title: "Success",
        description: `${student.profile.firstName} ${student.profile.lastName} has been deactivated.`,
      })
    } catch (error) {
      console.error("Error deactivating student:", error)
      toast({
        title: "Error",
        description: "Failed to deactivate student. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleView = (student: User) => {
    router.push(`/dashboard/students/${student.id}`)
  }

  if (loading) {
    return <div>Loading students...</div> // Replace with a proper skeleton loader if desired
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader
        title="Students"
        description="Manage all student profiles and information."
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Students" }]}
      >
        <Link href="/dashboard/students/new">
          <Button>Add New Student</Button>
        </Link>
      </DashboardHeader>

      <UserTable
        users={students}
        userType="students"
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />
    </div>
  )
}
