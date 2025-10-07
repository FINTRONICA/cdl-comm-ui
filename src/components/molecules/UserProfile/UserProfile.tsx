import React, { useState, useRef, useEffect } from 'react'
import { Avatar } from '../../atoms/Avatar'
import { ChevronDown, LogOut, User, Settings } from 'lucide-react'

interface UserProfileProps {
  name: string
  email?: string
  avatar?: string
  onLogout: () => void
}

export const UserProfile: React.FC<UserProfileProps> = ({
  name,
  email,
  avatar,
  onLogout,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleLogout = () => {
    setIsDropdownOpen(false)
    onLogout()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Profile Display - Always visible */}
      <div
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
        onClick={handleDropdownToggle}
      >
        <span className="text-sm text-gray-900 leading-3 font-medium">
          {name}
        </span>
        <div className="flex items-center gap-0">
          <Avatar
            {...(avatar && { src: avatar })}
            initials={initials}
            size="md"
          />
          <ChevronDown
            className={`w-4 h-4 ml-[5px] text-gray-600 -ml-1 transition-transform ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Section - Shows name prominently */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar
                {...(avatar && { src: avatar })}
                initials={initials}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {name}
                </p>
                {email && (
                  <p className="text-xs text-gray-500 truncate">{email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Logout Section */}
          <div className="border-t border-gray-100 py-1">
            <button
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
