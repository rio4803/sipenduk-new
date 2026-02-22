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
import { DatePicker } from "@/components/ui/date-picker"
import { FormField } from "@/components/ui/form-field"
import { format } from "date-fns"
import { getKKData, createPenduduk } from "../actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export default function TambahPendudukPage() {
  const router = useRouter()

  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [userCredentials, setUserCredentials] = useState<{ username: string; password: string } | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [kepalaKeluarga, setKepalaKeluarga] = useState<string>("0")
  const {user} = useAuth()
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
    nik: "",
    nama: "",
    tempat_lahir: "",
    jenis_kelamin: "",
    tanggal_lahir: null,
    agama: "",
    desa: "",
    rt: "",
    rw: "",
    status_perkawinan: "",
    pekerjaan: "",
    id_kk: "",
    hubungan: "",
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

    if (!formData.nama) errors.nama = "Nama wajib diisi"
    if (!formData.tempat_lahir) errors.tempat_lahir = "Tempat lahir wajib diisi"
    if (!formData.tanggal_lahir) errors.tanggal_lahir = "Tanggal lahir wajib diisi"
    if (!formData.jenis_kelamin) errors.jenis_kelamin = "Jenis kelamin wajib diisi"
    if (!formData.agama) errors.agama = "Agama wajib diisi"
    if (!formData.desa) errors.desa = "Desa wajib diisi"
    if (!formData.rt) errors.rt = "RT wajib diisi"
    if (!formData.rw) errors.rw = "RW wajib diisi"
    if (!formData.status_perkawinan) errors.status_perkawinan = "Status kawin wajib diisi"
    if (!formData.pekerjaan) errors.pekerjaan = "Pekerjaan wajib diisi"

    setFormErrors(errors)
    return Object.keys(errors).length == 0
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true);

    if (!validateForm() || !user) {
      setIsPending(false);
      return;
    }

    setError(null);
    setSuccess(null);
    setValidationErrors(null);
    setUserCredentials(null);

    try {
      const formDataObj = new FormData(e.currentTarget);

      formDataObj.append("data_penduduk", JSON.stringify(formData))
      const result = await createPenduduk(formDataObj, user.id)

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess("Data penduduk berhasil ditambahkan");
        if (result.user) {
          setUserCredentials(result.user);
        }
      }
    } catch (err) {
      console.error("Error creating penduduk:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tambah Penduduk</h2>
        <p className="text-muted-foreground">Tambahkan data penduduk baru ke dalam sistem</p>
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <form onSubmit={(e) => handleSubmit(e)}>
          <CardHeader>
            <CardTitle>Data Penduduk</CardTitle>
            <CardDescription>Masukkan informasi penduduk baru</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} errors={validationErrors} />

            {userCredentials && (
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
            )}

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
                <DatePicker id="tanggal_lahir" name="tanggal_lahir" selected={formData.tanggal_lahir} onSelect={(date) => handleSelectChange("tanggal_lahir", date)} />
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

              <FormField id="kawin" label="Status Perkawinan" required error={formErrors.status_perkawinan}>
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

            <div className="space-y-2">
              <FormField id="id_kk" label="Kepala keluarga" required error={formErrors.id_kk}>
                <Select
                  name="id_kk" 
                  onValueChange={(val) => {
                    setKepalaKeluarga(val)
                    handleSelectChange("id_kk", val)
                  }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kepala Keluarga" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"0"}>Pilih Kepala Keluarga</SelectItem>
                    {kepalaKeluargaList.map((kk: any) => (
                      <SelectItem key={kk.id} value={kk.id}>
                        {kk.no_kk} - {kk.kepala}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="space-y-2">
              <FormField required label="Hubungan" error={formErrors.hubungan} id="hubungan">
                <Select 
                  name="hubungan" 
                  disabled={kepalaKeluarga == "0"}
                  onValueChange={(val) => handleSelectChange("hubungan", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih hubungan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kepala Keluarga">Kepala Keluarga</SelectItem>
                    <SelectItem value="Istri">Istri</SelectItem>
                    <SelectItem value="Suami">Suami</SelectItem>
                    <SelectItem value="Anak">Anak</SelectItem>
                    <SelectItem value="Menantu">Menantu</SelectItem>
                    <SelectItem value="Cucu">Cucu</SelectItem>
                    <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                    <SelectItem value="Mertua">Mertua</SelectItem>
                    <SelectItem value="Famili Lain">Famili Lain</SelectItem>
                    <SelectItem value="Pembantu">Pembantu</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            
          </CardContent>

          <CardFooter className="flex justify-between">
          {success && userCredentials ? (
            <Button asChild className="w-full">
                <Link href="/admin/penduduk">Kembali ke Daftar Penduduk</Link>
            </Button>
          ):(
            <>
              <Button variant="outline" asChild>
                <Link href="/admin/penduduk">Batal</Link>
              </Button>

              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </>
          )}
          </CardFooter>

          
        </form>
      </Card>
    </div>
  )
}