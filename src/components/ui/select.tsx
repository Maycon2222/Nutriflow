import { SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-teal-300 focus:border-teal-400 focus:ring-2",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
