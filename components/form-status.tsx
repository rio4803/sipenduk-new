"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "./ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface FormStatusProps {
  error?: string | null
  success?: string | null
  errors?: Record<string, string[]> | null
}

export function FormStatus({ error, success, errors }: FormStatusProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (error || success) {
      setVisible(true)

      // Auto-hide after 5 seconds
      // const timer = setTimeout(() => {
      //   setVisible(false)
      // }, 5000)

      // return () => clearTimeout(timer)
    }
  }, [error, success])

  if (!visible) return null

  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert
          variant="default"
          className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
        >
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {errors && Object.entries(errors).length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
          <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">Validasi Gagal</h4>
          <ul className="list-disc pl-5 space-y-1">
            {Object.entries(errors).map(([field, messages]) =>
              messages.map((message, i) => (
                <li key={`${field}-${i}`} className="text-sm text-amber-700 dark:text-amber-400">
                  {message}
                </li>
              )),
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

