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
import { Megaphone, PlusCircle, Edit, Trash2, Loader2 } from "lucide-react"
import type { User } from "@/lib/types"
import type { Announcement } from "@/lib/types/communication"

type AudienceRole = "students" | "teachers" | "parents" | "staff"
type AnnouncementWithAuthor = Announcement & { author?: Pick<User, "id" | "profile"> }

const AnnouncementForm: FC<{
  announcement?: AnnouncementWithAuthor
  onSave: (data: Partial<Announcement>) => Promise<void>
  isLoading: boolean
}> = ({ announcement, onSave, isLoading }) => {
  const [title, setTitle] = useState(announcement?.title || "")
  const [content, setContent] = useState(announcement?.content || "")
  const [targetAudience, setTargetAudience] = useState<AudienceRole[]>(
    Array.isArray(announcement?.targetAudience) ? announcement.targetAudience : []
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ title, content, targetAudience })
  }

  const handleAudienceChange = (value: string) => {
    setTargetAudience(value === "all" ? [] : [value as AudienceRole])
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
          onValueChange={handleAudienceChange}
          defaultValue={targetAudience.length === 0 ? "all" : targetAudience[0]}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select audience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="teachers">Teachers</SelectItem>
            <SelectItem value="students">Students</SelectItem>
            <SelectItem value="parents">Parents</SelectItem>
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

        const announcementsWithAuthors = await Promise.all(
          announcementsData.map(async (ann) => {
            if (!ann.authorId) return ann
            const userDoc = await getDoc(doc(db, "users", ann.authorId))
            if (userDoc.exists()) {
              const authorData = userDoc.data() as User
              return { ...ann, author: { id: userDoc.id, profile: authorData.profile } }
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
    if (!user?.schoolId || !user.id || !user.profile) return
    setIsSubmitting(true)

    try {
      if (selectedAnnouncement) {
        const docRef = doc(db, "announcements", selectedAnnouncement.id)
        await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
        
        const updatedAnnouncements = announcements.map((ann) =>
          ann.id === selectedAnnouncement.id ? { ...ann, ...data, author: ann.author } : ann
        );
        setAnnouncements(updatedAnnouncements);
        
        toast({ title: "Success", description: "Announcement updated successfully." })
      } else {
        const announcementToCreate = {
            ...data,
            schoolId: user.schoolId,
            authorId: user.id,
            authorName: `${user.profile.firstName} ${user.profile.lastName}`,
            status: "published" as const,
            priority: "medium" as const,
            publishDate: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "announcements"), announcementToCreate);
        
        // FIX: Construct a new, complete object for the UI state update.
        // Use the non-null assertion `!` on `data.title` and `data.content` because we know the form requires them.
        const newAnnouncement: AnnouncementWithAuthor = {
          id: docRef.id,
          title: data.title!,
          content: data.content!,
          targetAudience: data.targetAudience || [],
          authorId: user.id,
          authorName: `${user.profile.firstName} ${user.profile.lastName}`,
          status: "published",
          priority: "medium",
          schoolId: user.schoolId,
          // Use local dates for the optimistic UI update
          publishDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          // Add the author profile for display
          author: { id: user.id, profile: user.profile },
        };
        setAnnouncements([newAnnouncement, ...announcements]);

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
    return <div>Loading announcements...</div>
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
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                if (!open) setSelectedAnnouncement(null);
                setIsDialogOpen(open);
            }}>
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
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[400px]">
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
              <Card key={ann.id} className="flex flex-col">
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
                      {ann.createdAt ? new Date((ann.createdAt as any).seconds * 1000).toLocaleDateString() : 'N/A'}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-4">{ann.content}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <Badge variant="outline">
                    {ann.targetAudience && ann.targetAudience.length > 0
                      ? ann.targetAudience.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(", ")
                      : "All Users"}
                  </Badge>
                  {canManageAnnouncements && ann.authorId === user?.id && (
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
                        className="text-destructive hover:text-destructive"
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
            <AlertDialogCancel onClick={() => setSelectedAnnouncement(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Deleting..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}