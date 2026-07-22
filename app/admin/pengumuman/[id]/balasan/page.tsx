"use client"

import { use, useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ArrowLeft, Send, MessageSquare, User } from "lucide-react"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { toast } from "sonner"

export default function AdminAnnouncementRepliesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()

  const [announcement, setAnnouncement] = useState<any>(null)
  const [chatList, setChatList] = useState<any[]>([])
  const [selectedWargaId, setSelectedWargaId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Ref to track selectedWargaId in polling callback
  const selectedWargaIdRef = useRef<string | null>(null)
  selectedWargaIdRef.current = selectedWargaId

  const fetchChatList = async () => {
    try {
      const res = await fetch(`/api/notifications/reply/admin-list?id_pengumuman=${id}`)
      if (res.ok) {
        const { list, allMessages } = await res.json()
        setChatList(list)

        // Update messages for currently selected warga
        const currentWargaId = selectedWargaIdRef.current
        if (currentWargaId && allMessages) {
          const activeMessages = allMessages
            .filter((msg: any) => msg.warga_id === currentWargaId)
            .reverse()
          setMessages(activeMessages)
        }
      }
    } catch (err) {
      console.error("Error in fetchChatList:", err)
    }
  }

  // Initial data load + polling (runs once)
  useEffect(() => {
    if (!user) return

    async function loadData() {
      try {
        const origRes = await fetch(`/api/notifications/${id}/detail`)
        if (!origRes.ok) {
          toast.error("Pengumuman tidak ditemukan")
          router.push("/admin/pengumuman")
          return
        }
        const original = await origRes.json()
        setAnnouncement(original)

        await fetchChatList()
      } catch (err) {
        console.error("Error loading admin page:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Polling interval (3.5 seconds)
    const interval = setInterval(() => {
      fetchChatList()
    }, 3500)

    return () => clearInterval(interval)
  }, [id, user])

  // Fetch messages immediately when selecting a warga
  const handleSelectWarga = async (wargaId: string) => {
    setSelectedWargaId(wargaId)

    try {
      const res = await fetch(`/api/notifications/reply?id_pengumuman=${id}&warga_id=${wargaId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (err) {
      console.error("Error fetching messages for warga:", err)
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !user || !selectedWargaId || isSending) return

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
          warga_id: selectedWargaId,
          pesan: messageContent,
          is_admin_reply: true,
        }),
      })

      if (response.ok) {
        await fetchChatList()
      } else {
        toast.error("Gagal mengirim balasan")
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

  const activeWarga = chatList.find((c) => c.wargaId === selectedWargaId)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/admin/pengumuman">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Balasan Pengumuman</h2>
          <p className="text-muted-foreground">Tanggapan dan chat dari warga desa</p>
        </div>
      </div>

      {announcement && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-primary">{announcement.judul}</CardTitle>
            <CardDescription>
              Diposting pada {format(new Date(announcement.tanggal), "dd MMMM yyyy HH:mm", { locale: localeId })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">{announcement.isi}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chat List Pane */}
        <Card className="md:col-span-1 flex flex-col h-[500px]">
          <CardHeader className="border-b py-3 px-4 bg-muted/20">
            <CardTitle className="text-sm font-semibold">Daftar Percakapan Warga</CardTitle>
            <CardDescription className="text-xs">Warga yang menanggapi pengumuman ini</CardDescription>
          </CardHeader>
          <div className="flex-1 overflow-y-auto divide-y">
            {chatList.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                Belum ada tanggapan dari warga.
              </div>
            ) : (
              chatList.map((chat) => (
                <button
                  key={chat.wargaId}
                  onClick={() => handleSelectWarga(chat.wargaId)}
                  className={`w-full text-left p-3 flex gap-3 items-start transition-colors hover:bg-muted/50 ${
                    selectedWargaId === chat.wargaId ? "bg-muted" : ""
                  }`}
                >
                  <div className="bg-primary/10 text-primary p-2 rounded-full mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-semibold text-sm truncate">{chat.wargaName}</span>
                      <span className="text-[9px] text-muted-foreground">
                        {format(new Date(chat.lastDate), "HH:mm", { locale: localeId })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Conversation Thread Pane */}
        <Card className="md:col-span-2 flex flex-col h-[500px]">
          {selectedWargaId && activeWarga ? (
            <>
              <CardHeader className="border-b py-3 px-4 flex-row items-center gap-2 bg-muted/20">
                <User className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <CardTitle className="text-sm font-semibold">{activeWarga.wargaName}</CardTitle>
                  <CardDescription className="text-xs">Percakapan terkait pengumuman ini</CardDescription>
                </div>
              </CardHeader>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                {messages.map((msg) => {
                  const isAdmin = msg.is_admin_reply
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-lg px-4 py-2 text-sm shadow-sm ${
                          isAdmin
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-background border text-foreground rounded-tl-none"
                        }`}
                      >
                        {!isAdmin && (
                          <span className="block text-[10px] font-bold text-primary mb-1">
                            {activeWarga.wargaName}
                          </span>
                        )}
                        <p className="leading-relaxed break-words">{msg.pesan}</p>
                        <span
                          className={`block text-[9px] mt-1 text-right ${
                            isAdmin ? "text-primary-foreground/75" : "text-muted-foreground"
                          }`}
                        >
                          {format(new Date(msg.created_at), "HH:mm", { locale: localeId })}
                        </span>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="border-t p-3 flex gap-2 bg-background">
                <Input
                  placeholder="Ketik balasan untuk warga..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isSending}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSending || !inputText.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
              <MessageSquare className="h-12 w-12 mb-2 opacity-30 text-primary" />
              <p className="text-sm font-medium">Pilih percakapan warga</p>
              <p className="text-xs max-w-xs mt-1">
                Silakan pilih salah satu warga di panel kiri untuk melihat detail pesan dan membalasnya.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
