"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter, notFound } from "next/navigation"
import { getPendudukById, updatePenduduk } from "../../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormStatus } from "@/components/form-status"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { DatePicker } from "@/components/ui/date-picker.tsx"
import { FormField } from "@/components/ui/form-field"
import { format } from "date-fns"

export default function EditPendudukPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const {id} = use(params)
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [penduduk, setPenduduk] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [birthDate, setBirthDate] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPendudukById(id)
        if (!data) {
          notFound()
        }
        setPenduduk(data)

        // Set birth date if available
        if (data.tanggal_lahir) {
          setBirthDate(new Date(data.tanggal_lahir))
        }
      } catch (error) {
        console.error("Error loading penduduk data:", error)
        setError("Gagal memuat data penduduk")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    setSuccess(null)
    setValidationErrors(null)

    const formData = new FormData(e.currentTarget)

    // Add the date from the DatePicker component - Fix untuk masalah timezone
    if (birthDate) {
      // Gunakan format untuk memastikan tanggal yang tepat, tidak terpengaruh timezone
      const formattedDate = format(birthDate, "yyyy-MM-dd")
      formData.set("tanggal_lahir", formattedDate)
    }

    try {
      const result = await updatePenduduk(id, formData)

      if (!result) {
        setError("Terjadi kesalahan. Silakan coba lagi.")
        return
      }

      if (result.error) {
        setError(result.error)
        setValidationErrors(result.errors || null)
      } else if (result.success) {
        setSuccess("Data penduduk berhasil diperbarui")
      }
    } catch (err) {
      console.error("Error updating penduduk:", err)
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsPending(false)
      setTimeout(() => {router.push(`/admin/penduduk/${id}`)}, 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Penduduk</h2>
          <p className="text-muted-foreground">Memuat data penduduk...</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Penduduk</h2>
        <p className="text-muted-foreground">Edit data penduduk</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Penduduk</CardTitle>
            <CardDescription>Edit informasi penduduk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} errors={validationErrors} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField id="nik" label="NIK" required>
                <Input id="nik" name="nik" defaultValue={penduduk.nik} required />
              </FormField>

              <FormField id="nama" label="Nama Lengkap" required>
                <Input id="nama" name="nama" defaultValue={penduduk.nama} required />
              </FormField>

              <FormField id="tempat_lahir" label="Tempat Lahir" required>
                <Input id="tempat_lahir" name="tempat_lahir" defaultValue={penduduk.tempat_lahir} required />
              </FormField>

              <FormField id="tanggal_lahir" label="Tanggal Lahir" required>
                <DatePicker id="tanggal_lahir" name="tanggal_lahir" selected={birthDate} onSelect={setBirthDate} />
              </FormField>

              <FormField id="jenis_kelamin" label="Jenis Kelamin" required>
                <Select name="jenis_kelamin" defaultValue={penduduk.jenis_kelamin} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LK">Laki-laki</SelectItem>
                    <SelectItem value="PR">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="agama" label="Agama" required>
                <Select name="agama" defaultValue={penduduk.agama} required>
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
              </FormField>

              <FormField id="desa" label="Desa" required>
                <Input id="desa" name="desa" defaultValue={penduduk.desa} required />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField id="rt" label="RT" required>
                  <Input id="rt" name="rt" defaultValue={penduduk.rt} required />
                </FormField>

                <FormField id="rw" label="RW" required>
                  <Input id="rw" name="rw" defaultValue={penduduk.rw} required />
                </FormField>
              </div>

              <FormField id="kawin" label="Status Perkawinan" required>
                <Select name="status_perkawinan" defaultValue={penduduk.status_perkawinan} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Belum">Belum Kawin</SelectItem>
                    <SelectItem value="Sudah">Sudah Kawin</SelectItem>
                    <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                    <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="pekerjaan" label="Pekerjaan" required>
                <Input id="pekerjaan" name="pekerjaan" defaultValue={penduduk.pekerjaan} required />
              </FormField>

              {/* <FormField id="status" label="Status" required>
                <Select name="status_penduduk" defaultValue={penduduk.status_penduduk || "Ada"} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ada">Ada</SelectItem>
                    <SelectItem value="Meninggal">Meninggal</SelectItem>
                    <SelectItem value="Pindah">Pindah</SelectItem>
                  </SelectContent>
                </Select>
              </FormField> */}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/admin/penduduk/${id}`}>Batal</Link>
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

