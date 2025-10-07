import { Circle } from "lucide-react"

interface InactiveButtonProps {
  label: number | string
}

export function InactiveButton({ label }: InactiveButtonProps) {
  return (
    <button
      className="
        flex items-center gap-1 
        px-2 py-0.5 h-6 w-[130px] 
        rounded-md text-sm font-medium 
       bg-[#F1F5F9] 
        border border-[#94A3B8]
      "
    >
      {/* Gray leading icon */}
      <Circle className="w-3.5 h-3.5 fill-[#6A7282] text-[#6A7282]" />

      {/* Label */}
      <span
        className="
          text-[#6A7282] font-medium text-[12px] leading-4 
          tracking-[0.01em] uppercase text-nowrap
        "
        style={{ fontFamily: "DM Sans, sans-serif" }}
      >
        {label}
      </span>
    </button>
  )
}
