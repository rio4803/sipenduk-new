"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatRelativeTime, getAge } from "@/lib/utils"
import { PDFExport } from "@/components/pdf-export"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Users, Home, Bell, FileText } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NotificationButton } from "@/components/notification-button"

export default function DashboardPage() {
  const { user } = useAuth()
  const [kkData, setKkData] = useState<any>(null)
  const [anggotaKeluarga, setAnggotaKeluarga] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Avoid hydration mismatch by only rendering user-dependent content after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function fetchData() {
      if (!user) return

      try {
        const response = await fetch(`/api/dashboard/keluarga?username=${user.username}`)

        if (!response.ok) {
           // Allow 404 or other errors to be handled gracefully
           console.warn("API response not ok", response.status)
        }
        
        const data = await response.json()
        setKkData(data.kkData || null)

        // --- SORTING ANGGOTA KELUARGA ---
        if (data.anggotaKeluarga && Array.isArray(data.anggotaKeluarga)) {
          const order: any = {
            "Suami": 1,
            "Istri": 2,
            "Anak": 3,
          }

          const sortedAnggota = [...data.anggotaKeluarga].sort((a: any, b: any) => {
            const orderA = order[a.hubungan] || 99
            const orderB = order[b.hubungan] || 99
            return orderA - orderB
          })
          setAnggotaKeluarga(sortedAnggota)
        } else {
           setAnggotaKeluarga([])
        }
        // --------------------------------

        const notifResponse = await fetch(`/api/notifications?userId=${user.id}`)
        if (notifResponse.ok) {
             let notifData = await notifResponse.json()
             // Ensure filtering is safe
             notifData = notifData.filter(
              (notif: any) =>
                notif.recipients.includes("all") ||
                notif.recipients.includes(user.id.toString()),
            )
            // Process reads
            notifData.forEach((notif: any) => {
              notif.read = notif.read_by && notif.read_by.includes(user.id.toString())
            })
            // Sort
            notifData.sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            )
            setNotifications(notifData.slice(0, 10))
        }

      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Gagal memuat data keluarga/notifikasi")
      } finally {
        setIsLoading(false)
      }
    }

    if (mounted) {
        fetchData()
    }
  }, [user, mounted])

  if (!mounted || isLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <LoadingSpinner />
        </div>
    )
  }

  // Handle case where user is logged in but has no family card linked
  if (!kkData && !isLoading) {
      return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Selamat datang, {user?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                   <NotificationButton />
                </div>
            </div>

            <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-yellow-600" />
                        Data Keluarga Tidak Ditemukan
                    </CardTitle>
                    <CardDescription>
                        Anda belum terdaftar dalam Kartu Keluarga atau data belum disinkronisasi.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Silakan hubungi administrator desa untuk memverifikasi data kependudukan Anda.</p>
                </CardContent>
            </Card>
            
            {/* Still show notifications */}
             <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>Notifikasi</CardTitle>
                        <CardDescription>Pemberitahuan terbaru</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                            <div key={notification.id} className="flex items-start space-x-2 pb-3 border-b last:border-0">
                                <Bell
                                className={`h-5 w-5 mt-0.5 ${notification.read ? "text-muted-foreground" : "text-primary"}`}
                                />
                                <div>
                                <p className="font-medium">{notification.title}</p>
                                <p className="text-sm text-muted-foreground">{notification.message}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(notification.created_at)} ({formatRelativeTime(notification.created_at)})
                                </p>
                                </div>
                            </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground">Tidak ada notifikasi</p>
                        )}
                        </div>
                    </CardContent>
                </Card>
                 <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>Aksi Cepat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Menu tidak tersedia karena data keluarga belum ada.</p>
                    </CardContent>
                </Card>
             </div>
        </div>
      )
  }

  // --- CHART DATA PREPARATION (Safe to run now that we know kkData exists? Actually check anggotaKeluarga) ---
  const genderData = [
    {
      name: "Laki-laki",
      value: anggotaKeluarga.filter((a) => a.penduduk?.jekel === "LK").length,
      color: "#3b82f6",
    },
    {
      name: "Perempuan",
      value: anggotaKeluarga.filter((a) => a.penduduk?.jekel === "PR").length,
      color: "#ec4899",
    },
  ]

  const ageGroups: any = {
    "0-10": 0,
    "11-20": 0,
    "21-30": 0,
    "31-40": 0,
    "41-50": 0,
    "51+": 0,
  }

  anggotaKeluarga.forEach((a) => {
    if (a.penduduk?.tgl_lh) {
        const age = getAge(a.penduduk.tgl_lh)
        if (age <= 10) ageGroups["0-10"]++
        else if (age <= 20) ageGroups["11-20"]++
        else if (age <= 30) ageGroups["21-30"]++
        else if (age <= 40) ageGroups["31-40"]++
        else if (age <= 50) ageGroups["41-50"]++
        else ageGroups["51+"]++
    }
  })

  const ageData = Object.entries(ageGroups).map(([name, value]: any, index) => ({
    name,
    value,
    color: `hsl(${index * 40}, 70%, 50%)`,
  }))


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Selamat datang, {user?.name}</p>
        </div>
        <div className="flex items-center gap-2">
           <NotificationButton />
           <PDFExport elementId="kk-data" fileName="data-keluarga" />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Anggota Keluarga" value={anggotaKeluarga.length} icon={Users} />
        <StatsCard title="Laki-laki" value={genderData[0].value} icon={Users} iconColor="text-blue-500" />
        <StatsCard title="Perempuan" value={genderData[1].value} icon={Users} iconColor="text-pink-500" />
        <StatsCard title="Kepala Keluarga" value={kkData.kepala} icon={Home} description="Nama" />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {/* Quick Actions */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Akses cepat ke layanan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start">
              <Link href="/dashboard/keluarga">
                <Users className="mr-2 h-4 w-4" />
                Lihat Data Keluarga
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Notifikasi</CardTitle>
            <CardDescription>Pemberitahuan terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-2 pb-3 border-b last:border-0">
                    <Bell
                      className={`h-5 w-5 mt-0.5 ${notification.read ? "text-muted-foreground" : "text-primary"}`}
                    />
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(notification.created_at)} ({formatRelativeTime(notification.created_at)})
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">Tidak ada notifikasi</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <ActivityFeed />
      </div>

      <div id="kk-data" className="space-y-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Data Kartu Keluarga</CardTitle>
            <CardDescription>Informasi kartu keluarga Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Nomor KK</p>
                <p className="text-lg">{kkData.no_kk}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Kepala Keluarga</p>
                <p className="text-lg">{kkData.kepala}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Alamat</p>
                <p className="text-lg">
                  Desa {kkData.desa}, RT {kkData.rt}, RW {kkData.rw}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Kecamatan/Kabupaten/Provinsi</p>
                <p className="text-lg">
                  {kkData.kec}, {kkData.kab}, {kkData.prov}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Distribusi Jenis Kelamin</CardTitle>
              <CardDescription>Anggota keluarga berdasarkan jenis kelamin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent || 0 * 100).toFixed(0)}%`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} orang`, "Jumlah"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Distribusi Umur</CardTitle>
              <CardDescription>Anggota keluarga berdasarkan kelompok umur</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => (percent > 0 ? `${name}: ${(percent || 0 * 100).toFixed(0)}%` : "")}
                    >
                      {ageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} orang`, "Jumlah"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Anggota Keluarga</CardTitle>
            <CardDescription>Daftar anggota keluarga dalam KK</CardDescription>
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
                    <th className="text-left py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {anggotaKeluarga.map((anggota) => (
                    <tr key={anggota.id_anggota} className="border-b">
                      <td className="py-2 px-4">{anggota.penduduk?.nik || "-"}</td>
                      <td className="py-2 px-4">{anggota.penduduk?.nama || "-"}</td>
                      <td className="py-2 px-4">{anggota.penduduk?.jekel === "LK" ? "Laki-laki" : "Perempuan"}</td>
                      <td className="py-2 px-4">
                        {anggota.penduduk?.tempat_lh}, {anggota.penduduk?.tgl_lh ? formatDate(anggota.penduduk.tgl_lh) : "-"}
                      </td>
                      <td className="py-2 px-4">{anggota.hubungan}</td>
                      <td className="py-2 px-4">{anggota.penduduk?.status || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

 