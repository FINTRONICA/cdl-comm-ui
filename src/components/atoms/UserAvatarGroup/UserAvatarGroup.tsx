import React from 'react'
import { Avatar } from '../Avatar'

interface User {
  id: string
  name: string
  avatar?: string
  initials?: string
}

interface UserAvatarGroupProps {
  users: User[]
  maxVisible?: number
  size?: 'sm' | 'md' | 'lg'
}

export const UserAvatarGroup: React.FC<UserAvatarGroupProps> = ({
  users,
  maxVisible = 3,
  size = 'sm',
}) => {
  const visibleUsers = users.slice(0, maxVisible)
  const remainingCount = users.length - maxVisible

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visibleUsers.map((user, index) => (
          <div
            key={user.id}
            className="relative"
            style={{ zIndex: visibleUsers.length - index }}
          >
            <Avatar
              {...(user.avatar && { src: user.avatar })}
              initials={user.initials || user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              size={size}
              alt={user.name}
            />
          </div>
        ))}
      </div>
      {remainingCount > 0 && (
        <div className="ml-2">
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  )
} 