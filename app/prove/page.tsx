"use client"

import { useRouter } from "next/navigation"
import { Navbar } from "../../components/navbar"
import { Footer } from "../../components/footer"
import { Toaster } from "../../components/ui/sonner"
import { ProvePage } from "../../components/pages/prove-page"

export default function Prove() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4">
        <ProvePage
          onNavigate={(page) => router.push(page === "register" ? "/register" : page === "verify" ? "/verify" : "/")}
        />
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
