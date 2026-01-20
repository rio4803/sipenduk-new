import { NextResponse } from "next/server";
import { getRedisKeys, getRedisData } from "@/lib/redis-service";

export async function GET() {
  const keys = await getRedisKeys("kk:*");
  const kkList = await Promise.all(keys.map(getRedisData));

  return NextResponse.json(
    kkList.filter(Boolean).map((kk: any) => ({
      id_kk: kk.id_kk,
      no_kk: kk.no_kk,
      kepala: kk.kepala,
    }))
  );
}
