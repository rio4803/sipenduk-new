"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DataTableWrapper } from "@/components/ui/data-table-wrapper"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { getKartuKeluargaData } from "./actions"
import { KartuKeluarga } from "@/lib/dummy-data"

export default function KartuKeluargaPage() {
  const [kartuKeluarga, setKartuKeluarga] = useState([] as KartuKeluarga[])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data: KartuKeluarga[] = await getKartuKeluargaData()

        setKartuKeluarga(data)
      } catch (error) {
        console.error("Error loading kartu keluarga data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const columns = [
    {
      accessorKey: "no_kk",
      header: "Nomor KK",
    },
    {
      accessorKey: "kepala",
      header: "Kepala Keluarga",
    },
    {
      accessorKey: "desa",
      header: "Desa",
    },
    {
      accessorKey: "rt",
      header: "RT",
    },
    {
      accessorKey: "rw",
      header: "RW",
    },
    {
      accessorKey: "kecamatan",
      header: "Kecamatan",
    },
    {
      accessorKey: "kabupaten",
      header: "Kabupaten",
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }: { row: { original: KartuKeluarga } }) => (
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/kartu-keluarga/${row.original.id}`}>Detail</Link>
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
          <h2 className="text-3xl font-bold tracking-tight">Data Kartu Keluarga</h2>
          <p className="text-muted-foreground">Kelola data kartu keluarga</p>
        </div>
        <Button asChild>
          <Link href="/admin/kartu-keluarga/tambah">
            <Plus className="mr-2 h-4 w-4" /> Tambah Kartu Keluarga
          </Link>
        </Button>
      </div>

      <DataTableWrapper
        columns={columns}
        data={kartuKeluarga}
        searchColumn="no_kk"
        searchPlaceholder="Cari berdasarkan nomor KK..."
      /> 
    </div>
  )
}

