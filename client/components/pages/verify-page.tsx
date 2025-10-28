"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Card } from "../ui/card"
import { Shield, CheckCircle, XCircle } from "lucide-react"
import { fakeApiCall, formatDateTime } from "../../utils/localHelpers" // swap imports to local helpers filenames
import { toast } from "sonner"
import { Alert, AlertDescription } from "../ui/alert"

export function VerifyPage() {
  const [proofJSON, setProofJSON] = useState("")
  const [loading, setLoading] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)

  const handleVerify = async () => {
    if (!proofJSON.trim()) {
      toast.error("Please paste a proof JSON to verify")
      return
    }

    setLoading(true)
    toast.loading("Verifying proof...")

    await fakeApiCall(2000)

    try {
      const proof = JSON.parse(proofJSON)

      // Simulate verification logic
      const isValid = Math.random() > 0.2 // 80% success rate for demo
      const isRevoked = Math.random() > 0.9 // 10% revoked for demo

      const result = {
        valid: isValid && !isRevoked,
        proofId: proof.id || "N/A",
        predicate: proof.predicate || "N/A",
        timestamp: proof.timestamp || new Date().toISOString(),
        fingerprintMatch: isValid,
        secretKeyMatch: isValid,
        credentialStatus: isRevoked ? "revoked" : "active",
        blockchainRoot: `0x${Math.random().toString(16).substring(2, 15)}`,
        verifiedAt: new Date().toISOString(),
      }

      setVerificationResult(result)
      setLoading(false)
      toast.dismiss()

      if (result.valid) {
        toast.success("Proof verified successfully!")
      } else if (isRevoked) {
        toast.error("Credential has been revoked")
      } else {
        toast.error("Proof verification failed")
      }
    } catch (error) {
      setLoading(false)
      toast.dismiss()
      toast.error("Invalid proof JSON format")
      setVerificationResult({ error: "Invalid JSON format" })
    }
  }

  const handleReset = () => {
    setProofJSON("")
    setVerificationResult(null)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full mb-4">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-600 dark:text-blue-400">Verifier Portal</span>
          </div>
          <h1>Verify Identity Proof</h1>
          <p className="text-muted-foreground">Verify zero-knowledge proofs without accessing personal data</p>
        </div>

        <Card className="p-8">
          {!verificationResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <h2 className="mb-4">Submit Proof for Verification</h2>
                <p className="text-sm text-muted-foreground mb-6">Paste the proof JSON received from the user</p>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  This verification process checks the proof validity, credential status, and blockchain revocation root
                  without revealing any personal information.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="proofJSON">Proof JSON</Label>
                <Textarea
                  id="proofJSON"
                  placeholder='Paste the proof JSON here, e.g.:
{
  "id": "PRF-1234567890",
  "proofHash": "proof_abc123...",
  "predicate": "Age ≥ 18",
  ...
}'
                  value={proofJSON}
                  onChange={(e) => setProofJSON(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleVerify}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  {loading ? "Verifying..." : "Verify Proof"}
                  <Shield className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              {verificationResult.error ? (
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h2 className="mb-2 text-red-600">Verification Failed</h2>
                  <p className="text-muted-foreground">{verificationResult.error}</p>
                </div>
              ) : verificationResult.valid ? (
                <>
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="mb-2 text-green-600">Proof Verified Successfully</h2>
                    <p className="text-muted-foreground">Identity matched with Secret Key and Fingerprint</p>
                  </div>

                  <Card className="p-6 bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>Proof is valid and authentic</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>Fingerprint biometric matched</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>Secret key verification passed</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>Credential is active (not revoked)</span>
                      </div>
                    </div>
                  </Card>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="mb-2 text-red-600">Verification Failed</h2>
                    <p className="text-muted-foreground">
                      {verificationResult.credentialStatus === "revoked"
                        ? "The credential has been revoked"
                        : "Invalid proof or credential mismatch"}
                    </p>
                  </div>

                  <Card className="p-6 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-5 w-5" />
                        <span>
                          {verificationResult.credentialStatus === "revoked"
                            ? "Credential has been revoked"
                            : "Proof validation failed"}
                        </span>
                      </div>
                      {!verificationResult.fingerprintMatch && (
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="h-5 w-5" />
                          <span>Fingerprint mismatch</span>
                        </div>
                      )}
                      {!verificationResult.secretKeyMatch && (
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="h-5 w-5" />
                          <span>Secret key mismatch</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </>
              )}

              <div className="p-4 bg-muted rounded-lg space-y-3">
                <h3>Verification Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Proof ID:</span>
                    <span>{verificationResult.proofId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Predicate:</span>
                    <span>{verificationResult.predicate}</span>
                  </div>
                  {verificationResult.timestamp && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Proof Timestamp:</span>
                      <span>{formatDateTime(verificationResult.timestamp)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verified At:</span>
                    <span>{formatDateTime(verificationResult.verifiedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credential Status:</span>
                    <span
                      className={verificationResult.credentialStatus === "active" ? "text-green-600" : "text-red-600"}
                    >
                      {verificationResult.credentialStatus}
                    </span>
                  </div>
                </div>
              </div>

              {verificationResult.blockchainRoot && (
                <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm mb-1">Blockchain Revocation Root</h4>
                      <code className="text-xs break-all">{verificationResult.blockchainRoot}</code>
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex gap-3">
                <Button onClick={handleReset} variant="outline" className="flex-1 bg-transparent">
                  Verify Another Proof
                </Button>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
