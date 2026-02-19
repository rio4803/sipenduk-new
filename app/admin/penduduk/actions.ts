"use server";

import { z } from "zod";
import { supabase } from "@/app/utils/supabase";
import { generateRandomPassword } from "@/lib/utils";

// validation schema
const pendudukSchema = z.object({
  nik: z.string().min(1),
  nama: z.string().min(1),
  tempat_lahir: z.string().min(1),
  tanggal_lahir: z.string().min(1),
  jenis_kelamin: z.enum(["LK","PR"]),
  desa: z.string().min(1),
  rt: z.string().min(1),
  rw: z.string().min(1),
  agama: z.string().min(1),
  status_perkawinan: z.string().optional(),
  pekerjaan: z.string().optional(),
  hubungan: z.string().optional(),
});

// get data kartu keluarga
// DONE
export async function getKKData() {
  const {data, error} = await supabase.from("kartu_keluarga").select("*")
  if(error){
    console.log(error)
    return []
  }
  return data
}

// get data penduduk
// DONE
export async function getPendudukData() {
  try {
    const {data: pendudukList, error: errPenduduk} = await supabase.from("penduduk").select("*")
    const {data: anggotaList, error: errAnggota} = await supabase.from("anggota_kartu_keluarga").select("*")
    const {data: kkList, error: errKK} = await supabase.from("kartu_keluarga").select("*")
    if(errAnggota || errKK || errPenduduk){
      console.log({errAnggota, errKK, errPenduduk})
      return []
    }

    const kkMap = new Map();
    const anggotaMap = new Map();
    
    kkList.forEach((kk) => kkMap.set(kk.id, kk));
    anggotaList.forEach((a) => anggotaMap.set(a.id_penduduk, a));

    const dataPenduduk = pendudukList.map((p) => {
      const anggota = anggotaMap.get(p.id) || null;
      const kk = anggota?.id_kk ? kkMap.get(anggota.id_kk) : null;

      return {
        ...p,
        id_kk: anggota?.id_kk || "-",
        hubungan: anggota?.hubungan || "-",
        no_kk: kk?.no_kk || "-",
        kepala: kk?.kepala || "-",
      };
    })
    .sort((a, b) => a.nama.localeCompare(b.nama));
    return dataPenduduk
  } catch (error) {
    console.error("Error fetching penduduk data:", error);
    return [];
  }
}

// get data penduduk by id
// DONE
export async function getPendudukById(id: string) {
  try {
    const {data: penduduk, error: errPenduduk} = await supabase.from("penduduk").select("*").eq("id", id).single()
    if (!penduduk || errPenduduk) {
      console.log({errPenduduk})
      return null
    }
    
    const {data: anggota, error: errAnggota} =  await supabase.from("anggota_kartu_keluarga").select("*, kartu_keluarga:id_kk (*)").eq("id_penduduk", id).single()
    if (errAnggota) {
      console.log({errAnggota});
    }

    return {
      ...penduduk,
      id_kk: anggota?.id_kk || null,
      hubungan: anggota?.hubungan || "-",
      no_kk: anggota?.kartu_keluarga.no_kk || "-",
      kepala: anggota?.kartu_keluarga.kepala || "-",
    };
  } catch (error) {
    console.error(`Error fetching penduduk ${id}:`, error);
    return null;
  }
}

