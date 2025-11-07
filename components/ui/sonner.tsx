"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      position="top-center"
      icons={{
        success: <CircleCheckIcon className="size-4 text-green-600 dark:text-green-400" />,
        info: <InfoIcon className="size-4 text-blue-600 dark:text-blue-400" />,
        warning: <TriangleAlertIcon className="size-4 text-yellow-600 dark:text-yellow-400" />,
        error: <OctagonXIcon className="size-4 text-red-600 dark:text-red-400" />,
        loading: <Loader2Icon className="size-4 animate-spin text-muted-foreground" />,
        close: <XIcon className="size-4" />,
      }}
      toastOptions={{
        classNames: {
          toast: 'group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:backdrop-blur-md group-[.toaster]:py-3 group-[.toaster]:pl-4 group-[.toaster]:pr-12 group-[.toaster]:min-h-[3.5rem] group-[.toaster]:relative group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-3',
          closeButton: 'group-[.toaster]:!absolute group-[.toaster]:!right-3 group-[.toaster]:!top-1/2 group-[.toaster]:!-translate-y-1/2 group-[.toaster]:!left-[unset] group-[.toaster]:!bg-transparent hover:group-[.toaster]:!bg-muted/50 group-[.toaster]:!border-0 group-[.toaster]:!text-muted-foreground/60 hover:group-[.toaster]:!text-foreground group-[.toaster]:!rounded-md group-[.toaster]:!h-6 group-[.toaster]:!w-6 group-[.toaster]:!p-0 group-[.toaster]:!flex group-[.toaster]:!items-center group-[.toaster]:!justify-center group-[.toaster]:!transition-all group-[.toaster]:!duration-200 group-[.toaster]:!m-0 group-[.toaster]:!transform group-[.toaster]:!translate-x-0',
          title: 'group-[.toaster]:text-sm group-[.toaster]:font-semibold',
          description: 'group-[.toaster]:text-sm group-[.toaster]:text-muted-foreground',
          success: 'group-[.toaster]:border-green-200 dark:group-[.toaster]:border-green-800 group-[.toaster]:bg-green-50/80 dark:group-[.toaster]:bg-green-950/30',
          error: 'group-[.toaster]:border-red-200 dark:group-[.toaster]:border-red-800 group-[.toaster]:bg-red-50/80 dark:group-[.toaster]:bg-red-950/30',
          warning: 'group-[.toaster]:border-yellow-200 dark:group-[.toaster]:border-yellow-800 group-[.toaster]:bg-yellow-50/80 dark:group-[.toaster]:bg-yellow-950/30',
          info: 'group-[.toaster]:border-blue-200 dark:group-[.toaster]:border-blue-800 group-[.toaster]:bg-blue-50/80 dark:group-[.toaster]:bg-blue-950/30',
        },
      }}
      style={
        {
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }