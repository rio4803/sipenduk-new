import { supabase } from "@/app/utils/supabase"
import { generateRandomPassword } from "./utils"

export type User = {
  id: string
  name: string
  username: string
  role: string
}

export type UserWithPassword = User & {password: string}

export async function checkAdminExists(): Promise<boolean> {
  if (typeof window !== "undefined") {
    throw new Error("This function can only be used on the server")
  }

  try {
    const {data, error} = await supabase.from("pengguna").select("id").eq("role", "admin")
    if(!error && data.length){return true}
    return false
  } catch (error) {
    console.error("Error checking admin exists:", error)
    return false
  }
}

export async function createDefaultAdmin(): Promise<{
  name: string,
  username: string,
  password: string,
  role: string  
}> {
  if (typeof window !== "undefined") {
    throw new Error("This function can only be used on the server")
  }

  try {
    const password = generateRandomPassword(8)
    const admin = {
      name: "Administrator",
      username: "admin",
      password: password,
      role: "admin",
    }

    const insertAdmin = await supabase.from("pengguna").insert(admin)
    console.log(insertAdmin)
    console.log("Default admin created successfully:", admin.username, admin.password)

    return admin
  } catch (error) {
    console.error("Error creating default admin:", error)
    throw new Error("Failed to create default admin")
  }
}

export async function login(username: string, password: string): Promise<User | null> {
  if (typeof window !== "undefined") {
    throw new Error("This function can only be used on the server")
  }

  try {
    console.log("Login attempt for username:", username)
    const {data: user, error} = await supabase
      .from("pengguna")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single()

    if (!user) {
      console.log("No matching user found")
      return null
    }

    console.log("User found:", user.username, "with role:", user.level)
    const userObj: User = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    }
    return userObj
  } catch (error) {
    console.error("Error during login:", error)
    return null
  }
}

// Export login as loginUser as well
export const loginUser = login

// Add this function to validate a user session against the database
export async function validateUserById(userId: string): Promise<User | null> {
  if (!userId) return null

  try {
    const {data, error} = await supabase.from("pengguna").select("*").eq("id", userId).single()
    if(error){
      console.log(error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      username: data.username,
      role: data.role,
    }
  } catch (error) {
    console.error("Error validating user:", error)
    return null
  }
}

export async function getSession(): Promise<User | null> {
  // Pastikan kode ini hanya dijalankan di server
  if (typeof window !== "undefined") {
    throw new Error("This function can only be used on the server")
  }

  try {
    // This function is kept for backward compatibility
    // but no longer uses cookies
    return null
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

