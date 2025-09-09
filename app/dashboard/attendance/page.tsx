"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/context"
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { AttendanceTracker } from "@/components/academic/attendance-tracker"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import type { AttendanceRecord, Class } from "@/lib/types/academic"
import type { User } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

export default function AttendancePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [students, setStudents] = useState<User[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [existingRecords, setExistingRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.schoolId) return

      setIsDataLoading(true)
      try {
        const classesQuery = query(
          collection(db, "classes"),
          where("schoolId", "==", user.schoolId),
          where("isActive", "==", true),
        )
        const classesSnapshot = await getDocs(classesQuery)
        const classesData = classesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Class[]
        setClasses(classesData)
      } catch (error) {
        console.error("Error fetching classes:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch classes. Please try again.",
        })
      } finally {
        setIsDataLoading(false)
      }
    }

    fetchClasses()
  }, [user?.schoolId, toast])

  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      if (!selectedClass || !user?.schoolId) return

      setIsDataLoading(true)
      try {
        // Fetch students for selected class
        const studentsQuery = query(
          collection(db, "users"),
          where("schoolId", "==", user.schoolId),
          where("role", "==", "student"),
          where("profile.classId", "==", selectedClass),
          where("isActive", "==", true),
        )
        const studentsSnapshot = await getDocs(studentsQuery)
        const studentsData = studentsSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            email: data.email,
            role: data.role,
            schoolId: data.schoolId,
            isActive: data.isActive,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            profile: data.profile,
            name: `${data.profile?.firstName ?? ""} ${data.profile?.lastName ?? ""}`.trim(),
            rollNumber: data.profile?.rollNumber || doc.id.slice(-3),
            avatar: data.profile?.avatar,
          }
        }) as User[]
        setStudents(studentsData)

        // Fetch existing attendance records for the selected date
        const attendanceQuery = query(
          collection(db, "attendance"),
          where("schoolId", "==", user.schoolId),
          where("classId", "==", selectedClass),
          where("date", "==", format(selectedDate, "yyyy-MM-dd")),
        )
        const attendanceSnapshot = await getDocs(attendanceQuery)
        const attendanceData = attendanceSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AttendanceRecord[]
        setExistingRecords(attendanceData)
      } catch (error) {
        console.error("Error fetching students and attendance:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch students and attendance. Please try again.",
        })
      } finally {
        setIsDataLoading(false)
      }
    }

    fetchStudentsAndAttendance()
  }, [selectedClass, selectedDate, user?.schoolId, toast])

  const handleSaveAttendance = async (records: Partial<AttendanceRecord>[]) => {
    if (!user?.schoolId || !selectedClass) return

    setIsLoading(true)
    try {
      const dateString = format(selectedDate, "yyyy-MM-dd")

      for (const record of records) {
        const attendanceData = {
          schoolId: user.schoolId,
          classId: selectedClass,
          studentId: record.studentId,
          date: dateString,
          status: record.status,
          notes: record.notes || "",
          markedBy: user.id,
          markedAt: serverTimestamp(),
        }

        // Check if record already exists
        const existingRecord = existingRecords.find((r) => r.studentId === record.studentId)

        if (existingRecord) {
          // Update existing record
          await updateDoc(doc(db, "attendance", existingRecord.id), {
            status: record.status,
            notes: record.notes || "",
            markedBy: user.id,
            markedAt: serverTimestamp(),
          })
        } else {
          // Create new record
          await addDoc(collection(db, "attendance"), attendanceData)
        }
      }

      // Refresh existing records
      const attendanceQuery = query(
        collection(db, "attendance"),
        where("schoolId", "==", user.schoolId),
        where("classId", "==", selectedClass),
        where("date", "==", dateString),
      )
      const attendanceSnapshot = await getDocs(attendanceQuery)
      const attendanceData = attendanceSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AttendanceRecord[]
      setExistingRecords(attendanceData)

      toast({
        title: "Success",
        description: "Attendance saved successfully!",
      })
    } catch (error) {
      console.error("Error saving attendance:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save attendance. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Main page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance Settings</h1>
        <p className="text-muted-foreground">Select class and date to mark attendance</p>
      </div>

      {/* Stacked card layout */}
      <div className="space-y-6">
        {/* Controls Card */}
        <Card className="bg-muted/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Select Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {isDataLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : classes.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No classes available
                      </div>
                    ) : (
                      classes.map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.name} - {classItem.section}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-background">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Card */}
        <Card className="bg-muted/20">
          <CardContent className="p-6">
            {selectedClass ? (
              isDataLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : students.length > 0 ? (
                <AttendanceTracker
                  students={students}
                  date={selectedDate}
                  onSave={handleSaveAttendance}
                  existingRecords={existingRecords}
                  isLoading={isLoading}
                />
              ) : (
                <div className="flex h-40 items-center justify-center text-center text-muted-foreground">
                  <p>No students found for this class.</p>
                </div>
              )
            ) : (
              <div className="flex h-40 items-center justify-center text-center text-muted-foreground">
                <p>Please select a class to start marking attendance.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}