"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter, notFound } from "next/navigation"
import { getKedatanganById, updateKedatangan } from "../../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormStatus } from "@/components/form-status"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { DatePicker } from "@/components/ui/date-picker"
import { useAuth } from "@/lib/auth-context"
import { getPendudukData } from "@/app/admin/penduduk/actions"

export default function EditKedatanganPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const {id} = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [penduduk, setPenduduk] = useState<any[]>([])
  const [kedatangan, setKedatangan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [arrivalDate, setArrivalDate] = useState<Date | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        // Load kedatangan data
        const kedatanganData = await getKedatanganById(id)
        if (!kedatanganData) {
          notFound()
        }
        setKedatangan(kedatanganData)

        if (kedatanganData.tanggal_kedatangan) {
          setArrivalDate(new Date(kedatanganData.tanggal_kedatangan))
        }

        // Load penduduk data
        const pendudukData = await getPendudukData()
        setPenduduk(pendudukData.filter((p: any) => p.status_penduduk == "Ada"))
      } catch (error) {
        console.error("Error loading data:", error)
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
    // Add the date from the DatePicker component
    if (arrivalDate) {
      formData.set("tgl_datang", arrivalDate.toISOString().split("T")[0])
    }

    try {
      const result = await updateKedatangan(id, formData, user.id)

      if (result.error) {
        setError(result.error)
        setValidationErrors(result.errors || null)
      } else if (result.success) {
        setSuccess("Data kedatangan berhasil diperbarui")
        // Redirect setelah 2 detik
        setTimeout(() => {
          router.push(`/admin/kedatangan/${id}`)
        }, 2000)
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
        <h2 className="text-3xl font-bold tracking-tight">Edit Kedatangan</h2>
        <p className="text-muted-foreground">Edit data kedatangan penduduk</p>
      </div>

      <Card className="glow-card">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Kedatangan</CardTitle>
            <CardDescription>Edit informasi kedatangan penduduk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} errors={validationErrors} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nik">NIK</Label>
                <Input id="nik" name="nik" defaultValue={kedatangan.nik} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama_datang">Nama Lengkap</Label>
                <Input id="nama_datang" name="nama_datang" defaultValue={kedatangan.nama_pendatang} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jekel">Jenis Kelamin</Label>
                <Select name="jekel" defaultValue={kedatangan.jenis_kelamin} required>
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
                <Label htmlFor="tgl_datang">Tanggal Datang</Label>
                <DatePicker
                  id="tgl_datang"
                  name="tgl_datang"
                  selected={arrivalDate}
                  onSelect={setArrivalDate}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pelapor">Pelapor</Label>
                <Select name="pelapor" defaultValue={kedatangan.id_pelapor} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pelapor" />
                  </SelectTrigger>
                  <SelectContent>
                    {penduduk.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/admin/kedatangan/${id}`}>Batal</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  Menyimpan <LoadingSpinner size="sm" />
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

