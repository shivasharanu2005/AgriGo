import { createContext, useContext, type ReactNode } from "react";
const TabsContext = createContext<{ value?: string; onValueChange?: (value: string) => void }>({});
export function Tabs({ value, onValueChange, children }: { value?: string; onValueChange?: (value: string) => void; children: ReactNode }) { return <TabsContext.Provider value={{ value, onValueChange }}>{children}</TabsContext.Provider>; }
export function TabsList({ children }: { children: ReactNode }) { return <div className="inline-flex gap-1 rounded-lg bg-stone-100 p-1">{children}</div>; }
export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) { const ctx = useContext(TabsContext); return <button type="button" onClick={() => ctx.onValueChange?.(value)} className={`rounded-md px-3 py-1.5 text-xs font-medium ${ctx.value === value ? "bg-white text-emerald-700 shadow-sm" : "text-stone-500"}`}>{children}</button>; }
