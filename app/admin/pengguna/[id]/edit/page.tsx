"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter, notFound } from "next/navigation"
import { getPenggunaById, updatePengguna } from "../../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormStatus } from "@/components/form-status"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/lib/auth-context"

export default function EditPenggunaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const {id} = use(params)
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [pengguna, setPengguna] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if(!user) return

    setIsPending(true)
    setError(null)
    setSuccess(null)
    setValidationErrors(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await updatePengguna(id, formData, user.id)

      if (result.error) {
        setError(result.error)
        setValidationErrors(result.errors || null)
      } else if (result.success) {
        setSuccess("Pengguna berhasil diperbarui")
        // Redirect setelah 2 detik
        setTimeout(() => {
          router.push(`/admin/pengguna/${id}`)
        }, 2000)
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsPending(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Pengguna</h2>
        <p className="text-muted-foreground">Edit data pengguna</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Pengguna</CardTitle>
            <CardDescription>Edit informasi pengguna</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} errors={validationErrors} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama_pengguna">Nama Lengkap</Label>
                <Input id="nama_pengguna" name="nama_pengguna" defaultValue={pengguna.name} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" defaultValue={pengguna.username} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select name="level" defaultValue={pengguna.role} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="penduduk">Penduduk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password (Kosongkan jika tidak diubah)</Label>
                <Input id="password" name="password" type="password" />
                <p className="text-xs text-muted-foreground">Biarkan kosong jika tidak ingin mengubah password</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/admin/pengguna/${id}`}>Batal</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

