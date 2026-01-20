"use server"

import { getRedisData, getRedisKeys, setRedisData, deleteRedisData } from "@/lib/redis-service"
import { revalidatePath } from "next/cache"
import { sendPushNotificationToAll } from "@/lib/push-notification-server"

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
export async function createPengumuman(formData: FormData, userId: number, userName: string) {
  try {
    const judul = formData.get("judul")?.toString()
    const isi = formData.get("isi")?.toString()

    if (!judul || !isi) {
      return { error: "Judul dan isi pengumuman harus diisi" }
    }

    // Get new ID
    const keys = await getRedisKeys("pengumuman:*")
    const pengumumanList = await Promise.all(keys.map((key) => getRedisData(key)))
    const pengumumanIds = pengumumanList.map((p) => (p ? p.id_pengumuman : 0))
    const newId = pengumumanIds.length > 0 ? Math.max(...pengumumanIds) + 1 : 1

    const newPengumuman = {
      id_pengumuman: newId,
      judul,
      isi,
      tanggal: new Date().toISOString(),
      penulis: userName,
      id_user: userId,
    }

    await setRedisData(`pengumuman:${newId}`, newPengumuman)

    // Send push notification
    try {
      await sendPushNotificationToAll({
        title: `Pengumuman Baru: ${judul}`,
        body: isi.length > 50 ? `${isi.substring(0, 50)}...` : isi,
        data: { url: "/dashboard/notifikasi" } // Redirect to notification/dashboard page
      })
    } catch (pushError) {
      console.error("Failed to send push notification:", pushError)
      // Don't fail the request if push fails, just log it
    }

    revalidatePath("/admin/pengumuman")
    return { success: true, data: newPengumuman }
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
