import { getRedisData, getRedisKeys } from "@/lib/redis-service"
import { cachedFetch } from "@/lib/cache"
import type { Penduduk, KartuKeluarga, AnggotaKeluarga } from "@/lib/dummy-data"

// Cache TTL values (in milliseconds)
const CACHE_TTL = {
  SHORT: 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
}

// Helper functions untuk mengambil data dari Redis
export async function getAllPenduduk(): Promise<Penduduk[]> {
  return cachedFetch(
    "all_penduduk",
    async () => {
      try {
        const keys = await getRedisKeys("penduduk:*")
        const pendudukPromises = keys.map((key) => getRedisData(key))
        const pendudukList = await Promise.all(pendudukPromises)
        return pendudukList.filter(Boolean) as Penduduk[]
      } catch (error) {
        console.error("Error getting all penduduk:", error)
        return []
      }
    },
    CACHE_TTL.SHORT,
  )
}

export async function getPendudukById(id: string): Promise<Penduduk | null> {
  return cachedFetch(
    `penduduk:${id}`,
    async () => {
      try {
        return await getRedisData(`penduduk:${id}`)
      } catch (error) {
        console.error(`Error getting penduduk with id ${id}:`, error)
        return null
      }
    },
    CACHE_TTL.MEDIUM,
  )
}

export async function getAllKartuKeluarga(): Promise<KartuKeluarga[]> {
  return cachedFetch(
    "all_kk",
    async () => {
      try {
        const keys = await getRedisKeys("kk:*")
        const kkPromises = keys.map((key) => getRedisData(key))
        const kkList = await Promise.all(kkPromises)
        return kkList.filter(Boolean) as KartuKeluarga[]
      } catch (error) {
        console.error("Error getting all kartu keluarga:", error)
        return []
      }
    },
    CACHE_TTL.SHORT,
  )
}

export async function getKartuKeluargaById(id: number): Promise<KartuKeluarga | null> {
  return cachedFetch(
    `kk:${id}`,
    async () => {
      try {
        return await getRedisData(`kk:${id}`)
      } catch (error) {
        console.error(`Error getting kartu keluarga with id ${id}:`, error)
        return null
      }
    },
    CACHE_TTL.MEDIUM,
  )
}

export async function getAnggotaKeluargaByKK(id_kk: number): Promise<AnggotaKeluarga[]> {
  return cachedFetch(
    `anggota_by_kk:${id_kk}`,
    async () => {
      try {
        const allKeys = await getRedisKeys("anggota:*")
        const anggotaPromises = allKeys.map((key) => getRedisData(key))
        const allAnggota = await Promise.all(anggotaPromises)
        return allAnggota.filter((a) => a && a.id_kk === id_kk) as AnggotaKeluarga[]
      } catch (error) {
        console.error(`Error getting anggota keluarga for KK ${id_kk}:`, error)
        return []
      }
    },
    CACHE_TTL.MEDIUM,
  )
}

export async function getAnggotaKeluargaWithDetail(id_kk: number): Promise<any[]> {
  return cachedFetch(
    `anggota_detail_by_kk:${id_kk}`,
    async () => {
      try {
        const anggota = await getAnggotaKeluargaByKK(id_kk)
        const detailsPromises = anggota.map(async (a) => {
          const pendudukData = await getPendudukById(a.id_pend)
          return {
            ...a,
            penduduk: pendudukData,
          }
        })
        return await Promise.all(detailsPromises)
      } catch (error) {
        console.error(`Error getting anggota keluarga with details for KK ${id_kk}:`, error)
        return []
      }
    },
    CACHE_TTL.SHORT,
  )
}

// Contoh implementasi untuk statistik
export async function getStatistics() {
  return cachedFetch(
    "statistics",
    async () => {
      try {
        const allPenduduk = await getAllPenduduk()
        const allKK = await getAllKartuKeluarga()
        const kelahiranKeys = await getRedisKeys("kelahiran:*")
        const kematianKeys = await getRedisKeys("kematian:*")
        const kedatanganKeys = await getRedisKeys("kedatangan:*")
        const perpindahanKeys = await getRedisKeys("perpindahan:*")

        return {
          totalPenduduk: allPenduduk.filter((p) => p.status === "Ada").length,
          totalKK: allKK.length,
          totalLaki: allPenduduk.filter((p) => p.jekel === "LK" && p.status === "Ada").length,
          totalPerempuan: allPenduduk.filter((p) => p.jekel === "PR" && p.status === "Ada").length,
          totalKelahiran: kelahiranKeys.length,
          totalKematian: kematianKeys.length,
          totalKedatangan: kedatanganKeys.length,
          totalPerpindahan: perpindahanKeys.length,
        }
      } catch (error) {
        console.error("Error getting statistics:", error)
        return {
          totalPenduduk: 0,
          totalKK: 0,
          totalLaki: 0,
          totalPerempuan: 0,
          totalKelahiran: 0,
          totalKematian: 0,
          totalKedatangan: 0,
          totalPerpindahan: 0,
        }
      }
    },
    CACHE_TTL.MEDIUM,
  )
}

