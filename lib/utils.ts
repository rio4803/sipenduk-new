import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"

// Declare EdgeRuntime to prevent errors in non-Edge environments
declare global {
  var EdgeRuntime: any
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  if(!dateString){
    return null
  }
  try {
    const date = new Date(dateString)
    return format(date, "dd MMMM yyyy", { locale: id })
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

export function formatDateTime(dateString: string) {
  try {
    const date = new Date(dateString)
    return format(date, "dd MMMM yyyy, HH:mm", { locale: id })
  } catch (error) {
    console.error("Error formatting date time:", error)
    return dateString
  }
}

export function formatRelativeTime(dateString: string) {
  try {
    const date = new Date(dateString)
    return formatDistanceToNow(date, { addSuffix: true, locale: id })
  } catch (error) {
    console.error("Error formatting relative time:", error)
    return ""
  }
}

export function generateRandomPassword(length = 8) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let password = ""

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }

  return password
}

// Alias for compatibility
export const generatePassword = generateRandomPassword

export function isEdgeRuntime(): boolean {
  return typeof window === "undefined" && typeof EdgeRuntime !== "undefined"
}

export function getAge(dateString: string): number {
  if(!dateString) return 0
  const today = new Date()
  const birthDate = new Date(dateString)
  let age = today.getFullYear() - birthDate.getFullYear()
  const month = today.getMonth() - birthDate.getMonth()
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export function formatDateInput(dateString: string): string {
  try {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0") // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error("Error formatting date for input:", error)
    return dateString // Return original string if formatting fails
  }
}

