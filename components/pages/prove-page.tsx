"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Stepper } from "../stepper"
import { FileUpload } from "../file-upload"
import { Shield, FileCheck, Fingerprint, Key, Copy, CheckCircle, AlertCircle } from "lucide-react"
import { useUserStore } from "../../store/user-store"
import { generateProofHash, generateHash, fakeApiCall, copyToClipboard, formatDateTime } from "../../utils/helpers"
import { toast } from "sonner@2.0.3"
import { Alert, AlertDescription } from "../ui/alert"

interface ProvePageProps {
  onNavigate: (page: string) => void
}

export function ProvePage({ onNavigate }: ProvePageProps) {
  const { currentUser, credentials, addProof, verifySecretKey } = useUserStore()
  const [step, setStep] = useState(1)
  const [selectedCredential, setSelectedCredential] = useState("")
  const [fingerprintImage, setFingerprintImage] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [generatedProof, setGeneratedProof] = useState<any>(null)

  const steps = [
    { number: 1, title: "Select Credential", icon: <FileCheck className="h-5 w-5" /> },
    { number: 2, title: "Upload Fingerprint", icon: <Fingerprint className="h-5 w-5" /> },
    { number: 3, title: "Enter Secret Key", icon: <Key className="h-5 w-5" /> },
    { number: 4, title: "Generate Proof", icon: <Shield className="h-5 w-5" /> },
  ]

  const activeCredentials = credentials.filter((c) => c.status === "active")

  const handleStep1Next = () => {
    if (!selectedCredential) {
      toast.error("Please select a credential")
      return
    }
    setStep(2)
    toast.success("Credential selected")
  }

  const handleStep2Next = () => {
    if (!fingerprintImage) {
      toast.error("Please upload your fingerprint")
      return
    }
    setStep(3)
    toast.success("Fingerprint uploaded")
  }

  const handleStep3Next = () => {
    if (!secretKey) {
      toast.error("Please enter your secret key")
      return
    }

    if (!currentUser || !verifySecretKey(currentUser.id, secretKey)) {
      toast.error("Invalid secret key. Please check and try again.")
      return
    }

    setStep(4)
    toast.success("Secret key verified")
  }

  const handleGenerateProof = async () => {
    setLoading(true)
    toast.loading("Generating zero-knowledge proof...")

    await fakeApiCall(2500)

    const fingerprintHash = generateHash(fingerprintImage)
    const proofHash = generateProofHash()
    const predicate = currentUser && currentUser.personalInfo.age >= 18 ? "Age ≥ 18" : "Age < 18"

    const proof = {
      id: `PRF-${Date.now()}`,
      credentialId: selectedCredential,
      proofHash,
      predicate,
      timestamp: new Date().toISOString(),
      verified: false,
      fingerprintHash,
      secretKeyUsed: secretKey.substring(0, 8) + "...",
      userData: {
        credentialType: credentials.find((c) => c.id === selectedCredential)?.type,
        userName: currentUser?.personalInfo.name,
      },
    }

    addProof(proof)
    setGeneratedProof(proof)
    setLoading(false)
    toast.dismiss()
    toast.success("Proof generated successfully!")
  }

  const handleCopyProof = async () => {
    const proofJSON = JSON.stringify(generatedProof, null, 2)
    const success = await copyToClipboard(proofJSON)
    if (success) {
      toast.success("Proof JSON copied to clipboard!")
    } else {
      toast.error("Failed to copy proof")
    }
  }

  const handleReset = () => {
    setStep(1)
    setSelectedCredential("")
    setFingerprintImage("")
    setSecretKey("")
    setGeneratedProof(null)
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="p-12 text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="mb-4">No User Registered</h2>
          <p className="text-muted-foreground mb-6">You need to complete registration before generating proofs.</p>
          <Button onClick={() => onNavigate("register")} className="bg-gradient-to-r from-blue-500 to-purple-600">
            Go to Registration
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full mb-4">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-600 dark:text-blue-400">Zero-Knowledge Proof Generation</span>
          </div>
          <h1>Generate Identity Proof</h1>
          <p className="text-muted-foreground">Create a privacy-preserving proof of your identity or eligibility</p>
        </div>

        {!generatedProof && <Stepper steps={steps} currentStep={step} />}

        <Card className="p-8">
          {!generatedProof ? (
            <>
              {/* Step 1: Select Credential */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div>
                    <h2 className="mb-4">Select Credential</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Choose which credential to use for proof generation
                    </p>
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      You have {activeCredentials.length} active credential(s) available
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label>Credential</Label>
                    <Select value={selectedCredential} onValueChange={setSelectedCredential}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a credential" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeCredentials.map((cred) => (
                          <SelectItem key={cred.id} value={cred.id}>
                            {cred.type} - {cred.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleStep1Next} className="bg-gradient-to-r from-blue-500 to-purple-600">
                      Next
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Upload Fingerprint */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div>
                    <h2 className="mb-4">Biometric Verification</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Upload your fingerprint for identity verification
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Fingerprint Image</Label>
                    <FileUpload
                      onFilesChange={(files) => setFingerprintImage(files[0] || "")}
                      accept="image/*"
                      maxFiles={1}
                      label="Upload your fingerprint scan"
                      multiple={false}
                    />
                  </div>

                  {fingerprintImage && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm mb-2">Fingerprint Preview:</p>
                      <img
                        src={fingerprintImage || "/placeholder.svg"}
                        alt="Fingerprint"
                        className="max-h-40 rounded border"
                      />
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button onClick={handleStep2Next} className="bg-gradient-to-r from-blue-500 to-purple-600">
                      Next
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Enter Secret Key */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div>
                    <h2 className="mb-4">Enter Secret Key</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Provide the secret key you received during registration
                    </p>
                  </div>

                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertDescription>
                      Your secret key was provided to you when you completed registration. It is required to generate
                      proofs.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="secretKey">Secret Key</Label>
                    <Input
                      id="secretKey"
                      type="password"
                      placeholder="Enter your secret key"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button onClick={handleStep3Next} className="bg-gradient-to-r from-blue-500 to-purple-600">
                      Verify & Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Generate Proof */}
              {step === 4 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div>
                    <h2 className="mb-4">Generate Proof</h2>
                    <p className="text-sm text-muted-foreground mb-6">Review and generate your zero-knowledge proof</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">User:</span>
                        <span>{currentUser.personalInfo.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Credential ID:</span>
                        <span className="truncate ml-2">{selectedCredential}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Age:</span>
                        <span>{currentUser.personalInfo.age} years</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Predicate:</span>
                        <span className="text-green-600 dark:text-green-400">
                          {currentUser.personalInfo.age >= 18 ? "Age ≥ 18 ✓" : "Age < 18"}
                        </span>
                      </div>
                    </div>

                    <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription>All verification steps completed. Ready to generate proof.</AlertDescription>
                    </Alert>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(3)}>
                      Back
                    </Button>
                    <Button
                      onClick={handleGenerateProof}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-500 to-purple-600"
                    >
                      {loading ? "Generating..." : "Generate Proof"}
                      <Shield className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            /* Proof Generated */
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="mb-2">Proof Generated Successfully!</h2>
                <p className="text-muted-foreground">Your zero-knowledge proof has been created</p>
              </div>

              <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Proof ID:</span>
                    <span>{generatedProof.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Proof Hash:</span>
                    <code className="text-xs">{generatedProof.proofHash}</code>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Predicate:</span>
                    <span className="text-green-600 dark:text-green-400">{generatedProof.predicate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span>{formatDateTime(generatedProof.timestamp)}</span>
                  </div>
                </div>
              </Card>

              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-sm mb-2 block">Proof JSON:</Label>
                <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-40">
                  {JSON.stringify(generatedProof, null, 2)}
                </pre>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleCopyProof} variant="outline" className="flex-1 bg-transparent">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Proof JSON
                </Button>
                <Button onClick={handleReset} variant="outline" className="flex-1 bg-transparent">
                  Generate New Proof
                </Button>
                <Button
                  onClick={() => onNavigate("verify")}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  Verify This Proof
                </Button>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
