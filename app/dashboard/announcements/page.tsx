"use client"

import { useEffect, useState, type FC } from "react"
import { useAuth } from "@/lib/auth/context"
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  getDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Megaphone, PlusCircle, Edit, Trash2, Loader2, Info } from "lucide-react"
import type { Announcement, User } from "@/lib/types"

// Extend the Announcement type to include the author's data
type AnnouncementWithAuthor = Announcement & { author?: Pick<User, "id" | "profile"> }

// Announcement Form Component for Create/Edit
const AnnouncementForm: FC<{
  announcement?: AnnouncementWithAuthor
  onSave: (data: Partial<Announcement>) => Promise<void>
  isLoading: boolean
}> = ({ announcement, onSave, isLoading }) => {
  const [title, setTitle] = useState(announcement?.title || "")
  const [content, setContent] = useState(announcement?.content || "")
  const [targetAudience, setTargetAudience] = useState<string[]>(
    Array.isArray(announcement?.targetAudience) ? announcement.targetAudience : []
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ title, content, targetAudience })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={6}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="targetAudience">Target Audience</Label>
        <Select
          onValueChange={(value) => setTargetAudience(value === "all" ? [] : [value])}
          defaultValue={targetAudience.length === 0 ? "all" : targetAudience[0]}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select audience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="teacher">Teachers</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="parent">Parents</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Announcement"
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default function AnnouncementsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<AnnouncementWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementWithAuthor | null>(null)

  useEffect(() => {
    if (!user?.schoolId) return

    const fetchAnnouncements = async () => {
      try {
        setLoading(true)
        const q = query(
          collection(db, "announcements"),
          where("schoolId", "==", user.schoolId),
          orderBy("createdAt", "desc")
        )
        const querySnapshot = await getDocs(q)
        const announcementsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Announcement[]

        // Fetch author details for each announcement
        const announcementsWithAuthors = await Promise.all(
          announcementsData.map(async (ann) => {
            if (!ann.authorId) return ann
            const userDoc = await getDoc(doc(db, "users", ann.authorId))
            if (userDoc.exists()) {
              return { ...ann, author: { id: userDoc.id, profile: userDoc.data().profile } }
            }
            return ann
          })
        )

        setAnnouncements(announcementsWithAuthors)
      } catch (error) {
        console.error("Error fetching announcements:", error)
        toast({
          title: "Error",
          description: "Failed to fetch announcements.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [user?.schoolId, toast])

  const handleCreateOrUpdate = async (data: Partial<Announcement>) => {
    if (!user?.schoolId || !user.id) return
    setIsSubmitting(true)

    try {
      if (selectedAnnouncement) {
        // Update existing announcement
        const docRef = doc(db, "announcements", selectedAnnouncement.id)
        await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
        setAnnouncements(
          announcements.map((ann) =>
            ann.id === selectedAnnouncement.id ? { ...ann, ...data } : ann
          )
        )
        toast({ title: "Success", description: "Announcement updated successfully." })
      } else {
        // Create new announcement
        const docRef = await addDoc(collection(db, "announcements"), {
          ...data,
          schoolId: user.schoolId,
          authorId: user.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        const newAnnouncement = {
          id: docRef.id,
          ...data,
          author: { id: user.id, profile: user.profile },
          createdAt: new Date(),
        } as AnnouncementWithAuthor
        setAnnouncements([newAnnouncement, ...announcements])
        toast({ title: "Success", description: "Announcement published successfully." })
      }
      setIsDialogOpen(false)
      setSelectedAnnouncement(null)
    } catch (error) {
      console.error("Error saving announcement:", error)
      toast({ title: "Error", description: "Failed to save announcement.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedAnnouncement) return
    setIsSubmitting(true)
    try {
      await deleteDoc(doc(db, "announcements", selectedAnnouncement.id))
      setAnnouncements(announcements.filter((ann) => ann.id !== selectedAnnouncement.id))
      toast({ title: "Success", description: "Announcement deleted." })
    } catch (error) {
      console.error("Error deleting announcement:", error)
      toast({ title: "Error", description: "Failed to delete announcement.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
      setIsAlertOpen(false)
      setSelectedAnnouncement(null)
    }
  }

  const canManageAnnouncements = user?.role === "school_admin" || user?.role === "teacher"

  if (loading) {
    // Uses the loading.tsx file in the same directory
    return null
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <DashboardHeader
          title="Announcements"
          description="Manage and view school-wide announcements."
          breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }, { title: "Announcements" }]}
        >
          {canManageAnnouncements && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedAnnouncement(null)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> New Announcement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedAnnouncement ? "Edit Announcement" : "New Announcement"}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedAnnouncement
                      ? "Update the details of the announcement."
                      : "Create a new announcement for the school."}
                  </DialogDescription>
                </DialogHeader>
                <AnnouncementForm
                  announcement={selectedAnnouncement || undefined}
                  onSave={handleCreateOrUpdate}
                  isLoading={isSubmitting}
                />
              </DialogContent>
            </Dialog>
          )}
        </DashboardHeader>

        {announcements.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-1 text-center">
              <Megaphone className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-2xl font-bold tracking-tight">No Announcements Yet</h3>
              <p className="text-sm text-muted-foreground">
                {canManageAnnouncements
                  ? "Create your first announcement to get started."
                  : "Check back later for school announcements."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {announcements.map((ann) => (
              <Card key={ann.id}>
                <CardHeader>
                  <CardTitle>{ann.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 pt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={ann.author?.profile?.avatar} />
                      <AvatarFallback>
                        {ann.author?.profile?.firstName?.[0]}
                        {ann.author?.profile?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      By {ann.author?.profile?.firstName} {ann.author?.profile?.lastName || "Admin"} on{" "}
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-4">{ann.content}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Badge variant="outline">
                    {ann.targetAudience?.length
                      ? ann.targetAudience.join(", ").replace(/^\w/, (c) => c.toUpperCase())
                      : "All Users"}
                  </Badge>
                  {canManageAnnouncements && ann.authorId === user.id && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAnnouncement(ann)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          setSelectedAnnouncement(ann)
                          setIsAlertOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this announcement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
