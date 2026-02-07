"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DataTableWrapper } from "@/components/ui/data-table-wrapper"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { formatDate } from "@/lib/utils"
import { Plus, FileText, Printer } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSuratByJenis } from "../actions"

export default function JenisSuratPage({
  params,
}: {
  params: Promise<{ jenis: string }>
}) {
  const [surat, setSurat] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const {jenis: jenisSurat} = use(params)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getSuratByJenis(jenisSurat)
        setSurat(data)
      } catch (error) {
        console.error("Error loading surat data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [jenisSurat])

  const columns = [
    {
      accessorKey: "nomor_surat",
      header: "Nomor Surat",
    },
    {
      accessorKey: "nama_penduduk",
      header: "Nama Penduduk",
    },
    {
      accessorKey: "tanggal_surat",
      header: "Tanggal Surat",
      cell: ({ row }: { row: any }) => <div>{formatDate(row.original.tanggal_surat)}</div>,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }: { row: any }) => (
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/surat/${jenisSurat}/${row.original.id}`}>
              <FileText className="h-4 w-4 mr-1" /> Detail
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/surat/${jenisSurat}/${row.original.id}/print`}>
              <Printer className="h-4 w-4 mr-1" /> Cetak
            </Link>
          </Button>
        </div>
      ),
    },
  ]

  let title = ""
  switch (jenisSurat) {
    case "kematian":
      title = "Surat Keterangan Kematian"
      break
    case "kelahiran":
      title = "Surat Keterangan Kelahiran"
      break
    case "kedatangan":
      title = "Surat Keterangan Kedatangan"
      break
    case "perpindahan":
      title = "Surat Keterangan Perpindahan"
      break
    case "domisili":
      title = "Surat Keterangan Domisili"
      break
    default:
      title = "Surat Keterangan"
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">Memuat data surat...</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">Kelola data surat keterangan</p>
        </div>
        <Button asChild>
          <Link href={`/admin/surat/${jenisSurat}/buat`}>
            <Plus className="mr-2 h-4 w-4" /> Buat Surat
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar {title}</CardTitle>
          <CardDescription>Daftar surat keterangan yang telah dibuat</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTableWrapper
            columns={columns}
            data={surat}
            searchColumn="nama_penduduk"
            searchPlaceholder="Cari berdasarkan nama..."
          />
        </CardContent>
      </Card>
    </div>
  )
}

