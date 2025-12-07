import React from 'react'
import { useRouter } from 'next/navigation'
import { UserProfile } from '../../molecules/UserProfile'
import { ThemeSwitcher } from '../../molecules/ThemeSwitcher'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuthQuery'

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
  const { user } = useAuthStore()
  const logoutMutation = useLogout()

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      router.push('/login')
    } catch (error) {
      // Even if logout fails, redirect to login
      router.push('/login')
    }
  }

  // Fallback user data if user is not available
  const displayName = user?.name || 'User'
  const displayEmail = user?.email

  return (
    <header className={`dark:bg-gray-900 px-5 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col justify-center">
          <h1 className="text-[32px] font-sans text-gray-900 dark:text-gray-100 font-semibold leading-normal">
            {title}
          </h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-6">
          <ThemeSwitcher />
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
