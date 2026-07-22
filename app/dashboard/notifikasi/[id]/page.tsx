"use client"

import { use, useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ArrowLeft, Send, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { toast } from "sonner"

export default function NotificationChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()

  const [announcement, setAnnouncement] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchReplies = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/notifications/reply?id_pengumuman=${id}&warga_id=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (err) {
      console.error("Error loading chat:", err)
    }
  }

  useEffect(() => {
    if (!user) return

    async function loadData() {
      try {
        // Fetch original announcement via server API
        const origRes = await fetch(`/api/notifications/${id}/detail`)
        if (!origRes.ok) {
          toast.error("Pengumuman tidak ditemukan")
          router.push("/dashboard/notifikasi")
          return
        }
        const original = await origRes.json()
        setAnnouncement(original)

        // Fetch replies
        await fetchReplies()

        // Mark as read visually
        await fetch(`/api/notifications/${id}/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user?.id }),
        })
      } catch (error) {
        console.error("Error loading chat page data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Polling interval for new messages (3.5 seconds)
    const interval = setInterval(() => {
      fetchReplies()
    }, 3500)

    return () => clearInterval(interval)
  }, [id, user])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !user || isSending) return

    const messageContent = inputText.trim()
    setInputText("")
    setIsSending(true)

    try {
      const response = await fetch("/api/notifications/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_pengumuman: id,
          pengirim_id: user.id,
          warga_id: user.id,
          pesan: messageContent,
          is_admin_reply: false,
        }),
      })

      if (response.ok) {
        await fetchReplies()
      } else {
        toast.error("Gagal mengirim pesan")
        setInputText(messageContent)
      }
    } catch (err) {
      console.error(err)
      toast.error("Terjadi kesalahan saat mengirim")
      setInputText(messageContent)
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/dashboard/notifikasi">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Detail Chat Notifikasi</h2>
          <p className="text-muted-foreground">Tanya jawab langsung dengan perangkat desa</p>
        </div>
      </div>

      {announcement && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-primary">{announcement.judul}</CardTitle>
            <CardDescription>
              Diposting oleh: <span className="font-semibold">{announcement.pengguna?.name || "Perangkat Desa"}</span> &middot;{" "}
              {format(new Date(announcement.tanggal), "dd MMMM yyyy HH:mm", { locale: localeId })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{announcement.isi}</p>
          </CardContent>
        </Card>
      )}

      <Card className="flex flex-col h-[500px]">
        <CardHeader className="border-b py-3 px-4 flex-row items-center gap-2 bg-muted/20">
          <MessageSquare className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <CardTitle className="text-sm font-semibold">Ruang Percakapan</CardTitle>
            <CardDescription className="text-xs">Pesan Anda terkirim langsung ke admin desa</CardDescription>
          </div>
        </CardHeader>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8">
              <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Belum ada percakapan. Mulai dengan mengirim pesan di bawah.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAdmin = msg.is_admin_reply
              return (
                <div key={msg.id} className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 text-sm shadow-sm ${
                      isAdmin
                        ? "bg-background border text-foreground rounded-tl-none"
                        : "bg-primary text-primary-foreground rounded-tr-none"
                    }`}
                  >
                    {isAdmin && (
                      <span className="block text-[10px] font-bold text-primary mb-1">
                        {msg.pengirim?.name || "Admin Desa"}
                      </span>
                    )}
                    <p className="leading-relaxed break-words">{msg.pesan}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        isAdmin ? "text-muted-foreground" : "text-primary-foreground/75"
                      }`}
                    >
                      {format(new Date(msg.created_at), "HH:mm", { locale: localeId })}
                    </span>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send Input */}
        <form onSubmit={handleSendMessage} className="border-t p-3 flex gap-2 bg-background">
          <Input
            placeholder="Tulis pesan..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            className="flex-1"
          />
          <Button type="submit" disabled={isSending || !inputText.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  )
}
