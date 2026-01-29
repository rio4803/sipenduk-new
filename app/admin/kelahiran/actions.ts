"use server"

import { getRedisData, getRedisKeys, setRedisData, deleteRedisData } from "@/lib/redis-service"
import { getKartuKeluargaById } from "@/lib/redis-helpers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { logActivity } from "@/lib/activity-logger"

export async function getKelahiranData() {
  try {
    // Ambil data kelahiran dari Redis
    const keys = await getRedisKeys("kelahiran:*")
    const kelahiranPromises = keys.map((key) => getRedisData(key))
    const kelahiranList = await Promise.all(kelahiranPromises)

    // Tambahkan informasi keluarga
    const kelahiranWithKeluarga = await Promise.all(
      kelahiranList.map(async (k) => {
        if (!k) return null

        const kk = await getKartuKeluargaById(k.id_kk)
        return {
          ...k,
          keluarga: kk ? kk.kepala : "-",
        }
      }),
    )

    console.log(kelahiranWithKeluarga);
    return kelahiranWithKeluarga
  } catch (error) {
    console.error("Error fetching kelahiran data:", error)
    throw new Error("Gagal mengambil data kelahiran")
  }
}

export async function getKelahiranById(id: number) {
  try {
    const kelahiran = await getRedisData(`kelahiran:${id}`)

    if (!kelahiran) {
      return null
    }

    const kk = await getKartuKeluargaById(kelahiran.id_kk)

    return {
      ...kelahiran,
      keluarga_nama: kk ? kk.kepala : "-",
    }
  } catch (error) {
    console.error(`Error getting kelahiran with id ${id}:`, error)
    throw new Error("Gagal mengambil data kelahiran")
  }
}

// Schema validasi untuk kelahiran
const kelahiranSchema = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
  tanggal_lahir: z.string().min(1, "Tanggal lahir harus diisi"),
  jenis_kelamin: z.enum(["LK", "PR"], {
    errorMap: () => ({ message: "Jenis kelamin harus dipilih" }),
  }),
  id_kk: z.string().min(1, "Kartu keluarga harus dipilih"),
})

