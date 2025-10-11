"use client"

import { motion } from "motion/react"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Shield, Lock, FileCheck, Eye, ArrowRight, Fingerprint, Key, CheckCircle } from "lucide-react"

interface HomePageProps {
  onNavigate: (page: string) => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Zero-Knowledge Proofs",
      description: "Prove your identity without revealing personal information",
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Secure Credentials",
      description: "Government-issued IDs stored with military-grade encryption",
    },
    {
      icon: <Fingerprint className="h-6 w-6" />,
      title: "Biometric Binding",
      description: "Link credentials to your unique fingerprint data",
    },
    {
      icon: <Key className="h-6 w-6" />,
      title: "Secret Key Generation",
      description: "Unique cryptographic keys for proof verification",
    },
  ]

  const steps = [
    {
      number: 1,
      icon: <FileCheck className="h-8 w-8" />,
      title: "Register",
      description: "Submit your identity documents and biometric data",
    },
    {
      number: 2,
      icon: <Lock className="h-8 w-8" />,
      title: "Generate Proof",
      description: "Create ZK-proofs for specific claims using your secret key",
    },
    {
      number: 3,
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Verify",
      description: "Verifiers confirm claims without seeing your data",
    },
  ]

  return (
    <div className="space-y-20 py-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-600 dark:text-blue-400">Privacy-First Identity Verification</span>
          </div>

          <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent text-5xl md:text-7xl">
            ZK-Proof Identity Portal
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure, privacy-preserving digital identity verification using zero-knowledge proofs and biometric
            authentication
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Button
            size="lg"
            onClick={() => onNavigate("register")}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Register Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => onNavigate("issuer")}>
            Issuer Portal
          </Button>
          <Button size="lg" variant="outline" onClick={() => onNavigate("verify")}>
            <Eye className="mr-2 h-4 w-4" />
            Verifier Portal
          </Button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow border-2 hover:border-blue-200 dark:hover:border-blue-800">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to secure, privacy-preserving identity verification
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="relative"
            >
              <Card className="p-8 text-center h-full border-2 hover:border-purple-200 dark:hover:border-purple-800 transition-all">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center">
                  {step.number}
                </div>
                <div className="text-blue-600 dark:text-blue-400 mb-4 flex justify-center">{step.icon}</div>
                <h3 className="mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </Card>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform translate-x-1/2 -translate-y-1/2">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}>
          <Card className="p-12 text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
            <h2 className="mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join the future of privacy-preserving identity verification. Register now and receive your unique secret
              key.
            </p>
            <Button
              size="lg"
              onClick={() => onNavigate("register")}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Start Registration
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </motion.div>
      </section>
    </div>
  )
}
