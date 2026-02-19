"use server"
import { supabase } from "./utils/supabase"

export async function errorNewPenduduk(id_penduduk: string){
    await supabase.from("penduduk").delete().eq("id", id_penduduk)
}