export async function createKelahiran(formData: FormData, userId: number) {
  try {
    // =====================================
    // VALIDASI + FIELD BARU
    // =====================================
    // const validated = kelahiranSchema.safeParse({
    //   nama: formData.get("nama"),
    //   tanggal_lahir: formData.get("tgl_lh"),
    //   jenis_kelamin: formData.get("jekel"),
    //   id_kk: formData.get("id_kk"),
    // })

    // if (!validated.success) {
    //   return { error: "Validasi gagal", errors: validated.error.flatten().fieldErrors }
    // }

    const dataField = {
      nama: formData.get("nama") || null,
      tanggal_lahir: formData.get("tanggal_lahir") || null,
      jenis_kelamin: formData.get("jenis_kelamin") || null,
      id_kk: formData.get("id_kk") || null,
      nik: formData.get("nik") || null,
      tempat_lh: formData.get("tempat_lh") || null,
      desa: formData.get("desa") || null,
      rt: formData.get("rt") || null,
      rw: formData.get("rw") || null,
      agama: formData.get("agama") || null
    }
    console.log(dataField)
    return {error: "Terjadi masalah"}
    // =====================================
    // BUAT ID PENDUDUK BARU
    // =====================================
    const pendudukKeys = await getRedisKeys("penduduk:*")
    const pendudukList = await Promise.all(pendudukKeys.map(k => getRedisData(k)))
    const pendudukIds = pendudukList.map(p => (p ? p.id_pend : 0))
    const newPendId = pendudukIds.length > 0 ? Math.max(...pendudukIds) + 1 : 1

    // =====================================
    // SIMPAN DATA PENDUDUK BARU (LENGKAP)
    // =====================================
    const newPenduduk = {
      id_pend: newPendId,
      nik,              // 🔵 DITAMBAHKAN
      nama,
      tempat_lh,        // 🔵 DITAMBAHKAN
      tgl_lh,
      jekel,
      desa,             // 🔵 DITAMBAHKAN
      rt,               // 🔵 DITAMBAHKAN
      rw,               // 🔵 DITAMBAHKAN
      agama,            // 🔵 DITAMBAHKAN
      kawin: "Belum Kawin",
      pekerjaan: "-",
      status: "Ada",
    }

    await setRedisData(`penduduk:${newPendId}`, newPenduduk)

    // =====================================
    // BUAT AKUN PENGGUNA OTOMATIS
    // =====================================
    const username = generateRandomUsername(newPenduduk)
    const password = generateRandomPassword()

    const newUser = {
      id_user: newPendId,
      username,
      password,
      role: "penduduk",
      id_pend: newPendId,
    }

    await setRedisData(`user:${newPendId}`, newUser)

    // =====================================
    // SIMPAN DATA KELAHIRAN (DITAMBAHKAN FIELD BARU)
    // =====================================
    const birthKeys = await getRedisKeys("kelahiran:*")
    const birthList = await Promise.all(birthKeys.map(k => getRedisData(k)))
    const birthIds = birthList.map(b => (b ? b.id_lahir : 0))
    const newBirthId = birthIds.length > 0 ? Math.max(...birthIds) + 1 : 1

    const newKelahiran = {
      id_lahir: newBirthId,
      nama,
      tgl_lh,
      jekel,
      id_kk: Number(id_kk),
      id_pend: newPendId,
      id_user: newPendId, // 🔵 TAMBAH FIELD id_user untuk tracking user account

      // 🔵 TAMBAH FIELD BARU AGAR SAMA DENGAN PENDUDUK
      nik,
      tempat_lh,
      desa,
      rt,
      rw,
      agama,
    }

    await setRedisData(`kelahiran:${newBirthId}`, newKelahiran)

    // =====================================
    // TAMBAHKAN KE ANGGOTA KELUARGA
    // =====================================
    await autoAddAnggotaKeluarga(Number(id_kk), newPendId)

    revalidatePath("/admin/kelahiran")

    return { 
      success: true,
      data: newKelahiran,
      akun: {
        username,
        password,
        message: "Akun pengguna berhasil dibuat"
      }
    }

  } catch (err) {
    console.error(err)
    return { error: "Gagal menambahkan data kelahiran" }
  }
}

// ===============================
// FUNGSI PEMBUATAN USERNAME/PASSWORD
// ===============================
function generateRandomUsername(penduduk: any) {
  // contoh: gunakan timestamp atau random digit
  return String(Date.now()).slice(-12)
}

function generateRandomPassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

// =====================================
// FUNGSI OTOMATIS TAMBAHKAN ANGGOTA KELUARGA
// =====================================
async function autoAddAnggotaKeluarga(id_kk: number, id_pend: number) {
  try {
    // Pastikan KK ada
    const kk = await getRedisData(`kk:${id_kk}`)
    if (!kk) {
      console.error("KK tidak ditemukan dalam autoAddAnggotaKeluarga")
      return
    }

    // Ambil semua anggota keluarga
    const keys = await getRedisKeys("anggota:*")
    const anggotaList = await Promise.all(keys.map(key => getRedisData(key)))

    // Cek apakah penduduk sudah ada di anggota keluarga
    const isAnggota = anggotaList.some(
      a => a && a.id_pend.toString() === id_pend.toString()
    )

    if (isAnggota) {
      console.log("Penduduk sudah anggota keluarga, skip")
      return
    }

    // Tentukan ID anggota baru
    const anggotaIds = anggotaList
      .filter(a => a)
      .map(a => a.id_anggota)

    const newId = anggotaIds.length > 0 ? Math.max(...anggotaIds) + 1 : 1

    // Data anggota baru
    const newAnggota = {
      id_anggota: newId,
      id_kk,
      id_pend,
      hubungan: "Anak",   // default untuk data kelahiran
    }

    // Simpan data anggota keluarga
    await setRedisData(`anggota:${newId}`, newAnggota)

    console.log("Anggota keluarga otomatis ditambahkan:", newAnggota)

  } catch (error) {
    console.error("Gagal menambah anggota keluarga otomatis:", error)
  }
}

