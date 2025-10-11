"use client"

import { Navbar } from "../../components/navbar"
import { Footer } from "../../components/footer"
import { Toaster } from "../../components/ui/sonner"
import { AboutPage } from "../../components/pages/about-page"

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4">
        <AboutPage />
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
