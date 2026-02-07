"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { login as authLogin } from "@/lib/auth"
import { setRedisData, getRedisData, deleteRedisData, getRedisKeys } from "@/lib/redis-service"
import { z } from "zod"
import { logActivity } from "@/lib/activity-logger"
import { generateRandomPassword } from "@/lib/utils"

// Schema validasi untuk login
const loginSchema = z.object({
  username: z.string().min(1, "Username harus diisi"),
  password: z.string().min(1, "Password harus diisi"),
})

// Authentication actions
export async function login(formData: FormData) {
  // Validasi input
  const validatedFields = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      error: "Validasi gagal",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { username, password } = validatedFields.data

  try {
    const user = await authLogin(username, password)

    if (!user) {
      return { error: "Username atau password salah" }
    }

    // Log activity
    await logActivity({
      user_id: user.id,
      type: "Login",
      description: "Berhasil login ke sistem",
      entity_type: "user",
    })

    // Return success instead of redirecting to prevent potential redirect loops
    return { success: true, role: user.role }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Terjadi kesalahan saat login. Silakan coba lagi." }
  }
}

export async function logout(userId: string) {
  try {
    // Log activity
    await logActivity({
      user_id: userId,
      type: "Logout",
      description: "Berhasil logout dari sistem",
      entity_type: "user",
    })
  } catch (error) {
    console.error("Error logging logout:", error)
  }

  cookies().delete("user")
  redirect("/login")
}

// Schema validasi untuk penduduk
const pendudukSchema = z.object({
  nik: z.string().min(1, "NIK harus diisi"),
  nama: z.string().min(1, "Nama harus diisi"),
  tempat_lh: z.string().min(1, "Tempat lahir harus diisi"),
  tgl_lh: z.string().min(1, "Tanggal lahir harus diisi"),
  jekel: z.enum(["LK", "PR"], {
    errorMap: () => ({ message: "Jenis kelamin harus dipilih" }),
  }),
  desa: z.string().min(1, "Desa harus diisi"),
  rt: z.string().min(1, "RT harus diisi"),
  rw: z.string().min(1, "RW harus diisi"),
  agama: z.string().min(1, "Agama harus diisi"),
  kawin: z.string().min(1, "Status perkawinan harus diisi"),
  pekerjaan: z.string().min(1, "Pekerjaan harus diisi"),
})

