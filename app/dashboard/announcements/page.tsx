"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth/context"
import { collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
<<<<<<< HEAD
import { Checkbox } from "@/components/ui/checkbox"
=======
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
import { Megaphone, Plus, Search, Calendar, Users, Loader2 } from "lucide-react"
import type { Announcement } from "@/lib/types/communication"

export default function AnnouncementsPage() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
<<<<<<< HEAD
  const [classes, setClasses] = useState<any[]>([])
=======
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
  const [showCreate, setShowCreate] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "medium",
<<<<<<< HEAD
    targetType: "all", // all, role, class, specific
    targetRoles: [] as string[],
    targetClasses: [] as string[],
=======
    targetAudience: [] as string[],
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
    expiryDate: "",
  })

  useEffect(() => {
<<<<<<< HEAD
    const fetchData = async () => {
      if (!user?.schoolId) return

      try {
        // Fetch announcements
=======
    const fetchAnnouncements = async () => {
      if (!user?.schoolId) return

      try {
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
        const announcementsQuery = query(
          collection(db, "announcements"),
          where("schoolId", "==", user.schoolId),
          orderBy("publishDate", "desc"),
        )
        const announcementsSnapshot = await getDocs(announcementsQuery)
        const announcementsData = announcementsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Announcement[]
        setAnnouncements(announcementsData)
<<<<<<< HEAD

        const classesQuery = query(
          collection(db, "classes"),
          where("schoolId", "==", user.schoolId),
          where("isActive", "==", true),
        )
        const classesSnapshot = await getDocs(classesQuery)
        const classesData = classesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setClasses(classesData)
      } catch (error) {
        console.error("Error fetching data:", error)
=======
      } catch (error) {
        console.error("Error fetching announcements:", error)
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
      } finally {
        setLoading(false)
      }
    }

<<<<<<< HEAD
    fetchData()
=======
    fetchAnnouncements()
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
  }, [user?.schoolId])

  const handlePublishAnnouncement = async () => {
    if (!user?.schoolId || !formData.title || !formData.content) return

    setPublishing(true)
    try {
<<<<<<< HEAD
      let targetAudience: string[] = []

      if (formData.targetType === "all") {
        targetAudience = ["all"]
      } else if (formData.targetType === "role") {
        targetAudience = formData.targetRoles
      } else if (formData.targetType === "class") {
        targetAudience = formData.targetClasses.map((classId) => `class:${classId}`)
      }

=======
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
      const announcementData = {
        title: formData.title,
        content: formData.content,
        authorId: user.uid,
        authorName: `${user.profile?.firstName} ${user.profile?.lastName}`,
<<<<<<< HEAD
        targetAudience,
        targetType: formData.targetType,
=======
        targetAudience: formData.targetAudience.length > 0 ? formData.targetAudience : ["all"],
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
        priority: formData.priority,
        publishDate: new Date(),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
        status: "published",
        schoolId: user.schoolId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const docRef = await addDoc(collection(db, "announcements"), announcementData)

      // Add to local state
      setAnnouncements((prev) => [{ id: docRef.id, ...announcementData }, ...prev])

      // Reset form
      setFormData({
        title: "",
        content: "",
        priority: "medium",
<<<<<<< HEAD
        targetType: "all",
        targetRoles: [],
        targetClasses: [],
=======
        targetAudience: [],
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
        expiryDate: "",
      })
      setShowCreate(false)

      alert("Announcement published successfully!")
    } catch (error) {
      console.error("Error publishing announcement:", error)
      alert("Failed to publish announcement")
    } finally {
      setPublishing(false)
    }
  }

  const handleArchiveAnnouncement = async (announcementId: string) => {
    try {
      await updateDoc(doc(db, "announcements", announcementId), {
        status: "archived",
        updatedAt: new Date(),
      })

      setAnnouncements((prev) => prev.map((ann) => (ann.id === announcementId ? { ...ann, status: "archived" } : ann)))
    } catch (error) {
      console.error("Error archiving announcement:", error)
    }
  }

<<<<<<< HEAD
  const getTargetAudienceDisplay = (announcement: any) => {
    if (announcement.targetType === "all" || announcement.targetAudience.includes("all")) {
      return "All Users"
    } else if (announcement.targetType === "role") {
      return announcement.targetAudience.join(", ")
    } else if (announcement.targetType === "class") {
      const classNames = announcement.targetAudience
        .filter((target: string) => target.startsWith("class:"))
        .map((target: string) => {
          const classId = target.replace("class:", "")
          const classData = classes.find((c) => c.id === classId)
          return classData ? `${classData.name} - ${classData.section}` : classId
        })
      return classNames.join(", ") || "Specific Classes"
    }
    return "Unknown"
  }

=======
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DashboardHeader breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Announcements" }]} />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading announcements...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Announcements" }]} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Announcements</h1>
            <p className="text-muted-foreground">Manage school-wide announcements and notifications</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Create Announcement Form */}
        {showCreate && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Announcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Enter announcement title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Enter announcement content"
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
<<<<<<< HEAD

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Target Audience</label>
                  <Select
                    value={formData.targetType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, targetType: value, targetRoles: [], targetClasses: [] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="role">Specific Roles</SelectItem>
                      <SelectItem value="class">Specific Classes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.targetType === "role" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Roles</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["students", "teachers", "parents", "staff"].map((role) => (
                        <div key={role} className="flex items-center space-x-2">
                          <Checkbox
                            id={role}
                            checked={formData.targetRoles.includes(role)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({ ...formData, targetRoles: [...formData.targetRoles, role] })
                              } else {
                                setFormData({
                                  ...formData,
                                  targetRoles: formData.targetRoles.filter((r) => r !== role),
                                })
                              }
                            }}
                          />
                          <label htmlFor={role} className="text-sm capitalize">
                            {role}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.targetType === "class" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Classes</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {classes.map((classData) => (
                        <div key={classData.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={classData.id}
                            checked={formData.targetClasses.includes(classData.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({ ...formData, targetClasses: [...formData.targetClasses, classData.id] })
                              } else {
                                setFormData({
                                  ...formData,
                                  targetClasses: formData.targetClasses.filter((c) => c !== classData.id),
                                })
                              }
                            }}
                          />
                          <label htmlFor={classData.id} className="text-sm">
                            {classData.name} - {classData.section}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
=======
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
<<<<<<< HEAD
=======
                  <label className="text-sm font-medium">Target Audience</label>
                  <Select
                    value={formData.targetAudience[0] || "all"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, targetAudience: value === "all" ? [] : [value] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="teachers">Teachers</SelectItem>
                      <SelectItem value="parents">Parents</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
                  <label className="text-sm font-medium">Expiry Date</label>
                  <Input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePublishAnnouncement} disabled={publishing}>
                  {publishing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Announcement"
                  )}
                </Button>
                <Button variant="outline">Save as Draft</Button>
                <Button variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Announcements List */}
        <div className="space-y-4">
          {filteredAnnouncements.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground">
                  {searchTerm
                    ? "No announcements found matching your search."
                    : "No announcements yet. Create your first announcement to get started."}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <Card key={announcement.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Megaphone className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>By {announcement.authorName}</span>
                          <span>•</span>
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(announcement.publishDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          announcement.priority === "high"
                            ? "destructive"
                            : announcement.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {announcement.priority}
                      </Badge>
                      <Badge variant="outline">{announcement.status}</Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">{announcement.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
<<<<<<< HEAD
                        Target: {getTargetAudienceDisplay(announcement)}
=======
                        Target:{" "}
                        {announcement.targetAudience.length === 0
                          ? "All Users"
                          : announcement.targetAudience.join(", ")}
>>>>>>> 0b4583de8b821be2502537b9a1b15f5b7e084fdf
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleArchiveAnnouncement(announcement.id)}>
                        Archive
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
