"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter, notFound } from "next/navigation"
import { getKartuKeluargaById, addAnggotaKeluarga } from "../../actions"
import { getPendudukData } from "../../../penduduk/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormStatus } from "@/components/form-status"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/lib/auth-context"
import { Penduduk } from "@/lib/dummy-data"

export default function TambahAnggotaKeluargaPage({
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
  const [kk, setKK] = useState<any>(null)
  const [penduduk, setPenduduk] = useState<Penduduk[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [kkData, pendudukData] = await Promise.all([getKartuKeluargaById(id), getPendudukData()])
        console.log({pendudukData})
        console.log({kkData})
        if (!kkData) {
          notFound()
        }

        setKK(kkData)

        // Filter penduduk yang belum menjadi anggota keluarga
        const filteredPenduduk = pendudukData.filter((p) => p.status === "Ada")
        setPenduduk(filteredPenduduk)
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
    formData.append("id_kk", id)

    try {
      const result = await addAnggotaKeluarga(formData)

      if (result.error) {
        setError(result.error)
        setValidationErrors(result.errors || null)
      } else if (result.success) {
        setSuccess("Anggota keluarga berhasil ditambahkan")
        // Redirect setelah 2 detik
        setTimeout(() => {
          router.push(`/admin/kartu-keluarga/${id}`)
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
        <h2 className="text-3xl font-bold tracking-tight">Tambah Anggota Keluarga</h2>
        <p className="text-muted-foreground">Tambahkan anggota ke kartu keluarga {kk.no_kk}</p>
      </div>

      <Card className="glow-card">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Anggota Keluarga</CardTitle>
            <CardDescription>Pilih penduduk dan hubungan keluarga</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} errors={validationErrors} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_pend">Penduduk</Label>
                <Select name="id_pend" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih penduduk" />
                  </SelectTrigger>
                  <SelectContent>
                    {penduduk.map((p) => (
                      <SelectItem key={p.id_penduduk} value={p.id_penduduk}>
                        {p.nama} - {p.nik}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hubungan">Hubungan Keluarga</Label>
                <Select name="hubungan" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih hubungan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kepala Keluarga">Kepala Keluarga</SelectItem>
                    <SelectItem value="Istri">Istri</SelectItem>
                    <SelectItem value="Suami">Suami</SelectItem>
                    <SelectItem value="Anak">Anak</SelectItem>
                    <SelectItem value="Menantu">Menantu</SelectItem>
                    <SelectItem value="Cucu">Cucu</SelectItem>
                    <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                    <SelectItem value="Mertua">Mertua</SelectItem>
                    <SelectItem value="Famili Lain">Famili Lain</SelectItem>
                    <SelectItem value="Pembantu">Pembantu</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/admin/kartu-keluarga/${id}`}>Batal</Link>
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