// create penduduk baru
// DONE
export async function createPenduduk(formData: FormData) {

  const id_kk = formData.get("id_kk") || null
  const hubungan = formData.get("hubungan") || "Kepala Keluarga"
  const no_kk = formData.get("no_kk") || null
  const kecamatan = formData.get("kec")
  const kabupaten = formData.get("kab")
  const provinsi = formData.get("prov")
  try {
    // validate form
    const validatedFields = pendudukSchema.safeParse({
      nik: formData.get("nik"),
      nama: formData.get("nama"),
      tempat_lahir: formData.get("tempat_lahir"),
      tanggal_lahir: formData.get("tanggal_lahir"),
      jenis_kelamin: formData.get("jenis_kelamin"),
      desa: formData.get("desa"),
      rt: formData.get("rt"),
      rw: formData.get("rw"),
      agama: formData.get("agama"),
      status_perkawinan: formData.get("status_perkawinan"),
      pekerjaan: formData.get("pekerjaan"),
    })
    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }
    
    // console.log({id_kk, hubungan, no_kk, kecamatan, kabupaten, provinsi, ...validatedFields.data});
    // return {error: "true"}

    // insert penduduk
    const {data: penduduk, error: errInsertPenduduk} = await supabase.from("penduduk").insert(validatedFields.data).select().single()
    if(errInsertPenduduk){
      if(errInsertPenduduk.code == "23505"){
        return { error: "NIK sudah terdaftar" };
      }
      return { error: "terjadi masalah pada tabel penduduk" };
    }
    
    // tambahkan ke anggota keluarga jika penduduk merupakan anggota keluarga
    if(id_kk){
      const newAnggota = {
        id_kk,
        id_penduduk: penduduk.id,
        hubungan
      }
      const {error: errAddAnggota} = await supabase.from("anggota_kartu_keluarga").insert(newAnggota)
      if(errAddAnggota){
        console.log(errAddAnggota)
        return { error: "terjadi masalah pada tabel anggota" };
      }
    }

    // tambah data kartu keluarga jika seorang kepala keluarga
    if(no_kk){
      const newKk = {
        no_kk,
        kepala: validatedFields.data.nama,
        desa: validatedFields.data.desa,
        rt: validatedFields.data.rt,
        rw: validatedFields.data.rw,
        kecamatan,
        kabupaten,
        provinsi
      }
      const {data: kk, error: errKk} = await supabase.from("kartu_keluarga").insert(newKk).select().single()
      const {error: errAnggotaKepala} = await supabase.from("anggota_kartu_keluarga").insert({id_kk: kk.id, id_penduduk: penduduk.id, hubungan})
      if(errKk || errAnggotaKepala){
        console.log({errKk, errAnggotaKepala})
        return {error: "Terjadi masalah"}
      }
    }

    // buat akun penduduk
    const password = generateRandomPassword(8)
    const newUser = {
      id_penduduk: penduduk.id,
      name: validatedFields.data.nama,
      username: validatedFields.data.nik,
      password: password,
      role: "penduduk" as const,
    }
    await supabase.from("pengguna").insert(newUser)

    return {
      success: true,
      data: validatedFields.data,
      user: {
        username: newUser.username,
        password: password,
      },
    }
  } catch (error) {
    console.error("Error creating penduduk:", error)
    return { error: "Gagal menambahkan penduduk" }
  }
}

// update penduduk
// DONE
export async function updatePenduduk(id: string, formData: FormData) {
  try {
    const validatedFields = pendudukSchema.safeParse({
      nik: formData.get("nik"),
      nama: formData.get("nama"),
      tempat_lahir: formData.get("tempat_lahir"),
      tanggal_lahir: formData.get("tanggal_lahir"),
      jenis_kelamin: formData.get("jenis_kelamin"),
      desa: formData.get("desa"),
      rt: formData.get("rt"),
      rw: formData.get("rw"),
      agama: formData.get("agama"),
      status_perkawinan: formData.get("status_perkawinan"),
      pekerjaan: formData.get("pekerjaan"),
    });

    if (!validatedFields.success) {
      console.log(validatedFields.error)
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const {error} = await supabase.from("penduduk").update(validatedFields.data).eq("id", id)
    if(error) return {error: "Terjadi masalah"}
    return { success: true};
  } catch (error) {
    console.error("Error updating penduduk:", error);
    return { error: "Gagal memperbarui penduduk" };
  }
}

// delete penduduk
// DONE
export async function deletePenduduk(id: string) {
  try {
    const {error} = await supabase.from("penduduk").delete().eq("id", id)
    if(error){
      console.log(error)
      return {error: "terjadi masalah"}
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting penduduk:", error);
    return { error: "Gagal menghapus penduduk" };
  }
}
