"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { PDFExport } from "@/components/pdf-export"
import { getKematianById, deleteKematian } from "../actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/lib/auth-context"

export default function DetailKematianPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const {id} = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [kematian, setKematian] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getKematianById(id)
        if (!data) {
          notFound()
        }
        setKematian(data)
      } catch (error) {
        console.error("Error loading kematian data:", error)
        setError("Gagal memuat data kematian")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id])

  const handleDelete = async () => {
    if (!user) return

    if (confirm("Apakah Anda yakin ingin menghapus data kematian ini?")) {
      try {
        await deleteKematian(id, user.id)
        router.push("/admin/kematian")
      } catch (error) {
        console.error("Error deleting kematian:", error)
        setError("Gagal menghapus data kematian")
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
          <Link href="/admin/kematian">Kembali</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Detail Kematian</h2>
          <p className="text-muted-foreground">Informasi detail kematian penduduk</p>
        </div>
        <div className="flex gap-2">
          <PDFExport elementId="kematian-data" fileName={`kematian-${kematian.penduduk_nama}`} />
          <Button asChild variant="outline">
            <Link href={`/admin/kematian/${id}/edit`}>Edit</Link>
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Hapus
          </Button>
        </div>
      </div>

      <div id="kematian-data">
        <Card className="glow-card">
          <CardHeader>
            <CardTitle>Data Kematian</CardTitle>
            <CardDescription>Informasi kematian penduduk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Nama Penduduk</p>
                <p className="text-lg">{kematian.nama}</p>
              </div>
              <div>
                <p className="text-sm font-medium">NIK</p>
                <p className="text-lg">{kematian.nik || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Tanggal Meninggal</p>
                <p className="text-lg">{formatDate(kematian.tanggal_kematian)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Sebab</p>
                <p className="text-lg">{kematian.sebab_kematian}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

