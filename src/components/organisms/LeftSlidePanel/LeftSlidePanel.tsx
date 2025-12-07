import React from 'react'

interface LeftSlidePanelProps {
  isOpen: boolean
  onClose: () => void
}

const LeftSlidePanel: React.FC<LeftSlidePanelProps> = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed top-0 right-0 h-[80%] w-115 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-all duration-500 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Slide Panel
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 transition-colors dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label="Close panel"
        >
          ×
        </button>
      </div>
      <div className="p-4">
        {/* Panel content goes here */}
        <p className="text-gray-700 dark:text-gray-300">
          This is a sliding panel from the right!
        </p>
      </div>
    </div>
  )
}

export default LeftSlidePanel