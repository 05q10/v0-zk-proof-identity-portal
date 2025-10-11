"use client"

import { Navbar } from "../../components/navbar"
import { Footer } from "../../components/footer"
import { Toaster } from "../../components/ui/sonner"
import { IssuerPage } from "../../components/pages/issuer-page"

export default function Issuer() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4">
        <IssuerPage />
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
