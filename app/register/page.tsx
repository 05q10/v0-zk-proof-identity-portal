"use client"

import { useRouter } from "next/navigation"
import { Navbar } from "../../components/navbar"
import { Footer } from "../../components/footer"
import { Toaster } from "../../components/ui/sonner"
import { RegisterPage } from "../../components/pages/register-page"

export default function Register() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4">
        <RegisterPage onNavigate={(page) => router.push(page === "prove" ? "/prove" : "/")} />
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
