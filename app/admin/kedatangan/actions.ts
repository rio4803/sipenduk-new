"use server"

import { supabase } from "@/app/utils/supabase"
import { logActivity } from "@/lib/activity-logger"
import z from "zod"

// read kedatangan
// DONE
export async function getKedatanganData() {
  try {
    const {data: dataKedatangan, error: errKedatangan} = await supabase.from("kedatangan").select("*, penduduk:penduduk!id_penduduk (nik, nama, jenis_kelamin), pelapor:penduduk!id_pelapor(nama)")
    if(errKedatangan){
      console.log(errKedatangan);
      return []
    }
    
    const kedatangan = dataKedatangan.map(k => {
      const newObj = {
        nama_pelapor: k.pelapor.nama,
        nik: k.penduduk.nik,
        nama_pendatang: k.penduduk.nama,
        jenis_kelamin: k.penduduk.jenis_kelamin,
        ...k
      }
      delete newObj.penduduk
      delete newObj.pelapor
      return newObj
    })
    return kedatangan
  } catch (error) {
    console.error("Error fetching kedatangan data:", error)
    throw new Error("Gagal mengambil data kedatangan")
  }
}

// read kedatangan by id
// DONE
export async function getKedatanganById(id: string) {
  try {
    const {data, error: errKedatangan} = await supabase
      .from("kedatangan")
      .select("*, penduduk:penduduk!id_penduduk (nik, nama, jenis_kelamin), pelapor:penduduk!id_pelapor(nama)")
      .eq("id", id)
      .single()
    if(errKedatangan){
      console.log(errKedatangan);
      return []
    }
    
    const kedatangan = {
      nama_pelapor: data.pelapor.nama,
      nik: data.penduduk.nik,
      nama_pendatang: data.penduduk.nama,
      jenis_kelamin: data.penduduk.jenis_kelamin,
      ...data
    }

    return kedatangan
  } catch (error) {
    console.error(`Error getting kedatangan with id ${id}:`, error)
    throw new Error("Gagal mengambil data kedatangan")
  }
}

// Schema validasi untuk kedatangan
const kedatanganSchema = z.object({
  nik: z.string().min(1, "NIK harus diisi"),
  nama: z.string().min(1, "Nama harus diisi"),
  jenis_kelamin: z.enum(["LK", "PR"], {
    error: () => ({ message: "Jenis kelamin harus dipilih" }),
  }),
  tanggal_kedatangan: z.string().min(1, "Tanggal datang harus diisi"),
})

