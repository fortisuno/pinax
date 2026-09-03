import type * as React from "react"

import { Button } from "@/components/ui/button"
import { ItemGroup } from "@/components/ui/item"
import { SidebarGroupLabel } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

function CriteriaGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="criteria-group"
      className={cn("flex w-full min-w-0 flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function CriteriaGroupHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="criteria-group-header"
      className={cn("flex items-center justify-between gap-2", className)}
      {...props}
    />
  )
}

function CriteriaGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof SidebarGroupLabel>) {
  return (
    <SidebarGroupLabel
      data-slot="criteria-group-label"
      className={cn("h-7 px-2", className)}
      {...props}
    />
  )
}

function CriteriaGroupAction({
  variant = "ghost",
  size = "icon-xs",
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="criteria-group-action"
      variant={variant}
      size={size}
      className={cn(
        "text-sidebar-foreground/70 hover:text-sidebar-foreground",
        className
      )}
      {...props}
    />
  )
}

function CriteriaGroupContent({
  className,
  ...props
}: React.ComponentProps<typeof ItemGroup>) {
  return (
    <ItemGroup
      data-slot="criteria-group-content"
      className={cn("gap-2", className)}
      {...props}
    />
  )
}

export {
  CriteriaGroup,
  CriteriaGroupHeader,
  CriteriaGroupLabel,
  CriteriaGroupAction,
  CriteriaGroupContent,
}
