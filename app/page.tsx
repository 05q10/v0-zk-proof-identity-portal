"use client"

import { useRouter } from "next/navigation"
import { Navbar } from "../components/navbar"
import { Footer } from "../components/footer"
import { Toaster } from "../components/ui/sonner"
import { HomePage } from "../components/pages/home-page"

export default function Page() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4">
        <HomePage
          onNavigate={(page) => {
            const path =
              page === "home"
                ? "/"
                : page === "register"
                  ? "/register"
                  : page === "prove"
                    ? "/prove"
                    : page === "verify"
                      ? "/verify"
                      : page === "issuer"
                        ? "/issuer"
                        : page === "about"
                          ? "/about"
                          : "/"
            router.push(path)
          }}
        />
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
