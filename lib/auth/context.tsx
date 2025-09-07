"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { User, School } from "@/lib/types"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null;
  schoolData: School | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User> & { schoolName?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [schoolData, setSchoolData] = useState<School | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Listen to user document
        const userDocRef = doc(db, "users", fbUser.uid);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = { id: docSnap.id, ...docSnap.data() } as User;
            setUser(userData);
            
            // Once we have user data, listen to their school data
            if (userData.schoolId) {
              const schoolDocRef = doc(db, "schools", userData.schoolId);
              const unsubscribeSchool = onSnapshot(schoolDocRef, (schoolSnap) => {
                if (schoolSnap.exists()) {
                  setSchoolData({ id: schoolSnap.id, ...schoolSnap.data() } as School);
                } else {
                  setSchoolData(null);
                }
                setLoading(false);
              });
              return () => unsubscribeSchool(); // Cleanup school listener
            } else {
                 setLoading(false);
            }
          } else {
            setUser(null);
            setSchoolData(null);
            setLoading(false);
          }
        });
        return () => unsubscribeUser(); // Cleanup user listener
      } else {
        setUser(null);
        setSchoolData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup auth listener
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      throw new Error(error.message || "Failed to sign in")
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<User> & { schoolName?: string }) => {
    try {
      const { user: newFirebaseUser } = await createUserWithEmailAndPassword(auth, email, password)

      // Update Firebase Auth profile
      await updateProfile(newFirebaseUser, {
        displayName: `${userData.profile?.firstName} ${userData.profile?.lastName}`,
      })
      
      const schoolId = userData.role === 'school_admin' ? newFirebaseUser.uid : userData.schoolId;

      // Create user document in Firestore
      const newUser: User = {
        id: newFirebaseUser.uid,
        email: newFirebaseUser.email!,
        role: userData.role || "school_admin",
        schoolId: schoolId!,
        profile: userData.profile!,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      }

      await setDoc(doc(db, "users", newFirebaseUser.uid), {
        ...newUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // If this is a school admin, create the school document
      if (userData.role === "school_admin") {
        const newSchoolData = {
          id: schoolId,
          name: userData.schoolName || `${userData.profile?.firstName}'s School`,
          adminId: newFirebaseUser.uid,
          email: newFirebaseUser.email!,
          address: userData.profile?.address || {
            street: "",
            city: "",
            state: "",
            country: "",
            zipCode: "",
          },
          phone: userData.profile?.phone || "",
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
          subscription: "free",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true,
        }

        await setDoc(doc(db, "schools", schoolId!), newSchoolData)
      }
    } catch (error: any) {
      throw new Error(error.message || "Failed to create account")
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setFirebaseUser(null)
      setSchoolData(null)
      router.push("/auth/login")
    } catch (error: any) {
      console.error("Error signing out:", error)
      throw new Error(error.message || "Failed to sign out")
    }
  }

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) throw new Error("No user logged in")

    try {
      const userDocRef = doc(db, "users", user.id);
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      // The onSnapshot listener will automatically update the local state
    } catch (error: any) {
      throw new Error(error.message || "Failed to update profile")
    }
  }

  const value = {
    user,
    schoolData,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
