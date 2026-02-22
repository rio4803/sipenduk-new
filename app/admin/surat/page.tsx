"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DataTableWrapper } from "@/components/ui/data-table-wrapper"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { formatDate } from "@/lib/utils"
import { Plus, FileText, Printer } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllSurat } from "./actions"

export default function SuratPage() {
  const [surat, setSurat] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAllSurat()
        setSurat(data)
      } catch (error) {
        console.error("Error loading surat data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const columns = [
    {
      accessorKey: "nomor_surat",
      header: "Nomor Surat",
    },
    {
      accessorKey: "jenis_surat",
      header: "Jenis Surat",
      cell: ({ row }: { row: any }) => {
        const jenis = row.original.jenis_surat
        let label = ""

        switch (jenis) {
          case "kematian":
            label = "Surat Keterangan Kematian"
            break
          case "kelahiran":
            label = "Surat Keterangan Kelahiran"
            break
          case "kedatangan":
            label = "Surat Keterangan Kedatangan"
            break
          case "perpindahan":
            label = "Surat Keterangan Perpindahan"
            break
          // case "domisili":
          //   label = "Surat Keterangan Domisili"
          //   break
          default:
            label = jenis
        }

        return <div>{label}</div>
      },
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
            <Link href={`/admin/surat/${row.original.jenis_surat}/${row.original.id}`}>
              <FileText className="h-4 w-4 mr-1" /> Detail
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/surat/${row.original.jenis_surat}/${row.original.id}/print`}>
              <Printer className="h-4 w-4 mr-1" /> Cetak
            </Link>
          </Button>
        </div>
      ),
    },
  ]

  const filteredSurat = activeTab === "all" ? surat : surat.filter((s) => s.jenis_surat === activeTab)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Surat</h2>
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
          <h2 className="text-3xl font-bold tracking-tight">Data Surat</h2>
          <p className="text-muted-foreground">Kelola data surat keterangan</p>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="kematian">Kematian</TabsTrigger>
          <TabsTrigger value="kelahiran">Kelahiran</TabsTrigger>
          <TabsTrigger value="kedatangan">Kedatangan</TabsTrigger>
          <TabsTrigger value="perpindahan">Perpindahan</TabsTrigger>
          {/* <TabsTrigger value="domisili">Domisili</TabsTrigger> */}
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {activeTab === "all"
                      ? "Semua Surat"
                      : `Surat Keterangan ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                  </CardTitle>
                  <CardDescription>Daftar surat keterangan yang telah dibuat</CardDescription>
                </div>
                {activeTab !== "all" && (
                  <Button asChild>
                    <Link href={`/admin/surat/${activeTab}/buat`}>
                      <Plus className="mr-2 h-4 w-4" /> Buat Surat
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <DataTableWrapper
                columns={columns}
                data={filteredSurat}
                searchColumn="nama_penduduk"
                searchPlaceholder="Cari berdasarkan nama..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

