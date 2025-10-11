import { motion } from "motion/react"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Shield, Lock, Eye, Key, Fingerprint, Database, CheckCircle, ImageIcon } from "lucide-react"

export function AboutPage() {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Zero-Knowledge Proofs",
      description:
        "Prove statements about your identity without revealing the underlying data. For example, prove you are over 18 without sharing your exact date of birth.",
    },
    {
      icon: <Fingerprint className="h-8 w-8" />,
      title: "Biometric Binding",
      description:
        "Your credentials are cryptographically bound to your unique biometric fingerprint data, ensuring only you can generate proofs.",
    },
    {
      icon: <Key className="h-8 w-8" />,
      title: "Secret Key Authentication",
      description:
        "A unique secret key is generated during registration. You must provide both your fingerprint and secret key to create valid proofs.",
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: "Privacy-Preserving",
      description:
        "Verifiers can confirm claims about your identity without accessing or storing your personal information, ensuring maximum privacy.",
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "Blockchain Integration",
      description:
        "Revocation roots are stored on-chain, providing transparent and tamper-proof credential status verification.",
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: "Selective Disclosure",
      description:
        "Choose exactly what information to prove. Verify eligibility for age-restricted services without revealing other identity details.",
    },
  ]

  const howItWorks = [
    {
      step: 1,
      title: "Registration",
      description:
        "Submit your government IDs, personal information, and biometric fingerprint data. The system generates a unique secret key for you.",
    },
    {
      step: 2,
      title: "Credential Issuance",
      description:
        "Issuing authorities verify your documents and issue verifiable credentials bound to your biometric data and secret key.",
    },
    {
      step: 3,
      title: "Proof Generation",
      description:
        'When needed, use your fingerprint and secret key to generate zero-knowledge proofs for specific claims (e.g., "I am over 18").',
    },
    {
      step: 4,
      title: "Verification",
      description:
        "Verifiers check the cryptographic proof without accessing your personal data. They only see if the claim is true or false.",
    },
  ]

  const useCases = [
    "Age verification for online services",
    "Address proof for KYC compliance",
    "Educational credential verification",
    "Professional license validation",
    "Healthcare record authentication",
    "Digital signature and document signing",
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full mb-4">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-600 dark:text-blue-400">About ZK-ProofID</span>
          </div>
          <h1>Privacy-First Digital Identity</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            ZK-ProofID combines zero-knowledge cryptography, biometric authentication, and secret key security to create
            a privacy-preserving identity verification system inspired by DigiLocker.
          </p>
        </div>

        {/* What are Zero-Knowledge Proofs? */}
        <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
          <h2 className="mb-4">What are Zero-Knowledge Proofs?</h2>
          <p className="text-muted-foreground mb-4">
            Zero-knowledge proofs (ZK-proofs) are cryptographic protocols that allow one party (the prover) to prove to
            another party (the verifier) that a statement is true, without revealing any information beyond the validity
            of the statement itself.
          </p>
          <p className="text-muted-foreground">
            For example, you can prove you are over 18 years old without revealing your exact date of birth, address, or
            any other personal information. The verifier only learns that your age meets the requirement—nothing more.
          </p>
        </Card>

        {/* Features Grid */}
        <div>
          <h2 className="mb-8 text-center">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-2 hover:border-purple-200 dark:hover:border-purple-800">
                  <div className="text-blue-600 dark:text-blue-400 mb-3">{feature.icon}</div>
                  <h3 className="mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div>
          <h2 className="mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {howItWorks.map((item) => (
              <Card
                key={item.step}
                className="p-6 border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
              >
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <Card className="p-8">
          <h2 className="mb-6 text-center">Use Cases</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-muted-foreground">{useCase}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Architecture */}
        <Card className="p-8 text-center">
          <h2 className="mb-4">System Architecture</h2>
          <p className="text-muted-foreground mb-6">
            ZK-ProofID integrates multiple technologies for secure, privacy-preserving identity verification
          </p>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="group bg-transparent">
                <ImageIcon className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                View Architecture Diagram
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>ZK-ProofID Architecture</DialogTitle>
                <DialogDescription>High-level overview of the system components and data flow</DialogDescription>
              </DialogHeader>
              <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border-2 border-dashed border-border">
                <div className="space-y-4 text-left">
                  <div className="p-4 bg-background rounded border">
                    <h4 className="mb-2">Frontend Layer</h4>
                    <p className="text-sm text-muted-foreground">Next.js 14 + TypeScript + Tailwind CSS</p>
                  </div>
                  <div className="p-4 bg-background rounded border">
                    <h4 className="mb-2">Cryptography Layer</h4>
                    <p className="text-sm text-muted-foreground">Circom circuits + snarkjs for ZK-proof generation</p>
                  </div>
                  <div className="p-4 bg-background rounded border">
                    <h4 className="mb-2">Smart Contract Layer</h4>
                    <p className="text-sm text-muted-foreground">
                      Solidity contracts for credential registry and revocation
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded border">
                    <h4 className="mb-2">Storage Layer</h4>
                    <p className="text-sm text-muted-foreground">
                      Local storage (demo) → IPFS + Blockchain (production)
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </Card>

        {/* Security Notice */}
        <Card className="p-8 bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-200 dark:border-yellow-800">
          <div className="flex gap-4">
            <Shield className="h-8 w-8 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="mb-2">Security & Privacy Notice</h3>
              <p className="text-sm text-muted-foreground mb-3">
                This is a demonstration platform showcasing the concept of zero-knowledge identity proofs. In a
                production environment:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• All cryptographic operations would use battle-tested libraries (Circom, snarkjs)</li>
                <li>• Biometric data would be processed locally and never stored in plaintext</li>
                <li>• Secret keys would be encrypted and stored in hardware security modules</li>
                <li>• Credential revocation would be managed via blockchain smart contracts</li>
                <li>• All data transmission would use end-to-end encryption</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Technology Stack */}
        <Card className="p-8">
          <h2 className="mb-6 text-center">Technology Stack</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="h-16 w-16 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="mb-1">Frontend</h4>
              <p className="text-sm text-muted-foreground">Next.js 14, TypeScript, Tailwind</p>
            </div>
            <div>
              <div className="h-16 w-16 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
                <Lock className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="mb-1">Cryptography</h4>
              <p className="text-sm text-muted-foreground">Circom, snarkjs, ZK-SNARKs</p>
            </div>
            <div>
              <div className="h-16 w-16 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                <Database className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="mb-1">Blockchain</h4>
              <p className="text-sm text-muted-foreground">Solidity, Ethereum, IPFS</p>
            </div>
            <div>
              <div className="h-16 w-16 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-3">
                <Fingerprint className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="mb-1">Biometrics</h4>
              <p className="text-sm text-muted-foreground">Fingerprint hashing, local processing</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
