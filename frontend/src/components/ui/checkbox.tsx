import { forwardRef, type InputHTMLAttributes } from "react";
export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { onCheckedChange?: (checked: boolean) => void }>(({ className, onCheckedChange, onChange, ...props }, ref) => <input ref={ref} type="checkbox" className={`h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 ${className ?? ""}`} onChange={(event) => { onChange?.(event); onCheckedChange?.(event.target.checked); }} {...props} />);
Checkbox.displayName = "Checkbox";
