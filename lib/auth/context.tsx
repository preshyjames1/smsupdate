"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"
import { doc, onSnapshot, type DocumentData } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser)
      if (fbUser) {
        // User is signed in, listen for real-time changes to their Firestore document
        const userDocRef = doc(db, "users", fbUser.uid)

        const unsubscribeSnapshot = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setUser({
                uid: docSnap.id,
                ...docSnap.data(),
              } as User)
            } else {
              // This case can happen if the user doc is not yet created or was deleted.
              console.error("User document not found for UID:", fbUser.uid)
              setUser(null)
            }
            setIsLoading(false)
          },
          (error) => {
            console.error("Error listening to user document:", error)
            setUser(null)
            setIsLoading(false)
          },
        )
        // Return the snapshot listener's unsubscribe function to clean up
        return () => unsubscribeSnapshot()
      } else {
        // User is signed out
        setUser(null)
        setIsLoading(false)
      }
    })

    // Cleanup subscription on unmount
    return () => unsubscribeAuth()
  }, [])

  const value = { user, firebaseUser, isLoading }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)