"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createKedatangan } from "../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormStatus } from "@/components/form-status"
import { getPendudukData } from "../../penduduk/actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { DatePicker } from "@/components/ui/date-picker"
import { FormField } from "@/components/ui/form-field"
import { getKartuKeluargaData } from "../../kartu-keluarga/actions"
import { useAuth } from "@/lib/auth-context"
import { Label } from "@/components/ui/label"

export default function TambahKedatanganPage() {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null)
  const [penduduk, setPenduduk] = useState<any[]>([])
  const [isLoadingPenduduk, setIsLoadingPenduduk] = useState(true)
  const [kartuKeluarga, setKartuKeluarga] = useState<any[]>([])
  const [userCredentials, setUserCredentials] = useState<{ username: string; password: string } | null>(null)
  const [isKepala, setIsKepala] = useState<boolean>(false)
  const { user }= useAuth()
  const [fdAnggota, setFdAnggota] = useState<any[]>([])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Form validation state
  const [formData, setFormData] = useState({
    id_kk: "",
    nik: "",
    nama: "",
    jenis_kelamin: "",
    tempat_lahir: "",
    tanggal_lahir: null,
    tanggal_datang: null,
    agama: "",
    status_perkawinan: "",
    hubungan: "",
    pekerjaan: "",
    pelapor: "",
    no_kk: "",
    desa: "",
    rt: "",
    rw: "",
    kabupaten: "",
    kecamatan: "",
    provinsi: "",
  })

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

    async function loadKartuKeluarga() {
      try {
        const kkData = await getKartuKeluargaData()
        setKartuKeluarga(kkData)
      } catch (error) {
        console.error("Error loading kartu keluarga data:", error)
      }
    }

    loadPenduduk()
    loadKartuKeluarga()
  }, [])

  // Handle input changes
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

  const handleFdAnggotaInput = (name: string, value: any, i: number) => {
    setFdAnggota(prev => {
      const newArray = [...prev]
      newArray[i][name] = value
      return newArray
    })
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
    const errors: Record<string, string> = {
      id_kk: !isKepala && !formData.id_kk ? "Kepala keluarga wajib dipilih" : "",
      nik: !formData.nik? "NIK wajib diisi" : !/^\d{16}$/.test(formData.nik) ? "NIK harus 16 digit angka" : "",
      nama: !formData.nama? "Nama lengkap wajib diisi" : "", 
      jenis_kelamin: !formData.jenis_kelamin ? "Jenis kelamin wajib diisi": "",
      tempat_lahir: !formData.tempat_lahir ? "Tempat lahir wajib diisi" : "",
      tanggal_lahir: !formData.tanggal_lahir ? "Tanggal lahir wajib diisi" : "",
      tanggal_kedatangan: !formData.tanggal_datang ? "Tanggal datang wajib diisi": "",
      agama: !formData.agama ? "Agama wajib diisi" : "",
      hubungan: !isKepala && !formData.hubungan ? "Hubungan wajib diisi" : "",
      pekerjaan: !formData.pekerjaan ? "Pekerjaan wajib diisi" : "",
      status_perkawinan: !formData.status_perkawinan ? "Status perkawinan wajib diisi" : ""
    }
    if(isKepala){
      if(!formData.no_kk) errors.no_kk = "Nomor KK wajib diisi"
      if(!formData.desa) errors.desa = "Isi data dengan benar"
      if(!formData.rt) errors.rt = "Isi data dengan benar"
      if(!formData.rw) errors.rw = "Isi data dengan benar"
      if(!formData.kecamatan) errors.kec = "Isi data dengan benar"
      if(!formData.kabupaten) errors.kab = "Isi data dengan benar"
      if(!formData.provinsi) errors.prov = "Isi data dengan benar"
      
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
    }

    setFormErrors(errors)
    return !Object.values(errors).some(Boolean);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if(!user || !validateForm()) return

    setIsPending(true)
    setError(null)
    setSuccess(null)
    setValidationErrors(null)
    
    const formDataObj = new FormData(e.currentTarget)
    formDataObj.append("data_pendatang", JSON.stringify({...formData, hubungan: isKepala? "Kepala Keluarga" : formData.hubungan}))
    if(fdAnggota.length > 0){
      formDataObj.append("anggota_keluarga", JSON.stringify(fdAnggota))
    }

    try {

      const result = await createKedatangan(formDataObj, user.id)
      if (result.error) {
        setError(result.error)
        // setValidationErrors(result.errors || null)
      } else if (result.success) {
        setSuccess("Data kedatangan berhasil ditambahkan")
        
        // Simpan kredensial user jika ada
        if (result.akun) {
          setUserCredentials({
            username: result.akun.username,
            password: result.akun.password
          })
        }
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
        <h2 className="text-3xl font-bold tracking-tight">Tambah Kedatangan</h2>
        <p className="text-muted-foreground">Tambahkan data kedatangan penduduk baru</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Data Kedatangan</CardTitle>
            <CardDescription>Masukkan informasi kedatangan penduduk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormStatus error={error} success={success} errors={validationErrors} />

            {userCredentials && (
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
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField id="nik" label="NIK" required error={formErrors.nik}>
                <Input
                  id="nik"
                  name="nik"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{16}"
                  maxLength={16}
                  onChange={handleInputChange}
                  className={formErrors.nik ? "border-red-500" : ""}
                />
              </FormField>

              <FormField id="nama" label="Nama Lengkap" required error={formErrors.nama}>
                <Input
                  id="nama" name="nama"
                  type="text"
                  onChange={handleInputChange}
                  className={formErrors.nama ? "border-red-500" : ""}
                />
              </FormField>

              <FormField id="jenis_kelamin" label="Jenis Kelamin" required error={formErrors.jenis_kelamin}>
                <Select
                  name="jenis_kelamin"
                  onValueChange={(value) => handleSelectChange("jenis_kelamin", value)}
                >
                  <SelectTrigger className={formErrors.jenis_kelamin ? "border-red-500" : ""}>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LK">Laki-laki</SelectItem>
                    <SelectItem value="PR">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
    
              <FormField id={`tempat_lahir`} label="Tempat Lahir" required error={formErrors.tempat_lahir}>
                <Input name="tempat_lahir" onChange={handleInputChange} />
              </FormField>

              <FormField id={`tanggal_lahir`} label="Tanggal Lahir" required error={formErrors.tanggal_lahir}>
                <DatePicker
                  selected={formData.tanggal_lahir}
                  onSelect={(date) => {
                    date?.setHours(12, 0, 0, 0)
                    handleSelectChange("tanggal_lahir", date)
                  }}
                />
              </FormField>

              <FormField id="tanggal_kedatangan" label="Tanggal Datang" required error={formErrors.tanggal_kedatangan}>
                <DatePicker
                  name="tanggal_kedatangan"
                  selected={formData.tanggal_datang}
                  onSelect={(date) => {
                    date?.setHours(12,0,0,0)
                    handleSelectChange("tanggal_datang", date)
                  }}
                  // error={formErrors.tanggal_kedatangan}
                />
              </FormField>

              <FormField id={`agama`} label="Agama" required error={formErrors.agama}>
                <Select onValueChange={(value) => handleSelectChange("agama", value)}>
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

              <FormField id={`status_perkawinan`} label="Status Perkawinan" required error={formErrors.status_perkawinan}>
                <Select onValueChange={(value) => handleSelectChange("status_perkawinan", value)}>
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

              <FormField id={`pekerjaan`} label="Pekerjaan" required error={formErrors.pekerjaan}>
                <Input name="pekerjaan" onChange={handleInputChange}/>
              </FormField>

              <FormField id="pelapor" label="Pelapor (Opsional)">
                <Select name="pelapor">
                  <SelectTrigger className={formErrors.pelapor ? "border-red-500" : ""}>
                    <SelectValue placeholder="Pilih pelapor" />
                  </SelectTrigger>
                  <SelectContent>
                    {penduduk.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>


            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="kepala-keluarga"
                name="kepala"
                onChange={() => setIsKepala(prev => {
                  !prev && setFormData(fdPrev => ({...fdPrev, id_kk: "", hubungan: ""}))
                  return !prev
                })}
              />
              <Label htmlFor="kepala-keluarga">Anda seorang kepala keluarga?</Label>
            </div>

            

            {isKepala ? (
              <>
              <div className="space-y-4 mt-10">
                <h3 className="text-lg font-semibold border-b pb-2">Informasi Kartu Keluarga</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField id="no_kk" label="Nomor KK" required error={formErrors.no_kk}>
                    <Input name="no_kk" onChange={handleInputChange}/>
                  </FormField>

                  <FormField id="desa" label="Desa" required error={formErrors.desa}>
                    <Input name="desa" onChange={handleInputChange}/>
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField id="rt" label="RT" required error={formErrors.rt}>
                      <Input name="rt" onChange={handleInputChange}/>
                    </FormField>

                    <FormField id="rw" label="RW" required error={formErrors.rw}>
                      <Input name="rw" onChange={handleInputChange}/>
                    </FormField>
                  </div>

                  <FormField id="kec" label="Kecamatan" required error={formErrors.kec}>
                    <Input name="kecamatan" onChange={handleInputChange}/>
                  </FormField>

                  <FormField id="kab" label="Kabupaten" required error={formErrors.kab}>
                    <Input name="kabupaten" onChange={handleInputChange}/>
                  </FormField>

                  <FormField id="prov" label="Provinsi" required error={formErrors.prov}>
                    <Input name="provinsi" onChange={handleInputChange}/>
                  </FormField>
                </div>
              </div>

              {fdAnggota.map((anggota, i) => (
                <div className="space-y-4 mt-10" key={i}>
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
              ))}

              <Button type="button" onClick={() => setFdAnggota(prev => [...prev, {
                nama_anggota              : "",
                nik_anggota               : "",
                tempat_lahir_anggota      : "",
                tanggal_lahir_anggota     : "",
                jenis_kelamin_anggota     : "",
                agama_anggota             : "",
                pekerjaan_anggota         : "",
                status_perkawinan_anggota : "",
                hubungan                  : ""
              }])}>+ Tambah anggota</Button>
            </>
            ) : (
              <>
                <FormField id="id_kk" label="Kepala Keluarga" required error={formErrors.id_kk}>
                  <Select
                    name="id_kk"
                    onValueChange={(value) => handleSelectChange("id_kk", value)}
                    defaultValue={formData.id_kk}
                  >
                    <SelectTrigger className={formErrors.id_kk ? "border-red-500" : ""}>
                      <SelectValue placeholder="Pilih kepala keluarga (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {kartuKeluarga.map((kk: any) => (
                        <SelectItem key={kk.id} value={kk.id}>
                          {kk.no_kk} - {kk.kepala}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField required label="Hubungan" error={formErrors.hubungan} id="hubungan">
                  <Select 
                    name="hubungan" 
                    disabled={!formData.id_kk}
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
              </>
            )}

          </CardContent>
          <CardFooter className="flex justify-between">
            {success ? (
              <Button asChild className="w-full">
                <Link href="/admin/kedatangan">Kembali ke Daftar Pendatang</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/admin/kedatangan">Batal</Link>
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

