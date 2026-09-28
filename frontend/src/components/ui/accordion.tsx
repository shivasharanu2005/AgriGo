import { useState, type ReactNode } from "react";
export function Accordion({ children }: { type?: "single"; collapsible?: boolean; children: ReactNode }) { return <div className="divide-y divide-stone-200">{children}</div>; }
export function AccordionItem({ value, children }: { value: string; children: ReactNode }) { const [open, setOpen] = useState(false); return <div><div onClick={() => setOpen(v => !v)}>{children}</div><div data-open={open} className={open ? "block" : "hidden"} /></div>; }
export function AccordionTrigger({ children, className = "" }: { children: ReactNode; className?: string }) { return <button type="button" className={`w-full py-3 text-sm font-medium ${className}`}>{children}</button>; }
export function AccordionContent({ children }: { children: ReactNode }) { return <div className="pb-4">{children}</div>; }
