"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter, notFound } from "next/navigation"
import { getKelahiranById, updateKelahiran } from "../../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormStatus } from "@/components/form-status"
import { getKartuKeluargaData } from "../../../kartu-keluarga/actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { DatePicker } from "@/components/ui/date-picker.tsx"
import { useAuth } from "@/lib/auth-context"

export default function EditKelahiranPage({ params }: { params: Promise<{ id: string }> }) {
  const {id} = use(params)
  const router = useRouter()
  const { user } = useAuth()

  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [kartuKeluarga, setKartuKeluarga] = useState<any[]>([])
  const [kelahiran, setKelahiran] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [birthDate, setBirthDate] = useState<Date | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [kelahiranData, kkData] = await Promise.all([
          getKelahiranById(id),
          getKartuKeluargaData(),
        ])

        if (!kelahiranData) return notFound()

        setKelahiran(kelahiranData)
        setKartuKeluarga(kkData)

        if (kelahiranData.tanggal_lahir) {
          setBirthDate(new Date(kelahiranData.tanggal_lahir))
        }
      } catch (err) {
        setError("Gagal memuat data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return

    setIsPending(true)
    setError(null)
    setSuccess(null)
    setValidationErrors(null)

    const formData = new FormData(e.currentTarget)

    if (birthDate) {
      formData.set("tanggal_lahir", birthDate.toISOString().split("T")[0])
    }

    try {
      const result = await updateKelahiran(id, formData, user.id)

      if (result.error) {
        setError(result.error)
        setValidationErrors(result.errors || null)
      } else {
        setSuccess("Data kelahiran berhasil diperbarui")
        setTimeout(() => router.push(`/admin/kelahiran/${id}`), 1500)
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsPending(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Edit Kelahiran</h2>
        <p className="text-muted-foreground">Edit data kelahiran</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Kelahiran</CardTitle>
            <CardDescription>Edit informasi kelahiran</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} errors={validationErrors} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* NIK */}
              <div className="space-y-2">
                <Label htmlFor="nik">NIK</Label>
                <Input id="nik" name="nik" maxLength={16} defaultValue={kelahiran.nik || ""} />
              </div>

              {/* NAMA */}
              <div className="space-y-2">
                <Label htmlFor="nama">Nama</Label>
                <Input id="nama" name="nama" defaultValue={kelahiran.nama} required />
              </div>

              {/* TEMPAT LAHIR */}
              <div className="space-y-2">
                <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                <Input id="tempat_lahir" name="tempat_lahir" defaultValue={kelahiran.tempat_lahir || ""} />
              </div>

              {/* TANGGAL LAHIR */}
              <div className="space-y-2">
                <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                <DatePicker
                  id="tanggal_lahir"
                  name="tanggal_lahir"
                  selected={birthDate}
                  onSelect={setBirthDate}
                  required
                />
              </div>

              {/* JENIS KELAMIN */}
              <div className="space-y-2">
                <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                <Select name="jenis_kelamin" defaultValue={kelahiran.jenis_kelamin} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LK">Laki-laki</SelectItem>
                    <SelectItem value="PR">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* KARTU KELUARGA */}
              <div className="space-y-2">
                <Label htmlFor="id_kk">Kartu Keluarga</Label>
                <Select name="id_kk" defaultValue={kelahiran.id_kk} required>
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

              {/* AGAMA */}
              <div className="space-y-2">
                <Label htmlFor="agama">Agama</Label>
                <Select name="agama" defaultValue={kelahiran.agama || ""}>
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

              {/* DESA */}
              <div className="space-y-2">
                <Label htmlFor="desa">Desa</Label>
                <Input id="desa" name="desa" defaultValue={kelahiran.desa || ""} />
              </div>

              {/* RT */}
              <div className="space-y-2">
                <Label htmlFor="rt">RT</Label>
                <Input id="rt" name="rt" defaultValue={kelahiran.rt || ""} />
              </div>

              {/* RW */}
              <div className="space-y-2">
                <Label htmlFor="rw">RW</Label>
                <Input id="rw" name="rw" defaultValue={kelahiran.rw || ""} />
              </div>

            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/kelahiran/${id}`}>Batal</Link>
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
