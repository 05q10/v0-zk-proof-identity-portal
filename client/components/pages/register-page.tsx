"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Stepper } from "../stepper"
import { FileUpload } from "../file-upload"
import { SecretKeyModal } from "../secret-key-modal"
import { User, CreditCard, Fingerprint, ArrowRight, ArrowLeft, Shield } from "lucide-react"
import { useUserStore } from "../../store/user-store"
import { generateSecretKey, generateHash, calculateAge, fakeApiCall } from "../../utils/helpers"
import { toast } from "sonner"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

interface RegisterPageProps {
  onNavigate: (page: string) => void
}

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const {
    registrationStep,
    setRegistrationStep,
    setTempPersonalInfo,
    setTempGovernmentIDs,
    setTempBiometricData,
    completeRegistration,
  } = useUserStore()

  // Step 1: Personal Info
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    dob: "",
    age: 0,
    gender: "",
    email: "",
    mobile: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pin: "",
    country: "India",
  })

  // Step 2: Government IDs
  const [govIDs, setGovIDs] = useState({
    aadhaar: "",
    pan: "",
    passport: "",
    voterId: "",
    idFiles: [] as string[],
  })

  // Step 3: Biometric
  const [biometric, setBiometric] = useState({
    fingerprintImage: "",
    fingerprintHash: "",
    passphrase: "",
  })

  const [loading, setLoading] = useState(false)
  const [showSecretKeyModal, setShowSecretKeyModal] = useState(false)
  const [generatedSecretKey, setGeneratedSecretKey] = useState("")
  const [date, setDate] = useState<Date>()

  const steps = [
    { number: 1, title: "Personal Info", icon: <User className="h-5 w-5" /> },
    { number: 2, title: "Government IDs", icon: <CreditCard className="h-5 w-5" /> },
    { number: 3, title: "Biometric", icon: <Fingerprint className="h-5 w-5" /> },
  ]

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      const dobString = format(selectedDate, "yyyy-MM-dd")
      const age = calculateAge(dobString)
      setPersonalInfo((prev) => ({ ...prev, dob: dobString, age }))
    }
  }

  const handleStep1Next = () => {
    if (
      !personalInfo.name ||
      !personalInfo.dob ||
      !personalInfo.gender ||
      !personalInfo.email ||
      !personalInfo.mobile
    ) {
      toast.error("Please fill all required fields")
      return
    }
    setTempPersonalInfo(personalInfo)
    setRegistrationStep(2)
    toast.success("Personal information saved")
  }

  const handleStep2Next = () => {
    if (!govIDs.aadhaar || !govIDs.pan) {
      toast.error("Please provide at least Aadhaar and PAN numbers")
      return
    }
    setTempGovernmentIDs(govIDs)
    setRegistrationStep(3)
    toast.success("Government IDs saved")
  }

  const handleStep3Complete = async () => {
    if (!biometric.fingerprintImage) {
      toast.error("Please upload fingerprint image")
      return
    }

    setLoading(true)
    toast.loading("Generating enrollment commitment...")

    await fakeApiCall(2000)

    const hash = generateHash(biometric.fingerprintImage)
    const secretKey = generateSecretKey()

    setBiometric((prev) => ({ ...prev, fingerprintHash: hash }))
    setTempBiometricData({ ...biometric, fingerprintHash: hash })

    completeRegistration(secretKey)

    setGeneratedSecretKey(secretKey)
    setLoading(false)
    toast.dismiss()
    toast.success("Enrollment completed successfully!")
    setShowSecretKeyModal(true)
  }

  const handleModalClose = () => {
    setShowSecretKeyModal(false)
    onNavigate("prove")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full mb-4">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-600 dark:text-blue-400">Secure Registration</span>
          </div>
          <h1>User Registration</h1>
          <p className="text-muted-foreground">Complete your registration to receive your unique secret key</p>
        </div>

        <Stepper steps={steps} currentStep={registrationStep} />

        <Card className="p-8">
          {/* Step 1: Personal Information */}
          {registrationStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <h2 className="mb-4">Personal Information</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter your personal details as they appear on government documents
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                {personalInfo.age > 0 && (
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input value={personalInfo.age} disabled />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={personalInfo.gender}
                    onValueChange={(value) => setPersonalInfo((prev) => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={personalInfo.mobile}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, mobile: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address1">Address Line 1</Label>
                  <Input
                    id="address1"
                    placeholder="Street address"
                    value={personalInfo.address1}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, address1: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address2">Address Line 2</Label>
                  <Input
                    id="address2"
                    placeholder="Apartment, suite, etc."
                    value={personalInfo.address2}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, address2: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Mumbai"
                    value={personalInfo.city}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, city: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="Maharashtra"
                    value={personalInfo.state}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, state: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pin">PIN Code</Label>
                  <Input
                    id="pin"
                    placeholder="400001"
                    value={personalInfo.pin}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, pin: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={personalInfo.country}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, country: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleStep1Next} className="bg-gradient-to-r from-blue-500 to-purple-600">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Government IDs */}
          {registrationStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <h2 className="mb-4">Government IDs</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Provide your government-issued identification numbers
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aadhaar">Aadhaar Number *</Label>
                  <Input
                    id="aadhaar"
                    placeholder="1234 5678 9012"
                    value={govIDs.aadhaar}
                    onChange={(e) => setGovIDs((prev) => ({ ...prev, aadhaar: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pan">PAN Number *</Label>
                  <Input
                    id="pan"
                    placeholder="ABCDE1234F"
                    value={govIDs.pan}
                    onChange={(e) => setGovIDs((prev) => ({ ...prev, pan: e.target.value.toUpperCase() }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passport">Passport Number (Optional)</Label>
                  <Input
                    id="passport"
                    placeholder="K1234567"
                    value={govIDs.passport}
                    onChange={(e) => setGovIDs((prev) => ({ ...prev, passport: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voterId">Voter ID (Optional)</Label>
                  <Input
                    id="voterId"
                    placeholder="ABC1234567"
                    value={govIDs.voterId}
                    onChange={(e) => setGovIDs((prev) => ({ ...prev, voterId: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload ID Documents</Label>
                <FileUpload
                  onFilesChange={(files) => setGovIDs((prev) => ({ ...prev, idFiles: files }))}
                  accept="image/*,.pdf"
                  maxFiles={5}
                  label="Upload scans of your government IDs"
                  multiple={true}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setRegistrationStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleStep2Next} className="bg-gradient-to-r from-blue-500 to-purple-600">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Biometric */}
          {registrationStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <h2 className="mb-4">Biometric Enrollment</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Upload your fingerprint and create your secret passphrase
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Fingerprint Image *</Label>
                  <FileUpload
                    onFilesChange={(files) => setBiometric((prev) => ({ ...prev, fingerprintImage: files[0] || "" }))}
                    accept="image/*"
                    maxFiles={1}
                    label="Upload your fingerprint scan"
                    multiple={false}
                  />
                  {biometric.fingerprintImage && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm">Preview:</p>
                      <img
                        src={biometric.fingerprintImage || "/placeholder.svg"}
                        alt="Fingerprint"
                        className="mt-2 max-h-40 rounded border"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passphrase">User Passphrase (Optional)</Label>
                  <Input
                    id="passphrase"
                    type="password"
                    placeholder="Enter an additional secret passphrase"
                    value={biometric.passphrase}
                    onChange={(e) => setBiometric((prev) => ({ ...prev, passphrase: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    This passphrase adds an extra layer of security to your enrollment
                  </p>
                </div>

                {biometric.fingerprintHash && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm">Simulated Fingerprint Hash:</p>
                    <code className="text-xs break-all">{biometric.fingerprintHash}</code>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setRegistrationStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleStep3Complete}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  {loading ? "Processing..." : "Generate Enrollment Commitment"}
                  <Shield className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </Card>
      </motion.div>

      <SecretKeyModal isOpen={showSecretKeyModal} secretKey={generatedSecretKey} onClose={handleModalClose} />
    </div>
  )
}
