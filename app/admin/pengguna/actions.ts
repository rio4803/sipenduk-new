"use server"

import { z } from "zod"
import { generateRandomPassword } from "@/lib/utils"
import { supabase } from "@/app/utils/supabase"
import { logActivity } from "@/lib/activity-logger"

export async function getPenggunaData() {
  try {
    const {data, error} = await supabase.from("pengguna").select("name, username, role, id, id_penduduk")
    if(error){
      console.log(error)
      return []
    }
    
    return data
  } catch (error) {
    console.error("Error fetching pengguna data:", error)
    throw new Error("Gagal mengambil data pengguna")
  }
}

export async function getPenggunaById(id: string) {
  try {
    const {data, error} = await supabase.from("pengguna").select("name, username, role, id, id_penduduk").eq("id", id).single()
    if(error){
      console.log(error)
      return null
    }
    return data
  } catch (error) {
    console.error(`Error getting pengguna with id ${id}:`, error)
    throw new Error("Gagal mengambil data pengguna")
  }
}

// Schema validasi untuk pengguna
const penggunaSchema = z.object({
  name: z.string().min(1, "Nama pengguna harus diisi"),
  username: z.string().min(1, "Username harus diisi"),
  password: z.string().min(1, "Password harus diisi"),
  role: z.enum(["admin", "penduduk"], {
    error: () => ({ message: "Level harus dipilih" }),
  }),
})

export async function createPengguna(formData: FormData, user_id: string) {
  try {
    // Validasi input
    const validatedFields = penggunaSchema.safeParse({
      name: formData.get("nama_pengguna"),
      username: formData.get("username"),
      password: formData.get("password") || generateRandomPassword(8),
      role: formData.get("role"),
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const newPengguna = {
      ...validatedFields.data,
      id_penduduk: formData.get("id_pdd") || null
    }

    const {error} = await supabase.from("pengguna").insert(newPengguna)
    if(error){
      if(error.code == "23505"){
        return {error: "Akun sudah terdaftar"}
      }
      console.log(error)
      return {error: "Terjadi masalah saat membuat user baru"}
    }

    // log
    await logActivity({
      user_id,
      type: "Pengguna",
      entity_type: "pengguna",
      description: `Menambahkan akun untuk ${validatedFields.data.username}`
    })

    return { success: true, data: newPengguna }
  } catch (error) {
    console.error("Error creating pengguna:", error)
    return { error: "Gagal menambahkan data pengguna" }
  }
}

export async function updatePengguna(id: string, formData: FormData, user_id: string) {
  try {
    
    const password = formData.get("password")
    let pengguna = null
    if(!password){
      const {data, error} = await supabase.from("pengguna").select("password").eq("id", id).single()
      if(error){
        console.log(error)
        return {error: "Terjadi masalah saat memuat data pengguna"}
      }
      
      pengguna = data
    }

    const validatedFields = penggunaSchema.safeParse({
      name: formData.get("nama_pengguna"),
      username: formData.get("username"),
      password: password ? password : pengguna?.password,
      role: formData.get("level"),
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }
    
    const {error} = await supabase.from("pengguna").update(validatedFields.data).eq("id", id)
    if(error){
      console.log(error)
      return {error: "Terjadi masalah saat memperbarui data pengguna"}
    }

    // log
    await logActivity({
      user_id,
      type: "Pengguna",
      entity_type: "pengguna",
      description: `Memperbarui data pengguna ${validatedFields.data.username}`
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating pengguna:", error)
    return { error: "Gagal memperbarui data pengguna" }
  }
}

export async function deletePengguna(id: string, user_id: string) {
  try {
    const {data: user, error: errUser} = await supabase.from("pengguna").select("role").eq("id", id).single()
    if(errUser){
      console.log(errUser)
      return {error: "Terjadi masalah"}
    }

    if(user.role == "admin"){
      const {count: adminCount, error} = await supabase.from("pengguna").select("role", {count: "exact", head: true}).eq("role", "admin")
      if(!adminCount){
        console.log(error)
        return {error: "Terjadi masalah teknis"}
      }
      if(adminCount < 2){
        return {error: "Tidak dapat menghapus admin terakhir!"}
      }
    }

    const {data, error} = await supabase.from("pengguna").delete().eq("id", id).select("username").single()
    if(error){
      console.log(error);
      return { error: "Terjadi masalah saat menghapus pengguna" }
    }
    
    // log
    await logActivity({
      user_id,
      type: "Pengguna",
      entity_type: "pengguna",
      description: `Menghapus akun ${data.username}`
    })

    return {success: true}
  } catch (error) {
    console.error("Error deleting pengguna:", error)
    return { error: "Gagal menghapus data pengguna" }
  }
}

