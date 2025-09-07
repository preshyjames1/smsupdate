"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, runTransaction, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import type { School, User } from "@/lib/types"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    schoolName: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { user: newFirebaseUser } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )

      await updateProfile(newFirebaseUser, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      })
      
      // Use a transaction to ensure both user and school are created successfully
      await runTransaction(db, async (transaction) => {
        const schoolId = newFirebaseUser.uid // School ID will be the same as the admin's UID
        const userDocRef = doc(db, "users", newFirebaseUser.uid)
        const schoolDocRef = doc(db, "schools", schoolId)
        
        // 1. Create the User Document
        const newUser: User = {
          id: newFirebaseUser.uid,
          email: formData.email,
          role: "school_admin",
          schoolId: schoolId,
          profile: {
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        }
        transaction.set(userDocRef, { ...newUser, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })

        // 2. Create the School Document
        const newSchool: School = {
          id: schoolId,
          name: formData.schoolName || `${formData.firstName}'s School`,
          adminId: newFirebaseUser.uid,
          email: formData.email,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          // Add default settings for the new school
          settings: {
            academicYear: new Date().getFullYear().toString(),
            currency: "USD",
            timezone: "UTC",
            language: "en",
            features: {
                attendance: true,
                examinations: true,
                library: false,
                transport: false,
                hostel: false,
                accounting: false,
                messaging: true,
            },
          },
          subscription: {
              plan: "free",
              status: "active",
              startDate: new Date(),
          }
        }
        transaction.set(schoolDocRef, { ...newSchool, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      })

      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create Your School Account</CardTitle>
          <CardDescription>
            Enter your information to get started as a School Administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
