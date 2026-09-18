"use client";

import { cn } from "@/lib/utils";
import type { ElementType } from "react";
import { memo } from "react";

export interface TextShimmerProps {
  children: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  spread?: number;
}

const ShimmerComponent = ({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread: _spread = 2,
}: TextShimmerProps) => {
  return (
    <Component
      className={cn("relative inline-block animate-pulse text-muted-foreground", className)}
      data-duration={duration}
    >
      {children}
    </Component>
  );
};

export const Shimmer = memo(ShimmerComponent);
