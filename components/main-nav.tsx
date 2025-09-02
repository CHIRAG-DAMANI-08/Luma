"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UserButton } from "@clerk/nextjs"

export function MainNav() {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith("/sign-")

  if (isAuthPage) return null

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
    },
    {
      href: "/chat",
      label: "Chat",
      active: pathname === "/chat",
    },
    {
      href: "/resources",
      label: "Resources",
      active: pathname === "/resources",
    },
  ]

  return (
      <header className="border-b" style={{ backgroundColor: '#19103E' }}>
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-xl" style={{ color: '#E779C1' }}>
              Luma
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    route.active
                      ? ""
                      : ""
                  )}
                  style={{
                    color: route.active ? '#E779C1' : '#fff',
                    opacity: route.active ? 1 : 0.7
                  }}
                >
                  {route.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
  )
}
