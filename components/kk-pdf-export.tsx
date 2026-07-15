"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import jsPDF from "jspdf"
import { formatDate } from "@/lib/utils"

interface KKPdfExportProps {
  kk: {
    no_kk: string
    kepala: string
    desa: string
    rt: string
    rw: string
    kecamatan: string
    kabupaten: string
    provinsi: string
  }
  anggota: Array<{
    id: string
    hubungan: string
    penduduk?: {
      nik?: string
      nama?: string
      jenis_kelamin?: string
      tempat_lahir?: string
      tanggal_lahir?: string
      agama?: string
      status_perkawinan?: string
      pekerjaan?: string
    }
  }>
}

export function KKPdfExport({ kk, anggota }: KKPdfExportProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)

    try {
      // Landscape A4: 297 x 210 mm
      const pdf = new jsPDF("l", "mm", "a4")
      const pageWidth = 297
      const pageHeight = 210
      const marginLeft = 10
      const marginRight = 10
      const contentWidth = pageWidth - marginLeft - marginRight

      // Colors
      const black: [number, number, number] = [0, 0, 0]
      const darkGray: [number, number, number] = [51, 51, 51]

      // ============================================
      // HEADER: Logo Garuda + Judul
      // ============================================
      let y = 10

      // Load Garuda image
      try {
        const img = new Image()
        img.crossOrigin = "anonymous"
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error("Failed to load garuda image"))
          img.src = "/garuda.png"
        })
        // Draw Garuda logo centered at top
        const logoSize = 18
        pdf.addImage(img, "PNG", pageWidth / 2 - logoSize / 2, y, logoSize, logoSize)
        y += logoSize + 2
      } catch {
        // If logo fails, just skip it
        y += 5
      }

      // Title
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(14)
      pdf.setTextColor(...black)
      pdf.text("KARTU KELUARGA", pageWidth / 2, y, { align: "center" })
      y += 6

      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")
      pdf.text(`No. ${kk.no_kk}`, pageWidth / 2, y, { align: "center" })
      y += 8

      // ============================================
      // INFO BLOCK: Data Kepala Keluarga & Alamat
      // ============================================
      pdf.setFontSize(9)
      pdf.setTextColor(...darkGray)

      const col1X = marginLeft
      const col1LabelW = 45
      const col1ValueX = col1X + col1LabelW + 3
      const col2X = pageWidth / 2 + 10
      const col2LabelW = 35
      const col2ValueX = col2X + col2LabelW + 3

      const infoRows = [
        {
          left: { label: "Nama Kepala Keluarga", value: kk.kepala },
          right: { label: "Provinsi", value: kk.provinsi },
        },
        {
          left: { label: "Alamat", value: `Desa ${kk.desa}` },
          right: { label: "Kabupaten/Kota", value: kk.kabupaten },
        },
        {
          left: { label: "RT/RW", value: `${kk.rt} / ${kk.rw}` },
          right: { label: "Kecamatan", value: kk.kecamatan },
        },
        {
          left: { label: "Desa/Kelurahan", value: kk.desa },
          right: null,
        },
      ]

      pdf.setFont("helvetica", "normal")
      for (const row of infoRows) {
        // Left column
        pdf.setFont("helvetica", "normal")
        pdf.text(row.left.label, col1X, y)
        pdf.text(":", col1ValueX - 3, y)
        pdf.setFont("helvetica", "bold")
        pdf.text(row.left.value || "-", col1ValueX, y)

        // Right column
        if (row.right) {
          pdf.setFont("helvetica", "normal")
          pdf.text(row.right.label, col2X, y)
          pdf.text(":", col2ValueX - 3, y)
          pdf.setFont("helvetica", "bold")
          pdf.text(row.right.value || "-", col2ValueX, y)
        }

        y += 6
      }

      y += 4

      // ============================================
      // TABLE: Anggota Keluarga
      // ============================================
      const columns = [
        { header: "No", width: 8 },
        { header: "Nama Lengkap", width: 40 },
        { header: "NIK", width: 35 },
        { header: "Jenis\nKelamin", width: 18 },
        { header: "Tempat Lahir", width: 30 },
        { header: "Tanggal\nLahir", width: 25 },
        { header: "Agama", width: 18 },
        { header: "Status\nPerkawinan", width: 25 },
        { header: "Hubungan\nDlm Keluarga", width: 30 },
        { header: "Pekerjaan", width: 48 },
      ]

      // Calculate total width and scale if needed
      const totalColWidth = columns.reduce((sum, col) => sum + col.width, 0)
      const scale = contentWidth / totalColWidth
      const scaledColumns = columns.map((col) => ({
        ...col,
        width: col.width * scale,
      }))

      const headerHeight = 12
      const rowHeight = 8

      // Draw table header background
      pdf.setFillColor(220, 220, 220)
      pdf.rect(marginLeft, y, contentWidth, headerHeight, "F")

      // Draw header border
      pdf.setDrawColor(...black)
      pdf.setLineWidth(0.3)
      pdf.rect(marginLeft, y, contentWidth, headerHeight, "S")

      // Draw header text
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(7)
      pdf.setTextColor(...black)

      let colX = marginLeft
      for (const col of scaledColumns) {
        // Draw vertical line
        pdf.line(colX, y, colX, y + headerHeight)

        // Split header text by newline for multi-line headers
        const lines = col.header.split("\n")
        const lineHeight = 3.5
        const textStartY = y + (headerHeight - lines.length * lineHeight) / 2 + lineHeight
        for (let i = 0; i < lines.length; i++) {
          pdf.text(lines[i], colX + col.width / 2, textStartY + i * lineHeight, {
            align: "center",
          })
        }
        colX += col.width
      }
      // Right border of last column
      pdf.line(colX, y, colX, y + headerHeight)

      y += headerHeight

      // Draw data rows
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(7)
      pdf.setTextColor(...darkGray)

      // Determine how many empty rows to show (minimum 10 rows total)
      const totalRows = Math.max(anggota.length, 10)

      for (let i = 0; i < totalRows; i++) {
        // Check if we need a new page
        if (y + rowHeight > pageHeight - 15) {
          pdf.addPage()
          y = 10
        }

        const a = anggota[i]
        const p = a?.penduduk

        const rowData = a
          ? [
              String(i + 1),
              p?.nama || "-",
              p?.nik || "-",
              p?.jenis_kelamin === "LK" ? "Laki-laki" : p?.jenis_kelamin === "PR" ? "Perempuan" : "-",
              p?.tempat_lahir || "-",
              p?.tanggal_lahir ? (formatDate(p.tanggal_lahir) || "-") : "-",
              p?.agama || "-",
              p?.status_perkawinan || "-",
              a.hubungan || "-",
              p?.pekerjaan || "-",
            ]
          : [String(i + 1), "", "", "", "", "", "", "", "", ""]

        // Draw row border
        pdf.setDrawColor(...black)
        pdf.setLineWidth(0.2)
        pdf.rect(marginLeft, y, contentWidth, rowHeight, "S")

        // Draw cell content
        colX = marginLeft
        for (let j = 0; j < scaledColumns.length; j++) {
          const col = scaledColumns[j]

          // Draw vertical line
          pdf.line(colX, y, colX, y + rowHeight)

          // Truncate text if too long
          const cellText = rowData[j]
          const maxTextWidth = col.width - 2
          let displayText = cellText

          // Simple truncation
          while (pdf.getTextWidth(displayText) > maxTextWidth && displayText.length > 1) {
            displayText = displayText.slice(0, -1)
          }
          if (displayText !== cellText && cellText.length > 0) {
            displayText = displayText.slice(0, -1) + "…"
          }

          // Center the "No" column, left-align others
          if (j === 0) {
            pdf.text(displayText, colX + col.width / 2, y + rowHeight / 2 + 1, {
              align: "center",
            })
          } else {
            pdf.text(displayText, colX + 1.5, y + rowHeight / 2 + 1)
          }

          colX += col.width
        }
        // Right border of last column
        pdf.line(colX, y, colX, y + rowHeight)

        y += rowHeight
      }

      // ============================================
      // FOOTER
      // ============================================
      y += 8
      if (y + 30 > pageHeight) {
        pdf.addPage()
        y = 15
      }

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(8)
      pdf.setTextColor(...darkGray)

      // Signature block on the right
      const sigX = pageWidth - marginRight - 70
      pdf.text(`${kk.desa}, ..............................`, sigX, y)
      y += 5
      pdf.text("Kepala Keluarga,", sigX, y)
      y += 20
      pdf.setFont("helvetica", "bold")
      pdf.text(`( ${kk.kepala} )`, sigX, y)

      // Save
      pdf.save(`KK-${kk.no_kk}.pdf`)
    } catch (error) {
      console.error("Error generating KK PDF:", error)
      alert("Gagal membuat PDF. Silakan coba lagi.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={generatePDF} disabled={isGenerating} variant="outline" size="sm" className="gap-2">
      <Printer className="h-4 w-4" />
      {isGenerating ? "Memproses..." : "Cetak KK"}
    </Button>
  )
}
