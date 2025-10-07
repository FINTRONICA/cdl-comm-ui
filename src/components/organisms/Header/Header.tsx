import React from 'react'
import { useRouter } from 'next/navigation'
import { UserProfile } from '../../molecules/UserProfile'
import { useAuthStore } from '@/store/authStore'

interface HeaderProps {
  title: string
  subtitle?: string
  showActions?: boolean
  showFilters?: boolean
  className?: string
  actions?: {
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }[]
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle = 'Description text',
  className = '',
}) => {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Fallback user data if user is not available
  const displayName = user?.name || 'User'
  const displayEmail = user?.email

  return (
    <header className={`bg-white/0 px-5 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left side - Title and description */}
        <div className="flex flex-col justify-center">
          <h1 className="text-[32px] font-sans text-[#1E2939] font-semibold leading-normal">
            {title}
          </h1>
          <p className="text-gray-600 text-base mt-1">{subtitle}</p>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-6">
          <UserProfile
            name={displayName}
            {...(displayEmail && { email: displayEmail })}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  )
}
