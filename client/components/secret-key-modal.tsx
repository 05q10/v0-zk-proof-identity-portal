"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { CheckCircle2 } from "lucide-react"

interface SecretKeyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SecretKeyModal({ isOpen, onClose }: SecretKeyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            Registration Successful
          </DialogTitle>
          <DialogDescription className="pt-2 text-gray-600 dark:text-gray-300">
            Your biometric data and details have been securely registered.
            <br />
            You can now proceed to the verification phase.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center pt-4">
          <Button onClick={onClose} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            Proceed
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
