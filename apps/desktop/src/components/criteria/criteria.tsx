import type * as React from "react"
import { MoreHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { cn } from "@/lib/utils"

interface CriteriaProps extends React.ComponentProps<typeof Item> {
  label: string
  value: number
  suffix?: string
}

function Criteria({
  label,
  value,
  suffix,
  className,
  children,
  ...props
}: CriteriaProps) {
  return (
    <Item
      data-slot="criteria"
      size="xs"
      variant="muted"
      className={cn(className)}
      {...props}
    >
      <ItemContent>
        <ItemTitle>{label}</ItemTitle>
        <ItemDescription>
          {value}
          {suffix}
        </ItemDescription>
      </ItemContent>
      {children ? <ItemActions>{children}</ItemActions> : null}
    </Item>
  )
}

function CriteriaMenu({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            data-slot="criteria-menu-trigger"
            className="text-muted-foreground hover:text-foreground"
          />
        }
      >
        <MoreHorizontalIcon />
        <span className="sr-only">Abrir menú</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn("w-auto min-w-fit", className)}
        {...props}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CriteriaMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuItem
      data-slot="criteria-menu-item"
      className={cn("cursor-pointer", className)}
      {...props}
    />
  )
}

export { Criteria, CriteriaMenu, CriteriaMenuItem }
