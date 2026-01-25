import { getRedisData, getRedisKeys, setRedisData } from "./redis-service"

type ActivityLog = {
  id: string
  user_id: string
  username?: string
  type: string
  entity_type: string
  description: string
  created_at?: string
}

export async function logActivity(activity: Omit<ActivityLog, "timestamp">): Promise<void> {
  try {
    const timestamp = Date.now()
    const activityWithTimestamp = { ...activity, timestamp }
    await setRedisData(`activity:${timestamp}`, activityWithTimestamp)
  } catch (error) {
    console.error("Error logging activity:", error)
    throw new Error("Failed to log activity")
  }
}

export async function getRecentActivities(limit: number, userId?: number): Promise<ActivityLog[]> {
  try {
    const keys = await getRedisKeys("activity:*")
    const activityPromises = keys.map((key) => getRedisData<ActivityLog>(key))
    const activities = await Promise.all(activityPromises)

    const validActivities = activities.filter(Boolean) as ActivityLog[]

    const sortedActivities = validActivities.sort((a, b) => b.timestamp! - a.timestamp!)

    let filteredActivities = sortedActivities
    if (userId) {
      filteredActivities = sortedActivities.filter((activity) => activity.userId === userId)
    }

    const recentActivities = filteredActivities.slice(0, limit)

    // Fetch usernames for each activity
    const activitiesWithUsernames = await Promise.all(
      recentActivities.map(async (activity) => {
        try {
          const user = await getRedisData(`pengguna:${activity.userId}`)
          return {
            ...activity,
            userName: user ? user.nama_pengguna : "Unknown User",
          }
        } catch (userError) {
          console.error(`Error fetching user for activity ${activity.timestamp}:`, userError)
          return { ...activity, userName: "Unknown User" }
        }
      }),
    )
    console.log(activitiesWithUsernames)
    return activitiesWithUsernames
  } catch (error) {
    console.error("Error getting recent activities:", error)
    return []
  }
}

