import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
export const Table = (p: HTMLAttributes<HTMLTableElement>) => <table {...p} className={`w-full text-left text-sm ${p.className ?? ""}`} />;
export const TableHeader = (p: HTMLAttributes<HTMLTableSectionElement>) => <thead {...p} className={`border-b border-stone-200 ${p.className ?? ""}`} />;
export const TableBody = (p: HTMLAttributes<HTMLTableSectionElement>) => <tbody {...p} className={p.className} />;
export const TableRow = (p: HTMLAttributes<HTMLTableRowElement>) => <tr {...p} className={`border-b border-stone-100 ${p.className ?? ""}`} />;
export const TableHead = (p: ThHTMLAttributes<HTMLTableCellElement>) => <th {...p} className={`px-3 py-2 text-xs font-semibold text-stone-500 ${p.className ?? ""}`} />;
export const TableCell = (p: TdHTMLAttributes<HTMLTableCellElement>) => <td {...p} className={`px-3 py-3 text-stone-700 ${p.className ?? ""}`} />;
