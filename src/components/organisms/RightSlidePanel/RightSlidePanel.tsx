import React from 'react'
import { X, Calendar } from 'lucide-react'

interface RightSlidePanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  reportData?: {
    developerName?: string
    project?: string
    status?: string
    asOnDate?: string
  }
}

export const RightSlidePanel: React.FC<RightSlidePanelProps> = ({
  isOpen,
  onClose,
  title,
}) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Panel */}
      {isOpen && (
        <div
          className="fixed top-1/2 right-5 h-[96.5%] w-[460px] z-50 transform -translate-y-1/2 transition-all duration-300 ease-in-out rounded-2xl"
          style={{
            backdropFilter: 'blur(15px)',
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}
        >
      <div className="flex items-center justify-between p-6 border-b border-white/20">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <button 
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 space-y-4">
          {/* Developer Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4A5565]">
              Developer Name (English)*
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Real estate</option>
              <option>Other Developer</option>
            </select>
          </div>

          {/* Project */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4A5565]">
              Project*
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Real estate</option>
              <option>Other Project</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4A5565]">
              Status
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Active</option>
              <option>Inactive</option>
              <option>Pending</option>
            </select>
          </div>

          {/* As on Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#4A5565]">
              As on Date
            </label>
            <div className="relative">
              <input
                type="text"
                value="10-06-2025"
                onChange={() => {}}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 space-y-3">
          <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Generate Report
          </button>
          <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Download Template
          </button>
        </div>
              </div>
      </div>
      )}
    </>
  )
} 