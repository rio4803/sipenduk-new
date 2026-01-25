"use server"

import { revalidatePath } from "next/cache"
import { getRedisData, getRedisKeys, setRedisData, deleteRedisData } from "@/lib/redis-service"
import { z } from "zod"
import { AnggotaKeluarga, KartuKeluarga } from "@/lib/dummy-data"
import { supabase } from "@/app/utils/supabase"

// Schema validasi untuk kartu keluarga
const kartuKeluargaSchema = z.object({
  no_kk: z.string().min(1, "Nomor KK harus diisi"),
  kepala: z.string().min(1, "Kepala keluarga harus diisi"),
  desa: z.string().min(1, "Desa harus diisi"),
  rt: z.string().min(1, "RT harus diisi"),
  rw: z.string().min(1, "RW harus diisi"),
  kecamatan: z.string().min(1, "Kecamatan harus diisi"),
  kabupaten: z.string().min(1, "Kabupaten harus diisi"),
  provinsi: z.string().min(1, "Provinsi harus diisi"),
})

// Fungsi untuk mendapatkan semua data kartu keluarga
export async function getKartuKeluargaData() {
  try {
    const {data, error} = await supabase.from("kartu_keluarga").select("*")
    if(error){
      console.error("Error fetching kartu keluarga data:", error)
      return []
    }
    return data
  } catch (error) {
    console.error("Error fetching kartu keluarga data:", error)
    return []
  }
}

// Fungsi untuk mendapatkan data kartu keluarga berdasarkan ID
export async function getKartuKeluargaById(id: string) {
  try {
    const keluarga = await getRedisData(`kk:${id}`)

    if (!keluarga) {
      return null
    }

    return {
      id_kk: id,
      ...keluarga,
    }
  } catch (error) {
    console.error(`Error fetching kartu keluarga with ID ${id}:`, error)
    return null
  }
}

// Fungsi untuk mendapatkan anggota keluarga dengan detail
export async function getAnggotaKeluargaWithDetail(id: string) {
  try {
    const keys = await getRedisKeys("anggota:*")
    const anggotaPromises = keys.map((key) => getRedisData(key))
    const anggotaList = await Promise.all(anggotaPromises) as AnggotaKeluarga[]

    const anggotaKeluarga = anggotaList.filter((a) => a && a.id_kk.toString() === id)

    const anggotaWithDetail = await Promise.all(
      anggotaKeluarga.map(async (anggota) => {
        const penduduk = await getRedisData(`penduduk:${anggota.id_pend}`)
        return {
          ...anggota,
          penduduk: penduduk || null,
        }
      }),
    )

    // === SORTING BARU DI SINI ===
    const order = {
      "Suami": 1,   // Ayah
      "Istri": 2,
      "Anak": 3,
    }

    anggotaWithDetail.sort((a, b) => {
      const orderA = order[a.hubungan] || 99
      const orderB = order[b.hubungan] || 99
      return orderA - orderB
    })
    
    return anggotaWithDetail
  } catch (error) {
    console.error(`Error fetching anggota keluarga for ID ${id}:`, error)
    return []
  }
}

