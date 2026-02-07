"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getSuratById, deleteSurat } from "../../actions"
import { formatDate } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Printer, Pencil, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { LetterPreview } from "@/components/surat/letter-preview"

export default function SuratDetailPage({
  params,
}: {
  params: Promise<{ jenis: string; id: string }>
}) {
  const router = useRouter()
  const { user } = useAuth()
  const [surat, setSurat] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {id} = use(params)
  const {jenis: jenisSurat} = use(params)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getSuratById(id)
        if (!data) {
          notFound()
        }
        setSurat(data)
      } catch (error) {
        console.error("Error loading surat data:", error)
        setError("Gagal memuat data surat")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id])

  async function handleDelete() {
    if (!user) return

    setIsDeleting(true)
    try {
      const result = await deleteSurat(id, user.id)
      if (result.success) {
        router.push("/admin/surat")
      } else {
        setError(result.error || "Gagal menghapus surat")
      }
    } catch (error) {
      console.error("Error deleting surat:", error)
      setError("Terjadi kesalahan saat menghapus surat")
    } finally {
      setIsDeleting(false)
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
            <span className="inline-block w-32">Nama</span>: {data.nama_penduduk}
          </p>
          <p>
            <span className="inline-block w-32">Keterangan</span>: {data.keterangan}
          </p>
        </div>
        <p>Demikian surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.</p>
        <div className="text-right mt-8">
          <p>..., {formatDate(data.tanggal_surat)}</p>
          <p className="mt-4">Kepala Desa</p>
          <p className="mt-16">(...........................)</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Error</h2>
        <p className="text-red-500">{error}</p>
        <Button asChild>
          <Link href="/admin/surat">Kembali</Link>
        </Button>
      </div>
    )
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{suratTitle}</h2>
          <p className="text-muted-foreground">Detail surat keterangan</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/surat/${jenisSurat}/${id}/print`}>
              <Printer className="mr-2 h-4 w-4" /> Cetak
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/surat/${jenisSurat}/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" /> Hapus
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus surat ini? Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Menghapus..." : "Hapus"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Surat</CardTitle>
          <CardDescription>Detail informasi surat keterangan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">Nomor Surat</h3>
              <p>{surat.nomor_surat}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Tanggal Surat</h3>
              <p>{formatDate(surat.tanggal_surat)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Nama Penduduk</h3>
              <p>{surat.nama_penduduk}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Jenis Surat</h3>
              <p>{jenisSurat.charAt(0).toUpperCase() + jenisSurat.slice(1)}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium">Keterangan</h3>
              <p>{surat.keterangan}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline">
            <Link href="/admin/surat">Kembali</Link>
          </Button>
        </CardFooter>
      </Card>

      <LetterPreview type={jenisSurat} formData={surat} renderContent={renderLetterContent} />
    </div>
  )
}

