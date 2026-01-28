"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DataTableWrapper } from "@/components/ui/data-table-wrapper"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { formatDate } from "@/lib/utils"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { getPendudukData } from "./actions"

export default function PendudukPage() {
  const [penduduk, setPenduduk] = useState<any>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPendudukData()
        setPenduduk(data)
      } catch (error) {
        console.error("Error loading penduduk data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const columns = [
    {
      id: "no_kk",
      header: "Nomor KK",
      cell: ({ row }:{ row: any }) => {
        const noKK = row.original.no_kk || "-"
        return `${noKK}`
      },
    },
    {
      accessorKey: "nik",
      header: "NIK",
    },
    {
      accessorKey: "nama",
      header: "Nama",
    },
    {
      accessorKey: "jenis_kelamin",
      header: "Jenis Kelamin",
      cell: ({ row }:{ row: any }) => <div>{row.original.jenis_kelamin === "LK" ? "Laki-laki" : "Perempuan"}</div>,
    },
    {
      accessorKey: "tempat_lahir",
      header: "Tempat Lahir",
    },
    {
      accessorKey: "tanggal_lahir",
      header: "Tanggal Lahir",
      cell: ({ row }:{ row: any }) => <div>{formatDate(row.original.tanggal_lahir) || "-"}</div>,
    },
    {
      accessorKey: "agama",
      header: "Agama",
    },
    {
      accessorKey: "status_penduduk",
      header: "Status",
      cell: ({ row }:{ row: any }) => {
        const status = row.original.status_penduduk
        let statusClass = ""

        switch (status) {
          case "Ada":
            statusClass = "text-green-600 dark:text-green-400"
            break
          case "Meninggal":
            statusClass = "text-red-600 dark:text-red-400"
            break
          case "Pindah":
            statusClass = "text-yellow-600 dark:text-yellow-400"
            break
        }

        return <div className={statusClass}>{status}</div>
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }:{ row: any }) => (
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/penduduk/${row.original.id}`}>Detail</Link>
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Penduduk</h2>
          <p className="text-muted-foreground">Memuat data penduduk...</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Penduduk</h2>
          <p className="text-muted-foreground">Kelola data penduduk desa</p>
        </div>
        <Button asChild>
          <Link href="/admin/penduduk/tambah">
            <Plus className="mr-2 h-4 w-4" /> Tambah Penduduk
          </Link>
        </Button>
      </div>

      <DataTableWrapper
        columns={columns}
        data={penduduk}
        searchColumn="nama"
        searchPlaceholder="Cari berdasarkan nama..."
      />
    </div>
  )
}

