"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { PDFExport } from "@/components/pdf-export"
import { getKedatanganById, deletePendatang } from "../actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/lib/auth-context"

export default function DetailKedatanganPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const{id} = use(params)
  const router = useRouter()
  const [kedatangan, setKedatangan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const {user} = useAuth()

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getKedatanganById(id)
        if (!data) {
          notFound()
        }
        setKedatangan(data)
      } catch (error) {
        console.error("Error loading kedatangan data:", error)
        setError("Gagal memuat data kedatangan")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id])

  const handleDelete = async () => {
    if(!user) return
    if (confirm("Apakah Anda yakin ingin menghapus data kedatangan ini?")) {
      try {
        await deletePendatang(id, user.id)
        router.push("/admin/kedatangan")
      } catch (error) {
        console.error("Error deleting kedatangan:", error)
        setError("Gagal menghapus data kedatangan")
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
          <Link href="/admin/kedatangan">Kembali</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Detail Kedatangan</h2>
          <p className="text-muted-foreground">Informasi detail kedatangan penduduk</p>
        </div>
        <div className="flex gap-2">
          <PDFExport elementId="kedatangan-data" fileName={`kedatangan-${kedatangan.nama_pendatang}`} />
          <Button asChild variant="outline">
            <Link href={`/admin/kedatangan/${id}/edit`}>Edit</Link>
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Hapus
          </Button>
        </div>
      </div>

      <div id="kedatangan-data">
        <Card>
          <CardHeader>
            <CardTitle>Data Kedatangan</CardTitle>
            <CardDescription>Informasi kedatangan penduduk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">NIK</p>
                <p className="text-lg">{kedatangan.nik}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Nama</p>
                <p className="text-lg">{kedatangan.nama_pendatang}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Jenis Kelamin</p>
                <p className="text-lg">{kedatangan.jenis_kelamin === "LK" ? "Laki-laki" : "Perempuan"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Tanggal Datang</p>
                <p className="text-lg">{formatDate(kedatangan.tanggal_kedatangan)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Pelapor</p>
                <p className="text-lg">{kedatangan.nama_pelapor}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

