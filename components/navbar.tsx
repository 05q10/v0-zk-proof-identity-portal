"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { Shield } from "lucide-react"

const links = [
  { href: "/", label: "Home" },
  { href: "/register", label: "Register" },
  { href: "/prove", label: "Prove" },
  { href: "/verify", label: "Verify" },
  { href: "/issuer", label: "Issuer" },
  { href: "/about", label: "About" },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="inline-flex items-center gap-2" aria-label="Go to home">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center">
            <Shield className="h-4 w-4" />
          </div>
          <span className="font-semibold">ZK-ProofID</span>
        </button>

        <nav className="hidden md:flex items-center gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm px-2 py-1 rounded-md hover:text-foreground/90",
                pathname === l.href ? "text-foreground font-medium" : "text-muted-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" aria-label="Connect wallet placeholder">
            Connect Wallet
          </Button>
        </div>
      </div>
    </header>
  )
}
