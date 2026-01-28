// Types based on the database schema
export type Penduduk = {
  id_penduduk: string
  nik: string
  nama: string
  tempat_lh: string
  tgl_lh: string
  jekel: "LK" | "PR"
  desa: string
  rt: string
  rw: string
  agama: string
  kawin: string
  pekerjaan: string
  status: "Ada" | "Meninggal" | "Pindah"
}

export type KartuKeluarga = {
  id: number
  no_kk: string
  kepala: string
  desa: string
  rt: string
  rw: string
  kecamatan: string
  kabupaten: string
  provinsi: string
}

export type AnggotaKeluarga = {
  id_anggota: string
  id_kk: string
  id_penduduk: string
  hubungan: string
}

export type Kelahiran = {
  id_lahir: number
  nama: string
  tgl_lh: string
  jekel: "LK" | "PR"
  id_kk: number
}

export type Kematian = {
  id_mendu: number
  id_pdd: number
  tgl_mendu: string
  sebab: string
}

export type Kedatangan = {
  id_datang: number
  nik: string
  nama_datang: string
  jekel: "LK" | "PR"
  tgl_datang: string
  pelapor: number
}

export type Perpindahan = {
  id_pindah: number
  id_pdd: number
  tgl_pindah: string
  alasan: string
}

export type Pengguna = {
  id_pengguna: number
  nama_pengguna: string
  username: string
  password: string
  level: "admin" | "guest"
}

