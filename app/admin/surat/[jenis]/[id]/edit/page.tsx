"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FormStatus } from "@/components/form-status"
import { DatePicker } from "@/components/ui/date-picker"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getSuratById, updateSurat } from "../../../actions"
import { getPendudukData } from "../../../../penduduk/actions"
import { useAuth } from "@/lib/auth-context"
import { LetterPreview } from "@/components/surat/letter-preview"

export default function EditSuratPage({
  params,
}: {
  params: Promise<{ jenis: string; id: string }>
}) {
  const router = useRouter()
  const { user } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [penduduk, setPenduduk] = useState<any[]>([])
  const [surat, setSurat] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [letterDate, setLetterDate] = useState<Date | null>(null)

  const {id} = use(params)
  const {jenis: jenisSurat} = use(params)

  useEffect(() => {
    async function loadData() {
      try {
        const [suratData, pendudukData] = await Promise.all([getSuratById(id), getPendudukData()])

        if (!suratData) {
          notFound()
        }

        setSurat(suratData)
        setLetterDate(suratData.tanggal_surat ? new Date(suratData.tanggal_surat) : null)
        setPenduduk(pendudukData)
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Gagal memuat data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return

    setIsPending(true)
    setError(null)
    setSuccess(null)
    setValidationErrors(null)

    const formData = new FormData(e.currentTarget)

    // Add the date from the DatePicker component
    if (letterDate) {
      formData.set("tanggal_surat", letterDate.toISOString().split("T")[0])
    }

    try {
      const result = await updateSurat(id, formData, user.id)

      if (result.error) {
        setError(result.error)
        // setValidationErrors(result.errors || null)
      } else if (result.success) {
        setSuccess("Surat berhasil diperbarui")
        // Redirect setelah 2 detik
        setTimeout(() => {
          router.push(`/admin/surat/${jenisSurat}/${id}`)
        }, 2000)
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsPending(false)
    }
  }

  function renderLetterContent(data: any) {
    if (!data) return null

    let title = ""
    switch (jenisSurat) {
      case "kematian":
        title = "SURAT KETERANGAN KEMATIAN"
        break
      case "kelahiran":
        title = "SURAT KETERANGAN KELAHIRAN"
        break
      case "kedatangan":
        title = "SURAT KETERANGAN KEDATANGAN"
        break
      case "perpindahan":
        title = "SURAT KETERANGAN PERPINDAHAN"
        break
      case "domisili":
        title = "SURAT KETERANGAN DOMISILI"
        break
      default:
        title = "SURAT KETERANGAN"
    }

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <p>Nomor: {data.nomor_surat}</p>
        </div>
        <p>Yang bertanda tangan di bawah ini, Kepala Desa ... menerangkan dengan sebenarnya bahwa:</p>
        <div className="space-y-2">
          <p>
            <span className="inline-block w-32">Nama</span>: {data.nama_penduduk || "..."}
          </p>
          <p>
            <span className="inline-block w-32">Keterangan</span>: {data.keterangan || "..."}
          </p>
        </div>
        <p>Demikian surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.</p>
        <div className="text-right mt-8">
          <p>..., {letterDate ? letterDate.toLocaleDateString() : "..."}</p>
          <p className="mt-4">Kepala Desa</p>
          <p className="mt-16">(...........................)</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  let suratTitle = ""
  switch (jenisSurat) {
    case "kematian":
      suratTitle = "Surat Keterangan Kematian"
      break
    case "kelahiran":
      suratTitle = "Surat Keterangan Kelahiran"
      break
    case "kedatangan":
      suratTitle = "Surat Keterangan Kedatangan"
      break
    case "perpindahan":
      suratTitle = "Surat Keterangan Perpindahan"
      break
    case "domisili":
      suratTitle = "Surat Keterangan Domisili"
      break
    default:
      suratTitle = "Surat Keterangan"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit {suratTitle}</h2>
        <p className="text-muted-foreground">Edit informasi surat keterangan</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Surat</CardTitle>
            <CardDescription>Edit informasi surat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} errors={validationErrors} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomor_surat">Nomor Surat</Label>
                <Input id="nomor_surat" name="nomor_surat" defaultValue={surat.nomor_surat} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggal_surat">Tanggal Surat</Label>
                <DatePicker
                  id="tanggal_surat"
                  name="tanggal_surat"
                  selected={letterDate}
                  onSelect={setLetterDate}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_penduduk">Penduduk</Label>
                <Select name="id_penduduk" defaultValue={surat.id_penduduk} required>
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

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea id="keterangan" name="keterangan" rows={3} defaultValue={surat.keterangan} required />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/admin/surat/${jenisSurat}/${id}`}>Batal</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <LetterPreview
        type={jenisSurat}
        formData={{ ...surat, tanggal_surat: letterDate?.toISOString() }}
        renderContent={renderLetterContent}
      />
    </div>
  )
}

