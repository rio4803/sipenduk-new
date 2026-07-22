"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { LetterTemplate } from "./letter-template"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface LetterPreviewProps {
  type: string
  formData: any
  renderContent: (data: any) => React.ReactNode
}

export function LetterPreview({ type, formData, renderContent }: LetterPreviewProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [letterTitle, setLetterTitle] = useState("")
  const [previewData, setPreviewData] = useState(formData)

  useEffect(() => {
    // Update preview data when formData changes
    setPreviewData(formData)
  }, [formData])

  useEffect(() => {
    switch (type) {
      case "kematian":
        setLetterTitle("SURAT KETERANGAN KEMATIAN")
        break
      case "kelahiran":
        setLetterTitle("SURAT KETERANGAN KELAHIRAN")
        break
      case "kedatangan":
        setLetterTitle("SURAT KETERANGAN KEDATANGAN")
        break
      case "perpindahan":
        setLetterTitle("SURAT KETERANGAN PERPINDAHAN")
        break
      case "domisili":
        setLetterTitle("SURAT KETERANGAN DOMISILI")
        break
      default:
        setLetterTitle("SURAT KETERANGAN")
    }
  }, [type])

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Preview Surat</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
          {showPreview ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Sembunyikan
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Tampilkan
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {showPreview && (
          <div className="border rounded-md p-4 bg-white">
            <LetterTemplate
              jenis={type}
              title={letterTitle}
              nomor={previewData.nomor_surat || "XXX/XXX/XXX/XXXX"}
              tanggal={
                previewData.tanggal_surat ? formatDate(previewData.tanggal_surat) : formatDate(new Date().toISOString())
              }
              nama={previewData.nama_penduduk || "..."}
              keterangan={previewData.keterangan || "..."}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

