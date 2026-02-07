"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPenggunaById, deletePengguna } from "../actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/lib/auth-context"

export default function DetailPenggunaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const {id} = use(params)
  const router = useRouter()
  const [pengguna, setPengguna] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const {user} = useAuth()

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPenggunaById(id)
        if (!data) {
          notFound()
        }
        setPengguna(data)
      } catch (error) {
        console.error("Error loading pengguna data:", error)
        setError("Gagal memuat data pengguna")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id])

  const handleDelete = async () => {
    if(!user) return
    if (confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      try {
        const result = await deletePengguna(id, user.id)

        if (result.error) {
          setError(result.error)
        } else {
          router.push("/admin/pengguna")
        }
      } catch (error) {
        console.error("Error deleting pengguna:", error)
        setError("Gagal menghapus pengguna")
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
          <Link href="/admin/pengguna">Kembali</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Detail Pengguna</h2>
          <p className="text-muted-foreground">Informasi detail pengguna</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/pengguna/${id}/edit`}>Edit</Link>
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Hapus
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Pengguna</CardTitle>
          <CardDescription>Informasi pengguna sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Nama</p>
              <p className="text-lg">{pengguna.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Username</p>
              <p className="text-lg">{pengguna.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Level</p>
              <p className="text-lg">{pengguna.role || "-"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-lg">********</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