// Fungsi untuk menambahkan kartu keluarga baru dengan auto-create penduduk kepala keluarga
export async function createKartuKeluarga(formData: FormData) {
  try {

    // Validasi input KK
    const validatedFields = kartuKeluargaSchema.safeParse({
      no_kk: formData.get("no_kk"),
      kepala: formData.get("kepala"),
      desa: formData.get("desa"),
      rt: formData.get("rt"),
      rw: formData.get("rw"),
      kecamatan: formData.get("kec"),
      kabupaten: formData.get("kab"),
      provinsi: formData.get("prov"),
    })
    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const insertKK = await supabase.from("kartu_keluarga").insert({
      ...validatedFields.data
    })
    if(insertKK.error?.code == '23505'){
      return { error: "Nomor KK sudah terdaftar" }
    }

    // AUTO-CREATE PENDUDUK UNTUK KEPALA KELUARGA
    const nik_kepala = formData.get("nik_kepala")?.toString()
    const tempat_lh_kepala = formData.get("tempat_lh_kepala")?.toString()
    const tgl_lh_kepala = formData.get("tgl_lh_kepala")?.toString()
    const jekel_kepala = formData.get("jekel_kepala")?.toString()
    const agama_kepala = formData.get("agama_kepala")?.toString()
    const kawin_kepala = formData.get("kawin_kepala")?.toString()
    const pekerjaan_kepala = formData.get("pekerjaan_kepala")?.toString()

    // Create penduduk for kepala keluarga
    const newPenduduk = {
      nik: nik_kepala || "",
      nama: validatedFields.data.kepala,
      tempat_lahir: tempat_lh_kepala || "-",
      tanggal_lahir: tgl_lh_kepala || "",
      jenis_kelamin: jekel_kepala || "LK",
      desa: validatedFields.data.desa,
      rt: validatedFields.data.rt,
      rw: validatedFields.data.rw,
      kecamatan: validatedFields.data.kecamatan,
      kabupaten: validatedFields.data.kabupaten,
      provinsi: validatedFields.data.provinsi,
      agama: agama_kepala || "-",
      status_perkawinan: kawin_kepala || "Kawin",
      pekerjaan: pekerjaan_kepala || "-",
      status_penduduk: "Ada" as const,
    }
    const insertPenduduk = await supabase.from("penduduk").insert(newPenduduk)

    // BUAT AKUN PENGGUNA OTOMATIS
    const newUser = {
      username: newPenduduk.nik,
      password: generateRandomPassword(),
      role: "penduduk",
    }
    const insertNewUser = await supabase.from("pengguna").insert(newUser)
    
    // LINK KEPALA KELUARGA TO KK AS "Suami"
    const newAnggota = {
      id_kk: validatedFields.data?.no_kk,
      id_penduduk: newPenduduk.nik,
      hubungan: "Suami", // Kepala keluarga as "Suami"
    }
    const setHubungan = await supabase.from("anggota_kartu_keluarga").insert(newAnggota)

    // revalidatePath("/admin/kartu-keluarga")
    return { 
      success: true, 
      akun: {
        username: newUser.username,
        password: newUser.password,
        message: "Akun kepala keluarga berhasil dibuat"
      }
    }
  } catch (error) {
    console.error("Error creating kartu keluarga:", error)
    return { error: "Gagal menambahkan kartu keluarga" }
  }
}

// =====================================
// FUNGSI PEMBUATAN USERNAME/PASSWORD
// =====================================
function generateRandomUsername(penduduk: any) {
  return String(Date.now()).slice(-12)
}

function generateRandomPassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

