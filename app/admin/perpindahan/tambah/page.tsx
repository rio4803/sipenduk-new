"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createPerpindahan } from "../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FormStatus } from "@/components/form-status"
import { getPendudukData } from "../../penduduk/actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { DatePicker } from "@/components/ui/date-picker"
import { FormField } from "@/components/ui/form-field"
import { useAuth } from "@/lib/auth-context"

export default function TambahPerpindahanPage() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [penduduk, setPenduduk] = useState<any[]>([])
  const [isLoadingPenduduk, setIsLoadingPenduduk] = useState(true)
  const {user} = useAuth()
  // Form validation state
  const [formData, setFormData] = useState({
    id_penduduk: "",
    alasan: "",
    tanggal_pindah: null
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadPenduduk() {
      try {
        const data = await getPendudukData()
        setPenduduk(data.filter((p: any) => p.status_penduduk == "Ada"))
      } catch (error) {
        console.error("Error loading penduduk data:", error)
      } finally {
        setIsLoadingPenduduk(false)
      }
    }

    loadPenduduk()
  }, [])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user selects
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.id_penduduk) errors.id_penduduk = "Penduduk wajib dipilih"
    if (!formData.tanggal_pindah) errors.tanggal_pindah = "Tanggal pindah wajib diisi"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!validateForm() || !user) {
      return
    }

    setIsPending(true)
    setError(null)
    setSuccess(null)
    setValidationErrors(null)

    const formDataObj = new FormData(e.currentTarget)
    formDataObj.append("data_perpindahan", JSON.stringify(formData))

    try {
      const result = await createPerpindahan(formDataObj, user.id)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess("Data perpindahan berhasil ditambahkan")
        // Redirect setelah 2 detik
        setTimeout(() => {
          router.push("/admin/perpindahan")
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
        <h2 className="text-3xl font-bold tracking-tight">Tambah Perpindahan</h2>
        <p className="text-muted-foreground">Tambahkan data perpindahan penduduk</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Perpindahan</CardTitle>
            <CardDescription>Masukkan informasi perpindahan penduduk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} errors={validationErrors} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField id="id_penduduk" label="Penduduk" required error={formErrors.id_penduduk}>
                <Select
                  name="id_penduduk"
                  value={formData.id_penduduk}
                  onValueChange={(value) => handleSelectChange("id_penduduk", value)}
                >
                  <SelectTrigger className={formErrors.id_penduduk ? "border-red-500" : ""}>
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
              </FormField>

              <FormField id="tanggal_pindah" label="Tanggal Pindah" required error={formErrors.tanggal_pindah}>
                <DatePicker
                  name="tanggal_pindah"
                  selected={formData.tanggal_pindah}
                  onSelect={(date) => handleSelectChange("tanggal_pindah", date)}
                />
              </FormField>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="alasan">Alasan</Label>
                <Textarea
                  id="alasan"
                  name="alasan"
                  rows={3}
                  value={formData.alasan}
                  onChange={handleInputChange}
                  className={formErrors.alasan ? "border-red-500" : ""}
                />
                {formErrors.alasan && <p className="text-sm font-medium text-red-500">{formErrors.alasan}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/admin/perpindahan">Batal</Link>
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

