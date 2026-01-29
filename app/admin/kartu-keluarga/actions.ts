"use server"

import { z } from "zod"
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

// password generator
function generateRandomPassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

// Fungsi untuk mendapatkan semua data kartu keluarga
// DONE
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
// DONE
export async function getKartuKeluargaById(id: string) {
  try {
    const {data, error} = await supabase.from("kartu_keluarga").select("*").eq("id", id).single()
    if (!data || error) {return null}
    return {...data}
  } catch (error) {
    console.error(`Error fetching kartu keluarga with ID ${id}:`, error)
    return null
  }
}

// Fungsi untuk mendapatkan anggota keluarga dengan detail
// DONE
export async function getAnggotaKeluargaWithDetail(id: string) {
  try {
    const {data: anggotaWithDetail, error} = await supabase.from("anggota_kartu_keluarga").select("*, penduduk:id_penduduk (*)").eq("id_kk", id)
    if(error){return []}

    // === SORTING BARU DI SINI ===
    const order = {
      Suami: 1,
      Istri: 2,
      Anak: 3,
    }
    
    anggotaWithDetail.sort((a, b) => {
      const orderA = order[a.hubungan as keyof typeof order]
      const orderB = order[b.hubungan as keyof typeof order]
      return orderA - orderB
    })
    return anggotaWithDetail
  } catch (error) {
    console.error(`Error fetching anggota keluarga for ID ${id}:`, error)
    return []
  }
}

// Fungsi untuk menambahkan kartu keluarga baru dengan auto-create penduduk kepala keluarga
// DONE
export async function createKartuKeluarga(formData: FormData) {
  try {
    // generate uuid
    const id_kk = crypto.randomUUID()
    const id_penduduk = crypto.randomUUID()

    // form validation
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
    if(!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // insert kartu keluarga ke database
    const insertKK = await supabase.from("kartu_keluarga").insert({
      id: id_kk,
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

    const newPenduduk = {
      id: id_penduduk,
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
      id_kk,
      id_penduduk,
      hubungan: newPenduduk.jenis_kelamin == "Perempuan" ? "Istri" : "Suami",
    }
    const setHubungan = await supabase.from("anggota_kartu_keluarga").insert(newAnggota)

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

// Fungsi untuk memperbarui data kartu keluarga
// DONE
export async function updateKartuKeluarga(id: string, formData: FormData) {
  try {
    // Validasi input
    const validatedFields = kartuKeluargaSchema.safeParse({
      no_kk: formData.get("no_kk"),
      kepala: formData.get("kepala"),
      desa: formData.get("desa"),
      rt: formData.get("rt"),
      rw: formData.get("rw"),
      kecamatan: formData.get("kecamatan"),
      kabupaten: formData.get("kabupaten"),
      provinsi: formData.get("provinsi"),
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // update kartu keluarga
    const updateKK = await supabase.from("kartu_keluarga").update(validatedFields.data).eq("id", id)
    if(updateKK.error?.code == "23505"){
      return { error: "Nomor KK sudah digunakan oleh kartu keluarga lain" }
    }
    
    return { success: true, data: validatedFields.data }
  } catch (error) {
    console.error("Error updating kartu keluarga:", error)
    return { error: "Gagal memperbarui kartu keluarga" }
  }
}

// Fungsi untuk menghapus kartu keluarga
// DONE
export async function deleteKartuKeluarga(id: string) {
  try {
    const deleteKK = await supabase.from("kartu_keluarga").delete().eq("id", id)
    if(deleteKK.error){
      return { error: "Terjadi masalah saat menghapus KK" }
    }
    return { success: true }
  } catch (error) {
    console.error("Error deleting kartu keluarga:", error)
    return { error: "Gagal menghapus kartu keluarga" }
  }
}

// Fungsi untuk menambahkan anggota keluarga
// DONE
export async function addAnggotaKeluarga(formData: FormData) {
  try {
    const id_kk = formData.get("id_kk") as string
    const id_penduduk = formData.get("id_penduduk") as string
    const hubungan = formData.get("hubungan") as string

    if (!id_kk || !id_penduduk || !hubungan) {
      return { error: "Data tidak lengkap" }
    }

    const addAnggota = await supabase.from("anggota_kartu_keluarga").insert({
      id_kk,
      id_penduduk,
      hubungan
    })
    if(addAnggota.error?.code == "23505" ){
      const updateAnggota = await supabase.from("anggota_kartu_keluarga").update({id_kk, id_penduduk, hubungan}).eq("id_penduduk", id_penduduk)
      if(updateAnggota.error){
        console.log(updateAnggota.error)
        return { error: "Terjadi masalah saat memperbarui anggota"}
      }
    } else if(addAnggota.error && addAnggota.error?.code != "23505") {
      console.log(addAnggota.error)
      return { error: "Terjadi masalah saat menambahkan anggota keluarga"}
    }
    
    return { error: null}
  } catch (error) {
    console.error("Error adding anggota keluarga:", error)
    return { error: "Gagal menambahkan anggota keluarga" }
  }
}

// Fungsi untuk menghapus anggota keluarga
// DONE
export async function removeAnggotaKeluarga(id: string) {
  try {
    const deleteAnggota = await supabase.from("anggota_kartu_keluarga").delete().eq("id", id)
    if(deleteAnggota.error){
      return { error: "Terjadi masalah" }
    }
    return { success: true }
  } catch (error) {
    console.error("Error removing anggota keluarga:", error)
    return { error: "Gagal menghapus anggota keluarga" }
  }
}

