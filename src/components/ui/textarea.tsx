import { TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-teal-300 placeholder:text-slate-400 focus:border-teal-400 focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}
