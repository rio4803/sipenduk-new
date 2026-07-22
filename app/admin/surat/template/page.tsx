"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, RotateCcw, FileText, CheckCircle2 } from "lucide-react"
import {
  getLetterTemplate,
  saveLetterTemplate,
  resetLetterTemplate,
  LetterTemplateConfig,
} from "@/lib/letter-templates"
import { LetterTemplate } from "@/components/surat/letter-template"
import { toast } from "sonner"

const JENIS_SURAT_LIST = [
  { id: "kematian", label: "Kematian" },
  { id: "kelahiran", label: "Kelahiran" },
  { id: "kedatangan", label: "Kedatangan" },
  { id: "perpindahan", label: "Perpindahan" },
  { id: "domisili", label: "Domisili" },
]

export default function LetterTemplateSettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("kematian")
  const [config, setConfig] = useState<LetterTemplateConfig>(() =>
    getLetterTemplate("kematian")
  )
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setConfig(getLetterTemplate(activeTab))
    setSaved(false)
  }, [activeTab])

  const handleChange = (field: keyof LetterTemplateConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = () => {
    const success = saveLetterTemplate(activeTab, config)
    if (success) {
      setSaved(true)
      toast.success(`Template Surat ${activeTab.toUpperCase()} berhasil disimpan`)
      setTimeout(() => setSaved(false), 3000)
    } else {
      toast.error("Gagal menyimpan template")
    }
  }

  const handleReset = () => {
    if (confirm(`Kembalikan template surat ${activeTab.toUpperCase()} ke pengaturan standar?`)) {
      const resetConfig = resetLetterTemplate(activeTab)
      setConfig(resetConfig)
      toast.info(`Template ${activeTab.toUpperCase()} telah direset ke default`)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Pengaturan Template Surat</h2>
            <p className="text-sm text-muted-foreground">
              Kustomisasi kop surat, teks pembuka, teks penutup, dan logo Kabupaten Bogor per jenis surat
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full bg-muted/40 p-1">
          {JENIS_SURAT_LIST.map((item) => (
            <TabsTrigger key={item.id} value={item.id} className="text-xs md:text-sm">
              <FileText className="h-4 w-4 mr-1.5 hidden sm:inline" />
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {JENIS_SURAT_LIST.map((item) => (
          <TabsContent key={item.id} value={item.id} className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Settings */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Form Setting Template: Surat Keterangan {item.label}</span>
                      {saved && (
                        <span className="text-xs font-normal text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Tersimpan
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Ubah kata-kata pembuka/penutup dan header surat sesuai kebutuhan administrasi desa
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    {/* Header Kop */}
                    <div className="space-y-2">
                      <Label htmlFor="header1">Kop Surat - Baris 1</Label>
                      <Input
                        id="header1"
                        value={config.header1}
                        onChange={(e) => handleChange("header1", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="header2">Kop Surat - Baris 2</Label>
                      <Input
                        id="header2"
                        value={config.header2}
                        onChange={(e) => handleChange("header2", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="header3">Kop Surat - Baris 3</Label>
                      <Input
                        id="header3"
                        value={config.header3}
                        onChange={(e) => handleChange("header3", e.target.value)}
                      />
                    </div>

                    {/* Judul Surat */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Judul Surat</Label>
                      <Input
                        id="title"
                        value={config.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                      />
                    </div>

                    {/* Opening Text */}
                    <div className="space-y-2">
                      <Label htmlFor="openingText">Teks Pembuka Surat</Label>
                      <Textarea
                        id="openingText"
                        rows={3}
                        value={config.openingText}
                        onChange={(e) => handleChange("openingText", e.target.value)}
                      />
                    </div>

                    {/* Closing Text */}
                    <div className="space-y-2">
                      <Label htmlFor="closingText">Teks Penutup Surat</Label>
                      <Textarea
                        id="closingText"
                        rows={3}
                        value={config.closingText}
                        onChange={(e) => handleChange("closingText", e.target.value)}
                      />
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signatureTitle">Jabatan Penandatangan</Label>
                        <Input
                          id="signatureTitle"
                          value={config.signatureTitle}
                          onChange={(e) => handleChange("signatureTitle", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signatureName">Nama Penandatangan</Label>
                        <Input
                          id="signatureName"
                          value={config.signatureName}
                          onChange={(e) => handleChange("signatureName", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Show Logo Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="space-y-0.5">
                        <Label htmlFor="showLogo">Tampilkan Logo Kabupaten Bogor</Label>
                        <p className="text-xs text-muted-foreground">
                          Menampilkan Lambang Resmi Kabupaten Bogor di sebelah kiri Kop Surat
                        </p>
                      </div>
                      <Switch
                        id="showLogo"
                        checked={config.showLogo}
                        onCheckedChange={(checked) => handleChange("showLogo", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <Button variant="outline" size="sm" onClick={handleReset}>
                        <RotateCcw className="h-4 w-4 mr-1.5 text-muted-foreground" /> Reset Default
                      </Button>
                      <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-1.5" /> Simpan Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Live Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Live Preview Cetak</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded">
                    Tampilan Real-time
                  </span>
                </div>
                <div className="border rounded-lg shadow-sm bg-white overflow-hidden p-2">
                  <LetterTemplate
                    jenis={item.id}
                    title={config.title}
                    nomor="001/SK-KM/07/2026"
                    tanggal={new Date().toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    nama="Ahmad Subagja (Contoh Warga)"
                    customHeader1={config.header1}
                    customHeader2={config.header2}
                    customHeader3={config.header3}
                    customOpening={config.openingText}
                    customClosing={config.closingText}
                    customSignatureTitle={config.signatureTitle}
                    customSignatureName={config.signatureName}
                    showLogo={config.showLogo}
                    additionalData={{
                      nik: "3201012345670001",
                      tempat_tanggal_lahir: "Bogor, 12 Mei 1990",
                      alamat: "Perum Walikota Blok N 13 RT 04 RW 06",
                      ...(item.id === "kematian" && {
                        tanggal_kematian: "20 Juli 2026",
                        sebab_kematian: "Sakit Usia Lanjut",
                      }),
                      ...(item.id === "kelahiran" && {
                        nama_bayi: "Anindya Putri Subagja",
                        nama_orang_tua: "Ahmad Subagja / Siti Rahma",
                      }),
                      ...(item.id === "kedatangan" && {
                        alamat_asal: "Kec. Sawangan, Kota Depok",
                      }),
                      ...(item.id === "perpindahan" && {
                        alamat_tujuan: "Kec. Parung, Kab. Bogor",
                      }),
                    }}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
