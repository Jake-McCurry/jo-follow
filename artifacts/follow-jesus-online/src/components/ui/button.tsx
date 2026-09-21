import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "secondary" | "warm"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

export function buttonVariants({
  variant = "default",
  size = "default",
}: Pick<ButtonProps, "variant" | "size"> = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-md text-base font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-sans",
    {
      "bg-[#006BB3] text-white hover:bg-[#004E8A]": variant === "default",
      "border border-[#5B9BC4] bg-white text-[#003A66] hover:bg-warm-50 hover:text-[#003A66]": variant === "outline",
      "text-[#003A66] hover:bg-warm-50 hover:text-[#003A66]": variant === "ghost",
      "text-[#006BB3] underline-offset-4 hover:text-[#004E8A] hover:underline": variant === "link",
      "bg-warm-100 text-[#003A66] hover:bg-warm-200": variant === "secondary",
      "bg-warm text-white hover:bg-warm-800": variant === "warm",
      "h-11 px-5 py-2.5": size === "default",
      "h-10 rounded-md px-4 text-sm": size === "sm",
      "h-12 rounded-md px-8 text-lg": size === "lg",
      "h-11 w-11": size === "icon",
    },
  )
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }