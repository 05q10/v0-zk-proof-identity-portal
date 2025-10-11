"use client"

import { Navbar } from "../../components/navbar"
import { Footer } from "../../components/footer"
import { Toaster } from "../../components/ui/sonner"
import { VerifyPage } from "../../components/pages/verify-page"

export default function Verify() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4">
        <VerifyPage />
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
