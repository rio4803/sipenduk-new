import { supabase } from "@/app/utils/supabase"

type ActivityLog = {
  user_id: string
  username?: string
  type: string
  entity_type: string
  description: string
  created_at?: string
}

// create log
// DONE
export async function logActivity(activity: Omit<ActivityLog, "timestamp">): Promise<void> {
  try {
    const {error: errLog} = await supabase.from("log_activity").insert(activity)
    if(errLog){
      console.log(errLog)
    }
  } catch (error) {
    console.error("Error logging activity:", error)
    throw new Error("Failed to log activity")
  }
}

// read log
export async function getRecentActivities(limit: number, userId?: number): Promise<ActivityLog[]> {
  try {
    const {data: log, error} = await supabase.from("log_activity").select("*, pengguna:user_id (username)")
    if(!log || error){
      error ?? console.log(error)
      return []
    }
    const newLog = log?.map(logObj => ({...logObj, username: logObj.pengguna.username}))
    return newLog
  } catch (error) {
    console.error("Error getting recent activities:", error)
    return []
  }
}

