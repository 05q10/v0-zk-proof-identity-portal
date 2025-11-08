"use client"

import { useState } from "react"
import { motion } from "motion/react"
import axios from "axios"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { toast } from "sonner"
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react"

export function VerifyPage() {
  const [fingerprint, setFingerprint] = useState<File | null>(null)
  const [passcode, setPasscode] = useState("")
  const [conditions, setConditions] = useState<any[]>([])
  const [selectedField, setSelectedField] = useState("")
  const [loading, setLoading] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [resultData, setResultData] = useState<any>(null)
  const [fieldResults, setFieldResults] = useState<any[]>([])

  const fieldOptions = [
    { label: "Full Name", value: "full_name", type: "string" },
    { label: "Age", value: "date_of_birth", type: "number" },
    { label: "Email ID", value: "email_id", type: "string" },
    { label: "Mobile Number", value: "mobile_number", type: "string" },
    { label: "City Name", value: "address", type: "string" },
    { label: "Gender", value: "gender", type: "string" },
  ]

  const addCondition = () => {
    if (!selectedField) return toast.error("Select a field first")
    const exists = conditions.some((c) => c.field === selectedField)
    if (exists) return toast.error("Field already added")
    setConditions([...conditions, { field: selectedField, condition: "equals", value: "" }])
    setSelectedField("")
  }

  const updateCondition = (index: number, key: string, value: string) => {
    const newConditions = [...conditions]
    newConditions[index][key] = value
    setConditions(newConditions)
  }

  const getFieldLabel = (value: string) => {
    return fieldOptions.find((f) => f.value === value)?.label || value
  }

  const calculateAge = (dob: string) => {
    const birthYear = new Date(dob).getFullYear()
    return new Date().getFullYear() - birthYear
  }

  const handleVerify = async () => {
    if (!fingerprint || !passcode) {
      toast.error("Please upload fingerprint and enter passcode")
      return
    }

    setLoading(true)
    toast.loading("Verifying details...")

    const formData = new FormData()
    formData.append("image", fingerprint)
    formData.append("passcode", passcode)

    try {
      const res = await axios.post("http://127.0.0.1:8000/verify", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      toast.dismiss()
      toast.success("Verification successful!")

      const data = res.data.data
      const results = conditions.map((c) => {
        const apiValue = data[c.field]
        let check = false

        if (c.field === "date_of_birth") {
          const userAge = calculateAge(apiValue)
          const inputAge = parseInt(c.value)
          if (c.condition === "equals") check = userAge === inputAge
          else if (c.condition === "greater") check = userAge > inputAge
          else if (c.condition === "less") check = userAge < inputAge
        } else if (c.field === "address") {
          check = apiValue.toLowerCase().includes(c.value.toLowerCase())
        } else {
          check = String(apiValue).toLowerCase() === c.value.toLowerCase()
        }

        return { ...c, apiValue, check }
      })

      setResultData(data)
      setFieldResults(results)
      setShowResultModal(true)
    } catch (err: any) {
      toast.dismiss()
      if (err.response?.status === 401) toast.error(err.response.data?.message || "Verification failed")
      else toast.error("Error verifying user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full mb-4">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-600">Verifier Portal</span>
          </div>
          <h1 className="text-2xl font-semibold">Verify User Details</h1>
          <p className="text-muted-foreground text-sm">
            Upload fingerprint and passcode to verify selected attributes securely
          </p>
        </div>

        <Card className="p-8 space-y-6">
          <div>
            <Label>Fingerprint Image</Label>
            <Input type="file" accept="image/*" onChange={(e) => setFingerprint(e.target.files?.[0] || null)} />
          </div>

          <div>
            <Label>Passcode</Label>
            <Input placeholder="Enter your passcode" value={passcode} onChange={(e) => setPasscode(e.target.value)} />
          </div>

          <div>
            <Label>Select Field to Verify</Label>
            <div className="flex gap-2 mt-2">
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose field" />
                </SelectTrigger>
                <SelectContent>
                  {fieldOptions.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addCondition} variant="outline">
                Add
              </Button>
            </div>
          </div>

          {conditions.length > 0 && (
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-medium mb-2">Conditions</h3>
              {conditions.map((c, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                  <span className="text-sm font-medium">{getFieldLabel(c.field)}</span>

                  {c.field === "date_of_birth" ? (
                    <Select value={c.condition} onValueChange={(val) => updateCondition(i, "condition", val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">equals</SelectItem>
                        <SelectItem value="greater">greater</SelectItem>
                        <SelectItem value="less">less</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm text-muted-foreground">equals</span>
                  )}

                  <Input
                    placeholder="Enter value"
                    value={c.value}
                    onChange={(e) => updateCondition(i, "value", e.target.value)}
                  />

                  {/* ❌ Remove button */}
                  <button
                    type="button"
                    onClick={() => setConditions((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-red-500 hover:text-red-700 text-sm px-2 transition-colors"
                    title="Remove condition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}


          <Button
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Verifying...
              </>
            ) : (
              "Verify Details"
            )}
          </Button>
        </Card>
      </motion.div>

      {/* ✅ Result Modal */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Verification Summary
            </DialogTitle>
          </DialogHeader>

          {fieldResults.length > 0 ? (
            <div className="space-y-4">
              {fieldResults.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    r.check ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"
                  }`}
                >
                  <div>
                    <p className="font-medium">{getFieldLabel(r.field)}</p>
                    <p className="text-xs text-muted-foreground">
                      Expected: {r.condition} {r.value}
                    </p>
                  </div>
                  {r.check ? (
                    <CheckCircle className="text-green-600 h-5 w-5" />
                  ) : (
                    <XCircle className="text-red-600 h-5 w-5" />
                  )}
                </div>
              ))}
              <div className="flex justify-end">
                <Button onClick={() => setShowResultModal(false)}>Close</Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No verification data found.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
