"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter, notFound } from "next/navigation"
import { getKartuKeluargaById, updateKartuKeluarga } from "../../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormStatus } from "@/components/form-status"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/lib/auth-context"

export default function EditKartuKeluargaPage({
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getKartuKeluargaById(id)
        if (!data) {
          notFound()
        }
        setKK(data)
      } catch (error) {
        console.error("Error loading kartu keluarga data:", error)
        setError("Gagal memuat data kartu keluarga")
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

    try {
      const result = await updateKartuKeluarga(id, formData)

      if (result.error) {
        setError(result.error)
        setValidationErrors(result.errors || null)
      } else if (result.success) {
        setSuccess("Kartu keluarga berhasil diperbarui")
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
        <h2 className="text-3xl font-bold tracking-tight">Edit Kartu Keluarga</h2>
        <p className="text-muted-foreground">Edit data kartu keluarga</p>
      </div>

      <Card className="glow-card">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Kartu Keluarga</CardTitle>
            <CardDescription>Edit informasi kartu keluarga</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} errors={validationErrors} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="no_kk">Nomor KK</Label>
                <Input id="no_kk" name="no_kk" defaultValue={kk.no_kk} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kepala">Kepala Keluarga</Label>
                <Input id="kepala" name="kepala" defaultValue={kk.kepala} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desa">Desa</Label>
                <Input id="desa" name="desa" defaultValue={kk.desa} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rt">RT</Label>
                  <Input id="rt" name="rt" defaultValue={kk.rt} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rw">RW</Label>
                  <Input id="rw" name="rw" defaultValue={kk.rw} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kec">Kecamatan</Label>
                <Input id="kec" name="kecamatan" defaultValue={kk.kecamatan} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kab">Kabupaten</Label>
                <Input id="kab" name="kabupaten" defaultValue={kk.kabupaten} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prov">Provinsi</Label>
                <Input id="prov" name="provinsi" defaultValue={kk.provinsi} required />
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

