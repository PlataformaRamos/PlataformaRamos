import { cn } from "@/lib/utils"

export default function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-slate-200/60 dark:bg-slate-800/40 border border-slate-200/5",
        className
      )}
      {...props}
    />
  )
}
