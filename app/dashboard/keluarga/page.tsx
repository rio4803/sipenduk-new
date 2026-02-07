"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/utils"
import { PDFExport } from "@/components/pdf-export"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function KeluargaPage() {
  const { user } = useAuth()
  const [kkData, setKkData] = useState<any>(null)
  const [anggotaKeluarga, setAnggotaKeluarga] = useState<any[]>([])
  const [kelahiran, setKelahiran] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!user) return

      try {
        const response = await fetch(`/api/dashboard/keluarga/detail?userId=${user.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch data")
        }

        const data = await response.json()
        setKkData(data.kkData)

        // --- Sorting urutan keluarga ---
        const order = {
          Suami: 1,
          Istri: 2,
          Anak: 3,
        }

        const sortedAnggota = [...data.anggotaKeluarga].sort((a, b) => {
          const orderA = order[a.hubungan as keyof typeof order] || 99
          const orderB = order[b.hubungan as keyof typeof order] || 99
          return orderA - orderB
        })

        setAnggotaKeluarga(sortedAnggota)
        // --------------------------------

        setKelahiran(data.kelahiran)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Gagal memuat data keluarga")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (isLoading) {
    return <LoadingSpinner text="Memuat data keluarga..." />
  }

  if (error || !kkData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Data Keluarga</h2>
          <p className="text-muted-foreground">Data tidak ditemukan</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Data Keluarga</h2>
          <p className="text-muted-foreground">Informasi detail keluarga</p>
        </div>
        <PDFExport elementId="keluarga-data" fileName="detail-keluarga" />
      </div>

      <div id="keluarga-data">
        <Tabs defaultValue="anggota">
          <TabsList className="mb-4 w-full justify-start overflow-x-auto">
            <TabsTrigger value="anggota">Anggota Keluarga</TabsTrigger>
            <TabsTrigger value="kelahiran">Kelahiran</TabsTrigger>
          </TabsList>

          <TabsContent value="anggota">
            <Card>
              <CardHeader>
                <CardTitle>Anggota Keluarga</CardTitle>
                <CardDescription>Daftar anggota keluarga dalam KK {kkData.no_kk}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">NIK</th>
                        <th className="text-left py-2 px-4">Nama</th>
                        <th className="text-left py-2 px-4">Jenis Kelamin</th>
                        <th className="text-left py-2 px-4">Tempat/Tgl Lahir</th>
                        <th className="text-left py-2 px-4">Hubungan</th>
                        <th className="text-left py-2 px-4">Agama</th>
                        <th className="text-left py-2 px-4">Pendidikan</th>
                        <th className="text-left py-2 px-4">Pekerjaan</th>
                        <th className="text-left py-2 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {anggotaKeluarga.map((anggota) => (
                        <tr key={anggota.id} className="border-b">
                          <td className="py-2 px-4">{anggota.nik}</td>
                          <td className="py-2 px-4">{anggota.nama}</td>
                          <td className="py-2 px-4">{anggota.jenis_kelamin === "LK" ? "Laki-laki" : "Perempuan"}</td>
                          <td className="py-2 px-4">
                            {anggota.tempat_lahir}, {formatDate(anggota.tanggal_lahir)}
                          </td>
                          <td className="py-2 px-4">{anggota.hubungan}</td>
                          <td className="py-2 px-4">{anggota.agama}</td>
                          <td className="py-2 px-4">-</td>
                          <td className="py-2 px-4">{anggota.pekerjaan}</td>
                          <td className="py-2 px-4">{anggota.status_penduduk}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kelahiran">
            <Card>
              <CardHeader>
                <CardTitle>Data Kelahiran</CardTitle>
                <CardDescription>Daftar kelahiran dalam keluarga</CardDescription>
              </CardHeader>
              <CardContent>
                {kelahiran && kelahiran?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Nama</th>
                          <th className="text-left py-2 px-4">Tanggal Lahir</th>
                          <th className="text-left py-2 px-4">Jenis Kelamin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kelahiran.map((k) => (
                          <tr key={k.id} className="border-b">
                            <td className="py-2 px-4">{k.nama}</td>
                            <td className="py-2 px-4">{formatDate(k.tanggal_lahir)}</td>
                            <td className="py-2 px-4">{k.jenis_kelamin === "LK" ? "Laki-laki" : "Perempuan"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>Tidak ada data kelahiran</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

