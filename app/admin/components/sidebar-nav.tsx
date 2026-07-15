"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Home, Users, FileText, Bell, UserPlus, UserMinus, Baby, Skull, Mail, Database } from "lucide-react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)} {...props}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
            "justify-start",
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  )
}

export const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: <Home className="mr-2 h-4 w-4" />,
  },
  {
    title: "Penduduk",
    href: "/admin/penduduk",
    icon: <Users className="mr-2 h-4 w-4" />,
  },
  {
    title: "Kartu Keluarga",
    href: "/admin/kartu-keluarga",
    icon: <FileText className="mr-2 h-4 w-4" />,
  },
  {
    title: "Kelahiran",
    href: "/admin/kelahiran",
    icon: <Baby className="mr-2 h-4 w-4" />,
  },
  {
    title: "Kematian",
    href: "/admin/kematian",
    icon: <Skull className="mr-2 h-4 w-4" />,
  },
  {
    title: "Kedatangan",
    href: "/admin/kedatangan",
    icon: <UserPlus className="mr-2 h-4 w-4" />,
  },
  {
    title: "Perpindahan",
    href: "/admin/perpindahan",
    icon: <UserMinus className="mr-2 h-4 w-4" />,
  },
  {
    title: "Surat",
    href: "/admin/surat",
    icon: <Mail className="mr-2 h-4 w-4" />,
  },
  {
    title: "Pengguna",
    href: "/admin/pengguna",
    icon: <Users className="mr-2 h-4 w-4" />,
  },
  {
    title: "Pengumuman",
    href: "/admin/pengumuman",
    icon: <Bell className="mr-2 h-4 w-4" />,
  }, 
]


