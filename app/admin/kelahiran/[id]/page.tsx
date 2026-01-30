"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { PDFExport } from "@/components/pdf-export"
import { getKelahiranById, deleteKelahiran } from "../actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/lib/auth-context"

export default function DetailKelahiranPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const {id} = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [kelahiran, setKelahiran] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getKelahiranById(id)
        if (!data) {
          notFound()
        }
        setKelahiran(data)
      } catch (error) {
        console.error("Error loading kelahiran data:", error)
        setError("Gagal memuat data kelahiran")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id])

  const handleDelete = async () => {
    if (!user) return

    if (confirm("Apakah Anda yakin ingin menghapus data kelahiran ini?")) {
      try {
        await deleteKelahiran(id, user.id)
        router.push("/admin/kelahiran")
      } catch (error) {
        console.error("Error deleting kelahiran:", error)
        setError("Gagal menghapus data kelahiran")
      }
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <p>{error}</p>
        <Button asChild className="mt-4">
          <Link href="/admin/kelahiran">Kembali</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Detail Kelahiran</h2>
          <p className="text-muted-foreground">Informasi detail kelahiran</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PDFExport elementId="kelahiran-data" fileName={`kelahiran-${kelahiran.nama}`} />
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/kelahiran/${id}/edit`}>Edit</Link>
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
            Hapus
          </Button>
        </div>
      </div>

      <div id="kelahiran-data">
        <Card>
          <CardHeader>
            <CardTitle>Data Kelahiran</CardTitle>
            <CardDescription>Informasi kelahiran</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <p className="text-sm font-medium">NIK</p>
                <p className="text-lg">{kelahiran.nik || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Nama</p>
                <p className="text-lg">{kelahiran.nama}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Tempat Lahir</p>
                <p className="text-lg">{kelahiran.tempat_lahir || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Tanggal Lahir</p>
                <p className="text-lg">{formatDate(kelahiran.tanggal_lahir)}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Jenis Kelamin</p>
                <p className="text-lg">
                  {kelahiran.jenis_kelamin === "LK" ? "Laki-laki" : "Perempuan"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium">Agama</p>
                <p className="text-lg">{kelahiran.agama || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Desa</p>
                <p className="text-lg">{kelahiran.desa || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium">RT</p>
                <p className="text-lg">{kelahiran.rt || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium">RW</p>
                <p className="text-lg">{kelahiran.rw || "-"}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Keluarga</p>
                <p className="text-lg">{kelahiran.kepala}</p>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

