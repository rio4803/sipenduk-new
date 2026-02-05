"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DataTableWrapper } from "@/components/ui/data-table-wrapper"
import { formatDate } from "@/lib/utils"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { getKematianData } from "./actions"

export default function KematianPage() {
  const [kematian, setKematian] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getKematianData()
        setKematian(data)
      } catch (error) {
        console.error("Error loading kematian data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const columns = [
    {
      accessorKey: "nama",
      header: "Penduduk",
    },
    {
      accessorKey: "tanggal_kematian",
      header: "Tanggal Meninggal",
      cell: ({ row }: {row:any}) => <div>{formatDate(row.original.tanggal_kematian)}</div>,
    },
    {
      accessorKey: "sebab_kematian",
      header: "Sebab",
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }: {row:any}) => (
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/kematian/${row.original.id}`}>Detail</Link>
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return <div>Memuat data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Kematian</h2>
          <p className="text-muted-foreground">Kelola data kematian</p>
        </div>
        <Button asChild>
          <Link href="/admin/kematian/tambah">
            <Plus className="mr-2 h-4 w-4" /> Tambah Kematian
          </Link>
        </Button>
      </div>

      <DataTableWrapper
        columns={columns}
        data={kematian}
        searchColumn="nama"
        searchPlaceholder="Cari berdasarkan nama penduduk..."
      />
    </div>
  )
}

