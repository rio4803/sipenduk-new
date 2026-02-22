"use server"

import { logActivity } from "@/lib/activity-logger"
import { supabase } from "@/app/utils/supabase"

const pageType = "Surat"

export async function getAllSurat() {
  try {
    const {data, error} = await supabase.from("surat").select("*, penduduk:id_penduduk(nama)")
    if(error){
      console.log(error);
      return []
    }

    const surat = data.map(surat => {
      const newObj = {...surat, nama_penduduk: surat.penduduk.nama}
      delete newObj.penduduk
      return newObj
    })

    return surat
  } catch (error) {
    console.error("Error getting all surat:", error)
    return []
  }
}

export async function getSuratById(id: string) {
  try {
    const {data, error} = await supabase.from("surat").select("*, penduduk:id_penduduk(nama)").eq("id", id).single()
    if(error){
      console.log(error);
      return []
    }
    const suratById = {...data, nama_penduduk: data.penduduk.nama}
    delete suratById.penduduk

    return suratById
  } catch (error) {
    console.error(`Error getting surat with jenis ${id}:`, error)
    return []
  }
}

export async function getSuratByJenis(jenis: string) {
  try {
    const {data, error} = await supabase.from("surat").select("*, penduduk:id_penduduk(nama)").eq("jenis_surat", jenis)
    if(error){
      console.log(error);
      return []
    }
    
    const suratByJenis = data.map(surat => {
      const newObj = {...surat, nama_penduduk: surat.penduduk.nama}
      delete newObj.penduduk
      return newObj
    })

    return suratByJenis
  } catch (error) {
    console.error(`Error getting surat with jenis ${jenis}:`, error)
    return []
  }
}

export async function createSurat(formData: FormData, userId: string, jenisSurat: string) {
  try {
    // Get penduduk data
    const idPenduduk = formData.get("id_penduduk")
    const now = new Date(Date.now())
    const nomorSurat = `XX/XXXX/${now.getDate()}/${now.getFullYear()}`

    // Create surat data
    const suratData = {
      id_penduduk: idPenduduk,
      jenis_surat: jenisSurat,
      nomor_surat: formData.get("nomor_surat") || nomorSurat,
      tanggal_surat: formData.get("tanggal_surat") || now.toISOString().split("T")[0],
      keterangan: formData.get("keterangan"),
      created_by: userId,
    }

    const {data, error} = await supabase.from("surat").insert(suratData).select("penduduk:id_penduduk(nama)").single()
    if(error){
      console.log(error)
      return {error: "Terjadi masalah saat membuat surat"}
    }

    const {penduduk} = data
    await logActivity({
      user_id: userId,
      type: "Surat",
      entity_type: "surat",
      description: `Membuat surat ${jenisSurat} baru untuk ${penduduk?.[0]?.nama}`,
    })

    return { success: true}
  } catch (error) {
    console.error("Error creating surat:", error)
    return { error: "Gagal membuat surat" }
  }
}

export async function updateSurat(id: string, formData: FormData, userId: string) {
  try {
    const idPenduduk = formData.get("id_penduduk")
    const updatedSurat = {
      id_penduduk: idPenduduk,
      nomor_surat: formData.get("nomor_surat"),
      tanggal_surat: formData.get("tanggal_surat"),
      keterangan: formData.get("keterangan"),
      updated_by: userId,
    }

    const {data, error} = await supabase.from("surat").update(updatedSurat).eq("id", id).select("*,penduduk:id_penduduk(nama)").single()
    if(error){
      console.log(error)
      return {error: "Terjadi masalah saat memperbarui surat"}
    }

    const logData = {jenis_surat: data.jenis_surat, nama: data.penduduk.nama}

    // Log activity
    await logActivity({
      user_id: userId,
      type: pageType,
      entity_type: pageType,
      description: `Memperbarui surat ${logData.jenis_surat} untuk ${logData.nama}`,
    })

    return { success: true }
  } catch (error) {
    console.error(`Error updating surat with id ${id}:`, error)
    return { error: "Gagal memperbarui surat" }
  }
}

export async function deleteSurat(id: string, userId: string) {
  try {
    const {data, error} = await supabase.from("surat").delete().eq("id", id).select("*, penduduk:id_penduduk(nama)").single()
    if(error){
      console.log(error)
      return {error: "Terjadi masalah saat menghapus surat"}
    }

    const logData = {jenis_surat: data.jenis_surat,nama_penduduk: data.penduduk.nama}
    // Log activity
    await logActivity({
      user_id: userId.toString(),
      type: pageType,
      entity_type: pageType,
      description: `Menghapus surat ${logData.jenis_surat} untuk ${logData.nama_penduduk}`,
    })

    return { success: true }
  } catch (error) {
    console.error(`Error deleting surat with id ${id}:`, error)
    return { error: "Gagal menghapus surat" }
  }
}

