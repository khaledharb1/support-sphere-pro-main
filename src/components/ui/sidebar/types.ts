
import { type LucideIcon } from "lucide-react";
import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { sidebarMenuButtonVariants } from "./sidebar-menu-button";
import { type TooltipContent } from "../tooltip";

export type SidebarState = "expanded" | "collapsed";

export type SidebarContext = {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

export interface SidebarProviderProps extends React.ComponentProps<"div"> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface SidebarProps extends React.ComponentProps<"div"> {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}

export interface SidebarMenuButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
  variant?: VariantProps<typeof sidebarMenuButtonVariants>["variant"];
  size?: VariantProps<typeof sidebarMenuButtonVariants>["size"];
}

export interface SidebarMenuActionProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
  showOnHover?: boolean;
}

export interface SidebarMenuSkeletonProps extends React.ComponentProps<"div"> {
  showIcon?: boolean;
}

export interface SidebarMenuSubButtonProps extends React.ComponentProps<"a"> {
  asChild?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
}
