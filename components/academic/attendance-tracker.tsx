"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, Clock, AlertCircle, Save, Circle } from "lucide-react"
import type { AttendanceRecord } from "@/lib/types/academic"

interface Student {
  id: string
  profile: {
    firstName: string
    lastName: string
    avatar?: string
  }
}

interface AttendanceTrackerProps {
  students: Student[]
  date: Date
  existingRecords?: AttendanceRecord[]
  onSave: (records: Partial<AttendanceRecord>[]) => Promise<void>
  isLoading: boolean
}

export function AttendanceTracker({
  students,
  date,
  existingRecords = [],
  onSave,
  isLoading,
}: AttendanceTrackerProps) {
  const [attendanceData, setAttendanceData] = useState<
    Record<string, { status: string; notes: string }>
  >({})

  useEffect(() => {
    const initial: Record<string, { status: string; notes: string }> = {}
    students.forEach((student) => {
      const existing = existingRecords.find((record) => record.studentId === student.id)
      initial[student.id] = {
        status: existing?.status || "", // Default to not set
        notes: existing?.notes || "",
      }
    })
    setAttendanceData(initial)
  }, [students, existingRecords])

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }))
  }

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes },
    }))
  }

  const handleSave = async () => {
    // Filter out students where attendance has not been marked
    const records: Partial<AttendanceRecord>[] = students
      .filter((student) => !!attendanceData[student.id]?.status)
      .map((student) => ({
        studentId: student.id,
        date,
        classId: "", // This should be passed as a prop if needed
        status: attendanceData[student.id]?.status as "present" | "absent" | "late" | "excused",
        notes: attendanceData[student.id]?.notes,
      }))

    if (records.length === 0) {
      // Consider using a toast notification instead of an alert
      console.warn("No attendance records to save.")
      return
    }

    await onSave(records)
  }

  const getIconForStatus = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "absent":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "late":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "excused":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-500" /> // Icon for "not set"
    }
  }

  const getVariantForStatus = (status: string) => {
    switch (status) {
      case "present":
        return "default"
      case "absent":
        return "destructive"
      case "late":
        return "secondary"
      case "excused":
        return "outline"
      default:
        return "secondary" // Variant for "not set"
    }
  }

  const stats = students.reduce(
    (acc, student) => {
      const status = attendanceData[student.id]?.status || ""
      acc[status || "not_set"] = (acc[status || "not_set"] || 0) + 1
      return acc
    },
    { not_set: 0 } as Record<string, number>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance for {date.toLocaleDateString()}</CardTitle>
        <CardDescription>Mark the attendance for each student in the class.</CardDescription>
        <div className="flex flex-wrap gap-4 pt-4 text-sm">
          <span className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" /> Present: {stats.present || 0}
          </span>
          <span className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" /> Absent: {stats.absent || 0}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" /> Late: {stats.late || 0}
          </span>
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500" /> Excused: {stats.excused || 0}
          </span>
          <span className="flex items-center gap-2">
            <Circle className="h-4 w-4 text-gray-500" /> Not Set: {stats.not_set || 0}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {students.map((student) => (
          <div key={student.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-md border p-3">
            <div className="flex items-center gap-3 flex-1">
              <Avatar>
                <AvatarImage src={student.profile.avatar} />
                <AvatarFallback>
                  {student.profile.firstName[0]}
                  {student.profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {student.profile.firstName} {student.profile.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{student.id}</p>
              </div>
            </div>
            <div className="flex w-full sm:w-auto items-center gap-2">
              <Select
                value={attendanceData[student.id]?.status || ""}
                onValueChange={(value) => handleStatusChange(student.id, value)}
              >
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Mark..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="excused">Excused</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Notes..."
                value={attendanceData[student.id]?.notes || ""}
                onChange={(e) => handleNotesChange(student.id, e.target.value)}
                className="flex-1 sm:w-[200px]"
                rows={1}
              />
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save Attendance"}
        </Button>
      </CardFooter>
    </Card>
  )
}
