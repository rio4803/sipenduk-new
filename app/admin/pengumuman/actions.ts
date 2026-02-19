"use server"

import { sendPushNotificationToAll } from "@/lib/push-notification-server"
import { supabase } from "@/app/utils/supabase"

export interface Pengumuman {
  id_pengumuman: number
  judul: string
  isi: string
  tanggal: string
  penulis: string
  id_user: number
}

// Get all pengumuman
export async function getPengumumanData() {
  try {
    const {data, error} = await supabase.from("pengumuman").select("*, pengguna:penulis(username)").order("created_at", {ascending: true})
    if(error){
      console.log(error)
      return []
    }
    const pengumuman = data.map(p => {
      const newObj = {...p, username: p.pengguna.username}
      delete newObj.pengguna
      return newObj
    })
    return pengumuman

  } catch (error) {
    console.error("Error fetching pengumuman data:", error)
    return []
  }
}

// // Get pengumuman by ID
// export async function getPengumumanById(id: number) {
//   try {
//     const pengumuman = await getRedisData(`pengumuman:${id}`)
//     return pengumuman
//   } catch (error) {
//     console.error(`Error getting pengumuman with id ${id}:`, error)
//     return null
//   }
// }

// Create pengumuman
export async function createPengumuman(formData: FormData, userId: string, userName: string) {
  try {
    const judul = formData.get("judul")?.toString()
    const isi = formData.get("isi")?.toString()

    if (!judul || !isi) {
      return { error: "Judul dan isi pengumuman harus diisi" }
    }

    const newPengumuman = {
      judul,
      isi,
      tanggal: new Date().toISOString(),
      penulis: userId
    }

    const {error} = await supabase.from("pengumuman").insert(newPengumuman)
    if(error){
      console.log(error)
      return {error: "Terjadi kesalahan saat membuat pengumuman baru"}
    }

    // Send push notification
    try {
      await sendPushNotificationToAll({
        title: `Pengumuman Baru: ${judul}`,
        body: isi.length > 50 ? `${isi.substring(0, 50)}...` : isi,
        data: { url: "/dashboard/notifikasi" } // Redirect to notification/dashboard page
      })
    } catch (pushError) {
      console.error("Failed to send push notification:", pushError)
      return {error: "Something wen't wrong"}
    }

    return { success: true }
  } catch (error) {
    console.error("Error creating pengumuman:", error)
    return { error: "Gagal membuat pengumuman" }
  }
}

// // Update pengumuman
// export async function updatePengumuman(id: number, formData: FormData) {
//   try {
//     const pengumuman = await getRedisData(`pengumuman:${id}`)

//     if (!pengumuman) {
//       return { error: "Pengumuman tidak ditemukan" }
//     }

//     const judul = formData.get("judul")?.toString()
//     const isi = formData.get("isi")?.toString()

//     if (!judul || !isi) {
//       return { error: "Judul dan isi pengumuman harus diisi" }
//     }

//     const updatedPengumuman = {
//       ...pengumuman,
//       judul,
//       isi,
//     }

//     await setRedisData(`pengumuman:${id}`, updatedPengumuman)

//     revalidatePath("/admin/pengumuman")
//     return { success: true, data: updatedPengumuman }
//   } catch (error) {
//     console.error("Error updating pengumuman:", error)
//     return { error: "Gagal memperbarui pengumuman" }
//   }
// }

// Delete pengumuman
export async function deletePengumuman(id: string) {
  try {
    const {error} = await supabase.from("pengumuman").delete().eq("id", id)
    if(error){
      console.log(error)
      return {error: "Terjadi masalah saat menghapus pengumuman"}
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting pengumuman:", error)
    return { error: "Gagal menghapus pengumuman" }
  }
}
