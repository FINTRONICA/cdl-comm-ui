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
            className={`relative w-[100%] font-sans text-sm leading-5 tracking-normal transition-colors duration-200 h-[48px] ${
              activeTab === tab.id
                ? 'text-[#155DFC] border-b-2 border-[#2563EB] font-medium'
                : 'text-[#1F2937] hover:text-[#155DFC] hover:font-medium border-b border-[#D1D5DB] font-normal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
