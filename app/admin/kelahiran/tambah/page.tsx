"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createKelahiran } from "../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormStatus } from "@/components/form-status"
import { getKartuKeluargaData } from "../../kartu-keluarga/actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { DatePicker } from "@/components/ui/date-picker.tsx"
import { useAuth } from "@/lib/auth-context"

export default function TambahKelahiranPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [kartuKeluarga, setKartuKeluarga] = useState<any[]>([])
  const [isLoadingKK, setIsLoadingKK] = useState(true)
  const [birthDate, setBirthDate] = useState<Date | null>(null)
  const [userCredentials, setUserCredentials] = useState<{ username: string; password: string } | null>(null)

  useEffect(() => {
    async function loadKartuKeluarga() {
      try {
        const data = await getKartuKeluargaData()
        setKartuKeluarga(data)
      } catch (error) {
        console.error("Error loading kartu keluarga data:", error)
      } finally {
        setIsLoadingKK(false)
      }
    }

    loadKartuKeluarga()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return

    setIsPending(true)
    setError(null)
    setSuccess(null)
    setValidationErrors(null)

    const formData = new FormData(e.currentTarget)

    // Add the date from the DatePicker component
    if (birthDate) {
      formData.set("tanggal_lahir", birthDate.toISOString().split("T")[0])
    }

    try {
      const result = await createKelahiran(formData, user.id)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess("Data kelahiran berhasil ditambahkan")
        
        // Simpan kredensial user jika ada
        if (result.akun) {
          setUserCredentials({
            username: result.akun.username,
            password: result.akun.password
          })
        }
        
        // Redirect setelah 5 detik (lebih lama untuk memberikan waktu baca kredensial)
        setTimeout(() => {
          router.push("/admin/kelahiran")
        }, 5000)
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsPending(false)
    }
  }

  if (isLoadingKK) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Tambah Kelahiran</h2>
        <p className="text-muted-foreground">Tambahkan data kelahiran baru</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Kelahiran</CardTitle>
            <CardDescription>Masukkan informasi kelahiran</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} errors={validationErrors} />

            {userCredentials && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  ✅ Akun Login Berhasil Dibuat
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="text-green-700 dark:text-green-300">
                    <strong>Username:</strong> {userCredentials.username}
                  </p>
                  <p className="text-green-700 dark:text-green-300">
                    <strong>Password:</strong> {userCredentials.password}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    ⚠️ Harap catat kredensial ini karena tidak akan ditampilkan lagi.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="space-y-2">
                <Label htmlFor="nik">NIK</Label>
                <Input id="nik" name="nik" placeholder="Masukkan NIK" maxLength={16} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama">Nama</Label>
                <Input id="nama" name="nama" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                <Input id="tempat_lahir" name="tempat_lahir" placeholder="Masukkan tempat lahir" />
              </div>

              {/* ✅ PERBAIKAN DI SINI – DatePicker full width + match input height */}
              <div className="space-y-2">
                <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                <div className="w-full">
                  <DatePicker
                    id="tanggal_lahir"
                    name="tanggal_lahir"
                    selected={birthDate}
                    onSelect={setBirthDate}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                <Select name="jenis_kelamin" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LK">Laki-laki</SelectItem>
                    <SelectItem value="PR">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_kk">Kartu Keluarga</Label>
                <Select name="id_kk" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kartu keluarga" />
                  </SelectTrigger>
                  <SelectContent>
                    {kartuKeluarga.map((kk) => (
                      <SelectItem key={kk.id} value={kk.id}>
                        {kk.no_kk} - {kk.kepala}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agama">Agama</Label>
                <Select name="agama">
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih agama" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Islam">Islam</SelectItem>
                    <SelectItem value="Kristen">Kristen</SelectItem>
                    <SelectItem value="Katolik">Katolik</SelectItem>
                    <SelectItem value="Hindu">Hindu</SelectItem>
                    <SelectItem value="Buddha">Buddha</SelectItem>
                    <SelectItem value="Konghucu">Konghucu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desa">Desa</Label>
                <Input id="desa" name="desa" placeholder="Masukkan nama desa" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rt">RT</Label>
                <Input id="rt" name="rt" placeholder="RT" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rw">RW</Label>
                <Input id="rw" name="rw" placeholder="RW" />
              </div>

            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/kelahiran">Batal</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

