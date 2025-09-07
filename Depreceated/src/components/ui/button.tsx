import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";

import { cn } from "@/utils";
import { useFocusable } from "@/context/RemoteNavigationContext";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // TV-optimized variants
        tvPrimary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700",
        tvSecondary: "bg-slate-800 text-white border border-slate-600 hover:bg-slate-700",
        tvDanger: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800",
        tvSuccess: "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800",
      },
      size: {
        default: "h-12 px-6 py-3 text-base", // Larger for TV
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-16 px-8 py-4 text-lg", // Extra large for TV
        xl: "h-20 px-12 py-6 text-xl", // Hero buttons for TV
        icon: "h-12 w-12", // Larger icons for TV
        iconSm: "h-10 w-10",
        iconLg: "h-16 w-16",
      },
      tvFocus: {
        true: "ring-4 ring-blue-400 ring-opacity-75 scale-105 shadow-2xl",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      tvFocus: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  focusId?: string;
  enableTVFocus?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    focusId,
    enableTVFocus = true,
    children,
    onClick,
    ...props 
  }, ref) => {
    const buttonId = focusId || `button-${Math.random().toString(36).substr(2, 9)}`;
    const { elementRef, isFocused } = useFocusable(buttonId, enableTVFocus);
    
    const Comp = asChild ? Slot : "button";
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Add haptic feedback for TV if available
      if (window.navigator && 'vibrate' in window.navigator) {
        window.navigator.vibrate(50);
      }
      onClick?.(e);
    };

    const buttonElement = (
      <Comp
        className={cn(buttonVariants({ 
          variant, 
          size, 
          tvFocus: enableTVFocus && isFocused,
          className 
        }))}
        ref={(node) => {
          if (elementRef) {
            (elementRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          }
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          }
        }}
        onClick={handleClick}
        data-focusable={enableTVFocus ? "true" : "false"}
        data-focus-id={buttonId}
        {...props}
      >
        {children}
      </Comp>
    );

    // Wrap with motion for TV animations
    if (enableTVFocus) {
      return (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          animate={isFocused ? { 
            scale: 1.05,
            transition: { duration: 0.2 }
          } : { 
            scale: 1,
            transition: { duration: 0.2 }
          }}
        >
          {buttonElement}
        </motion.div>
      );
    }

    return buttonElement;
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
