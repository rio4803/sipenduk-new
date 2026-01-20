"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Show the install button
      setShowInstallButton(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) {
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)

    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null)
    setShowInstallButton(false)
  }

  if (!showInstallButton) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-background border rounded-lg shadow-lg p-4 max-w-sm">
        <h3 className="font-semibold mb-2">Install Aplikasi</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Install aplikasi ini untuk akses lebih cepat dan notifikasi push
        </p>
        <div className="flex gap-2">
          <Button onClick={handleInstall} size="sm">
            Install
          </Button>
          <Button onClick={() => setShowInstallButton(false)} variant="outline" size="sm">
            Nanti
          </Button>
        </div>
      </div>
    </div>
  )
}
