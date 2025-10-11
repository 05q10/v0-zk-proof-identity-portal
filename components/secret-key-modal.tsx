"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { copyToClipboard, downloadText } from "@/utils/helpers"
import { Key, Copy, Download } from "lucide-react"
import { toast } from "sonner"

interface SecretKeyModalProps {
  isOpen: boolean
  secretKey: string
  onClose: () => void
}

export function SecretKeyModal({ isOpen, secretKey, onClose }: SecretKeyModalProps) {
  const handleCopy = async () => {
    const ok = await copyToClipboard(secretKey)
    ok ? toast.success("Secret key copied") : toast.error("Failed to copy")
  }
  const handleDownload = () => {
    downloadText("zk-secret-key.txt", secretKey)
    toast.success("Secret key downloaded")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-4 w-4 text-blue-600" />
            Your Secret Key
          </DialogTitle>
          <DialogDescription>
            Store this key safely. It will not be shown again and is required to generate proofs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input value={secretKey} readOnly className="font-mono text-xs" />
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopy} className="flex-1 bg-transparent">
              <Copy className="h-4 w-4 mr-2" />
              Copy Key
            </Button>
            <Button variant="outline" onClick={handleDownload} className="flex-1 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Download .txt
            </Button>
          </div>
          <p className="text-xs text-red-600 dark:text-red-400">Warning: This key will not be shown again.</p>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>I Stored It Safely</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
