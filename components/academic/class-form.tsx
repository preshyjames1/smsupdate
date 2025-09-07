"use client"

import type React from "react"

<<<<<<< HEAD
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/context"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
=======
import { useState } from "react"
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
<<<<<<< HEAD
import { Checkbox } from "@/components/ui/checkbox"
=======
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
import { Loader2, ArrowLeft, X } from "lucide-react"
import type { Class } from "@/lib/types/academic"
import Link from "next/link"

interface ClassFormProps {
  classData?: Class
  onSubmit: (classData: Partial<Class>) => Promise<void>
  isLoading?: boolean
}

export function ClassForm({ classData, onSubmit, isLoading = false }: ClassFormProps) {
<<<<<<< HEAD
  const { user } = useAuth()
  const [error, setError] = useState("")
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [teachers, setTeachers] = useState<any[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(true)
=======
  const [error, setError] = useState("")
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
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
<<<<<<< HEAD
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
          where("isActive", "==", true),
        )
        const subjectsSnapshot = await getDocs(subjectsQuery)
        const subjectsData = subjectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setAvailableSubjects(subjectsData)
        console.log("[v0] Fetched subjects:", subjectsData)
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
          where("isActive", "==", true),
        )
        const teachersSnapshot = await getDocs(teachersQuery)
        const teachersData = teachersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setTeachers(teachersData)
        console.log("[v0] Fetched teachers:", teachersData)
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

=======
  })
  const [newSubject, setNewSubject] = useState("")

>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

<<<<<<< HEAD
  const addSubjectById = (subjectId: string) => {
    if (subjectId && !formData.subjects.includes(subjectId)) {
      setFormData((prev) => ({
        ...prev,
        subjects: [...prev.subjects, subjectId],
      }))
    }
  }

  const toggleSubject = (subjectId: string, checked: boolean) => {
    if (checked) {
      addSubjectById(subjectId)
    } else {
      removeSubject(subjectId)
    }
  }

=======
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
  const addSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      setFormData((prev) => ({
        ...prev,
        subjects: [...prev.subjects, newSubject.trim()],
      }))
      setNewSubject("")
    }
  }

  const removeSubject = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s !== subject),
    }))
  }

<<<<<<< HEAD
  const getSubjectName = (subjectId: string) => {
    const subject = availableSubjects.find((s) => s.id === subjectId)
    return subject ? subject.name : subjectId
  }

=======
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const classDataToSubmit: Partial<Class> = {
        name: formData.name,
        section: formData.section,
        grade: formData.grade,
        capacity: formData.capacity,
        room: formData.room,
        description: formData.description,
        academicYear: formData.academicYear,
        subjects: formData.subjects,
        isActive: formData.isActive,
<<<<<<< HEAD
        classTeacherId: formData.classTeacherId,
=======
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
      }

      await onSubmit(classDataToSubmit)
    } catch (error: any) {
      setError(error.message || "Failed to save class")
    }
  }

  const isEditing = !!classData

  return (
    <div className="space-y-6">
      {/* Header */}
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

        {/* Basic Information */}
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
                  placeholder="e.g., Mathematics"
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
                <Label htmlFor="grade">Grade *</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => handleInputChange("grade", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                      <SelectItem key={grade} value={grade.toString()}>
                        Grade {grade}
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
                <Label htmlFor="room">Room</Label>
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

<<<<<<< HEAD
        {/* Class Teacher Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Class Teacher Assignment</CardTitle>
            <CardDescription>Assign a teacher to be responsible for this class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingTeachers ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading teachers...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="classTeacherId">Class Teacher</Label>
                <Select
                  value={formData.classTeacherId}
                  onValueChange={(value) => handleInputChange("classTeacherId", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class teacher (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Teacher Assigned</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.profile?.firstName} {teacher.profile?.lastName}
                        {teacher.email && <span className="text-muted-foreground ml-2">({teacher.email})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Assign a teacher to be the primary class teacher. This teacher will have additional responsibilities
                  for this class.
                </p>
                {teachers.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No teachers found. Create teachers first in the{" "}
                    <Link href="/dashboard/teachers" className="text-primary hover:underline">
                      Teachers
                    </Link>{" "}
                    section.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

=======
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
<<<<<<< HEAD
            <CardDescription>Select subjects taught in this class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingSubjects ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading subjects...</span>
              </div>
            ) : availableSubjects.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableSubjects.map((subject) => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject.id}
                        checked={formData.subjects.includes(subject.id)}
                        onCheckedChange={(checked) => toggleSubject(subject.id, checked as boolean)}
                        disabled={isLoading}
                      />
                      <Label htmlFor={subject.id} className="text-sm font-normal cursor-pointer">
                        {subject.name}
                        {subject.code && <span className="text-muted-foreground ml-1">({subject.code})</span>}
                      </Label>
                    </div>
                  ))}
                </div>

                {formData.subjects.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Selected Subjects:</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.subjects.map((subjectId) => (
                        <Badge key={subjectId} variant="secondary" className="flex items-center gap-1">
                          {getSubjectName(subjectId)}
                          <button
                            type="button"
                            onClick={() => removeSubject(subjectId)}
                            className="ml-1 hover:text-destructive"
                            disabled={isLoading}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No subjects found.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create subjects first in the{" "}
                  <Link href="/dashboard/subjects" className="text-primary hover:underline">
                    Subjects
                  </Link>{" "}
                  section.
                </p>
              </div>
            )}

            <div className="border-t pt-4">
              <Label className="text-sm font-medium">Add Custom Subject</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Add a custom subject"
                  disabled={isLoading}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSubject()
                    }
                  }}
                />
                <Button type="button" onClick={addSubject} disabled={isLoading || !newSubject.trim()}>
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Use this to add subjects that aren't in your subjects list yet.
              </p>
            </div>
=======
            <CardDescription>Subjects taught in this class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Add a subject"
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addSubject()
                  }
                }}
              />
              <Button type="button" onClick={addSubject} disabled={isLoading || !newSubject.trim()}>
                Add
              </Button>
            </div>

            {formData.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeSubject(subject)}
                      className="ml-1 hover:text-destructive"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Class status and configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.isActive ? "active" : "inactive"}
                onValueChange={(value) => handleInputChange("isActive", value === "active")}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
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
