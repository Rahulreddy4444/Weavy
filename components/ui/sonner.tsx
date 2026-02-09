// "use client"

// import {
//   CircleCheckIcon,
//   InfoIcon,
//   Loader2Icon,
//   OctagonXIcon,
//   TriangleAlertIcon,
// } from "lucide-react"
// import { useTheme } from "next-themes"
// import { Toaster as Sonner, type ToasterProps } from "sonner"

// const Toaster = ({ ...props }: ToasterProps) => {
//   const { theme = "system" } = useTheme()

//   return (
//     <Sonner
//       theme={theme as ToasterProps["theme"]}
//       className="toaster group"
//       icons={{
//         success: <CircleCheckIcon className="size-4" />,
//         info: <InfoIcon className="size-4" />,
//         warning: <TriangleAlertIcon className="size-4" />,
//         error: <OctagonXIcon className="size-4" />,
//         loading: <Loader2Icon className="size-4 animate-spin" />,
//       }}
//       style={
//         {
//           "--normal-bg": "var(--popover)",
//           "--normal-text": "var(--popover-foreground)",
//           "--normal-border": "var(--border)",
//           "--border-radius": "var(--radius)",
//         } as React.CSSProperties
//       }
//       {...props}
//     />
//   )
// }

// export { Toaster }





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