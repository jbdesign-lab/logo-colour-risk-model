import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/cn"
import { ButtonProps, Button } from "@/components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-0.5 flex-wrap justify-center", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = React.ComponentProps<"a"> & {
  isActive?: boolean
}

const PaginationLink = ({
  className,
  isActive,
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      "inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded border border-gray-300 bg-white text-xs font-semibold ring-offset-white transition-colors hover:bg-gray-50 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005eff] focus-visible:ring-offset-2",
      isActive &&
        "border-[#005eff] bg-[#005eff] text-white hover:bg-[#0052d6] hover:text-white",
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof Button>) => (
  <Button
    aria-label="Go to previous page"
    size="sm"
    variant="outline"
    className={cn("gap-0.5 sm:gap-1 px-2 sm:px-3 h-7 sm:h-8 text-xs", className)}
    {...props}
  >
    <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
    <span className="hidden sm:inline text-xs">Prev</span>
  </Button>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof Button>) => (
  <Button
    aria-label="Go to next page"
    size="sm"
    variant="outline"
    className={cn("gap-0.5 sm:gap-1 px-2 sm:px-3 h-7 sm:h-8 text-xs", className)}
    {...props}
  >
    <span className="hidden sm:inline text-xs">Next</span>
    <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
  </Button>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
