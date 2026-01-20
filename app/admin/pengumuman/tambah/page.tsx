"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createPengumuman } from "../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormStatus } from "@/components/form-status"
import { useAuth } from "@/lib/auth-context"

export default function TambahPengumumanPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return

    setIsPending(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await createPengumuman(formData, user.id, user.nama)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess("Pengumuman berhasil dibuat")
        setTimeout(() => {
          router.push("/admin/pengumuman")
        }, 2000)
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tambah Pengumuman</h2>
        <p className="text-muted-foreground">Buat pengumuman baru untuk warga desa</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Pengumuman</CardTitle>
            <CardDescription>Masukkan informasi pengumuman</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} />

            <div className="space-y-2">
              <Label htmlFor="judul">Judul Pengumuman</Label>
              <Input
                id="judul"
                name="judul"
                placeholder="Masukkan judul pengumuman"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isi">Isi Pengumuman</Label>
              <Textarea
                id="isi"
                name="isi"
                placeholder="Masukkan isi pengumuman"
                rows={8}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/admin/pengumuman">Batal</Link>
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
