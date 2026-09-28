import { cloneElement, forwardRef, isValidElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "link" | "secondary" | "ghost"; size?: "sm" | "default" | "icon"; asChild?: boolean; children?: ReactNode };
export const Button = forwardRef<HTMLButtonElement, Props>(({ className, variant = "default", size = "default", asChild, children, ...props }, ref) => {
  const styles = { default: "bg-emerald-700 text-white hover:bg-emerald-800", outline: "border border-stone-300 bg-white text-stone-700 hover:border-emerald-400", link: "text-emerald-700 underline-offset-4 hover:underline", secondary: "bg-stone-100 text-stone-700 hover:bg-stone-200", ghost: "text-stone-600 hover:bg-stone-100" }[variant];
  const sizeStyle = size === "sm" ? "px-3 py-1.5 text-xs" : size === "icon" ? "p-2" : "px-4 py-2 text-sm";
  if (asChild && isValidElement(children)) return cloneElement(children as ReactElement<{ className?: string }>, { className: cn("inline-flex items-center justify-center rounded-lg font-medium", styles, sizeStyle, className) });
  return <button ref={ref} className={cn("inline-flex items-center justify-center rounded-lg font-medium transition-colors", styles, sizeStyle, className)} {...props}>{children}</button>;
});
Button.displayName = "Button";
