"use server"

import { getRedisData, getRedisKeys, setRedisData, deleteRedisData } from "@/lib/redis-service"
import { revalidatePath } from "next/cache"
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
    const keys = await getRedisKeys("pengumuman:*")
    const pengumumanPromises = keys.map((key) => getRedisData(key))
    const pengumumanList = await Promise.all(pengumumanPromises)

    return pengumumanList
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
  } catch (error) {
    console.error("Error fetching pengumuman data:", error)
    return []
  }
}

// Get pengumuman by ID
export async function getPengumumanById(id: number) {
  try {
    const pengumuman = await getRedisData(`pengumuman:${id}`)
    return pengumuman
  } catch (error) {
    console.error(`Error getting pengumuman with id ${id}:`, error)
    return null
  }
}

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

    // // Send push notification
    // try {
    //   await sendPushNotificationToAll({
    //     title: `Pengumuman Baru: ${judul}`,
    //     body: isi.length > 50 ? `${isi.substring(0, 50)}...` : isi,
    //     data: { url: "/dashboard/notifikasi" } // Redirect to notification/dashboard page
    //   })
    // } catch (pushError) {
    //   console.error("Failed to send push notification:", pushError)
    //   // Don't fail the request if push fails, just log it
    // }

    return { success: true }
  } catch (error) {
    console.error("Error creating pengumuman:", error)
    return { error: "Gagal membuat pengumuman" }
  }
}

// Update pengumuman
export async function updatePengumuman(id: number, formData: FormData) {
  try {
    const pengumuman = await getRedisData(`pengumuman:${id}`)

    if (!pengumuman) {
      return { error: "Pengumuman tidak ditemukan" }
    }

    const judul = formData.get("judul")?.toString()
    const isi = formData.get("isi")?.toString()

    if (!judul || !isi) {
      return { error: "Judul dan isi pengumuman harus diisi" }
    }

    const updatedPengumuman = {
      ...pengumuman,
      judul,
      isi,
    }

    await setRedisData(`pengumuman:${id}`, updatedPengumuman)

    revalidatePath("/admin/pengumuman")
    return { success: true, data: updatedPengumuman }
  } catch (error) {
    console.error("Error updating pengumuman:", error)
    return { error: "Gagal memperbarui pengumuman" }
  }
}

// Delete pengumuman
export async function deletePengumuman(id: number) {
  try {
    const pengumuman = await getRedisData(`pengumuman:${id}`)

    if (!pengumuman) {
      return { error: "Pengumuman tidak ditemukan" }
    }

    await deleteRedisData(`pengumuman:${id}`)

    revalidatePath("/admin/pengumuman")
    return { success: true }
  } catch (error) {
    console.error("Error deleting pengumuman:", error)
    return { error: "Gagal menghapus pengumuman" }
  }
}