// Penduduk actions
export async function createPenduduk(formData: FormData) {
  try {
    // Validasi input
    const validatedFields = pendudukSchema.safeParse({
      nik: formData.get("nik"),
      nama: formData.get("nama"),
      tempat_lh: formData.get("tempat_lh"),
      tgl_lh: formData.get("tgl_lh"),
      jekel: formData.get("jekel"),
      desa: formData.get("desa"),
      rt: formData.get("rt"),
      rw: formData.get("rw"),
      agama: formData.get("agama"),
      kawin: formData.get("kawin"),
      pekerjaan: formData.get("pekerjaan"),
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Periksa apakah NIK sudah ada
    const keys = await getRedisKeys("penduduk:*")
    const pendudukPromises = keys.map((key) => getRedisData(key))
    const pendudukList = await Promise.all(pendudukPromises)
    const nikExists = pendudukList.some((p) => p && p.nik === validatedFields.data.nik)

    if (nikExists) {
      return { error: "NIK sudah terdaftar" }
    }

    // Dapatkan ID baru
    const pendudukIds = pendudukList.map((p) => (p ? p.id_pend : 0))
    const newId = pendudukIds.length > 0 ? Math.max(...pendudukIds) + 1 : 1

    const newPenduduk = {
      id_pend: newId,
      ...validatedFields.data,
      status: "Ada" as const,
    }

    // Simpan ke Redis
    await setRedisData(`penduduk:${newId}`, newPenduduk)

    // Create user account with guest role
    const password = generateRandomPassword(8)
    const userKeys = await getRedisKeys("pengguna:*")
    const userPromises = userKeys.map((key) => getRedisData(key))
    const userList = await Promise.all(userPromises)
    const userIds = userList.map((u) => (u ? u.id_pengguna : 0))
    const newUserId = userIds.length > 0 ? Math.max(...userIds) + 1 : 1

    const newUser = {
      id_pengguna: newUserId,
      nama_pengguna: validatedFields.data.nama,
      username: validatedFields.data.nik, // Use NIK as username
      password: password,
      level: "guest" as const,
    }

    await setRedisData(`pengguna:${newUserId}`, newUser)

    revalidatePath("/admin/penduduk")
    return {
      success: true,
      data: newPenduduk,
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

export async function updatePenduduk(id: number, formData: FormData) {
  try {
    // Validasi input
    const validatedFields = pendudukSchema.safeParse({
      nik: formData.get("nik"),
      nama: formData.get("nama"),
      tempat_lh: formData.get("tempat_lh"),
      tgl_lh: formData.get("tgl_lh"),
      jekel: formData.get("jekel"),
      desa: formData.get("desa"),
      rt: formData.get("rt"),
      rw: formData.get("rw"),
      agama: formData.get("agama"),
      kawin: formData.get("kawin"),
      pekerjaan: formData.get("pekerjaan"),
    })

    if (!validatedFields.success) {
      return {
        error: "Validasi gagal",
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    // Periksa apakah penduduk ada
    const penduduk = await getRedisData(`penduduk:${id}`)
    if (!penduduk) {
      return { error: "Penduduk tidak ditemukan" }
    }

    // Periksa apakah NIK sudah digunakan oleh penduduk lain
    const keys = await getRedisKeys("penduduk:*")
    const pendudukPromises = keys.map((key) => getRedisData(key))
    const pendudukList = await Promise.all(pendudukPromises)
    const nikExists = pendudukList.some((p) => p && p.id_pend !== id && p.nik === validatedFields.data.nik)

    if (nikExists) {
      return { error: "NIK sudah digunakan oleh penduduk lain" }
    }

    // Update penduduk
    const status = formData.get("status") as "Ada" | "Meninggal" | "Pindah"
    const updatedPenduduk = {
      ...penduduk,
      ...validatedFields.data,
      status: status || penduduk.status,
    }

    await setRedisData(`penduduk:${id}`, updatedPenduduk)

    // Update related user if NIK changed
    if (penduduk.nik !== validatedFields.data.nik) {
      // Find user with old NIK
      const userKeys = await getRedisKeys("pengguna:*")
      const userPromises = userKeys.map((key) => getRedisData(key))
      const userList = await Promise.all(userPromises)
      const user = userList.find((u) => u && u.username === penduduk.nik)

      if (user) {
        // Update username to new NIK
        const updatedUser = {
          ...user,
          nama_pengguna: validatedFields.data.nama,
          username: validatedFields.data.nik,
        }
        await setRedisData(`pengguna:${user.id_pengguna}`, updatedUser)
      }
    }

    revalidatePath("/admin/penduduk")
    return { success: true, data: updatedPenduduk }
  } catch (error) {
    console.error("Error updating penduduk:", error)
    return { error: "Gagal memperbarui penduduk" }
  }
}

export async function deletePenduduk(id: number) {
  try {
    // Periksa apakah penduduk ada
    const penduduk = await getRedisData(`penduduk:${id}`)
    if (!penduduk) {
      return { error: "Penduduk tidak ditemukan" }
    }

    // Periksa apakah penduduk adalah anggota keluarga
    const anggotaKeys = await getRedisKeys("anggota:*")
    const anggotaPromises = anggotaKeys.map((key) => getRedisData(key))
    const anggotaList = await Promise.all(anggotaPromises)
    const isAnggota = anggotaList.some((a) => a && a.id_pend === id)

    if (isAnggota) {
      return { error: "Penduduk masih terdaftar sebagai anggota keluarga" }
    }

    // Delete related user account
    const userKeys = await getRedisKeys("pengguna:*")
    const userPromises = userKeys.map((key) => getRedisData(key))
    const userList = await Promise.all(userPromises)
    const user = userList.find((u) => u && u.username === penduduk.nik && u.level === "guest")

    if (user) {
      await deleteRedisData(`pengguna:${user.id_pengguna}`)
    }

    // Hapus penduduk
    await deleteRedisData(`penduduk:${id}`)

    revalidatePath("/admin/penduduk")
    return { success: true }
  } catch (error) {
    console.error("Error deleting penduduk:", error)
    return { error: "Gagal menghapus penduduk" }
  }
}

// Implementasikan fungsi CRUD lainnya dengan pola yang sama

