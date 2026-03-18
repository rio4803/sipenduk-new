"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createPengumuman } from "../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormStatus } from "@/components/form-status"
import { useAuth } from "@/lib/auth-context"
import { FormField } from "@/components/ui/form-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getPenggunaData } from "../../pengguna/actions"

export default function TambahPengumumanPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pengguna, setPengguna] = useState<any[]>()

  useEffect(() => {
    async function loadPengguna() {
      const penggunaData = await getPenggunaData()
      setPengguna(penggunaData)
    }

    loadPengguna()
  }, [])


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return

    setIsPending(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await createPengumuman(formData, user.id, user.name)

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

            <FormField id="tujuan" label="Tujuan" required>
              <Select name="tujuan">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tujuan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {pengguna && pengguna.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="judul" label="Judul Pengumuman" required>
              <Input
                name="judul"
                placeholder="Masukkan judul pengumuman"
              />
            </FormField>

            <FormField id="isi" label="Isi Pengumuman" required>
              <Textarea
                name="isi"
                placeholder="Masukkan isi pengumuman"
                rows={8}
              />
            </FormField>
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
