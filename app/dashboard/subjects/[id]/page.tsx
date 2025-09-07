"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PermissionGuard } from "@/components/permissions/permission-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Edit, BookOpen, Users } from "lucide-react"
import Link from "next/link"

interface Subject {
  id: string
  schoolId: string
  name: string
  code: string
  description?: string
  department: string
  credits: number
  teacherIds: string[]
  classIds: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export default function SubjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchSubject = async () => {
      if (!user?.schoolId || !params.id) return

      try {
        const subjectDoc = await getDoc(doc(db, "subjects", params.id))
        if (subjectDoc.exists()) {
          const data = subjectDoc.data()
          if (data.schoolId === user.schoolId) {
            setSubject({
              id: subjectDoc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            } as Subject)
          } else {
            setError("Subject not found or access denied")
          }
        } else {
          setError("Subject not found")
        }
      } catch (error) {
        console.error("Error fetching subject:", error)
        setError("Failed to load subject")
      } finally {
        setLoading(false)
      }
    }

    fetchSubject()
  }, [user?.schoolId, params.id])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DashboardHeader
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Subjects", href: "/dashboard/subjects" },
            { title: "Loading..." },
          ]}
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading subject...</div>
        </div>
      </div>
    )
  }

  if (error || !subject) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DashboardHeader
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Subjects", href: "/dashboard/subjects" },
            { title: "Error" },
          ]}
        />
        <Alert variant="destructive">
          <AlertDescription>{error || "Subject not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <PermissionGuard module="subjects" action="view">
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DashboardHeader
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Subjects", href: "/dashboard/subjects" },
            { title: subject.name },
          ]}
        />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/subjects">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{subject.name}</h1>
                <p className="text-muted-foreground">{subject.code}</p>
              </div>
            </div>
            <PermissionGuard module="subjects" action="edit">
              <Link href={`/dashboard/subjects/${subject.id}/edit`}>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Subject
                </Button>
              </Link>
            </PermissionGuard>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subject Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <Badge variant="secondary">{subject.department}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Credits</span>
                  <span>{subject.credits}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={subject.isActive ? "default" : "secondary"}>
                    {subject.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {subject.description && (
                  <div className="space-y-2">
                    <span className="text-muted-foreground">Description</span>
                    <p className="text-sm">{subject.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assignment Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Assigned Teachers</span>
                  </div>
                  <span>{subject.teacherIds.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Assigned Classes</span>
                  </div>
                  <span>{subject.classIds.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PermissionGuard>
  )
}
