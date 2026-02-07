"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { FormStatus } from "@/components/form-status"
import { LetterPreview } from "@/components/surat/letter-preview"
import { useAuth } from "@/lib/auth-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getPendudukData } from "@/app/admin/penduduk/actions"

interface LetterFormProps {
  type: string
  title: string
  description: string
  onSubmit: (formData: FormData) => Promise<any>
  renderLetterContent: (data: any) => React.ReactNode
  additionalFields?: React.ReactNode
}

export function LetterForm({
  type,
  title,
  description,
  onSubmit,
  renderLetterContent,
  additionalFields,
}: LetterFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [penduduk, setPenduduk] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPenduduk, setSelectedPenduduk] = useState<any>(null)
  const [letterDate, setLetterDate] = useState<Date>(new Date())

  // Form state
  const [formData, setFormData] = useState<any>({
    nomor_surat: "",
    tanggal_surat: new Date().toISOString(),
    id_penduduk: "",
    nama_penduduk: "",
    keterangan: "",
  })

  useEffect(() => {
    async function loadPenduduk() {
      try {
        const data = await getPendudukData()
        setPenduduk(data.filter((p: any) => p.status_penduduk == "Ada"))
      } catch (error) {
        console.error("Error loading penduduk data:", error)
      } finally {
        setIsLoading(false)
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

    const formDataObj = new FormData(e.currentTarget)

    // Add the date from the DatePicker component
    if (letterDate) {
      formDataObj.set("tanggal_surat", letterDate.toISOString().split("T")[0])
    }

    try {
      const result = await onSubmit(formDataObj)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(`Surat ${title} berhasil dibuat`)
        // Redirect setelah 2 detik
        setTimeout(() => {
          router.push("/admin/surat")
        }, 2000)
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsPending(false)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  function handleSelectChange(name: string, value: string) {
    if (name == "id_penduduk") {
      const selected = penduduk.find((p) => p.id == value)
      if (selected) {
        setSelectedPenduduk(selected)
        setFormData((prev: any) => ({
          ...prev,
          [name]: value,
          nama_penduduk: selected.nama,
        }))
      }
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }))
    }
  }

  function handleDateChange(date: Date | null) {
    if (date) {
      setLetterDate(date)
      setFormData((prev: any) => ({
        ...prev,
        tanggal_surat: date.toISOString(),
      }))
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Buat {title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <Card className="glow-card">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Surat</CardTitle>
            <CardDescription>Masukkan informasi surat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomor_surat">Nomor Surat</Label>
                <Input
                  id="nomor_surat"
                  name="nomor_surat"
                  value={formData.nomor_surat}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggal_surat">Tanggal Surat</Label>
                <DatePicker
                  id="tanggal_surat"
                  name="tanggal_surat"
                  selected={letterDate}
                  onSelect={handleDateChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_penduduk">Penduduk</Label>
                <Select
                  name="id_penduduk"
                  value={formData.id_penduduk}
                  onValueChange={(value) => handleSelectChange("id_penduduk", value)}
                  required
                >
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

              {additionalFields}

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea
                  id="keterangan"
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/admin/surat">Batal</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <LetterPreview type={type} formData={formData} renderContent={renderLetterContent} />
    </div>
  )
}

