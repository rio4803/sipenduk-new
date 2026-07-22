export interface LetterTemplateConfig {
  jenis: string
  title: string
  header1: string
  header2: string
  header3: string
  openingText: string
  closingText: string
  signatureTitle: string
  signatureName: string
  showLogo: boolean
}

export const DEFAULT_LETTER_TEMPLATES: Record<string, LetterTemplateConfig> = {
  kematian: {
    jenis: "kematian",
    title: "SURAT KETERANGAN KEMATIAN",
    header1: "PEMERINTAH KABUPATEN BOGOR",
    header2: "KECAMATAN CISEENG - DESA CIBEUTEUNG MUARA",
    header3: "PERUM WALIKOTA BLOK N 13 RT 04 RW 06",
    openingText: "Yang bertanda tangan di bawah ini Pengurus RT 04 RW 06 Desa Cibeuteung Muara, Kecamatan Ciseeng, Kabupaten Bogor, menerangkan bahwa telah meninggal dunia warga kami:",
    closingText: "Demikian surat keterangan kematian ini dibuat dengan sebenarnya berdasarkan data yang ada untuk dapat dipergunakan sebagaimana mestinya.",
    signatureTitle: "Ketua RT 04",
    signatureName: "Rio Nurfajri",
    showLogo: true,
  },
  kelahiran: {
    jenis: "kelahiran",
    title: "SURAT KETERANGAN KELAHIRAN",
    header1: "PEMERINTAH KABUPATEN BOGOR",
    header2: "KECAMATAN CISEENG - DESA CIBEUTEUNG MUARA",
    header3: "PERUM WALIKOTA BLOK N 13 RT 04 RW 06",
    openingText: "Yang bertanda tangan di bawah ini Pengurus RT 04 RW 06 Desa Cibeuteung Muara, Kecamatan Ciseeng, Kabupaten Bogor, menerangkan bahwa telah lahir seorang anak:",
    closingText: "Demikian surat keterangan kelahiran ini dibuat dengan sebenarnya atas dasar yang dapat dipercaya untuk dipergunakan sebagaimana mestinya.",
    signatureTitle: "Ketua RT 04",
    signatureName: "Rio Nurfajri",
    showLogo: true,
  },
  kedatangan: {
    jenis: "kedatangan",
    title: "SURAT KETERANGAN KEDATANGAN",
    header1: "PEMERINTAH KABUPATEN BOGOR",
    header2: "KECAMATAN CISEENG - DESA CIBEUTEUNG MUARA",
    header3: "PERUM WALIKOTA BLOK N 13 RT 04 RW 06",
    openingText: "Yang bertanda tangan di bawah ini Pengurus RT 04 RW 06 Desa Cibeuteung Muara, Kecamatan Ciseeng, Kabupaten Bogor, menerangkan bahwa nama di bawah ini telah melapor dan datang menjadi warga di wilayah kami:",
    closingText: "Demikian surat keterangan kedatangan ini dibuat dengan sebenarnya untuk dipergunakan sebagai kelengkapan administrasi kependudukan.",
    signatureTitle: "Ketua RT 04",
    signatureName: "Rio Nurfajri",
    showLogo: true,
  },
  perpindahan: {
    jenis: "perpindahan",
    title: "SURAT KETERANGAN PERPINDAHAN",
    header1: "PEMERINTAH KABUPATEN BOGOR",
    header2: "KECAMATAN CISEENG - DESA CIBEUTEUNG MUARA",
    header3: "PERUM WALIKOTA BLOK N 13 RT 04 RW 06",
    openingText: "Yang bertanda tangan di bawah ini Pengurus RT 04 RW 06 Desa Cibeuteung Muara, Kecamatan Ciseeng, Kabupaten Bogor, menerangkan bahwa warga di bawah ini bermaksud pindah domisili tempat tinggal:",
    closingText: "Demikian surat keterangan perpindahan ini dibuat dengan sebenarnya atas permohonan yang bersangkutan untuk dipergunakan sebagaimana mestinya.",
    signatureTitle: "Ketua RT 04",
    signatureName: "Rio Nurfajri",
    showLogo: true,
  },
  domisili: {
    jenis: "domisili",
    title: "SURAT KETERANGAN DOMISILI",
    header1: "PEMERINTAH KABUPATEN BOGOR",
    header2: "KECAMATAN CISEENG - DESA CIBEUTEUNG MUARA",
    header3: "PERUM WALIKOTA BLOK N 13 RT 04 RW 06",
    openingText: "Yang bertanda tangan di bawah ini Pengurus RT 04 RW 06 Desa Cibeuteung Muara, Kecamatan Ciseeng, Kabupaten Bogor, menerangkan bahwa orang di bawah ini benar berdomisili di wilayah kami:",
    closingText: "Demikian surat keterangan domisili ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    signatureTitle: "Ketua RT 04",
    signatureName: "Rio Nurfajri",
    showLogo: true,
  },
}

const TEMPLATE_STORAGE_KEY = "sipenduk_letter_templates"

export function getLetterTemplate(jenis: string): LetterTemplateConfig {
  const normalizedJenis = (jenis || "").toLowerCase()
  const defaultTemplate = DEFAULT_LETTER_TEMPLATES[normalizedJenis] || {
    jenis: normalizedJenis,
    title: `SURAT KETERANGAN ${(jenis || "").toUpperCase()}`,
    header1: "PEMERINTAH KABUPATEN BOGOR",
    header2: "KECAMATAN CISEENG - DESA CIBEUTEUNG MUARA",
    header3: "PERUM WALIKOTA BLOK N 13 RT 04 RW 06",
    openingText: "Yang bertanda tangan di bawah ini Pengurus RT 04 RW 06 Desa Cibeuteung Muara, Kecamatan Ciseeng, Kabupaten Bogor, menerangkan bahwa:",
    closingText: "Demikian surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.",
    signatureTitle: "Ketua RT 04",
    signatureName: "Rio Nurfajri",
    showLogo: true,
  }

  if (typeof window === "undefined") {
    return defaultTemplate
  }

  try {
    const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed[normalizedJenis]) {
        return { ...defaultTemplate, ...parsed[normalizedJenis] }
      }
    }
  } catch (err) {
    console.error("Error loading stored letter template:", err)
  }

  return defaultTemplate
}

export function saveLetterTemplate(jenis: string, config: Partial<LetterTemplateConfig>): boolean {
  const normalizedJenis = (jenis || "").toLowerCase()
  if (typeof window === "undefined") return false

  try {
    const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY)
    const templates = stored ? JSON.parse(stored) : {}
    templates[normalizedJenis] = {
      ...(templates[normalizedJenis] || getLetterTemplate(normalizedJenis)),
      ...config,
    }
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates))
    return true
  } catch (err) {
    console.error("Error saving letter template:", err)
    return false
  }
}

export function resetLetterTemplate(jenis: string): LetterTemplateConfig {
  const normalizedJenis = (jenis || "").toLowerCase()
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY)
      if (stored) {
        const templates = JSON.parse(stored)
        delete templates[normalizedJenis]
        localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates))
      }
    } catch (err) {
      console.error("Error resetting letter template:", err)
    }
  }
  return DEFAULT_LETTER_TEMPLATES[normalizedJenis] || getLetterTemplate(normalizedJenis)
}
