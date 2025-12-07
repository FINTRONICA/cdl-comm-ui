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
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Panel */}
      {isOpen && (
        <div
          className="fixed top-1/2 right-5 h-[96.5%] w-[460px] z-50 transform -translate-y-1/2 transition-all duration-300 ease-in-out rounded-2xl backdrop-blur-2xl border border-white/20 dark:border-white/20 border-gray-200 shadow-2xl bg-white dark:bg-[rgba(30,30,30,0.92)]"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/20">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-white" />
            </button>
          </div>

          <div className="p-6 space-y-6 text-gray-900 dark:text-white">
            <div className="grid grid-cols-2 gap-4 space-y-4">
              {/* Developer Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                  Developer Name (English)*
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 dark:border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-[#1E293B]/50">
                  <option className="bg-white dark:bg-[rgba(30,30,30,0.92)] text-gray-900 dark:text-white">Real estate</option>
                  <option className="bg-white dark:bg-[rgba(30,30,30,0.92)] text-gray-900 dark:text-white">Other Developer</option>
                </select>
              </div>

              {/* Project */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                  Project*
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 dark:border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-[#1E293B]/50">
                  <option className="bg-white dark:bg-[rgba(30,30,30,0.92)] text-gray-900 dark:text-white">Real estate</option>
                  <option className="bg-white dark:bg-[rgba(30,30,30,0.92)] text-gray-900 dark:text-white">Other Project</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                  Status
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 dark:border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-[#1E293B]/50">
                  <option className="bg-white dark:bg-[rgba(30,30,30,0.92)] text-gray-900 dark:text-white">Active</option>
                  <option className="bg-white dark:bg-[rgba(30,30,30,0.92)] text-gray-900 dark:text-white">Inactive</option>
                  <option className="bg-white dark:bg-[rgba(30,30,30,0.92)] text-gray-900 dark:text-white">Pending</option>
                </select>
              </div>

              {/* As on Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-white">
                  As on Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value="10-06-2025"
                    onChange={() => {}}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/30 rounded-lg bg-white dark:bg-[#1E293B]/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 placeholder-gray-500 dark:placeholder-white/50"
                    placeholder="10-06-2025"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/70" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 space-y-3">
              <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Generate Report
              </button>
              <button className="w-full px-4 py-3 border border-gray-300 dark:border-white/30 text-gray-700 dark:text-white rounded-lg font-medium bg-white dark:bg-[#1E293B]/50 hover:bg-gray-50 dark:hover:bg-[#1E293B]/70 transition-colors">
                Download Template
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 