// Dummy data
export const penduduk: Penduduk[] = [
  {
    id_penduduk: "1",
    nik: "3501012001900001",
    nama: "Budi Santoso",
    tempat_lh: "Jakarta",
    tgl_lh: "1990-01-20",
    jekel: "LK",
    desa: "Tamantirto",
    rt: "001",
    rw: "002",
    agama: "Islam",
    kawin: "Sudah",
    pekerjaan: "Pegawai Swasta",
    status: "Ada",
  },
  {
    id_penduduk: "2",
    nik: "3501012002900002",
    nama: "Siti Rahayu",
    tempat_lh: "Yogyakarta",
    tgl_lh: "1992-05-15",
    jekel: "PR",
    desa: "Tamantirto",
    rt: "001",
    rw: "002",
    agama: "Islam",
    kawin: "Sudah",
    pekerjaan: "Guru",
    status: "Ada",
  },
  {
    id_penduduk: "3",
    nik: "3501012003900003",
    nama: "Ahmad Rizki",
    tempat_lh: "Bantul",
    tgl_lh: "2010-08-10",
    jekel: "LK",
    desa: "Tamantirto",
    rt: "001",
    rw: "002",
    agama: "Islam",
    kawin: "Belum",
    pekerjaan: "Pelajar",
    status: "Ada",
  },
  {
    id_penduduk: "4",
    nik: "3501012004900004",
    nama: "Dewi Lestari",
    tempat_lh: "Sleman",
    tgl_lh: "2012-12-05",
    jekel: "PR",
    desa: "Tamantirto",
    rt: "001",
    rw: "002",
    agama: "Islam",
    kawin: "Belum",
    pekerjaan: "Pelajar",
    status: "Ada",
  },
  {
    id_penduduk: "5",
    nik: "3501012005900005",
    nama: "Joko Widodo",
    tempat_lh: "Surakarta",
    tgl_lh: "1985-03-25",
    jekel: "LK",
    desa: "Tamantirto",
    rt: "002",
    rw: "003",
    agama: "Islam",
    kawin: "Sudah",
    pekerjaan: "Wiraswasta",
    status: "Ada",
  },
  {
    id_penduduk: "6",
    nik: "3501012006900006",
    nama: "Ani Yudhoyono",
    tempat_lh: "Yogyakarta",
    tgl_lh: "1987-07-18",
    jekel: "PR",
    desa: "Tamantirto",
    rt: "002",
    rw: "003",
    agama: "Islam",
    kawin: "Sudah",
    pekerjaan: "Ibu Rumah Tangga",
    status: "Ada",
  },
  {
    id_penduduk: "7",
    nik: "3501012007900007",
    nama: "Agus Harimurti",
    tempat_lh: "Bantul",
    tgl_lh: "2015-02-12",
    jekel: "LK",
    desa: "Tamantirto",
    rt: "002",
    rw: "003",
    agama: "Islam",
    kawin: "Belum",
    pekerjaan: "Pelajar",
    status: "Ada",
  },
  {
    id_penduduk: "8",
    nik: "3501012008900008",
    nama: "Mega Wati",
    tempat_lh: "Jakarta",
    tgl_lh: "1980-04-30",
    jekel: "PR",
    desa: "Tamantirto",
    rt: "003",
    rw: "001",
    agama: "Islam",
    kawin: "Sudah",
    pekerjaan: "PNS",
    status: "Ada",
  },
  {
    id_penduduk: "9",
    nik: "3501012009900009",
    nama: "Susilo Bambang",
    tempat_lh: "Pacitan",
    tgl_lh: "1978-09-15",
    jekel: "LK",
    desa: "Tamantirto",
    rt: "003",
    rw: "001",
    agama: "Islam",
    kawin: "Sudah",
    pekerjaan: "TNI",
    status: "Ada",
  },
  {
    id_penduduk: "10",
    nik: "3501012010900010",
    nama: "Prabowo Subianto",
    tempat_lh: "Jakarta",
    tgl_lh: "1975-11-22",
    jekel: "LK",
    desa: "Tamantirto",
    rt: "004",
    rw: "002",
    agama: "Islam",
    kawin: "Sudah",
    pekerjaan: "Pengusaha",
    status: "Pindah",
  },
  {
    id_penduduk: "11",
    nik: "3501012011900011",
    nama: "Sandiaga Uno",
    tempat_lh: "Jakarta",
    tgl_lh: "1982-06-10",
    jekel: "LK",
    desa: "Tamantirto",
    rt: "004",
    rw: "002",
    agama: "Islam",
    kawin: "Sudah",
    pekerjaan: "Pengusaha",
    status: "Meninggal",
  },
  {
    id_penduduk: "12",
    nik: "3501012012900012",
    nama: "Anies Baswedan",
    tempat_lh: "Jakarta",
    tgl_lh: "1983-08-05",
    jekel: "LK",
    desa: "Tamantirto",
    rt: "005",
    rw: "003",
    agama: "Islam",
    kawin: "Sudah",
    pekerjaan: "Dosen",
    status: "Ada",
  },
  {
    id_penduduk: "13",
    nik: "3501012013900013",
    nama: "Ganjar Pranowo",
    tempat_lh: "Semarang",
    tgl_lh: "1979-12-15",
    jekel: "LK",
    desa: "Tamantirto",
    rt: "005",
    rw: "003",
    agama: "Islam",
    kawin: "Sudah",
    pekerjaan: "PNS",
    status: "Ada",
  },
  {
    id_penduduk: "14",
    nik: "1234",
    nama: "Ardi",
    tempat_lh: "Jogja",
    tgl_lh: "1995-02-20",
    jekel: "LK",
    desa: "Tegal Sari",
    rt: "01",
    rw: "-",
    agama: "Islam",
    kawin: "Sudah",
    pekerjaan: "Buruh",
    status: "Pindah",
  },
  {
    id_penduduk: "15",
    nik: "21712718",
    nama: "Restu",
    tempat_lh: "Bantul",
    tgl_lh: "1996-09-13",
    jekel: "LK",
    desa: "Tamantirto",
    rt: "002",
    rw: "004",
    agama: "Islam",
    kawin: "Belum",
    pekerjaan: "Pegawai Swasta",
    status: "Meninggal",
  },
]

