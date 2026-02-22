"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createKelahiran } from "../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormStatus } from "@/components/form-status"
import { getKartuKeluargaData } from "../../kartu-keluarga/actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { DatePicker } from "@/components/ui/date-picker"
import { useAuth } from "@/lib/auth-context"
import { FormField } from "@/components/ui/form-field"

export default function TambahKelahiranPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [kartuKeluarga, setKartuKeluarga] = useState<any[]>([])
  const [isLoadingKK, setIsLoadingKK] = useState(true)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    id_kk: "",
    nik: "",
    nama: "",
    tempat_lahir: "",
    tanggal_lahir: null,
    jenis_kelamin: "",
    agama: "",
    hubungan: "Anak",
    pekerjaan: "-",
    status_perkawinan: "Belum Kawin",
    desa: "",
    rt: "",
    rw: ""
  })


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  const handleSelectChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.nik) errors.nik = "NIK wajib diisi"
    else if (!/^\d{16}$/.test(formData.nik)) errors.nik = "NIK harus 16 digit angka"
    if (!formData.id_kk) errors.id_kk = "Keluarga wajib dipilih"
    if (!formData.nama) errors.nama = "Nama wajib diisi"
    if (!formData.tempat_lahir) errors.tempat_lahir = "Tempat lahir wajib diisi"
    if (!formData.tanggal_lahir) errors.tanggal_lahir = "Tanggal lahir wajib diisi"
    if (!formData.jenis_kelamin) errors.jenis_kelamin = "Jenis kelamin wajib diisi"
    if (!formData.agama) errors.agama = "Agama wajib diisi"
    if (!formData.desa) errors.desa = "Desa wajib diisi"
    if (!formData.rt) errors.rt = "RT wajib diisi"
    if (!formData.rw) errors.rw = "RW wajib diisi"

    setFormErrors(errors)
    return Object.keys(errors).length == 0
  }


  useEffect(() => {
    async function loadKartuKeluarga() {
      try {
        const data = await getKartuKeluargaData()
        setKartuKeluarga(data)
      } catch (error) {
        console.error("Error loading kartu keluarga data:", error)
      } finally {
        setIsLoadingKK(false)
      }
    }

    loadKartuKeluarga()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validateForm()||!user) return
    setIsPending(true)
    setError(null)
    setSuccess(null)
    setValidationErrors(null)

    const formDataObj = new FormData(e.currentTarget)
    formDataObj.append("data_kelahiran", JSON.stringify(formData))
    // Add the date from the DatePicker component

    try {
      const result = await createKelahiran(formDataObj, user.id)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess("Data kelahiran berhasil ditambahkan")
        setTimeout(() => {
          router.push("/admin/kelahiran")
        }, 2000)
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsPending(false)
    }
  }

  if (isLoadingKK) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Tambah Kelahiran</h2>
        <p className="text-muted-foreground">Tambahkan data kelahiran baru</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Kelahiran</CardTitle>
            <CardDescription>Masukkan informasi kelahiran</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} errors={validationErrors} />

            {/* {userCredentials && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  ✅ Akun Login Berhasil Dibuat
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="text-green-700 dark:text-green-300">
                    <strong>Username:</strong> {userCredentials.username}
                  </p>
                  <p className="text-green-700 dark:text-green-300">
                    <strong>Password:</strong> {userCredentials.password}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    ⚠️ Harap catat kredensial ini karena tidak akan ditampilkan lagi.
                  </p>
                </div>
              </div>
            )} */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <FormField id="nik" label="NIK" required error={formErrors.nik}>
                <Input name="nik" placeholder="Masukkan NIK" maxLength={16} onChange={handleInputChange}/>
              </FormField>

              <FormField id="nama" label="Nama" required error={formErrors.nama}>
                <Input name="nama" onChange={handleInputChange}/>
              </FormField>

              <FormField id="tempat_lahir" label="Tempat Lahir" required error={formErrors.tempat_lahir}>
                <Input name="tempat_lahir" placeholder="Masukkan tempat lahir" onChange={handleInputChange}/>
              </FormField>

              {/* ✅ PERBAIKAN DI SINI – DatePicker full width + match input height */}
              <FormField id="tanggal_lahir" label="Tanggal Lahir" required error={formErrors.tanggal_lahir}>
                <div className="w-full">
                  <DatePicker
                    name="tanggal_lahir"
                    selected={formData.tanggal_lahir}
                    onSelect={(date) => handleSelectChange("tanggal_lahir", date)}
                    className="w-full"
                  />
                </div>
              </FormField>

              <FormField id="jenis_kelamin" label="Jenis Kelamin" required error={formErrors.jenis_kelamin}>
                <Select name="jenis_kelamin" onValueChange={(val) => handleSelectChange("jenis_kelamin", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LK">Laki-laki</SelectItem>
                    <SelectItem value="PR">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="id_kk" label="Kartu Keluarga" required error={formErrors.id_kk}>
                <Select name="id_kk" onValueChange={(val) => handleSelectChange("id_kk", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kartu keluarga" />
                  </SelectTrigger>
                  <SelectContent>
                    {kartuKeluarga.map((kk) => (
                      <SelectItem key={kk.id} value={kk.id}>
                        {kk.no_kk} - {kk.kepala}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="agama" label="Agama" required error={formErrors.agama}>
                <Select name="agama" onValueChange={(val) => handleSelectChange("agama", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih agama" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Islam">Islam</SelectItem>
                    <SelectItem value="Kristen">Kristen</SelectItem>
                    <SelectItem value="Katolik">Katolik</SelectItem>
                    <SelectItem value="Hindu">Hindu</SelectItem>
                    <SelectItem value="Buddha">Buddha</SelectItem>
                    <SelectItem value="Konghucu">Konghucu</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="desa" label="Desa" required error={formErrors.desa}>
                <Input name="desa" placeholder="Masukkan nama desa" onChange={handleInputChange}/>
              </FormField>

              <FormField id="rt" label="RT" required error={formErrors.rt}>
                <Input name="rt" placeholder="RT" onChange={handleInputChange}/>
              </FormField>

              <FormField id="rw" label="RW" required error={formErrors.rw}>
                <Input name="rw" placeholder="RW" onChange={handleInputChange}/>
              </FormField>

            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/kelahiran">Batal</Link>
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

