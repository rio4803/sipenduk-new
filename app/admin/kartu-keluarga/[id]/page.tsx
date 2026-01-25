"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PDFExport } from "@/components/pdf-export"
import {
  getKartuKeluargaById,
  getAnggotaKeluargaWithDetail,
  deleteKartuKeluarga,
  removeAnggotaKeluarga,
} from "../actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/lib/auth-context"
import { formatDate } from "@/lib/utils"

export default function DetailKartuKeluargaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const {id} = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [kk, setKK] = useState<any>(null)
  const [anggota, setAnggota] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [kkData, anggotaData] = await Promise.all([getKartuKeluargaById(id), getAnggotaKeluargaWithDetail(id)])

        if (!kkData) {
          notFound()
        }

        setKK(kkData)
        setAnggota(anggotaData)
      } catch (error) {
        console.error("Error loading kartu keluarga data:", error)
        setError("Gagal memuat data kartu keluarga")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id])

  const handleDelete = async () => {
    if (!user) return

    if (confirm("Apakah Anda yakin ingin menghapus kartu keluarga ini?")) {
      try {
        const result = await deleteKartuKeluarga(id.toString())

        if (result.error) {
          setError(result.error)
        } else {
          router.push("/admin/kartu-keluarga")
        }
      } catch (error) {
        console.error("Error deleting kartu keluarga:", error)
        setError("Gagal menghapus kartu keluarga")
      }
    }
  }

  const handleRemoveAnggota = async (id_anggota: number) => {
    if (!user) return

    if (confirm("Apakah Anda yakin ingin menghapus anggota keluarga ini?")) {
      try {
        const result = await removeAnggotaKeluarga(id_anggota.toString())

        if (result.error) {
          setError(result.error)
        } else {
          // Refresh data
          const anggotaData = await getAnggotaKeluargaWithDetail(id.toString())
          setAnggota(anggotaData)
        }
      } catch (error) {
        console.error("Error removing anggota keluarga:", error)
        setError("Gagal menghapus anggota keluarga")
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
          <Link href="/admin/kartu-keluarga">Kembali</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Detail Kartu Keluarga</h2>
          <p className="text-muted-foreground">Informasi detail kartu keluarga</p>
        </div>
        <div className="flex gap-2">
          <PDFExport elementId="kk-data" fileName={`kk-${kk.no_kk}`} />
          <Button asChild variant="outline">
            <Link href={`/admin/kartu-keluarga/${id}/edit`}>Edit</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/admin/kartu-keluarga/${id}/tambah-anggota`}>Tambah Anggota</Link>
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Hapus
          </Button>
        </div>
      </div>

      <div id="kk-data">
        <Tabs defaultValue="info">
          <TabsList className="mb-4">
            <TabsTrigger value="info">Informasi KK</TabsTrigger>
            <TabsTrigger value="anggota">Anggota Keluarga</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card className="glow-card">
              <CardHeader>
                <CardTitle>Data Kartu Keluarga</CardTitle>
                <CardDescription>Informasi kartu keluarga</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Nomor KK</p>
                    <p className="text-lg">{kk.no_kk}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Kepala Keluarga</p>
                    <p className="text-lg">{kk.kepala}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Alamat</p>
                    <p className="text-lg">
                      Desa {kk.desa}, RT {kk.rt}, RW {kk.rw}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Kecamatan</p>
                    <p className="text-lg">{kk.kec}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Kabupaten</p>
                    <p className="text-lg">{kk.kab}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Provinsi</p>
                    <p className="text-lg">{kk.prov}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anggota">
            <Card className="glow-card">
              <CardHeader>
                <CardTitle>Anggota Keluarga</CardTitle>
                <CardDescription>Daftar anggota dalam kartu keluarga</CardDescription>
              </CardHeader>
              <CardContent>
                {anggota.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">NIK</th>
                          <th className="text-left py-2 px-4">Nama</th>
                          <th className="text-left py-2 px-4">Jenis Kelamin</th>
                          <th className="text-left py-2 px-4">Tempat/Tgl Lahir</th>
                          <th className="text-left py-2 px-4">Hubungan</th>
                          <th className="text-left py-2 px-4">Status</th>
                          <th className="text-left py-2 px-4">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {anggota.map((a) => (
                          <tr key={a.id_anggota} className="border-b">
                            <td className="py-2 px-4">{a.penduduk?.nik || "-"}</td>
                            <td className="py-2 px-4">{a.penduduk?.nama || "-"}</td>
                            <td className="py-2 px-4">{a.penduduk?.jekel === "LK" ? "Laki-laki" : "Perempuan"}</td>
                            <td className="py-2 px-4">
                              {a.penduduk?.tempat_lh || "-"}, {a.penduduk?.tgl_lh ? formatDate(a.penduduk.tgl_lh) : "-"}
                            </td>
                            <td className="py-2 px-4">{a.hubungan}</td>
                            <td className="py-2 px-4">{a.penduduk?.status || "-"}</td>
                            <td className="py-2 px-4">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRemoveAnggota(a.id_anggota)}
                                // disabled={a.hubungan === "Kepala Keluarga"}
                              >
                                Hapus
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>Tidak ada anggota keluarga</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

