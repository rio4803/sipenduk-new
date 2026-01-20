"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getPengumumanData, deletePengumuman } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/lib/auth-context"
import { Trash2, Plus, Bell } from "lucide-react"

export default function PengumumanPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [pengumumanList, setPengumumanList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPengumuman()
  }, [])

  async function loadPengumuman() {
    try {
      const data = await getPengumumanData()
      setPengumumanList(data)
    } catch (error) {
      console.error("Error loading pengumuman:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) return

    const result = await deletePengumuman(id)
    if (result.success) {
      loadPengumuman()
    } else {
      alert(result.error)
    }
  }

  async function handleSendNotification(pengumuman: any) {
    if (!confirm("Kirim notifikasi push untuk pengumuman ini?")) return

    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: pengumuman.judul,
          body: pengumuman.isi.substring(0, 100) + (pengumuman.isi.length > 100 ? "..." : ""),
          data: {
            url: "/dashboard/notifikasi",
            pengumumanId: pengumuman.id_pengumuman,
          },
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        alert(`Notifikasi berhasil dikirim ke ${result.sent} pengguna`)
      } else {
        alert("Gagal mengirim notifikasi: " + result.error)
      }
    } catch (error) {
      console.error("Error sending notification:", error)
      alert("Terjadi kesalahan saat mengirim notifikasi")
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pengumuman</h2>
          <p className="text-muted-foreground">Kelola pengumuman untuk warga desa</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/pengumuman/tambah">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pengumuman
            </Link>
          </Button>
        </div>
      </div>

      {pengumumanList.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Belum ada pengumuman</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pengumumanList.map((pengumuman) => (
            <Card key={pengumuman.id_pengumuman}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{pengumuman.judul}</CardTitle>
                    <CardDescription>
                      {new Date(pengumuman.tanggal).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" · "}oleh {pengumuman.penulis}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendNotification(pengumuman)}
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(pengumuman.id_pengumuman)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{pengumuman.isi}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
