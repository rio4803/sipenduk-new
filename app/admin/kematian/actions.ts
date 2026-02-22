"use server"

import { z } from "zod"
import { logActivity } from "@/lib/activity-logger"
import { supabase } from "@/app/utils/supabase"
import { error } from "console"
import { createSurat } from "../surat/actions"

// read kematian
// DONE
export async function getKematianData() {
  try {
    const {data: dataKematian, error} = await supabase.from("kematian").select("*, penduduk:id_penduduk (*)")
    if(error){
      console.log(error);
      return []
    }
    const kematian = dataKematian.map(k => {
      const newObject = {...k.penduduk, ...k, id_penduduk: k.penduduk.id }
      delete newObject.penduduk
      return newObject
    })
    return kematian
  } catch (error) {
    console.error("Error fetching kematian data:", error)
    throw new Error("Gagal mengambil data kematian")
  }
}

// read kematian by id
// DONE
export async function getKematianById(id: string) {
  try {
    const {data: dataKematian, error} = await supabase.from("kematian").select("*, penduduk:id_penduduk(*)").eq("id", id).single()
    if (error) {
      console.log(error)
      return null
    }
    const kematian = {...dataKematian.penduduk, ...dataKematian, id_penduduk: dataKematian.penduduk.id}
    delete kematian.penduduk
    return kematian
  } catch (error) {
    console.error(`Error getting kematian with id ${id}:`, error)
    throw new Error("Gagal mengambil data kematian")
  }
}

// Schema validasi untuk kematian
const kematianSchema = z.object({
  id_penduduk: z.string().min(1, "Penduduk harus dipilih"),
  tanggal_kematian: z.string().min(1, "Tanggal meninggal harus diisi"),
  sebab_kematian: z.string().min(1, "Sebab harus diisi"),
})

// create kematian
// DONE
export async function createKematian(formData: FormData, userId: string) {
  /**
   * insert kematian
   * update status penduduk
   * delete pengguna
   */
  const dataKematian = JSON.parse(formData.get("data_kematian") as string)
  const {error} = await supabase.rpc("insert_kematian", {
    p_id_penduduk: dataKematian.id_penduduk,
    p_tanggal_kematian: dataKematian.tanggal_kematian,
    p_sebab_kematian: dataKematian.sebab_kematian,
  })
  if(error){
    console.log({errKematian: error})
    return {error: "Terjadi kesalahan"}
  }

  formData.append("id_penduduk", dataKematian.id_penduduk)
  formData.append("keterangan", "Surat pernyataan kematian")
  const surat = await createSurat(formData, userId, "kematian")

  //   // Log activity
    await logActivity({
      user_id: userId,
      type: "Kematian",
      description: `Menambahkan data kematian untuk ${formData.get("nama")}`,
      entity_type: "kematian",
    })

    return { success: true }
}

// update kematian
// DONE
export async function updateKematian(id: string, formData: FormData, userId: string) {
  try {
    // Validasi input
    const validatedFields = kematianSchema.safeParse({
      id_penduduk: formData.get("id_pdd"),
      tanggal_kematian: formData.get("tgl_mendu"),
      sebab_kematian: formData.get("sebab"),
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const {data: nama, error} = await supabase.from("kematian").update({...validatedFields.data}).eq("id", id).select("penduduk:id_penduduk (nama)").single()
    if(error){
      console.log(error);
      return {error: "terjadi masalah saat memperbarui data"}
    }
    
    // Log activity
    await logActivity({
      user_id: userId,
      type: "Kematian",
      description: `Memperbarui data kematian untuk ${nama}`,
      entity_type: "kematian",
    })

    return { success: true}
  } catch (error) {
    console.error("Error updating kematian:", error)
    return { error: "Gagal memperbarui data kematian" }
  }
}

// delete kematian
// DONE
export async function deleteKematian(id: string, userId: string) {
  try {
    
    const {data: get_id_penduduk, error: errDeleteKematian} = await supabase.from("kematian").delete().eq("id", id).select("id_penduduk").single()
    if(errDeleteKematian){
      console.log(errDeleteKematian);
      return {error: "Terjadi masalah"}
    }
    
    const {data: nama, error: errUpdatePenduduk} = await supabase.from("penduduk").update({status_penduduk: "Ada"}).eq("id", get_id_penduduk.id_penduduk)
    if(errUpdatePenduduk){
      console.log(errUpdatePenduduk);
      return {error: "Terjadi masalah"}
    }

    // Log activity
    await logActivity({
      user_id: userId,
      type: "Kematian",
      description: `Menghapus data kematian ${nama ? `untuk ${nama}` : ""}`,
      entity_type: "kematian",
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting kematian:", error)
    return { error: "Gagal menghapus data kematian" }
  }
}

