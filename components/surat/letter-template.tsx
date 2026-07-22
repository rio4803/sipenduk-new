"use client"

import { useEffect, useState } from "react"
import { getLetterTemplate, LetterTemplateConfig } from "@/lib/letter-templates"

interface LetterTemplateProps {
  jenis?: string
  title?: string
  nomor?: string
  tanggal?: string | null
  nama?: string
  keterangan?: string
  customOpening?: string
  customClosing?: string
  customHeader1?: string
  customHeader2?: string
  customHeader3?: string
  customSignatureTitle?: string
  customSignatureName?: string
  showLogo?: boolean
  additionalData?: Record<string, any>
}

export function LetterTemplate({
  jenis = "kematian",
  title,
  nomor = "XXX/XXX/XXX/XXXX",
  tanggal,
  nama = "...",
  keterangan,
  customOpening,
  customClosing,
  customHeader1,
  customHeader2,
  customHeader3,
  customSignatureTitle,
  customSignatureName,
  showLogo = true,
  additionalData,
}: LetterTemplateProps) {
  const [templateConfig, setTemplateConfig] = useState<LetterTemplateConfig>(() =>
    getLetterTemplate(jenis)
  )

  useEffect(() => {
    setTemplateConfig(getLetterTemplate(jenis))
  }, [jenis])

  const header1 = customHeader1 || templateConfig.header1
  const header2 = customHeader2 || templateConfig.header2
  const header3 = customHeader3 || templateConfig.header3
  const letterTitle = title || templateConfig.title
  const openingText = customOpening || templateConfig.openingText
  const closingText = customClosing || templateConfig.closingText
  const sigTitle = customSignatureTitle || templateConfig.signatureTitle
  const sigName = customSignatureName || templateConfig.signatureName
  const displayLogo = showLogo !== undefined ? showLogo : templateConfig.showLogo

  return (
    <div className="max-w-[800px] mx-auto p-8 bg-white text-black print:bg-white print:p-0 font-serif leading-relaxed">
      {/* Official Government Kop Surat Header */}
      <div className="flex items-center justify-between border-b-4 border-double border-black pb-4 mb-6">
        {displayLogo && (
          <div className="w-20 h-24 flex items-center justify-center flex-shrink-0">
            {/* Logo Kabupaten Bogor */}
            <img
              src="/logo-bogor.net.png"
              alt="Logo Kabupaten Bogor"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
        <div className="flex-1 text-center px-4">
          <h1 className="text-base font-bold tracking-wider uppercase">{header1}</h1>
          <h2 className="text-sm font-bold uppercase">{header2}</h2>
          <h3 className="text-xs font-semibold">{header3}</h3>
        </div>
        {displayLogo && <div className="w-20 flex-shrink-0 hidden md:block"></div>}
      </div>

      {/* Letter Title & Number */}
      <div className="text-center mb-6">
        <h3 className="text-base font-bold uppercase underline tracking-wide mb-1">
          {letterTitle}
        </h3>
        <p className="text-sm font-sans">Nomor: {nomor}</p>
      </div>

      {/* Opening Paragraph */}
      <div className="mb-6 text-justify text-sm leading-relaxed">
        <p className="mb-4">{openingText}</p>

        {/* Data Fields */}
        <div className="space-y-2 my-4 pl-4 border-l-2 border-muted/50">
          <div className="flex text-sm">
            <span className="w-40 font-medium flex-shrink-0">Nama Lengkap</span>
            <span className="mr-2">:</span>
            <span className="font-semibold">{nama}</span>
          </div>

          {additionalData?.nik && (
            <div className="flex text-sm">
              <span className="w-40 font-medium flex-shrink-0">NIK</span>
              <span className="mr-2">:</span>
              <span>{additionalData.nik}</span>
            </div>
          )}

          {additionalData?.tempat_tanggal_lahir && (
            <div className="flex text-sm">
              <span className="w-40 font-medium flex-shrink-0">Tempat, Tgl Lahir</span>
              <span className="mr-2">:</span>
              <span>{additionalData.tempat_tanggal_lahir}</span>
            </div>
          )}

          {additionalData?.jenis_kelamin && (
            <div className="flex text-sm">
              <span className="w-40 font-medium flex-shrink-0">Jenis Kelamin</span>
              <span className="mr-2">:</span>
              <span>{additionalData.jenis_kelamin}</span>
            </div>
          )}

          {additionalData?.alamat && (
            <div className="flex text-sm">
              <span className="w-40 font-medium flex-shrink-0">Alamat Domisili</span>
              <span className="mr-2">:</span>
              <span>{additionalData.alamat}</span>
            </div>
          )}

          {/* Specific fields based on letter type */}
          {jenis === "kematian" && additionalData?.tanggal_kematian && (
            <div className="flex text-sm">
              <span className="w-40 font-medium flex-shrink-0">Tanggal Meninggal</span>
              <span className="mr-2">:</span>
              <span>{additionalData.tanggal_kematian}</span>
            </div>
          )}

          {jenis === "kematian" && additionalData?.sebab_kematian && (
            <div className="flex text-sm">
              <span className="w-40 font-medium flex-shrink-0">Sebab Meninggal</span>
              <span className="mr-2">:</span>
              <span>{additionalData.sebab_kematian}</span>
            </div>
          )}

          {jenis === "kelahiran" && additionalData?.nama_bayi && (
            <div className="flex text-sm">
              <span className="w-40 font-medium flex-shrink-0">Nama Bayi</span>
              <span className="mr-2">:</span>
              <span className="font-semibold">{additionalData.nama_bayi}</span>
            </div>
          )}

          {jenis === "kelahiran" && additionalData?.nama_orang_tua && (
            <div className="flex text-sm">
              <span className="w-40 font-medium flex-shrink-0">Nama Orang Tua</span>
              <span className="mr-2">:</span>
              <span>{additionalData.nama_orang_tua}</span>
            </div>
          )}

          {jenis === "kedatangan" && additionalData?.alamat_asal && (
            <div className="flex text-sm">
              <span className="w-40 font-medium flex-shrink-0">Alamat Asal</span>
              <span className="mr-2">:</span>
              <span>{additionalData.alamat_asal}</span>
            </div>
          )}

          {jenis === "perpindahan" && additionalData?.alamat_tujuan && (
            <div className="flex text-sm">
              <span className="w-40 font-medium flex-shrink-0">Alamat Tujuan Pindah</span>
              <span className="mr-2">:</span>
              <span>{additionalData.alamat_tujuan}</span>
            </div>
          )}

          {keterangan && (
            <div className="flex text-sm">
              <span className="w-40 font-medium flex-shrink-0">Keterangan</span>
              <span className="mr-2">:</span>
              <span className="whitespace-pre-wrap">{keterangan}</span>
            </div>
          )}
        </div>

        {/* Closing Paragraph */}
        <p className="mt-6">{closingText}</p>
      </div>

      {/* Signature Section */}
      <div className="flex justify-end mt-12 text-sm">
        <div className="text-center w-64">
          <p>Bogor, {tanggal || new Date().toLocaleDateString("id-ID")}</p>
          <p className="mb-20 font-medium">{sigTitle}</p>
          <p className="font-bold underline">{sigName}</p>
        </div>
      </div>
    </div>
  )
}
