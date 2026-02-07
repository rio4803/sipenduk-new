"use client"
import { useRouter } from "next/navigation"
import { LetterForm } from "@/components/surat/letter-form"
import { createSurat } from "../../actions"
import { useAuth } from "@/lib/auth-context"
import { use } from "react"

export default function BuatSuratPage({
  params,
}: {
  params: Promise<{ jenis: string }>
}) {
  const router = useRouter()
  const { user } = useAuth()
  const {jenis: jenisSurat} = use(params)

  let title = ""
  let description = ""

  switch (jenisSurat) {
    case "kematian":
      title = "Surat Keterangan Kematian"
      description = "Buat surat keterangan kematian baru"
      break
    case "kelahiran":
      title = "Surat Keterangan Kelahiran"
      description = "Buat surat keterangan kelahiran baru"
      break
    case "kedatangan":
      title = "Surat Keterangan Kedatangan"
      description = "Buat surat keterangan kedatangan baru"
      break
    case "perpindahan":
      title = "Surat Keterangan Perpindahan"
      description = "Buat surat keterangan perpindahan baru"
      break
    case "domisili":
      title = "Surat Keterangan Domisili"
      description = "Buat surat keterangan domisili baru"
      break
    default:
      title = "Surat Keterangan"
      description = "Buat surat keterangan baru"
  }

  async function handleSubmit(formData: FormData) {
    if (!user) return { error: "Anda harus login terlebih dahulu" }
    return await createSurat(formData, user.id, jenisSurat)
  }

  function renderLetterContent(data: any) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold">{title.toUpperCase()}</h2>
          <p>Nomor: {data.nomor_surat || "..."}</p>
        </div>
        <p>Yang bertanda tangan di bawah ini, Kepala Desa ... menerangkan dengan sebenarnya bahwa:</p>
        <div className="space-y-2">
          <p>
            <span className="inline-block w-32">Nama</span>: {data.nama_penduduk || "..."}
          </p>
          <p>
            <span className="inline-block w-32">Keterangan</span>: {data.keterangan || "..."}
          </p>
        </div>
        <p>Demikian surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.</p>
        <div className="text-right mt-8">
          <p>..., {data.tanggal_surat ? new Date(data.tanggal_surat).toLocaleDateString() : "..."}</p>
          <p className="mt-4">Kepala Desa</p>
          <p className="mt-16">(...........................)</p>
        </div>
      </div>
    )
  }

  return (
    <LetterForm
      type={jenisSurat}
      title={title}
      description={description}
      onSubmit={handleSubmit}
      renderLetterContent={renderLetterContent}
    />
  )
}

