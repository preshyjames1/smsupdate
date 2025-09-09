// FIX: Imported FieldValue to use in the Announcement interface
import type { FieldValue } from "firebase/firestore"

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: "admin" | "teacher" | "parent" | "student"
  recipientId: string
  recipientName: string
  recipientRole: "admin" | "teacher" | "parent" | "student"
  subject: string
  content: string
  timestamp: Date
  read: boolean
  priority: "low" | "medium" | "high"
}

export interface Announcement {
  id: string
  title: string
  content: string
  authorId: string
  authorName: string
  targetAudience: ("students" | "teachers" | "parents" | "staff")[]
  priority: "low" | "medium" | "high"
  expiryDate?: Date
  attachments?: string[]
  status: "draft" | "published" | "archived"
  schoolId: string // <-- ADD THIS LINE
  // FIX: Updated date types to be compatible with serverTimestamp()
  publishDate: Date | FieldValue
  createdAt: Date | FieldValue
  updatedAt: Date | FieldValue
}

export interface Report {
  id: string
  type: "attendance" | "academic" | "behavioral" | "financial"
  title: string
  description: string
  generatedBy: string
  generatedAt: Date
  parameters: Record<string, any>
  data: any[]
  format: "pdf" | "excel" | "csv"
}