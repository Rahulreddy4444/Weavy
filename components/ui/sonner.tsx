"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:bg-green-950 group-[.toast]:text-green-50 group-[.toast]:border-green-800",
          error: "group-[.toast]:bg-red-950 group-[.toast]:text-red-50 group-[.toast]:border-red-800",
          warning: "group-[.toast]:bg-yellow-950 group-[.toast]:text-yellow-50 group-[.toast]:border-yellow-800",
          info: "group-[.toast]:bg-blue-950 group-[.toast]:text-blue-50 group-[.toast]:border-blue-800",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }