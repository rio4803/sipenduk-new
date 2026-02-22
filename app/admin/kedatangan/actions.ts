"use server"

import { supabase } from "@/app/utils/supabase"
import { logActivity } from "@/lib/activity-logger"
import z from "zod"
import { createSurat } from "../surat/actions"

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
        nama_pelapor: k.pelapor?.nama || "Administrasi",
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
      nama_pelapor: data.pelapor?.nama || "Administrasi",
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
    const dataAnggota = JSON.parse(formData.get("anggota_keluarga") as string)
    formData.append("keterangan", `Surat kedatangan dan kependudukan baru`)

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

    const password = generateRandomPassword()
    const {data: idPenduduk, error: errPenduduk} = await supabase.rpc("insert_kedatangan", {
      p_id_kk: dataPendatang.id_kk || null,
      p_nik: dataPendatang.nik,
      p_nama: dataPendatang.nama,
      p_jenis_kelamin: dataPendatang.jenis_kelamin,
      p_tempat_lahir: dataPendatang.tempat_lahir,
      p_tanggal_lahir: dataPendatang.tanggal_lahir,
      p_tanggal_datang: dataPendatang.tanggal_datang,
      p_agama: dataPendatang.agama,
      p_status_perkawinan: dataPendatang.status_perkawinan,
      p_hubungan: dataPendatang.hubungan,
      p_pekerjaan: dataPendatang.pekerjaan,
      p_pelapor: dataPendatang.pelapor || null,
      p_no_kk: dataPendatang.no_kk,
      p_desa: dataPendatang.desa,
      p_rt: dataPendatang.rt,
      p_rw: dataPendatang.rw,
      p_kabupaten: dataPendatang.kabupaten,
      p_kecamatan: dataPendatang.kecamatan,
      p_provinsi: dataPendatang.provinsi,
      p_username: dataPendatang.nik,
      p_password: password,
      p_anggota: dataAnggota || null
    })
    if(errPenduduk){
      console.log(errPenduduk)
      return {error: "Terjadi masalah saat membuat data kedatangan"}
    }

    Object.entries({
      id_penduduk: idPenduduk,
      keterangan: "Kami yang bertandatangan dibawah ini mengajukan kependudukan baru",
    }).forEach(([key, value]) => {
      formData.append(key, value)
    })

    const surat = await createSurat(formData, user_id, "kedatangan")
    if(surat.error){
      return {error: surat.error}
    }

    // log
    await logActivity({
      user_id,
      type: "Kedatangan",
      entity_type: "kedatangan",
      description: `Menambahkan data kedatangan untuk ${dataPendatang.nama}`
    })

    return {
      success: true,
      akun : {
        username: dataPendatang.nik,
        password,
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
    const id_pelapor = formData.get("pelapor")
    const pendatang = {
      tanggal_kedatangan: formData.get("tanggal_kedatangan"),
      id_pelapor: id_pelapor == "0" ? null : id_pelapor
    }

    const {error: errKedatangan} = await supabase.from("kedatangan").update(pendatang).eq("id", id)
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

