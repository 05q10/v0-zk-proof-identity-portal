export async function fakeApiCall(ms: number) {
  await new Promise((res) => setTimeout(res, ms))
}

export function calculateAge(dobYYYYMMDD: string): number {
  if (!dobYYYYMMDD) return 0
  const [y, m, d] = dobYYYYMMDD.split("-").map((n) => Number.parseInt(n, 10))
  const dob = new Date(y, (m ?? 1) - 1, d ?? 1)
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const mDiff = now.getMonth() - dob.getMonth()
  if (mDiff < 0 || (mDiff === 0 && now.getDate() < dob.getDate())) {
    age--
  }
  return age
}

// simple non-crypto hash for demo only
export function generateHash(input: string): string {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  // convert to hex
  const hex = (h >>> 0).toString(16).padStart(8, "0")
  return `0x${hex}${Math.random().toString(16).slice(2, 10)}`
}

export function generateProofHash(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return (
    "0x" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  )
}

export function generateSecretKey(length = 32): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return iso
  }
}

export function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}
