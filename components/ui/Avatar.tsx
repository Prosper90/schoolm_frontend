"use client";

import { forwardRef, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: "sm" | "md" | "lg" | "xl";
  fallback?: string;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, size = "md", fallback, ...props }, ref) => {
    const sizes = {
      sm: "w-8 h-8 text-xs",
      md: "w-10 h-10 text-sm",
      lg: "w-12 h-12 text-base",
      xl: "w-16 h-16 text-lg",
    };

    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    if (src) {
      return (
        <div ref={ref} className={cn("relative rounded-full overflow-hidden", sizes[size], className)}>
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            {...props}
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium",
          sizes[size],
          className
        )}
      >
        {fallback ? getInitials(fallback) : alt ? getInitials(alt) : "?"}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
