"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createKartuKeluarga } from "../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormStatus } from "@/components/form-status"
import { DatePicker } from "@/components/ui/date-picker"
import { useAuth } from "@/lib/auth-context"
import { FormField } from "@/components/ui/form-field"

export default function TambahKartuKeluargaPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [birthDate, setBirthDate] = useState<Date | null>(null)
  const [userCredentials, setUserCredentials] = useState<{ username: string; password: string } | null>(null)
  const [fdAnggota, setFdAnggota] = useState<any[]>([])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [fdKepala, setFdKepala] = useState({
    nik: "",
    nama: "",
    tempat_lahir: "",
    tanggal_lahir: null,
    jenis_kelamin: "",
    agama: "",
    status_perkawinan: "",
    pekerjaan: "",
    no_kk: "",
    desa: "",
    rt: "",
    rw: "",
    kecamatan: "",
    kabupaten: "",
    provinsi: ""
  })

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {
      nik: !fdKepala.nik? "NIK wajib diisi" : !/^\d{16}$/.test(fdKepala.nik) ? "NIK harus 16 digit angka" : "",
      nama: !fdKepala.nama? "Nama lengkap wajib diisi" : "", 
      jenis_kelamin: !fdKepala.jenis_kelamin ? "Jenis kelamin wajib diisi": "",
      tempat_lahir: !fdKepala.tempat_lahir ? "Tempat lahir wajib diisi" : "",
      tanggal_lahir: !fdKepala.tanggal_lahir ? "Tanggal lahir wajib diisi" : "",
      agama: !fdKepala.agama ? "Agama wajib diisi" : "",
      pekerjaan: !fdKepala.pekerjaan ? "Pekerjaan wajib diisi" : "",
      status_perkawinan: !fdKepala.status_perkawinan ? "Status perkawinan wajib diisi" : "",
      no_kk: !fdKepala.no_kk ? "Nomor KK wajib diisi" : "",
      desa: !fdKepala.desa ? "Isi data dengan benar" : "",
      rt: !fdKepala.rt ? "Isi data dengan benar" : "",
      rw: !fdKepala.rw ? "Isi data dengan benar" : "",
      kecamatan: !fdKepala.kecamatan ? "Isi data dengan benar" : "",
      kabupaten: !fdKepala.kabupaten ? "Isi data dengan benar" : "",
      provinsi: !fdKepala.provinsi ? "Isi data dengan benar" : ""
    }
  
    fdAnggota.length > 0 && fdAnggota.forEach((anggota, i) => {
      if(!anggota.nik_anggota) errors[`nik_anggota-${i}`] = "NIK anggota wajib diisi"
      if(!anggota.nama_anggota) errors[`nama_anggota-${i}`] = "Nama anggota wajib diisi"
      if(!anggota.jenis_kelamin_anggota) errors[`jenis_kelamin_anggota-${i}`] = "Jenis kelamin anggota wajib diisi"
      if(!anggota.tempat_lahir_anggota) errors[`tempat_lahir_anggota-${i}`] = "Data kelahiran anggota wajib diisi"
      if(!anggota.tanggal_lahir_anggota) errors[`tanggal_lahir_anggota-${i}`] = "Data kelahiran anggota wajib diisi"
      if(!anggota.status_perkawinan_anggota) errors[`status_perkawinan_anggota-${i}`] = "Status perkawinan anggota wajib diisi"
      if(!anggota.agama_anggota) errors[`agama_anggota-${i}`] = "Agama anggota wajib diisi"
      if(!anggota.pekerjaan_anggota) errors[`pekerjaan_anggota-${i}`] = "Pekerjaan anggota wajib diisi"
      if(!anggota.hubungan) errors[`hubungan-${i}`] = "Hubungan wajib diisi"
    })

    setFormErrors(errors)
    return !Object.values(errors).some(Boolean);
  }


  const handleFdAnggotaInput = (name: string, value: any, i: number) => {
    setFdAnggota(prev => {
      const newArray = [...prev]
      newArray[i][name] = value
      return newArray
    })

    if (formErrors[`${name}-${i}`]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[`${name}-${i}`]
        return newErrors
      })
    }
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: any) => {
    setFdKepala((prev) => ({ ...prev, [name]: value }))

    // Clear error when user selects
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFdKepala((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
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

    const formData = new FormData(e.currentTarget)
    formData.append("dataKepala", JSON.stringify(fdKepala))
    formData.append("dataAnggota", JSON.stringify(fdAnggota))

    try {
      const result = await createKartuKeluarga(formData, user.id)
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess("Kartu keluarga berhasil ditambahkan")
        
        // Simpan kredensial user jika ada
        if (result.akun) {
          setUserCredentials({
            username: result.akun.username,
            password: result.akun.password
          })
        }
        
        // Don't auto-redirect - let user copy credentials first
        // User can manually navigate back using the "Kembali" button
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
        <h2 className="text-3xl font-bold tracking-tight">Tambah Kartu Keluarga</h2>
        <p className="text-muted-foreground">Tambahkan data kartu keluarga baru</p>
      </div>

      <Card className="glow-card">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Kartu Keluarga</CardTitle>
            <CardDescription>Masukkan informasi kartu keluarga dan kepala keluarga</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormStatus error={error} success={success} errors={validationErrors} />

            {userCredentials && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  ✅ Akun Login Kepala Keluarga Berhasil Dibuat
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
            )}

            {/* Informasi Kartu Keluarga */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Informasi Kartu Keluarga</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField id="no_kk" required label="Nomor KK" error={formErrors.no_kk}>
                  <Input name="no_kk" onChange={handleInputChange}/>
                </FormField>

                <FormField id="desa" required label="Desa" error={formErrors.desa}>
                  <Input name="desa" onChange={handleInputChange}/>
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField id="rt" required label="RT" error={formErrors.rt}>
                    <Input name="rt" onChange={handleInputChange}/>
                  </FormField>

                  <FormField id="rw" required label="RW" error={formErrors.rw}>
                    <Input name="rw" onChange={handleInputChange}/>
                  </FormField>
                </div>

                <FormField id="kecamatan" required label="Kecamatan" error={formErrors.kecamatan}>
                  <Input name="kecamatan" onChange={handleInputChange}/>
                </FormField>

                <FormField id="kabupaten" required label="Kabupaten" error={formErrors.kabupaten}>
                  <Input name="kabupaten" onChange={handleInputChange}/>
                </FormField>

                <FormField id="provinsi" required label="Provinsi" error={formErrors.provinsi}>
                  <Input name="provinsi" onChange={handleInputChange}/>
                </FormField>
              </div>
            </div>

            {/* Informasi Kepala Keluarga */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Informasi Kepala Keluarga</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField id="nik" required label="NIK Kepala Keluarga" error={formErrors.nik}>
                  <Input name="nik" maxLength={16} onChange={handleInputChange}/>
                </FormField>

                <FormField id="nama" required label="Nama Kepala Keluarga" error={formErrors.nama}>
                  <Input name="nama" onChange={handleInputChange}/>
                </FormField>

                <FormField id="tempat_lahir" required label="Tempat Lahir" error={formErrors.tempat_lahir}>
                  <Input name="tempat_lahir" onChange={handleInputChange}/>
                </FormField>

                <FormField id="tanggal_lahir" required label="Tanggal Lahir" error={formErrors.tanggal_lahir}>
                  <DatePicker
                    name="tanggal_lahir"
                    selected={fdKepala.tanggal_lahir}
                    onSelect={(date) => handleSelectChange("tanggal_lahir", date)}
                  />
                </FormField>

                <FormField id="jenis_kelamin" required label="Jenis Kelamin" error={formErrors.jenis_kelamin}>
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

                <FormField id="agama" required label="Agama" error={formErrors.agama}>
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

                <FormField id="status_perkawinan" required label="Status Perkawinan" error={formErrors.status_perkawinan}>
                  <Select name="status_perkawinan" onValueChange={(val) => handleSelectChange("status_perkawinan", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status kawin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                      <SelectItem value="Kawin">Kawin</SelectItem>
                      <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                      <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField id="pekerjaan" required label="Pekerjaan" error={formErrors.pekerjaan}>
                  <Input name="pekerjaan" onChange={handleInputChange}/>
                </FormField>
              </div>
            </div>
          </CardContent>

            {fdAnggota.map((anggota, i) => (
              <CardContent className="space-y-6" key={i}>
                <div className="space-y-4 mt-10">
                  <h3 className="text-lg font-semibold border-b pb-2">Informasi Anggota ke {i+1}</h3>
                  <Button variant="destructive" type="button" onClick={() => setFdAnggota(prev => prev.filter((_, index) => index != i))}>x Hapus</Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField id={`nik_anggota-${i}`} label="NIK" required error={formErrors[`nik_anggota-${i}`]}>
                      <Input type="number" maxLength={16} onChange={(e) => handleFdAnggotaInput("nik_anggota", e.target.value, i)} value={anggota.nik_anggota} />
                    </FormField>
    
                    <FormField id={`nama_anggota-${i}`} label="Nama" required error={formErrors[`nama_anggota-${i}`]}>
                      <Input onChange={(e) => handleFdAnggotaInput("nama_anggota", e.target.value, i)} value={anggota.nama_anggota} />
                    </FormField>
    
                    <FormField id={`tempat_lahir_anggota-${i}`} label="Tempat Lahir" required error={formErrors[`tempat_lahir_anggota-${i}`]}>
                      <Input onChange={(e) => handleFdAnggotaInput("tempat_lahir_anggota", e.target.value, i)} value={anggota.tempat_lahir_anggota} />
                    </FormField>
    
                    <FormField id={`tanggal_lahir_anggota-${i}`} label="Tanggal Lahir" required error={formErrors[`tanggal_lahir_anggota-${i}`]}>
                      <DatePicker
                        selected={anggota.tanggal_lahir_anggota}
                        onSelect={(date) => {
                          date?.setHours(12,0,0,0)
                          handleFdAnggotaInput("tanggal_lahir_anggota", date, i)
                        }}
                      />
                    </FormField>
    
                    <FormField id={`jenis_kelamin_anggota-${i}`} label="Jenis Kelamin" required error={formErrors[`jenis_kelamin_anggota-${i}`]}>
                      <Select defaultValue={anggota.jenis_kelamin_anggota} onValueChange={(value) => handleFdAnggotaInput("jenis_kelamin_anggota", value, i)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LK">Laki-laki</SelectItem>
                          <SelectItem value="PR">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
    
                    <FormField id={`agama_anggota-${i}`} label="Agama" required error={formErrors[`agama_anggota-${i}`]}>
                      <Select defaultValue={anggota.agama_anggota} onValueChange={(value) => handleFdAnggotaInput("agama_anggota", value, i)}>
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
    
                    <FormField id={`status_perkawinan_anggota-${i}`} label="Status Perkawinan" required error={formErrors[`status_perkawinan_anggota-${i}`]}>
                      <Select defaultValue={anggota.status_perkawinan_anggota} onValueChange={(value) => handleFdAnggotaInput("status_perkawinan_anggota", value, i)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status kawin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                          <SelectItem value="Kawin">Kawin</SelectItem>
                          <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                          <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField required label="Hubungan" error={formErrors[`hubungan-${i}`]} id="hubungan">
                      <Select 
                        defaultValue={anggota.hubungan}
                        onValueChange={(val) => handleFdAnggotaInput("hubungan", val, i)}
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
                    
                    <FormField id={`pekerjaan_anggota-${i}`} label="Pekerjaan" required error={formErrors[`pekerjaan_anggota-${i}`]}>
                      <Input onChange={(e) => handleFdAnggotaInput("pekerjaan_anggota", e.target.value, i)} value={anggota.pekerjaan_anggota}/>
                    </FormField>
                  </div>
                </div>
              </CardContent>
            ))}

          <CardContent>
            <Button type="button" onClick={() => setFdAnggota(prev => [...prev, {
              nama_anggota              : "",
              nik_anggota               : "",
              tempat_lahir_anggota      : "",
              tanggal_lahir_anggota     : "",
              jenis_kelamin_anggota     : "",
              agama_anggota             : "",
              pekerjaan_anggota         : "",
              status_perkawinan_anggota : "",
              hubungan_anggota          : ""
            }])}>+ Tambah anggota</Button>
          </CardContent>

          <CardFooter className="flex justify-between">
            {success && userCredentials ? (
              <Button asChild className="w-full">
                <Link href="/admin/kartu-keluarga">Kembali ke Daftar Kartu Keluarga</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/admin/kartu-keluarga">Batal</Link>
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