export async function updateKelahiran(id: number, formData: FormData, userId: number) {
  try {
    // =====================================
    // VALIDASI WAJIB
    // =====================================
    const validated = kelahiranSchema.safeParse({
      nama: formData.get("nama"),
      tgl_lh: formData.get("tgl_lh"),
      jekel: formData.get("jekel"),
      id_kk: formData.get("id_kk"),
    })

    if (!validated.success) {
      return {
        error: "Validasi gagal",
        errors: validated.error.flatten().fieldErrors,
      }
    }

    const { nama, tgl_lh, jekel, id_kk } = validated.data

    // =====================================
    // AMBIL DATA KELAHIRAN SEBELUMNYA
    // =====================================
    const oldData = await getRedisData(`kelahiran:${id}`)
    if (!oldData) return { error: "Data kelahiran tidak ditemukan" }

    const oldKK = oldData.id_kk
    const idPend = oldData.id_pend // penduduk terkait

    // =====================================
    // FIELD BARU (TANPA VALIDASI KETAT)
    // =====================================
    const nik = formData.get("nik")?.toString() || oldData.nik
    const tempat_lh = formData.get("tempat_lh")?.toString() || oldData.tempat_lh
    const desa = formData.get("desa")?.toString() || oldData.desa
    const rt = formData.get("rt")?.toString() || oldData.rt
    const rw = formData.get("rw")?.toString() || oldData.rw
    const agama = formData.get("agama")?.toString() || oldData.agama

    // =====================================
    // UPDATE DATA PENDUDUK
    // =====================================
    const penduduk = await getRedisData(`penduduk:${idPend}`)

    if (penduduk) {
      const updatedPenduduk = {
        ...penduduk,
        nik,
        nama,
        tempat_lh,
        tgl_lh,
        jekel,
        desa,
        rt,
        rw,
        agama,
      }

      await setRedisData(`penduduk:${idPend}`, updatedPenduduk)
    }

    // =====================================
    // UPDATE DATA KELAHIRAN
    // =====================================
    const updatedKelahiran = {
      ...oldData,
      nama,
      tgl_lh,
      jekel,
      id_kk: Number(id_kk),

      // field baru agar konsisten
      nik,
      tempat_lh,
      desa,
      rt,
      rw,
      agama,
    }

    await setRedisData(`kelahiran:${id}`, updatedKelahiran)

    // =====================================
    // UPDATE DATA ANGGOTA KELUARGA (PINDAH KK)
    // =====================================
    if (Number(id_kk) !== oldKK) {
      // pindah KK → update anggota keluarga
      const anggotaKeys = await getRedisKeys("anggota:*")
      const anggotaList = await Promise.all(anggotaKeys.map(k => getRedisData(k)))

      const anggota = anggotaList.find(a => a && a.id_pend === idPend)

      if (anggota) {
        const updatedAnggota = {
          ...anggota,
          id_kk: Number(id_kk),
        }

        await setRedisData(`anggota:${anggota.id_anggota}`, updatedAnggota)
      }
    }

    // =====================================
    // LOG AKTIVITAS
    // =====================================
    await logActivity({
      userId,
      type: "Kelahiran",
      description: `Memperbarui data kelahiran untuk ${nama}`,
      entityId: id,
      entityType: "kelahiran",
    })

    revalidatePath("/admin/kelahiran")

    return { success: true, data: updatedKelahiran }

  } catch (error) {
    console.error("Error updating kelahiran:", error)
    return { error: "Gagal memperbarui data kelahiran" }
  }
}

export async function deleteKelahiran(id: number, userId: number) {
  try {
    // Periksa apakah kelahiran ada
    const kelahiran = await getRedisData(`kelahiran:${id}`)
    if (!kelahiran) {
      return { error: "Data kelahiran tidak ditemukan" }
    }

    // Hapus kelahiran
    await deleteRedisData(`kelahiran:${id}`)

    // Log activity
    await logActivity({
      userId,
      type: "Kelahiran",
      description: `Menghapus data kelahiran ${kelahiran.nama}`,
      entityId: id,
      entityType: "kelahiran",
    })

    revalidatePath("/admin/kelahiran")
    return { success: true }
  } catch (error) {
    console.error("Error deleting kelahiran:", error)
    return { error: "Gagal menghapus data kelahiran" }
  }
}