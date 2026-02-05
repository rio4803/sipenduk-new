"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DataTableWrapper } from "@/components/ui/data-table-wrapper"
import { formatDate } from "@/lib/utils"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { getPerpindahanData } from "./actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function PerpindahanPage() {
  const [perpindahan, setPerpindahan] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPerpindahanData()
        setPerpindahan(data)
      } catch (error) {
        console.error("Error loading perpindahan data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const columns = [
    {
      accessorKey: "nama_penduduk",
      header: "Nama Penduduk",
    },
    {
      accessorKey: "tanggal_pindah",
      header: "Tanggal Pindah",
      cell: ({ row }: { row: any }) => <div>{formatDate(row.original.tanggal_pindah)}</div>,
    },
    {
      accessorKey: "alasan",
      header: "Alasan",
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }: { row: any }) => (
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/perpindahan/${row.original.id}`}>Detail</Link>
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Perpindahan</h2>
          <p className="text-muted-foreground">Memuat data perpindahan...</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Perpindahan</h2>
          <p className="text-muted-foreground">Kelola data perpindahan penduduk</p>
        </div>
        <Button asChild>
          <Link href="/admin/perpindahan/tambah">
            <Plus className="mr-2 h-4 w-4" /> Tambah Perpindahan
          </Link>
        </Button>
      </div>

      <DataTableWrapper
        columns={columns}
        data={perpindahan}
        searchColumn="nama_penduduk"
        searchPlaceholder="Cari berdasarkan nama penduduk..."
      />
    </div>
  )
}

