"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function MainNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  const isAdmin = user.role === "admin"
  const basePath = isAdmin ? "/admin" : "/dashboard"

  const routes = isAdmin
    ? [
        {
          href: `${basePath}/dashboard`,
          label: "Dashboard",
          active: pathname === `${basePath}/dashboard`,
        },
        {
          href: `${basePath}/penduduk`,
          label: "Penduduk",
          active: pathname === `${basePath}/penduduk` || pathname.startsWith(`${basePath}/penduduk/`),
        },
        {
          href: `${basePath}/kartu-keluarga`,
          label: "Kartu Keluarga",
          active: pathname === `${basePath}/kartu-keluarga` || pathname.startsWith(`${basePath}/kartu-keluarga/`),
        },
        {
          href: `${basePath}/kelahiran`,
          label: "Kelahiran",
          active: pathname === `${basePath}/kelahiran` || pathname.startsWith(`${basePath}/kelahiran/`),
        },
        {
          href: `${basePath}/kematian`,
          label: "Kematian",
          active: pathname === `${basePath}/kematian` || pathname.startsWith(`${basePath}/kematian/`),
        },
        {
          href: `${basePath}/kedatangan`,
          label: "Kedatangan",
          active: pathname === `${basePath}/kedatangan` || pathname.startsWith(`${basePath}/kedatangan/`),
        },
        {
          href: `${basePath}/perpindahan`,
          label: "Perpindahan",
          active: pathname === `${basePath}/perpindahan` || pathname.startsWith(`${basePath}/perpindahan/`),
        },
        {
          href: `${basePath}/surat`,
          label: "Surat",
          active: pathname === `${basePath}/surat` || pathname.startsWith(`${basePath}/surat/`),
        },
        {
          href: `${basePath}/pengguna`,
          label: "Pengguna",
          active: pathname === `${basePath}/pengguna` || pathname.startsWith(`${basePath}/pengguna/`),
        },
        {
          href: `${basePath}/pengumuman`,
          label: "Pengumuman",
          active: pathname === `${basePath}/pengumuman` || pathname.startsWith(`${basePath}/pengumuman/`),
        },
      ]
    : [
        {
          href: `${basePath}`,
          label: "Dashboard",
          active: pathname === `${basePath}`,
        },
        {
          href: `${basePath}/keluarga`,
          label: "Data Keluarga",
          active: pathname === `${basePath}/keluarga`,
        },
      ]

  return (
    <nav className="hidden md:flex items-center space-x-2 lg:space-x-4 mx-auto overflow-x-auto [&::-webkit-scrollbar]:h-0">
      {routes.map((route) => (
        <Button key={route.href} asChild variant={route.active ? "default" : "ghost"} size="sm">
          <Link
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors whitespace-nowrap",
              route.active ? "text-primary-foreground" : "text-muted-foreground hover:text-primary",
            )}
          >
            {route.label}
          </Link>
        </Button>
      ))}
    </nav>
  )
}

