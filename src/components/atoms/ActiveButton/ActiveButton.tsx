import { Circle } from "lucide-react"

interface ActiveButtonProps {
  label: number | string
}

export function ActiveButton({ label }: ActiveButtonProps) {
  return (
    <button
      className="
        flex items-center gap-1.5 
        px-2 py-0.5 h-6 w-[200px] 
        rounded-md text-sm font-medium 
        bg-white 
        border border-[rgba(0,193,106,0.25)]
        bg-gradient-to-t from-[rgba(0,193,106,0.1)] to-[rgba(0,193,106,0.1)]
      "
    >
      <Circle className="w-3.5 h-3.5 fill-[#00C16A] text-[#00C16A]" />
     <span
  className="text-[#00C16A] font-medium text-[12px] leading-4 tracking-[0.01em] uppercase text-nowrap"
  style={{ fontFamily: 'DM Sans, sans-serif' }}
>
  {label}
</span>

    </button>
  )
}
