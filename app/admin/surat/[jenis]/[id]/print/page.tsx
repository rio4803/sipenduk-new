"use client"

import { useState, useEffect, useRef, use } from "react"
import { useRouter, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getSuratById } from "../../../actions"
import { formatDate } from "@/lib/utils"
import { Printer, ArrowLeft } from "lucide-react"
import { LetterTemplate } from "@/components/surat/letter-template"

export default function SuratPrintPage({
  params,
}: {
  params: Promise<{ jenis: string; id: string }>
}) {
  const router = useRouter()
  const [surat, setSurat] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

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

  function handlePrint() {
    window.print()
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Error</h2>
        <p className="text-red-500">{error}</p>
        <Button onClick={() => router.back()}>Kembali</Button>
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
      <div className="flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Cetak
        </Button>
      </div>

      <div ref={printRef} className="bg-white p-8 rounded-lg shadow-md print:shadow-none">
        <LetterTemplate
          title={suratTitle.toUpperCase()}
          nomor={surat.nomor_surat}
          tanggal={formatDate(surat.tanggal_surat)}
          nama={surat.nama_penduduk}
          keterangan={surat.keterangan}
        />
      </div>
    </div>
  )
}

