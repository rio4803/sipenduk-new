"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createKematian } from "../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FormStatus } from "@/components/form-status"
import { getPendudukData } from "../../penduduk/actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/lib/auth-context"

export default function TambahKematianPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [penduduk, setPenduduk] = useState<any[]>([])
  const [isLoadingPenduduk, setIsLoadingPenduduk] = useState(true)

  useEffect(() => {
    async function loadPenduduk() {
      try {
        const data = await getPendudukData()
        const filteredData = data.filter(penduduk => penduduk.status_penduduk == "Ada")
        setPenduduk(filteredData)
      } catch (error) {
        console.error("Error loading penduduk data:", error)
      } finally {
        setIsLoadingPenduduk(false)
      }
    }

    loadPenduduk()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return

    setIsPending(true)
    setError(null)
    setSuccess(null)
    setValidationErrors(null)

    const formData = new FormData(e.currentTarget)
    const namaPenduduk = penduduk.find(p => p.id == formData.get("id_pdd"))?.nama
    formData.set("nama", namaPenduduk)
    try {
      const result = await createKematian(formData, user.id)

      if (result.error) {
        setError(result.error)
        setValidationErrors(result.errors || null)
      } else if (result.success) {
        setSuccess("Data kematian berhasil ditambahkan")
        // Redirect setelah 2 detik
        setTimeout(() => {
          router.push("/admin/kematian")
        }, 2000)
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsPending(false)
    }
  }

  if (isLoadingPenduduk) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tambah Kematian</h2>
        <p className="text-muted-foreground">Tambahkan data kematian penduduk</p>
      </div>

      <Card className="glow-card">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Kematian</CardTitle>
            <CardDescription>Masukkan informasi kematian penduduk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} errors={validationErrors} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_pdd">Penduduk</Label>
                <Select name="id_pdd" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih penduduk" />
                  </SelectTrigger>
                  <SelectContent>
                    {penduduk.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nama} - {p.nik}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tgl_mendu">Tanggal Meninggal</Label>
                <Input id="tgl_mendu" name="tgl_mendu" type="date" required />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="sebab">Sebab</Label>
                <Textarea id="sebab" name="sebab" rows={3} required />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/admin/kematian">Batal</Link>
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

