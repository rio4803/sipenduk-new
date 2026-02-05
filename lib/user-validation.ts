import { supabase } from "@/app/utils/supabase"

export async function validateUserExists(userId: string): Promise<boolean> {
  try {
    const {data: user, error} = await supabase.from("pengguna").select("*").eq("id", userId).single()
    return !!user
  } catch (error) {
    console.error("Error validating user:", error)
    return false
  }
}

export async function validateUserRole(userId: string, requiredRole: "admin" | "penduduk"): Promise<boolean> {
  try {
    const {data: user, error} = await supabase.from("pengguna").select("*").eq("id", userId).single()
    if (!user || error) return false
    return user.role === requiredRole
  } catch (error) {
    console.error("Error validating user role:", error)
    return false
  }
}

export async function validatePenduduk(nik: string): Promise<boolean> {
  try {
    const {data: penduduk, error} = await supabase.from("penduduk").select("*").eq("nik", nik).single()
    return !!penduduk
  } catch (error) {
    console.error("Error validating penduduk:", error)
    return false
  }
}

