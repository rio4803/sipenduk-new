"use server"

import { z } from "zod"
import { logActivity } from "@/lib/activity-logger"
import { supabase } from "@/app/utils/supabase"
import { createSurat } from "../surat/actions"


// Schema validasi untuk kelahiran
const kelahiranSchema = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
  tanggal_lahir: z.string().min(1, "Tanggal lahir harus diisi"),
  jenis_kelamin: z.enum(["LK", "PR"], {
    error: () => ({ message: "Jenis kelamin harus dipilih" }),
  }),
  id_kk: z.string().min(1, "Kartu keluarga harus dipilih"),
})

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

    const dataKelahiran = {...kelahiran.penduduk, ...kelahiran.kartu_keluarga,  id_kelahiran: kelahiran.id, id_kk: kelahiran.id_kk}
    return dataKelahiran
  } catch (error) {
    console.error(`Error getting kelahiran with id ${id}:`, error)
    throw new Error("Gagal mengambil data kelahiran")
  }
}

// create kelahiran
// DONE
export async function createKelahiran(formData: FormData, userId: string) {
  /*
    * insert penduduk
    * insert anggota
    * insert kelahiran
    * new surat kelahiran
  */
  const dataKelahiran = JSON.parse(formData.get("data_kelahiran") as string)
  const {data, error} = await supabase.rpc("insert_kelahiran", {
    p_id_kk: dataKelahiran.id_kk,
    p_nik: dataKelahiran.nik,
    p_nama: dataKelahiran.nama,
    p_tempat_lahir: dataKelahiran.tempat_lahir,
    p_tanggal_lahir: dataKelahiran.tanggal_lahir,
    p_jenis_kelamin: dataKelahiran.jenis_kelamin,
    p_agama: dataKelahiran.agama,
    p_hubungan: dataKelahiran.hubungan,
    p_pekerjaan: dataKelahiran.pekerjaan,
    p_status_perkawinan: dataKelahiran.status_perkawinan,
    p_desa: dataKelahiran.desa,
    p_rt: dataKelahiran.rt,
    p_rw: dataKelahiran.rw,
  })
  if(error){
    console.log({errKelahiran: error})
    return {error: "Terjadi kesalahan"}
  }

  formData.append("keterangan", "Surat keterangan kelahiran dan kependudukan baru")
  formData.append("id_penduduk", data)
  const surat = await createSurat(formData, userId, "kelahiran")
  
  await logActivity({
    description: `Menambahkan data kelahiran ${dataKelahiran.nama}`,
    user_id: userId,
    entity_type: "kelahiran",
    type: "Kelahiran"
  })

  return {success: "Data kelahiran berhasil ditambahkan"}
}

// update kelahiran
// DONE
export async function updateKelahiran(id: string, formData: FormData, userId: string) {
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

    const id_penduduk = formData.get("id_penduduk")
    const { id_kk } = validated.data
    const old_id_kk = formData.get("old_id_kk")
    const newPenduduk = {
      nama: validated.data.nama,
      tanggal_lahir: validated.data.tanggal_lahir,
      jenis_kelamin: validated.data.jenis_kelamin,
      nik: formData.get("nik"),
      tempat_lahir: formData.get("tempat_lahir"),
      desa: formData.get("desa"),
      rt: formData.get("rt"),
      rw: formData.get("rw"),
      agama: formData.get("agama")
    }

    const {error: errUpdatePenduduk} = await supabase.from("penduduk").update(newPenduduk).eq("id", id_penduduk)
    const {error: errUpdateKelahiran} = await supabase.from("kelahiran").update({id_kk}).eq("id", id)
    if(errUpdatePenduduk || errUpdateKelahiran){
      errUpdatePenduduk && console.log(errUpdatePenduduk)
      errUpdateKelahiran && console.log(errUpdateKelahiran)
      return {error: "Terjadi masalah saat memperbarui data"}
    }
    
    if(old_id_kk != id_kk){
      const {error: errUpdateAnggota} = await supabase.from("anggota_kartu_keluarga").update({id_kk}).eq("id_penduduk", id_penduduk)
      if(errUpdateAnggota){
        console.log(errUpdateAnggota)
        return {error: "Terjadi masalah saat memperbarui data"}
      }
    }


    // =====================================
    // LOG AKTIVITAS
    // =====================================
    await logActivity({
      user_id: userId,
      type: "Kelahiran",
      description: `Memperbarui data kelahiran ${newPenduduk.nama}`,
      entity_type: "kelahiran",
    })

    return { success: true }

  } catch (error) {
    console.error("Error updating kelahiran:", error)
    return { error: "Gagal memperbarui data kelahiran" }
  }
}

// hapus kelahiran
// DONE
export async function deleteKelahiran(id: string, user_id: string) {
  try {
    const {data, error} = await supabase.from("kelahiran").delete().eq("id", id).select("penduduk:id_penduduk (nama)").single()
    if(error){
      return { error: "Gagal menghapus data kelahiran" }
    }

    // Log activity
    await logActivity({
      user_id,
      type: "Kelahiran",
      description: `Menghapus data kelahiran ${data}`,
      entity_type: "kelahiran",
    })
    console.log(data)
    return { success: true }
  } catch (error) {
    console.error("Error deleting kelahiran:", error)
    return { error: "Gagal menghapus data kelahiran" }
  }
}