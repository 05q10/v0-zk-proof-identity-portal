"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface Step {
  number: number
  title: string
  icon?: React.ReactNode
}
export function Stepper({ steps, currentStep }: { steps: Step[]; currentStep: number }) {
  return (
    <div className="w-full">
      <ol className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        {steps.map((s) => {
          const active = s.number <= currentStep
          return (
            <li key={s.number} className="flex items-center gap-3">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center border-2",
                  active ? "border-blue-500 text-blue-600" : "border-border text-muted-foreground",
                )}
                aria-current={active ? "step" : undefined}
              >
                {s.icon ?? s.number}
              </div>
              <span className={cn("text-sm", active ? "text-foreground" : "text-muted-foreground")}>{s.title}</span>
            </li>
          )
        })}
      </ol>
      <div className="mt-4 h-2 w-full rounded bg-muted overflow-hidden">
        <div
          className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
          style={{
            width: `${(currentStep / steps.length) * 100}%`,
          }}
          aria-hidden
        />
      </div>
    </div>
  )
}