export const kartuKeluarga: KartuKeluarga[] = [
  {
    id: 1,
    no_kk: "3501012001900001",
    kepala: "Budi Santoso",
    desa: "Tamantirto",
    rt: "001",
    rw: "002",
    kecamatan: "Kasihan",
    kabupaten: "Bantul",
    provinsi: "DIY",
  },
  {
    id: 2,
    no_kk: "3501012005900005",
    kepala: "Joko Widodo",
    desa: "Tamantirto",
    rt: "002",
    rw: "003",
    kecamatan: "Kasihan",
    kabupaten: "Bantul",
    provinsi: "DIY",
  },
  {
    id: 3,
    no_kk: "3501012008900008",
    kepala: "Mega Wati",
    desa: "Tamantirto",
    rt: "003",
    rw: "001",
    kecamatan: "Kasihan",
    kabupaten: "Bantul",
    provinsi: "DIY",
  },
  {
    id: 4,
    no_kk: "3501012010900010",
    kepala: "Prabowo Subianto",
    desa: "Tamantirto",
    rt: "004",
    rw: "002",
    kecamatan: "Kasihan",
    kabupaten: "Bantul",
    provinsi: "DIY",
  },
  {
    id: 5,
    no_kk: "3501012012900012",
    kepala: "Anies Baswedan",
    desa: "Tamantirto",
    rt: "005",
    rw: "003",
    kecamatan: "Kasihan",
    kabupaten: "Bantul",
    provinsi: "DIY",
  },
  {
    id: 6,
    no_kk: "102038292321",
    kepala: "Nugroho",
    desa: "Tamantirto",
    rt: "01",
    rw: "0",
    kecamatan: "Kasihan",
    kabupaten: "Bantul",
    provinsi: "DIY",
  },
  {
    id: 7,
    no_kk: "356163565",
    kepala: "Restu",
    desa: "Tamantirto",
    rt: "002",
    rw: "004",
    kecamatan: "Kasihan",
    kabupaten: "Bantul",
    provinsi: "Daerah Istimewa Yogyakarta",
  },
]

export const anggotaKeluarga: AnggotaKeluarga[] = [
  {
    id_anggota: "1",
    id_kk: "1",
    id_penduduk: "1",
    hubungan: "Kepala Keluarga",
  },
  {
    id_anggota: "2",
    id_kk: "1",
    id_penduduk: "2",
    hubungan: "Istri",
  },
  {
    id_anggota: "3",
    id_kk: "1",
    id_penduduk: "3",
    hubungan: "Anak",
  },
  {
    id_anggota: "4",
    id_kk: "1",
    id_penduduk: "4",
    hubungan: "Anak",
  },
  {
    id_anggota: "5",
    id_kk: "2",
    id_penduduk: "5",
    hubungan: "Kepala Keluarga",
  },
  {
    id_anggota: "6",
    id_kk: "2",
    id_penduduk: "6",
    hubungan: "Istri",
  },
  {
    id_anggota: "7",
    id_kk: "2",
    id_penduduk: "7",
    hubungan: "Anak",
  },
  {
    id_anggota: "8",
    id_kk: "3",
    id_penduduk: "8",
    hubungan: "Kepala Keluarga",
  },
  {
    id_anggota: "9",
    id_kk: "3",
    id_penduduk: "9",
    hubungan: "Suami",
  },
  {
    id_anggota: "10",
    id_kk: "4",
    id_penduduk: "10",
    hubungan: "Kepala Keluarga",
  },
  {
    id_anggota: "11",
    id_kk: "4",
    id_penduduk: "11",
    hubungan: "Saudara",
  },
  {
    id_anggota: "12",
    id_kk: "5",
    id_penduduk: "12",
    hubungan: "Kepala Keluarga",
  },
  {
    id_anggota: "13",
    id_kk: "5",
    id_penduduk: "13",
    hubungan: "Saudara",
  },
  {
    id_anggota: "14",
    id_kk: "6",
    id_penduduk: "14",
    hubungan: "Kepala Keluarga",
  },
]

export const kelahiran: Kelahiran[] = [
  {
    id_lahir: 1,
    nama: "Ahmad Rizki",
    tgl_lh: "2010-08-10",
    jekel: "LK",
    id_kk: 1,
  },
  {
    id_lahir: 2,
    nama: "Dewi Lestari",
    tgl_lh: "2012-12-05",
    jekel: "PR",
    id_kk: 1,
  },
  {
    id_lahir: 3,
    nama: "Restu",
    tgl_lh: "2021-05-14",
    jekel: "LK",
    id_kk: 7,
  },
]

