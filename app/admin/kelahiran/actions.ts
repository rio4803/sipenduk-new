"use server"

import { getRedisData, getRedisKeys, setRedisData, deleteRedisData } from "@/lib/redis-service"
import { getKartuKeluargaById } from "@/lib/redis-helpers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { logActivity } from "@/lib/activity-logger"
import { supabase } from "@/app/utils/supabase"

// get data kelahiran
// DONE
export async function getKelahiranData() {
  try {
    const {data: arrayKelahiran, error} = await supabase.from("kelahiran").select("id, penduduk:id_penduduk (nik, nama, tanggal_lahir, jenis_kelamin), kartu_keluarga:id_kk (kepala)")
    if(error){
      console.log(error)
      return []
    }
    const dataKelahiran = arrayKelahiran.map(kelahiran => ({...kelahiran.penduduk, ...kelahiran.kartu_keluarga, id: kelahiran.id}))
    return dataKelahiran
  } catch (error) {
    console.error("Error fetching kelahiran data:", error)
    throw new Error("Gagal mengambil data kelahiran")
  }
}

// get kelahiran by id
// DONE
export async function getKelahiranById(id: string) {
  try {
    const {data: kelahiran, error} = await supabase.from("kelahiran").select("id, id_kk, penduduk:id_penduduk (*), kartu_keluarga:id_kk (kepala)").eq("id", id).single()
    if(error){
      console.log(error)
      return null
    }

    const dataKelahiran = {...kelahiran.penduduk, ...kelahiran.kartu_keluarga, id: kelahiran.id, id_kk: kelahiran.id_kk}
    return dataKelahiran
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

// create kelahiran
// DONE
export async function createKelahiran(formData: FormData, userId: number) {
  try {
    const id_kk = formData.get("id_kk")
    const newUserData = {
      nik: formData.get("nik") || null,
      nama: formData.get("nama") || null,
      tanggal_lahir: formData.get("tanggal_lahir") || null,
      jenis_kelamin: formData.get("jenis_kelamin") || null,
      tempat_lahir: formData.get("tempat_lahir") || null,
      desa: formData.get("desa") || null,
      rt: formData.get("rt") || null,
      rw: formData.get("rw") || null,
      agama: formData.get("agama") || null
    }
    const insertPenduduk = await supabase.from("penduduk").insert(newUserData).select().single()
    if(insertPenduduk.error){
      console.log(insertPenduduk.error)
      if(insertPenduduk.error.code == "23505"){
        return {error: "NIK telah terdaftar"}
      }
      return {error: "Terjadi masalah saat menambahkan penduduk"}
    }
    
    const anggota = {
      id_penduduk: insertPenduduk.data.id,
      id_kk,
      hubungan: "Anak"
    }
    const insertAnggota = await supabase.from("anggota_kartu_keluarga").insert(anggota)
    if(insertAnggota.error){
      console.log(insertAnggota.error)
      if(insertAnggota.error.code == "23505"){
        return {error: "NIK telah terdaftar"}
      }
      return {error: "Terjadi masalah saat menambahkan anggota keluarga"}
    }
    
    const kelahiran = {
      id_penduduk: insertPenduduk.data.id,
      id_kk
    }
    const insertKelahiran = await supabase.from("kelahiran").insert(kelahiran)
    if(insertKelahiran.error){
      console.log(insertKelahiran.error)
      if(insertKelahiran.error.code == "23505"){
        return {error: "NIK telah terdaftar"}
      }
      return {error: "Terjadi masalah saat menambahkan data kelahiran"}
    }

    return {success: "berhasil"}
  } catch (err) {
    console.error(err)
    return { error: "Gagal menambahkan data kelahiran" }
  }
}


export async function updateKelahiran(id: string, formData: FormData, userId: number) {
  try {
    // VALIDASI WAJIB
    const validated = kelahiranSchema.safeParse({
      nama: formData.get("nama"),
      tanggal_lahir: formData.get("tanggal_lahir"),
      jenis_kelamin: formData.get("jenis_kelamin"),
      id_kk: formData.get("id_kk"),
    })

    if (!validated.success) {
      return {
        error: "Validasi gagal",
        errors: validated.error.flatten().fieldErrors,
      }
    }

    const { id_kk } = validated.data

    const newPenduduk = {
      nama: validated.data.nama
      tanggal_lahir: validated.data.tanggal_lahir
      nama: validated.data.nama
    }
    const nik = formData.get("nik")?.toString()
    const tempat_lahir = formData.get("tempat_lh")
    const desa = formData.get("desa")?.toString()
    const rt = formData.get("rt")?.toString()
    const rw = formData.get("rw")?.toString()
    const agama = formData.get("agama")?.toString()

    const updatePenduduk = await supabase.from("penduduk").update({
      
    })

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
    // await logActivity({
    //   userId,
    //   type: "Kelahiran",
    //   description: `Memperbarui data kelahiran untuk ${nama}`,
    //   entityId: id,
    //   entityType: "kelahiran",
    // })

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