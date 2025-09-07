"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/context"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PermissionGuard } from "@/components/permissions/permission-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewSubjectPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    department: "",
    credits: 1,
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.schoolId) {
      setError("School ID not found")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const subjectData = {
        ...formData,
        schoolId: user.schoolId,
        teacherIds: [],
        classIds: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await addDoc(collection(db, "subjects"), subjectData)
      router.push("/dashboard/subjects")
    } catch (error: any) {
      console.error("Error creating subject:", error)
      setError(error.message || "Failed to create subject")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PermissionGuard module="subjects" action="create">
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DashboardHeader
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Subjects", href: "/dashboard/subjects" },
            { title: "Add New Subject" },
          ]}
        />

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/subjects">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Add New Subject</h1>
              <p className="text-muted-foreground">Create a new subject for your school's curriculum</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Subject Information</CardTitle>
                <CardDescription>Basic details about the subject</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Subject Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="e.g., Mathematics"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Subject Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange("code", e.target.value)}
                      placeholder="e.g., MATH101"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      placeholder="e.g., Science"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credits">Credits *</Label>
                    <Input
                      id="credits"
                      type="number"
                      value={formData.credits}
                      onChange={(e) => handleInputChange("credits", Number.parseInt(e.target.value) || 1)}
                      min="1"
                      max="10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Optional description of the subject"
                    disabled={isLoading}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Subject"
                )}
              </Button>
              <Link href="/dashboard/subjects">
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </PermissionGuard>
  )
}
