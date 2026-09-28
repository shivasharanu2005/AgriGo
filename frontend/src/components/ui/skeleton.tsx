import type { CSSProperties } from "react";
export function Skeleton({ className = "", style }: { className?: string; style?: CSSProperties }) { return <div style={style} className={`animate-pulse rounded-md bg-stone-200 ${className}`} />; }
