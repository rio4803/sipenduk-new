"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter, notFound } from "next/navigation"
import { getPendudukById, deletePenduduk } from "../actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, getAge } from "@/lib/utils"
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
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { FormStatus } from "@/components/form-status"
import { Pencil, Trash2 } from "lucide-react"

export default function DetailPendudukPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const {id} = use(params)
  const router = useRouter()
  const [penduduk, setPenduduk] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPendudukById(id)
        if (!data) {
          notFound()
        }
        setPenduduk(data)
      } catch (error) {
        console.log("Error loading penduduk data:", error)
        setError("Gagal memuat data penduduk")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id])

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await deletePenduduk(id)

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess("Data penduduk berhasil dihapus")
        // Redirect setelah 2 detik
        setTimeout(() => {
          router.push("/admin/penduduk")
        }, 2000)
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Detail Penduduk</h2>
          <p className="text-muted-foreground">Memuat data penduduk...</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Detail Penduduk</h2>
          <p className="text-muted-foreground">Informasi lengkap penduduk</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/penduduk/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Hapus
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus data penduduk ini? Tindakan ini tidak dapat dibatalkan.
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

      <FormStatus error={error} success={success} />

      <Card>
        <CardHeader>
          <CardTitle>Data Pribadi</CardTitle>
          <CardDescription>Informasi data diri penduduk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Nomor KK</h3>
              <p className="text-base">{penduduk?.no_kk || "-"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">NIK</h3>
              <p className="text-base">{penduduk?.nik}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Nama Lengkap</h3>
              <p className="text-base">{penduduk?.nama}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Tempat, Tanggal Lahir</h3>
              <p className="text-base">
                {penduduk?.tempat_lahir || "-"}, {formatDate(penduduk?.tanggal_lahir) || "-"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Usia</h3>
              <p className="text-base">{getAge(penduduk?.tanggal_lahir) || "-"} tahun</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Jenis Kelamin</h3>
              <p className="text-base">{penduduk?.jenis_kelamin === "LK" ? "Laki-laki" : "Perempuan"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Agama</h3>
              <p className="text-base">{penduduk?.agama || "-"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status Perkawinan</h3>
              <p className="text-base">{penduduk?.status_perkawinan || "-"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Pekerjaan</h3>
              <p className="text-base">{penduduk?.pekerjaan || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alamat</CardTitle>
          <CardDescription>Informasi alamat penduduk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Desa</h3>
              <p className="text-base">{penduduk?.desa || "-"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">RT/RW</h3>
              <p className="text-base">
                {penduduk?.rt || "-"}/{penduduk?.rw || "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>Status keberadaan penduduk</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
            <p
              className={`text-base ${
                penduduk?.status_penduduk == "Ada"
                  ? "text-green-600 dark:text-green-400"
                  : penduduk?.status_penduduk == "Meninggal"
                    ? "text-red-600 dark:text-red-400"
                    : "text-yellow-600 dark:text-yellow-400"
              }`}
            >
              {penduduk?.status_penduduk || "-"}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild>
            <Link href="/admin/penduduk">Kembali</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

