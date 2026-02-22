"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createKematian } from "../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FormStatus } from "@/components/form-status"
import { getPendudukData } from "../../penduduk/actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuth } from "@/lib/auth-context"
import { FormField } from "@/components/ui/form-field"

export default function TambahKematianPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [penduduk, setPenduduk] = useState<any[]>([])
  const [isLoadingPenduduk, setIsLoadingPenduduk] = useState(true)
  const [formErrors, setFormErrors] = useState<Record<string,string>>({})
  const [formData, setFormData] = useState({
    id_penduduk: "",
    tanggal_kematian: null,
    sebab_kematian: null,
  })

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

  const validateForm = () => {
    const errors: Record<string, string> = {
      id_penduduk: !formData.id_penduduk ? "Penduduk wajib dipilih" : "",
      tanggal_kematian: !formData.tanggal_kematian? "Tanggal kematian wajib diisi" : "", 
    }
    setFormErrors(errors)
    return !Object.values(errors).some(Boolean);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validateForm() || !user) return

    setIsPending(true)
    setError(null)
    setSuccess(null)
    setValidationErrors(null)

    const formDataObj = new FormData(e.currentTarget)
    const namaPenduduk = penduduk.find(p => p.id == formDataObj.get("id_pdd"))?.nama
    formDataObj.append("nama", namaPenduduk)
    formDataObj.append("data_kematian", JSON.stringify(formData))
    try {
      const result = await createKematian(formDataObj, user.id)

      if (result.error) {
        setError(result.error)
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
              <FormField id="id_penduduk" label="Penduduk" required error={formErrors.id_penduduk}>
                <Select name="id_penduduk" onValueChange={(val) => handleSelectChange("id_penduduk", val)}>
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
              </FormField>

              <FormField id="tanggal_kematian" label="Tanggal Meninggal" required error={formErrors.tanggal_kematian}>
                <Input name="tanggal_kematian" type="date" onChange={handleInputChange}/>
              </FormField>

              <FormField id="sebab_kematian" label="Sebab (Opsional)">
                <Textarea name="sebab_kematian" rows={3} onVolumeChange={(val) => handleSelectChange("sebab_kematian", val)}/>
              </FormField>
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

