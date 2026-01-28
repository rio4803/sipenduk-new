"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormStatus } from "@/components/form-status"
import { DatePicker } from "@/components/ui/date-picker.tsx"
import { FormField } from "@/components/ui/form-field"
import { format } from "date-fns"
import { getKKData, createPenduduk } from "../actions"

export default function TambahPendudukPage() {
  const router = useRouter()

  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [userCredentials, setUserCredentials] = useState<{ username: string; password: string } | null>(null)

  const [birthDate, setBirthDate] = useState<any>(null)

  // LIST KEPALA KELUARGA
  const [kepalaKeluargaList, setKepalaKeluargaList] = useState<any[]>([])

  useEffect(() => {
    async function fetchKK() {
      try {
        const kkData = await getKKData()
        setKepalaKeluargaList(kkData)
      } catch (error) {
        console.error("Gagal mengambil list KK:", error)
      }
    }
    fetchKK()
  }, [])

  const [formData, setFormData] = useState({
    id_kk: "",
    nik: "",
    nama: "",
    tempat_lahir: "",
    jenis_kelamin: "",
    agama: "",
    desa: "",
    rt: "",
    rw: "",
    status_perkawinan: "",
    pekerjaan: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSelectChange = (name: string, value: string) => {
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

    if (!formData.id_kk) errors.id_kk = "Kepala keluarga wajib dipilih"

    if (!formData.nik) errors.nik = "NIK wajib diisi"
    else if (!/^\d{16}$/.test(formData.nik)) errors.nik = "NIK harus 16 digit angka"

    if (!formData.nama) errors.nama = "Nama wajib diisi"
    if (!formData.tempat_lahir) errors.tempat_lahir = "Tempat lahir wajib diisi"
    if (!birthDate) errors.tanggal_lahir = "Tanggal lahir wajib diisi"
    if (!formData.jenis_kelamin) errors.jenis_kelamin = "Jenis kelamin wajib diisi"
    if (!formData.agama) errors.agama = "Agama wajib diisi"
    if (!formData.desa) errors.desa = "Desa wajib diisi"
    if (!formData.rt) errors.rt = "RT wajib diisi"
    if (!formData.rw) errors.rw = "RW wajib diisi"
    if (!formData.status_perkawinan) errors.status_perkawinan = "Status kawin wajib diisi"
    if (!formData.pekerjaan) errors.pekerjaan = "Pekerjaan wajib diisi"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    // VALIDASI
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    setIsPending(true);
    setError(null);
    setSuccess(null);
    setValidationErrors(null);
    setUserCredentials(null);

    try {
      const formDataObj = new FormData(e.currentTarget);

      // Set nilai dari state manual
      formDataObj.set("id_kk", formData.id_kk);
      if (birthDate) {
        formDataObj.set("tanggal_lahir", format(birthDate, "yyyy-MM-dd"));
      }

      // Kirim ke server
      const result = await createPenduduk(formDataObj);

      if (result.error) {
        setError(result.error);
        setValidationErrors(result.errors || null);
      } else if (result.success) {
        setSuccess("Data penduduk berhasil ditambahkan");

        if (result.user) {
          setUserCredentials(result.user);
        }

        // Reset form
        setFormData({
          id_kk: "",
          nik: "",
          nama: "",
          tempat_lahir: "",
          jenis_kelamin: "",
          agama: "",
          desa: "",
          rt: "",
          rw: "",
          status_perkawinan: "",
          pekerjaan: "",
        });
        setBirthDate(null);
      }
    } catch (err) {
      console.error("Error creating penduduk:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsPending(false);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tambah Penduduk</h2>
        <p className="text-muted-foreground">Tambahkan data penduduk baru ke dalam sistem</p>
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Penduduk</CardTitle>
            <CardDescription>Masukkan informasi penduduk baru</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} errors={validationErrors} />

            {/* {userCredentials && (
              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 mb-4">
                <InfoIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle>Akun Pengguna Dibuat</AlertTitle>
                <AlertDescription className="mt-2">
                  <p>Akun pengguna telah dibuat dengan kredensial berikut:</p>
                  <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/40 rounded-md">
                    <p>
                      <strong>Username:</strong> {userCredentials.username}
                    </p>
                    <p>
                      <strong>Password:</strong> {userCredentials.password}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                    Harap catat informasi ini karena tidak akan ditampilkan lagi.
                  </p>
                </AlertDescription>
              </Alert>
            )} */}

            {/* Dropdown Kepala Keluarga */}
            <FormField id="id_kk" label="Kepala Keluarga" required error={formErrors.id_kk}>
              <select
                id="id_kk"
                name="id_kk"
                value={formData.id_kk}
                onChange={handleInputChange}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="">Pilih Kepala Keluarga</option>

                {kepalaKeluargaList.map((kk: any) => (
                  <option key={kk.id} value={kk.id}>
                    {kk.no_kk} - {kk.kepala}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Grid Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <FormField id="nik" label="NIK" required error={formErrors.nik}>
                <Input
                  id="nik"
                  name="nik"
                  type="text"
                  inputMode="numeric"
                  maxLength={16}
                  value={formData.nik}
                  onChange={handleInputChange}
                />
              </FormField>

              <FormField id="nama" label="Nama Lengkap" required error={formErrors.nama}>
                <Input id="nama" name="nama" value={formData.nama} onChange={handleInputChange} />
              </FormField>

              <FormField id="tempat_lahir" label="Tempat Lahir" required error={formErrors.tempat_lahir}>
                <Input id="tempat_lahir" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleInputChange} />
              </FormField>

              <FormField id="tanggal_lahir" label="Tanggal Lahir" required error={formErrors.tanggal_lahir}>
                <DatePicker id="tanggal_lahir" name="tanggal_lahir" selected={birthDate} onSelect={setBirthDate} />
              </FormField>

              <FormField id="jenis_kelamin" label="Jenis Kelamin" required error={formErrors.jenis_kelamin}>
                <Select
                  name="jenis_kelamin"
                  value={formData.jenis_kelamin}
                  onValueChange={(value) => handleSelectChange("jenis_kelamin", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LK">Laki-laki</SelectItem>
                    <SelectItem value="PR">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="agama" label="Agama" required error={formErrors.agama}>
                <Select
                  name="agama"
                  value={formData.agama}
                  onValueChange={(value) => handleSelectChange("agama", value)}
                >
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
                <Input id="desa" name="desa" value={formData.desa} onChange={handleInputChange} />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField id="rt" label="RT" required error={formErrors.rt}>
                  <Input id="rt" name="rt" value={formData.rt} onChange={handleInputChange} />
                </FormField>

                <FormField id="rw" label="RW" required error={formErrors.rw}>
                  <Input id="rw" name="rw" value={formData.rw} onChange={handleInputChange} />
                </FormField>
              </div>

              <FormField id="kawin" label="Status Perkawinan" required error={formErrors.kawin}>
                <Select
                  name="status_perkawinan"
                  value={formData.status_perkawinan}
                  onValueChange={(value) => handleSelectChange("status_perkawinan", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status kawin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Belum">Belum Kawin</SelectItem>
                    <SelectItem value="Sudah">Sudah Kawin</SelectItem>
                    <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                    <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField id="pekerjaan" label="Pekerjaan" required error={formErrors.pekerjaan}>
                <Input id="pekerjaan" name="pekerjaan" value={formData.pekerjaan} onChange={handleInputChange} />
              </FormField>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/admin/penduduk">Batal</Link>
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