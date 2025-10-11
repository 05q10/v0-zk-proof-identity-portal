"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFilesChange: (files: string[]) => void
  accept?: string
  maxFiles?: number
  multiple?: boolean
  label?: string
  className?: string
}

export function FileUpload({
  onFilesChange,
  accept,
  maxFiles = 5,
  multiple = true,
  label = "Upload files",
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handlePick = () => inputRef.current?.click()

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, maxFiles)
    const urls: string[] = []
    await Promise.all(
      files.map(
        (file) =>
          new Promise<void>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => {
              urls.push(String(reader.result || ""))
              resolve()
            }
            reader.readAsDataURL(file)
          }),
      ),
    )
    onFilesChange(urls)
  }

  return (
    <div className={cn("border rounded-md p-3 bg-background", className)}>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} hidden onChange={handleChange} />
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Button variant="outline" size="sm" onClick={handlePick}>
          Choose File{multiple ? "s" : ""}
        </Button>
      </div>
    </div>
  )
}
