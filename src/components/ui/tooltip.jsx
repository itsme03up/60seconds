import * as React from "react"
import { cn } from "@/lib/utils"

const TooltipProvider = ({ children, ...props }) => children

const Tooltip = ({ children, ...props }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="relative inline-block">
      {React.Children.map(children, (child) => {
        if (child.type === TooltipTrigger) {
          return React.cloneElement(child, { 
            onMouseEnter: () => setOpen(true),
            onMouseLeave: () => setOpen(false)
          })
        }
        if (child.type === TooltipContent) {
          return open ? child : null
        }
        return child
      })}
    </div>
  )
}

const TooltipTrigger = React.forwardRef(({ className, onMouseEnter, onMouseLeave, ...props }, ref) => (
  <div
    ref={ref}
    className={className}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    {...props}
  />
))

const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute z-50 overflow-hidden rounded-md border bg-white px-3 py-1.5 text-sm text-gray-900 shadow-md -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap",
      className
    )}
    {...props}
  />
))

TooltipTrigger.displayName = "TooltipTrigger"
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
