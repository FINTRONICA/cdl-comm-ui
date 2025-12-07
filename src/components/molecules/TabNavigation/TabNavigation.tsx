import React from 'react'

interface Tab {
  id: string
  label: string
}

interface TabNavigationProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div className={`${className}`}>
      <nav className="flex justify-between" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative w-[100%] font-sans text-sm leading-5 tracking-normal transition-colors duration-200 h-[48px] cursor-pointer ${
              activeTab === tab.id
                ? 'text-[#155DFC] dark:text-blue-400 border-b-2 border-[#2563EB] dark:border-blue-400 font-medium'
                : 'text-[#1F2937] dark:text-gray-300 hover:text-[#155DFC] dark:hover:text-blue-400 hover:font-medium border-b border-[#D1D5DB] dark:border-gray-700 font-normal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