// create kedatangan
// DONE
export async function createKedatangan(formData: FormData, user_id: string) {
  try {
    const dataPendatang = JSON.parse(formData.get("data_pendatang") as string)
    const anggota = JSON.parse(formData.get("anggota_keluarga") as string)

    // Validasi input
    const validatedFields = kedatanganSchema.safeParse({
      nik: dataPendatang.nik,
      nama: dataPendatang.nama,
      jenis_kelamin: dataPendatang.jenis_kelamin,
      tanggal_kedatangan: dataPendatang.tanggal_datang,
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    if(dataPendatang.id_kk){
      console.log("insert penduduk")
    } else {
      console.log("insert kk")
    }
    return {error: "true"}
    const penduduk = {
      nik: validatedFields.data.nik,
      nama: validatedFields.data.nama,
      jenis_kelamin: validatedFields.data.jenis_kelamin
    }
    const {data: newPenduduk, error: errNewPenduduk} = await supabase.from("penduduk").insert(penduduk).select().single()
    if(errNewPenduduk && errNewPenduduk.code == "23505"){
      return {error: "NIK Sudah terdaftar"}
    } else if (errNewPenduduk && errNewPenduduk.code != "23505") {
      console.log(errNewPenduduk)
    }

    const id_kk = formData.get("id_kk") || null
    if(id_kk){
      const {error: errAnggota} = await supabase.from("anggota_kartu_keluarga").insert({id_penduduk: newPenduduk.id, id_kk}).select().single()
      if(errAnggota){
        console.log(errAnggota);
        return {error: "Terjadi masalah saat menambahkan anggota"}
      }
    }
    
    const kedatangan = {
      id_penduduk: newPenduduk.id,
      id_kk,
      id_pelapor: validatedFields.data.id_pelapor,
      tanggal_kedatangan: validatedFields.data.tanggal_kedatangan
    }
    const {error: errKedatangan} = await supabase.from("kedatangan").insert(kedatangan)
    if(errKedatangan){
      console.log(errKedatangan);
      return {error: "Terjadi masalah saat menambahkan kedatangan"}
    }
    
    const username = validatedFields.data.nik
    const password = generateRandomPassword()
    const {error: errPengguna} = await supabase.from("pengguna").insert({username, password, id_penduduk: newPenduduk.id, name: newPenduduk.nama})
    if(errPengguna){
      console.log(errPengguna);
      return {error: "Terjadi masalah saat menambahkan Pengguna"}
    }

    // log
    await logActivity({
      user_id,
      type: "Kedatangan",
      entity_type: "kedatangan",
      description: `Menambahkan data kedatangan untuk ${newPenduduk.nama}`
    })

    return {
      success: true,
      akun : {
        username, password,
        message: "Akun berhasil dibuat"
      }
    }
  } catch (error) {
    console.error("Error creating kedatangan:", error)
    return { error: "Gagal menambahkan data kedatangan" }
  }
}

function generateRandomPassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

export async function updateKedatangan(id: string, formData: FormData, user_id: string) {
  try {
    // Validasi input
    const validatedFields = kedatanganSchema.safeParse({
      nik: formData.get("nik"),
      nama: formData.get("nama_datang"),
      jenis_kelamin: formData.get("jekel"),
      tanggal_kedatangan: formData.get("tgl_datang"),
      id_pelapor: formData.get("pelapor"),
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const penduduk = {
      nik: validatedFields.data.nik,
      nama: validatedFields.data.nama,
      jenis_kelamin: validatedFields.data.jenis_kelamin
    }
    const {data: newPenduduk, error: errNewPenduduk} = await supabase.from("penduduk").update(penduduk).eq("id", id).select().single()
    if(errNewPenduduk && errNewPenduduk.code == "23505"){
      return {error: "NIK Sudah terdaftar"}
    } else if (errNewPenduduk && errNewPenduduk.code != "23505") {
      console.log(errNewPenduduk)
    }

    const kedatangan = {
      id_pelapor: validatedFields.data.id_pelapor,
      tanggal_kedatangan: validatedFields.data.tanggal_kedatangan
    }
    const {error: errKedatangan} = await supabase.from("kedatangan").update(kedatangan).eq("id", id)
    if(errKedatangan){
      console.log(errKedatangan);
      return {error: "Terjadi masalah saat menambahkan kedatangan"}
    }
    
    return { success: true }
  } catch (error) {
    console.error("Error updating kedatangan:", error)
    return { error: "Gagal memperbarui data kedatangan" }
  }
}

// delete data kedatangan
// DONE
export async function deletePendatang(id: string, user_id: string) {
  try {
    const {data: pendatang, error} = await supabase.from("kedatangan").delete().eq("id", id).select("penduduk:id_penduduk(nama)").single()
    if(error){
      console.log(error)
      return {error: "Terjadi masalah saat menghapus data kedatangan"}
    }

    const nama = pendatang.penduduk[0].nama

    // log
    await logActivity({
      user_id,
      type: "Kedatangan",
      entity_type: "kedatangan",
      description: `Menghapus data kedatangan untuk ${nama}`
    })
    return { success: true }
  } catch (error) {
    console.error("Error deleting kedatangan:", error)
    return { error: "Gagal menghapus data kedatangan" }
  }
}

