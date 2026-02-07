"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DataTableWrapper } from "@/components/ui/data-table-wrapper"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { getPenggunaData } from "./actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function PenggunaPage() {
  const [pengguna, setPengguna] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPenggunaData()
        setPengguna(data)
      } catch (error) {
        console.error("Error loading pengguna data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const columns = [
    {
      accessorKey: "name",
      header: "Nama",
    },
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }:{ row: any }) => (
        <div className={row.original.role == "admin" ? "text-blue-600 dark:text-blue-400" : ""}>
          {row.original.role || "-"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }: { row: any }) => (
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/pengguna/${row.original.id}`}>Detail</Link>
          </Button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Pengguna</h2>
          <p className="text-muted-foreground">Memuat data pengguna...</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Pengguna</h2>
          <p className="text-muted-foreground">Kelola data pengguna sistem</p>
        </div>
        <Button asChild>
          <Link href="/admin/pengguna/tambah">
            <Plus className="mr-2 h-4 w-4" /> Tambah Pengguna
          </Link>
        </Button>
      </div>

      <DataTableWrapper
        columns={columns}
        data={pengguna}
        searchColumn="name"
        searchPlaceholder="Cari berdasarkan nama..."
      />
    </div>
  )
}