export const kematian: Kematian[] = [
  {
    id_mendu: 1,
    id_pdd: 11,
    tgl_mendu: "2021-01-15",
    sebab: "Sakit",
  },
  {
    id_mendu: 2,
    id_pdd: 15,
    tgl_mendu: "2021-05-13",
    sebab: "Covid",
  },
]

export const kedatangan: Kedatangan[] = [
  {
    id_datang: 1,
    nik: "3501012014900014",
    nama_datang: "Ridwan Kamil",
    jekel: "LK",
    tgl_datang: "2021-02-10",
    pelapor: 1,
  },
  {
    id_datang: 2,
    nik: "3501012015900015",
    nama_datang: "Tri Rismaharini",
    jekel: "PR",
    tgl_datang: "2021-03-20",
    pelapor: 5,
  },
  {
    id_datang: 3,
    nik: "677899",
    nama_datang: "Nugroho",
    jekel: "LK",
    tgl_datang: "2021-05-13",
    pelapor: 14,
  },
]

export const perpindahan: Perpindahan[] = [
  {
    id_pindah: 1,
    id_pdd: 10,
    tgl_pindah: "2021-04-05",
    alasan: "Pekerjaan",
  },
  {
    id_pindah: 2,
    id_pdd: 14,
    tgl_pindah: "2021-05-15",
    alasan: "Ga tau",
  },
]

export const pengguna: Pengguna[] = [
  {
    id_pengguna: 1,
    nama_pengguna: "Administrator",
    username: "admin",
    password: "admin123",
    level: "admin",
  },
  {
    id_pengguna: 2,
    nama_pengguna: "Budi Santoso",
    username: "3501012001900001",
    password: "budi123",
    level: "guest",
  },
  {
    id_pengguna: 3,
    nama_pengguna: "Joko Widodo",
    username: "3501012005900005",
    password: "joko123",
    level: "guest",
  },
]

// Helper functions to get data
export function getPendudukById(id: string): Penduduk | undefined {
  return penduduk.find((p) => p.id_penduduk === id)
}

export function getKartuKeluargaById(id: number): KartuKeluarga | undefined {
  return kartuKeluarga.find((kk) => kk.id === id)
}

export function getAnggotaKeluargaByKK(id_kk: string): AnggotaKeluarga[] {
  return anggotaKeluarga.filter((a) => a.id_kk === id_kk)
}

export function getAnggotaKeluargaWithDetail(id_kk: string): any[] {
  const anggota = getAnggotaKeluargaByKK(id_kk)
  return anggota.map((a) => {
    const pendudukData = getPendudukById(a.id_penduduk)
    return {
      ...a,
      penduduk: pendudukData,
    }
  })
}

export function getKelahiranByKK(id_kk: number): Kelahiran[] {
  return kelahiran.filter((k) => k.id_kk === id_kk)
}

export function getKematianByPenduduk(id_pdd: number): Kematian | undefined {
  return kematian.find((k) => k.id_pdd === id_pdd)
}

export function getPerpindahanByPenduduk(id_pdd: number): Perpindahan | undefined {
  return perpindahan.find((p) => p.id_pdd === id_pdd)
}

export function getKedatanganByPelapor(pelapor: number): Kedatangan[] {
  return kedatangan.filter((k) => k.pelapor === pelapor)
}

// Statistics functions
export function getStatistics() {
  return {
    totalPenduduk: penduduk.filter((p) => p.status === "Ada").length,
    totalKK: kartuKeluarga.length,
    totalLaki: penduduk.filter((p) => p.jekel === "LK" && p.status === "Ada").length,
    totalPerempuan: penduduk.filter((p) => p.jekel === "PR" && p.status === "Ada").length,
    totalKelahiran: kelahiran.length,
    totalKematian: kematian.length,
    totalKedatangan: kedatangan.length,
    totalPerpindahan: perpindahan.length,
  }
}

