interface LetterTemplateProps {
  title: string
  nomor: string
  tanggal: string | null
  nama: string
  keterangan: string
}

export function LetterTemplate({ title, nomor, tanggal, nama, keterangan }: LetterTemplateProps) {
  return (
    <div className="max-w-[800px] mx-auto p-8 bg-white text-black print:bg-white">
      {/* Letterhead */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold mb-2">PERUM WALIKOTA BLOK N 13 RT 04 RW 06</h1>
        <h2 className="text-lg mb-2">DESA CIBEUTEUNG MUARA KECAMATAN CISEENG</h2>
        <h2 className="text-lg mb-4">KAB.BOGOR</h2>
        <div className="border-b-2 border-black mb-4"></div>
        <h3 className="text-lg font-bold uppercase mb-2">{title}</h3>
        <p className="text-sm">No Surat: {nomor}</p>
      </div>

      {/* Letter Content */}
      <div className="mb-8 leading-relaxed">
        <p className="mb-4">
          Yang bertandatangan dibawah ini PERUM WALIKOTA BLOK N 13 RT 04 RW 06 DESA CIBEUTEUNG MUARA KECAMATAN CISEENG
          KAB.BOGOR, dengan ini menerangkan bahwa :
        </p>
        <div className="space-y-2 mb-4">
          <p>
            <span className="inline-block w-32">Nama</span>: {nama}
          </p>
          <p>
            <span className="inline-block w-32">Keterangan</span>: {keterangan}
          </p>
        </div>
        <p>Demikian surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.</p>
      </div>

      {/* Signature */}
      <div className="text-right mt-12">
        <p>BOGOR, {tanggal}</p>
        <p className="mb-20">KETUA RT 04</p>
        <p className="font-bold">( Rio Nurfajri )</p>
      </div>
    </div>
  )
}

