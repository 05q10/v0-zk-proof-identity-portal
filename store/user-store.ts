"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type PersonalInfo = {
  name: string
  dob: string // yyyy-MM-dd
  age: number
  gender: string
  email: string
  mobile: string
  address1: string
  address2: string
  city: string
  state: string
  pin: string
  country: string
}

export type GovernmentIDs = {
  aadhaar: string
  pan: string
  passport?: string
  voterId?: string
  idFiles: string[] // data URLs
}

export type BiometricData = {
  fingerprintImage: string // data URL
  fingerprintHash: string
  passphrase?: string
}

export type User = {
  id: string
  personalInfo: PersonalInfo
  governmentIDs: GovernmentIDs
  biometric: BiometricData
  secretKey: string
  createdAt: string // ISO
}

export type Credential = {
  id: string
  userId: string
  type: string
  issueDate: string // ISO
  expiryDate: string // ISO
  status: "active" | "revoked"
}

export type Proof = {
  id: string
  credentialId: string
  proofHash: string
  predicate: string
  timestamp: string
  verified: boolean
  fingerprintHash: string
  secretKeyUsed: string
  userData?: Record<string, any>
}

type State = {
  // registration wizard
  registrationStep: number
  tempPersonalInfo: PersonalInfo | null
  tempGovernmentIDs: GovernmentIDs | null
  tempBiometricData: BiometricData | null

  // data
  users: User[]
  currentUser: User | null
  credentials: Credential[]
  proofs: Proof[]

  // actions
  setRegistrationStep: (n: number) => void
  setTempPersonalInfo: (p: PersonalInfo) => void
  setTempGovernmentIDs: (g: GovernmentIDs) => void
  setTempBiometricData: (b: BiometricData) => void
  completeRegistration: (secretKey: string) => void

  addCredential: (c: Credential) => void
  revokeCredential: (credentialId: string) => void
  addProof: (p: Proof) => void
  verifySecretKey: (userId: string, key: string) => boolean
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useUserStore = create<State>()(
  persist(
    (set, get) => ({
      registrationStep: 1,
      tempPersonalInfo: null,
      tempGovernmentIDs: null,
      tempBiometricData: null,

      users: [],
      currentUser: null,
      credentials: [],
      proofs: [],

      setRegistrationStep: (n) => set({ registrationStep: n }),
      setTempPersonalInfo: (p) => set({ tempPersonalInfo: p }),
      setTempGovernmentIDs: (g) => set({ tempGovernmentIDs: g }),
      setTempBiometricData: (b) => set({ tempBiometricData: b }),

      completeRegistration: (secretKey) => {
        const { tempPersonalInfo, tempGovernmentIDs, tempBiometricData } = get()
        if (!tempPersonalInfo || !tempGovernmentIDs || !tempBiometricData) return

        const user: User = {
          id: makeId("USR"),
          personalInfo: tempPersonalInfo,
          governmentIDs: tempGovernmentIDs,
          biometric: tempBiometricData,
          secretKey,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          users: [user, ...state.users],
          currentUser: user,
          registrationStep: 1,
          tempPersonalInfo: null,
          tempGovernmentIDs: null,
          tempBiometricData: null,
        }))
      },

      addCredential: (c) => set((s) => ({ credentials: [c, ...s.credentials] })),
      revokeCredential: (credentialId) =>
        set((s) => ({
          credentials: s.credentials.map((c) => (c.id === credentialId ? { ...c, status: "revoked" } : c)),
        })),
      addProof: (p) => set((s) => ({ proofs: [p, ...s.proofs] })),
      verifySecretKey: (userId, key) => {
        const user = get().users.find((u) => u.id === userId)
        return !!user && user.secretKey === key
      },
    }),
    {
      name: "zk-proofid-store",
      version: 1,
      partialize: (s) => ({
        // persist all for demo; in production avoid persisting secrets
        ...s,
      }),
    },
  ),
)

export type { Credential as CredentialType }
