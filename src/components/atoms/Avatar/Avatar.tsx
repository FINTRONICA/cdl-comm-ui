import React from 'react'
import Image from 'next/image'

interface AvatarProps {
  src?: string
  alt?: string
  initials?: string
  size?: 'sm' | 'md' | 'lg'
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  initials,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const baseClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center`

  if (src) {
    return (
      <Image 
        src={src} 
        alt={alt} 
        width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
        height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
        className={`${baseClasses} object-cover`} 
      />
    )
  }

  return (
    <div className={`${baseClasses} bg-blue-500 text-white font-medium`}>
      {initials}
    </div>
  )
}
