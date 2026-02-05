"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { PDFExport } from "@/components/pdf-export"
import { getPerpindahanById, deletePerpindahan } from "../actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/lib/auth-context"

export default function DetailPerpindahanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const {id} = use(params)
  const router = useRouter()
  const [perpindahan, setPerpindahan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const {user} = useAuth()

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPerpindahanById(id)
        if (!data) {
          notFound()
        }
        setPerpindahan(data)
      } catch (error) {
        console.error("Error loading perpindahan data:", error)
        setError("Gagal memuat data perpindahan")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id])

  const handleDelete = async () => {
    if(!user) return
    if (confirm("Apakah Anda yakin ingin menghapus data perpindahan ini?")) {
      try {
        await deletePerpindahan(id, user.id)
        router.push("/admin/perpindahan")
      } catch (error) {
        console.error("Error deleting perpindahan:", error)
        setError("Gagal menghapus data perpindahan")
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
          <Link href="/admin/perpindahan">Kembali</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Detail Perpindahan</h2>
          <p className="text-muted-foreground">Informasi detail perpindahan penduduk</p>
        </div>
        <div className="flex gap-2">
          <PDFExport elementId="perpindahan-data" fileName={`perpindahan-${perpindahan.penduduk_nama}`} />
          <Button asChild variant="outline">
            <Link href={`/admin/perpindahan/${id}/edit`}>Edit</Link>
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Hapus
          </Button>
        </div>
      </div>

      <div id="perpindahan-data">
        <Card>
          <CardHeader>
            <CardTitle>Data Perpindahan</CardTitle>
            <CardDescription>Informasi perpindahan penduduk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Nama Penduduk</p>
                <p className="text-lg">{perpindahan.nama}</p>
              </div>
              <div>
                <p className="text-sm font-medium">NIK</p>
                <p className="text-lg">{perpindahan.nik || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Tanggal Pindah</p>
                <p className="text-lg">{formatDate(perpindahan.tanggal_pindah)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Alasan</p>
                <p className="text-lg">{perpindahan.alasan}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

