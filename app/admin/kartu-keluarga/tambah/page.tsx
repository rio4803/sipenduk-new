"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createKartuKeluarga } from "../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormStatus } from "@/components/form-status"
import { DatePicker } from "@/components/ui/date-picker"
import { useAuth } from "@/lib/auth-context"

export default function TambahKartuKeluargaPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [birthDate, setBirthDate] = useState<Date | null>(null)
  const [userCredentials, setUserCredentials] = useState<{ username: string; password: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return

    setIsPending(true)
    setError(null)
    setSuccess(null)
    setValidationErrors(null)

    const formData = new FormData(e.currentTarget)
    
    // Add birth date from DatePicker
    if (birthDate) {
      formData.set("tgl_lh_kepala", birthDate.toISOString().split("T")[0])
    }

    try {
      const result = await createKartuKeluarga(formData)

      if (result.error) {
        setError(result.error)
        setValidationErrors(result.errors || null)
      } else if (result.success) {
        setSuccess("Kartu keluarga berhasil ditambahkan")
        
        // Simpan kredensial user jika ada
        if (result.akun) {
          setUserCredentials({
            username: result.akun.username,
            password: result.akun.password
          })
        }
        
        // Don't auto-redirect - let user copy credentials first
        // User can manually navigate back using the "Kembali" button
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tambah Kartu Keluarga</h2>
        <p className="text-muted-foreground">Tambahkan data kartu keluarga baru</p>
      </div>

      <Card className="glow-card">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Kartu Keluarga</CardTitle>
            <CardDescription>Masukkan informasi kartu keluarga dan kepala keluarga</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormStatus error={error} success={success} errors={validationErrors} />

            {userCredentials && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  ✅ Akun Login Kepala Keluarga Berhasil Dibuat
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

            {/* Informasi Kartu Keluarga */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Informasi Kartu Keluarga</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="no_kk">Nomor KK</Label>
                  <Input id="no_kk" name="no_kk" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desa">Desa</Label>
                  <Input id="desa" name="desa" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rt">RT</Label>
                    <Input id="rt" name="rt" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rw">RW</Label>
                    <Input id="rw" name="rw" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kec">Kecamatan</Label>
                  <Input id="kec" name="kec" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kab">Kabupaten</Label>
                  <Input id="kab" name="kab" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prov">Provinsi</Label>
                  <Input id="prov" name="prov" required />
                </div>
              </div>
            </div>

            {/* Informasi Kepala Keluarga */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Informasi Kepala Keluarga</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nik_kepala">NIK Kepala Keluarga</Label>
                  <Input id="nik_kepala" name="nik_kepala" maxLength={16} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kepala">Nama Kepala Keluarga</Label>
                  <Input id="kepala" name="kepala" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempat_lh_kepala">Tempat Lahir</Label>
                  <Input id="tempat_lh_kepala" name="tempat_lh_kepala" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tgl_lh_kepala">Tanggal Lahir</Label>
                  <DatePicker
                    id="tgl_lh_kepala"
                    name="tgl_lh_kepala"
                    selected={birthDate}
                    onSelect={setBirthDate}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jekel_kepala">Jenis Kelamin</Label>
                  <Select name="jekel_kepala" required>
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
                  <Label htmlFor="agama_kepala">Agama</Label>
                  <Select name="agama_kepala" required>
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
                  <Label htmlFor="kawin_kepala">Status Perkawinan</Label>
                  <Select name="kawin_kepala" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status kawin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                      <SelectItem value="Kawin">Kawin</SelectItem>
                      <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                      <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pekerjaan_kepala">Pekerjaan</Label>
                  <Input id="pekerjaan_kepala" name="pekerjaan_kepala" required />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {success && userCredentials ? (
              <Button asChild className="w-full">
                <Link href="/admin/kartu-keluarga">Kembali ke Daftar Kartu Keluarga</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/admin/kartu-keluarga">Batal</Link>
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