// Fungsi untuk memperbarui data kartu keluarga
export async function updateKartuKeluarga(id: string, formData: FormData) {
  try {
    // Validasi input
    const validatedFields = kartuKeluargaSchema.safeParse({
      no_kk: formData.get("no_kk"),
      kepala: formData.get("kepala"),
      desa: formData.get("desa"),
      rt: formData.get("rt"),
      rw: formData.get("rw"),
      kec: formData.get("kec"),
      kab: formData.get("kab"),
      prov: formData.get("prov"),
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Periksa apakah kartu keluarga ada
    const keluarga = await getRedisData(`kk:${id}`)
    if (!keluarga) {
      return { error: "Kartu keluarga tidak ditemukan" }
    }

    // Periksa apakah Nomor KK sudah digunakan oleh kartu keluarga lain
    const keys = await getRedisKeys("kk:*")
    const keluargaPromises = keys.map((key) => getRedisData(key))
    const keluargaList = await Promise.all(keluargaPromises) as KartuKeluarga[]
    const noKKExists = keluargaList.some(
      (k) => k && k.id_kk !== Number.parseInt(id) && k.no_kk === validatedFields.data.no_kk,
    )

    if (noKKExists) {
      return { error: "Nomor KK sudah digunakan oleh kartu keluarga lain" }
    }

    // Update kartu keluarga
    const updatedKeluarga = {
      ...keluarga,
      ...validatedFields.data,
    }

    await setRedisData(`kk:${id}`, updatedKeluarga)

    revalidatePath(`/admin/kartu-keluarga/${id}`)
    revalidatePath("/admin/kartu-keluarga")
    return { success: true, data: updatedKeluarga }
  } catch (error) {
    console.error("Error updating kartu keluarga:", error)
    return { error: "Gagal memperbarui kartu keluarga" }
  }
}

// Fungsi untuk menghapus kartu keluarga
export async function deleteKartuKeluarga(id: string) {
  try {
    // Periksa apakah kartu keluarga ada
    const keluarga = await getRedisData(`kk:${id}`)
    if (!keluarga) {
      return { error: "Kartu keluarga tidak ditemukan" }
    }

    // Periksa apakah kartu keluarga memiliki anggota
    const anggotaKeluarga = await getAnggotaKeluargaWithDetail(id)
    if (anggotaKeluarga.length > 0) {
      return { error: "Kartu keluarga masih memiliki anggota, hapus anggota terlebih dahulu" }
    }

    // Hapus kartu keluarga
    await deleteRedisData(`kk:${id}`)

    revalidatePath("/admin/kartu-keluarga")
    return { success: true }
  } catch (error) {
    console.error("Error deleting kartu keluarga:", error)
    return { error: "Gagal menghapus kartu keluarga" }
  }
}

// Fungsi untuk menambahkan anggota keluarga
export async function addAnggotaKeluarga(formData: FormData) {
  console.log("formData:", formData);
  console.log("formData instanceof FormData:", formData instanceof FormData);


  try {
    const id_kk = formData.get("id_kk") as string
    const id_pend = formData.get("id_pend") as string
    const hubungan = formData.get("hubungan") as string

    if (!id_kk || !id_pend || !hubungan) {
      return { error: "Data tidak lengkap" }
    }

    // Periksa apakah kartu keluarga ada
    const keluarga = await getRedisData(`kk:${id_kk}`)
    if (!keluarga) {
      return { error: "Kartu keluarga tidak ditemukan" }
    }

    // Periksa apakah penduduk ada
    const penduduk = await getRedisData(`penduduk:${id_pend}`)
    if (!penduduk) {
      return { error: "Penduduk tidak ditemukan" }
    }

    // Periksa apakah penduduk sudah menjadi anggota keluarga
    const keys = await getRedisKeys("anggota:*")
    const anggotaPromises = keys.map((key) => getRedisData(key))
    const anggotaList = (await Promise.all(anggotaPromises)) as AnggotaKeluarga[] || [];
    console.log(anggotaList)
    const isAnggota = anggotaList.some((a) => a && a.id_pend.toString() === id_pend)

    if (isAnggota) {
      return { error: "Penduduk sudah menjadi anggota keluarga" }
    }

    // Dapatkan ID baru
    const anggotaIds = anggotaList.filter(a => a).map(a => a.id_anggota);
    console.log(anggotaIds);
    
    const newId = anggotaIds.length > 0 ? Math.max(...anggotaIds) + 1 : 1

    const newAnggota = {
      id_anggota: newId,
      id_kk,
      id_pend,
      hubungan,
    }

    // Simpan ke Redis
    await setRedisData(`anggota:${newId}`, newAnggota)

    revalidatePath(`/admin/kartu-keluarga/${id_kk}`)
    return { success: true, data: newAnggota }
  } catch (error) {
    console.error("Error adding anggota keluarga:", error)
    return { error: "Gagal menambahkan anggota keluarga" }
  }
}

// Fungsi untuk menghapus anggota keluarga
export async function removeAnggotaKeluarga(id: string) {
  try {
    // Periksa apakah anggota keluarga ada
    const anggota = await getRedisData(`anggota:${id}`) as AnggotaKeluarga
    if (!anggota) {
      return { error: "Anggota keluarga tidak ditemukan" }
    }

    // Hapus anggota keluarga
    await deleteRedisData(`anggota:${id}`)

    revalidatePath(`/admin/kartu-keluarga/${anggota.id_kk}`)
    return { success: true }
  } catch (error) {
    console.error("Error removing anggota keluarga:", error)
    return { error: "Gagal menghapus anggota keluarga" }
  }
}

