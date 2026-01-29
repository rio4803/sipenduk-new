"use server";

import { revalidatePath } from "next/cache";
import { getRedisData, getRedisKeys, setRedisData, deleteRedisData } from "@/lib/redis-service";
import { z } from "zod";
import { supabase } from "@/app/utils/supabase";
import { generateRandomPassword } from "@/lib/utils";

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

/* =====================================================
   ===============  VALIDATION SCHEMA ==================
===================================================== */
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
    // console.log(dataPenduduk);
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
      console.log(errPenduduk)
      return null
    }
    
    const {data: anggota, error: errAnggota} =  await supabase.from("anggota_kartu_keluarga").select("*, kartu_keluarga:id_kk (*)").eq("id_penduduk", id).single()
    if (errAnggota) {
      console.log(errAnggota);
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

/* =====================================================
   ===============  CREATE PENDUDUK ====================
===================================================== */
// export async function createPenduduk(formData: FormData) {
//   const id_penduduk = crypto.randomUUID()
  
//   const id_kk = formData.get("id_kk");
//   if (!id_kk) {
//     return { error: "ID KK wajib diisi" };
//   }

//   // const {data: kkData, error} = await supabase.from("kartu_keluarga").select("*").eq("id", id).single()
//   // if(error){
//   //   return { error: "terjadi masalah" };
//   // }
  
//   // Data penduduk
//   const newPenduduk = {
//     id: id_penduduk,
//     id_kk,
//     nik: formData.get("nik"),
//     nama: formData.get("nama"),
//     tempat_lahir: formData.get("tempat_lahir"),
//     tanggal_lahir: formData.get("tanggal_lahir"),
//     jenis_kelamin: formData.get("jenis_kelamin"),
//     desa: formData.get("desa"),
//     rt: formData.get("rt"),
//     rw: formData.get("rw"),
//     agama: formData.get("agama"),
//     status_perkawinan: formData.get("status_perkawinan"),
//     pekerjaan: formData.get("pekerjaan"),
//   };


//   return {
//     success: true,
//     message: "Penduduk berhasil ditambahkan",
//   };
// }

export async function createPenduduk(formData: FormData) {
  const id_kk = formData.get("id_kk")
  const id_penduduk = crypto.randomUUID()

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
    
    // insert penduduk
    const {data: penduduk, error: errInsertPenduduk} = await supabase.from("penduduk").insert(validatedFields.data).select().single()
    if(errInsertPenduduk){
      if(errInsertPenduduk.code == "23505"){
        return { error: "NIK sudah terdaftar" };
      }
      return { error: "terjadi masalah pada tabel penduduk" };
    }
    
    // add penduduk to anggota kartu keluarga
    const {error: errAddAnggota} = await supabase.from("anggota_kartu_keluarga").insert({id_penduduk: penduduk.id, id_kk})
    if(errAddAnggota){
      console.log(errAddAnggota)
      return { error: "terjadi masalah pada tabel anggota" };
    }

    // buat akun penduduk
    const password = generateRandomPassword(8)
    const newUser = {
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

// =====================================
// FIX FINAL – AUTO ADD ANGGOTA + KK:ANGGOTA
// =====================================
async function addToAnggotaKeluarga(id_kk, id_pend, hubungan) {
  try {
    // Cari semua anggota
    const keys = await getRedisKeys("anggota:*");
    const all = await Promise.all(keys.map(getRedisData));
    const list = all.filter(a => a);

    const newId =
      list.length > 0 ? Math.max(...list.map(a => a.id_anggota)) + 1 : 1;

    const newAnggota = {
      id_anggota: newId,
      id_kk,
      id_pend,
      hubungan,
    };

    // Simpan anggota:xx
    await setRedisData(`anggota:${newId}`, newAnggota);

    // Masukkan ke list kk:anggota:ID
    const kkKey = `kk:anggota:${id_kk}`;
    let kkList = await getRedisData(kkKey);

    if (!Array.isArray(kkList)) kkList = [];

    kkList.push(newAnggota);

    await setRedisData(kkKey, kkList);

  } catch (err) {
    console.error("Error add anggota:", err);
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
