"use server"

import { getRedisData, getRedisKeys, setRedisData, deleteRedisData } from "@/lib/redis-service"
import { getPendudukById } from "@/lib/redis-helpers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { logActivity } from "@/lib/activity-logger"

export async function getKematianData() {
  try {
    // Ambil data kematian dari Redis
    const keys = await getRedisKeys("kematian:*")
    const kematianPromises = keys.map((key) => getRedisData(key))
    const kematianList = await Promise.all(kematianPromises)

    // Tambahkan informasi penduduk
    const kematianWithPenduduk = await Promise.all(
      kematianList.map(async (k) => {
        if (!k) return null

        const penduduk = await getPendudukById(k.id_pdd)
        return {
          ...k,
          penduduk: penduduk ? penduduk.nama : "-",
        }
      }),
    )
    return kematianWithPenduduk.filter(Boolean)
  } catch (error) {
    console.error("Error fetching kematian data:", error)
    throw new Error("Gagal mengambil data kematian")
  }
}

export async function getKematianById(id: number) {
  try {
    const kematian = await getRedisData(`kematian:${id}`)

    if (!kematian) {
      return null
    }

    const penduduk = await getPendudukById(kematian.id_pdd)

    return {
      ...kematian,
      penduduk_nama: penduduk ? penduduk.nama : "-",
      penduduk: penduduk,
    }
  } catch (error) {
    console.error(`Error getting kematian with id ${id}:`, error)
    throw new Error("Gagal mengambil data kematian")
  }
}

// Schema validasi untuk kematian
const kematianSchema = z.object({
  id_pdd: z.string().min(1, "Penduduk harus dipilih"),
  tgl_mendu: z.string().min(1, "Tanggal meninggal harus diisi"),
  sebab: z.string().min(1, "Sebab harus diisi"),
})

export async function createKematian(formData: FormData, userId: number) {
  try {
    // Validasi input
    const validatedFields = kematianSchema.safeParse({
      id_pdd: formData.get("id_pdd"),
      tgl_mendu: formData.get("tgl_mendu"),
      sebab: formData.get("sebab"),
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Periksa apakah penduduk ada
    const penduduk = await getPendudukById(Number.parseInt(validatedFields.data.id_pdd))
    if (!penduduk) {
      return { error: "Penduduk tidak ditemukan" }
    }

    // Periksa apakah penduduk sudah meninggal
    if (penduduk.status === "Meninggal") {
      return { error: "Penduduk sudah tercatat meninggal" }
    }

    // Periksa apakah penduduk sudah pindah
    if (penduduk.status === "Pindah") {
      return { error: "Penduduk sudah tercatat pindah" }
    }

    // Dapatkan ID baru
    const keys = await getRedisKeys("kematian:*")
    const kematianPromises = keys.map((key) => getRedisData(key))
    const kematianList = await Promise.all(kematianPromises)
    const kematianIds = kematianList.map((k) => (k ? k.id_mendu : 0))
    const newId = kematianIds.length > 0 ? Math.max(...kematianIds) + 1 : 1

    const newKematian = {
      id_mendu: newId,
      id_pdd: Number.parseInt(validatedFields.data.id_pdd),
      tgl_mendu: validatedFields.data.tgl_mendu,
      sebab: validatedFields.data.sebab,
    }

    // Simpan ke Redis
    await setRedisData(`kematian:${newId}`, newKematian)

    // Update status penduduk menjadi "Meninggal"
    await setRedisData(`penduduk:${penduduk.id_pend}`, {
      ...penduduk,
      status: "Meninggal",
    })

    // Log activity
    await logActivity({
      userId,
      type: "Kematian",
      description: `Menambahkan data kematian untuk ${penduduk.nama}`,
      entityId: newId,
      entityType: "kematian",
    })

    revalidatePath("/admin/kematian")
    revalidatePath("/admin/penduduk")
    return { success: true, data: newKematian }
  } catch (error) {
    console.error("Error creating kematian:", error)
    return { error: "Gagal menambahkan data kematian" }
  }
}

export async function updateKematian(id: number, formData: FormData, userId: number) {
  try {
    // Validasi input
    const validatedFields = kematianSchema.safeParse({
      id_pdd: formData.get("id_pdd"),
      tgl_mendu: formData.get("tgl_mendu"),
      sebab: formData.get("sebab"),
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Periksa apakah kematian ada
    const kematian = await getRedisData(`kematian:${id}`)
    if (!kematian) {
      return { error: "Data kematian tidak ditemukan" }
    }

    // Periksa apakah penduduk ada
    const penduduk = await getPendudukById(Number.parseInt(validatedFields.data.id_pdd))
    if (!penduduk) {
      return { error: "Penduduk tidak ditemukan" }
    }

    // Jika penduduk berubah, kembalikan status penduduk lama dan update status penduduk baru
    if (kematian.id_pdd !== Number.parseInt(validatedFields.data.id_pdd)) {
      // Kembalikan status penduduk lama menjadi "Ada"
      const oldPenduduk = await getPendudukById(kematian.id_pdd)
      if (oldPenduduk && oldPenduduk.status === "Meninggal") {
        await setRedisData(`penduduk:${oldPenduduk.id_pend}`, {
          ...oldPenduduk,
          status: "Ada",
        })
      }

      // Update status penduduk baru menjadi "Meninggal"
      await setRedisData(`penduduk:${penduduk.id_pend}`, {
        ...penduduk,
        status: "Meninggal",
      })
    }

    // Update kematian
    const updatedKematian = {
      ...kematian,
      id_pdd: Number.parseInt(validatedFields.data.id_pdd),
      tgl_mendu: validatedFields.data.tgl_mendu,
      sebab: validatedFields.data.sebab,
    }

    await setRedisData(`kematian:${id}`, updatedKematian)

    // Log activity
    await logActivity({
      userId,
      type: "Kematian",
      description: `Memperbarui data kematian untuk ${penduduk.nama}`,
      entityId: id,
      entityType: "kematian",
    })

    revalidatePath("/admin/kematian")
    revalidatePath("/admin/penduduk")
    return { success: true, data: updatedKematian }
  } catch (error) {
    console.error("Error updating kematian:", error)
    return { error: "Gagal memperbarui data kematian" }
  }
}

export async function deleteKematian(id: number, userId: number) {
  try {
    // Periksa apakah kematian ada
    const kematian = await getRedisData(`kematian:${id}`)
    if (!kematian) {
      return { error: "Data kematian tidak ditemukan" }
    }

    // Kembalikan status penduduk menjadi "Ada"
    const penduduk = await getPendudukById(kematian.id_pdd)
    if (penduduk && penduduk.status === "Meninggal") {
      await setRedisData(`penduduk:${penduduk.id_pend}`, {
        ...penduduk,
        status: "Ada",
      })
    }

    // Hapus kematian
    await deleteRedisData(`kematian:${id}`)

    // Log activity
    await logActivity({
      userId,
      type: "Kematian",
      description: `Menghapus data kematian ${penduduk ? `untuk ${penduduk.nama}` : ""}`,
      entityId: id,
      entityType: "kematian",
    })

    revalidatePath("/admin/kematian")
    revalidatePath("/admin/penduduk")
    return { success: true }
  } catch (error) {
    console.error("Error deleting kematian:", error)
    return { error: "Gagal menghapus data kematian" }
  }
}

