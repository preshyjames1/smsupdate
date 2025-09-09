// src/components/academic/class-form.tsx

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/context"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, ArrowLeft, X } from "lucide-react"
import type { Class } from "@/lib/types/academic"
import Link from "next/link"

interface ClassFormProps {
  classData?: Class
  onSubmit: (classData: Partial<Class>) => Promise<void>
  isLoading?: boolean
}

const gradeLevels = ["Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

// This is a NAMED export
export function ClassForm({ classData, onSubmit, isLoading = false }: ClassFormProps) {
  const { user } = useAuth()
  const [error, setError] = useState("")
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [teachers, setTeachers] = useState<any[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(true)
  const [formData, setFormData] = useState({
    name: classData?.name || "",
    section: classData?.section || "",
    grade: classData?.grade || "",
    capacity: classData?.capacity || 30,
    room: classData?.room || "",
    description: classData?.description || "",
    academicYear: classData?.academicYear || new Date().getFullYear().toString(),
    subjects: classData?.subjects || [],
    isActive: classData?.isActive ?? true,
    classTeacherId: classData?.classTeacherId || "",
  })
  const [newSubject, setNewSubject] = useState("")

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user?.schoolId) return

      try {
        setLoadingSubjects(true)
        const subjectsQuery = query(
          collection(db, "subjects"),
          where("schoolId", "==", user.schoolId),
          where("isActive", "==", true)
        )
        const subjectsSnapshot = await getDocs(subjectsQuery)
        const subjectsData = subjectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setAvailableSubjects(subjectsData)
      } catch (error) {
        console.error("Error fetching subjects:", error)
        setError("Failed to load subjects")
      } finally {
        setLoadingSubjects(false)
      }
    }

    const fetchTeachers = async () => {
      if (!user?.schoolId) return

      try {
        setLoadingTeachers(true)
        const teachersQuery = query(
          collection(db, "users"),
          where("schoolId", "==", user.schoolId),
          where("role", "==", "teacher"),
          where("isActive", "==", true)
        )
        const teachersSnapshot = await getDocs(teachersQuery)
        const teachersData = teachersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setTeachers(teachersData)
      } catch (error) {
        console.error("Error fetching teachers:", error)
        setError("Failed to load teachers")
      } finally {
        setLoadingTeachers(false)
      }
    }

    fetchSubjects()
    fetchTeachers()
  }, [user?.schoolId])

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const toggleSubject = (subjectId: string, checked: boolean) => {
    let updatedSubjects = [...formData.subjects]
    if (checked) {
      if (!updatedSubjects.includes(subjectId)) {
        updatedSubjects.push(subjectId)
      }
    } else {
      updatedSubjects = updatedSubjects.filter((id) => id !== subjectId)
    }
    setFormData((prev) => ({ ...prev, subjects: updatedSubjects }))
  }

  const addCustomSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      setFormData((prev) => ({
        ...prev,
        subjects: [...prev.subjects, newSubject.trim()],
      }))
      setNewSubject("")
    }
  }

  const removeSubject = (subjectToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s !== subjectToRemove),
    }))
  }

  const getSubjectName = (subjectId: string) => {
    const subject = availableSubjects.find((s) => s.id === subjectId)
    return subject ? subject.name : subjectId // Fallback to ID if not found (for custom subjects)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const classDataToSubmit: Partial<Class> = {
        ...formData,
        // Ensure classTeacherId is an empty string if "none" was selected
        classTeacherId: formData.classTeacherId === "none" ? "" : formData.classTeacherId,
      }

      await onSubmit(classDataToSubmit)
    } catch (error: any) {
      setError(error.message || "Failed to save class")
    }
  }

  const isEditing = !!classData

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/classes">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEditing ? "Edit" : "Add New"} Class</h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update class information" : "Create a new class for your school"}
          </p>
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
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details about the class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Grade 5"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section *</Label>
                <Input
                  id="section"
                  value={formData.section}
                  onChange={(e) => handleInputChange("section", e.target.value)}
                  placeholder="e.g., A, B, C"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade Level *</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => handleInputChange("grade", value)}
                  disabled={isLoading}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeLevels.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange("capacity", Number.parseInt(e.target.value) || 0)}
                  min="1"
                  max="100"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Room Number</Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) => handleInputChange("room", e.target.value)}
                  placeholder="e.g., Room 101"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Select
                  value={formData.academicYear}
                  onValueChange={(value) => handleInputChange("academicYear", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}-{year + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Optional description about the class"
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Class Teacher</CardTitle>
            <CardDescription>Assign a primary teacher for this class.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTeachers ? (
                <p>Loading teachers...</p>
            ) : (
                <Select
                  value={formData.classTeacherId || "none"}
                  onValueChange={(value) => handleInputChange("classTeacherId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Teacher Assigned</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.profile?.firstName} {teacher.profile?.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
            <CardDescription>Select subjects taught in this class from the list, or add custom ones.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingSubjects ? (
              <p>Loading subjects...</p>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {availableSubjects.map((subject) => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`subject-${subject.id}`}
                        checked={formData.subjects.includes(subject.id)}
                        onCheckedChange={(checked) => toggleSubject(subject.id, checked as boolean)}
                      />
                      <Label htmlFor={`subject-${subject.id}`}>{subject.name}</Label>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Add custom subject"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomSubject();
                      }
                    }}
                  />
                  <Button type="button" onClick={addCustomSubject} disabled={!newSubject.trim()}>
                    Add
                  </Button>
                </div>
              </>
            )}

            {formData.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4">
                {formData.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary">
                    {getSubjectName(subject)}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title="Remove subject"
                      onClick={() => removeSubject(subject)}
                      className="ml-2 rounded-full outline-none hover:bg-destructive/80"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{isEditing ? "Update Class" : "Create Class"}</>
            )}
          </Button>
          <Link href="/dashboard/classes">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}