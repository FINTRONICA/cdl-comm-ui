import React from 'react'

interface ReportCardProps {
  title: string
  icon: React.ReactNode
  onClick?: () => void
  isSelected?: boolean
}

export const ReportCard: React.FC<ReportCardProps> = ({
  title,
  icon,
  onClick,
  isSelected = false,
}) => {
  return (
    <div 
      className={`flex h-[124px] p-4 flex-col items-end gap-2 flex-1 min-w-0 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-[5px] hover:bg-[#DBEAFE] dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'bg-[#DBEAFE] dark:bg-blue-900/30 border-blue-300 dark:border-blue-500 shadow-md' 
          : 'bg-white/90 dark:bg-gray-800/90'
      }`}
      onClick={onClick}
    >
      <div className="flex gap-2 self-stretch items-center">
        <div className="flex w-14 h-14 justify-center items-center gap-2 aspect-square rounded-full bg-gradient-to-b from-[#F3F4F6] to-[#F3F4F6] dark:from-gray-700 dark:to-gray-700 backdrop-blur-[2px]">
          {icon}
        </div>
        <div className="flex w-[178px] h-12 flex-col justify-center text-[#4A5565] dark:text-gray-300 text-sm font-normal leading-normal uppercase font-sans">
          {title}
        </div>
      </div>
      <button
      >
       <img src="/ButtonNeutral.svg" alt="button icon" />
      </button>
    </div>
  )
}
