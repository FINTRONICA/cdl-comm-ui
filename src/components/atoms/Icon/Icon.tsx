import React from 'react'
import * as Icons from 'lucide-react'

interface IconProps {
  name: keyof typeof Icons
  size?: number
  className?: string
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 16,
  className = '',
}) => {
  const IconComponent = Icons[name] as React.ComponentType<{ size?: number; className?: string }>

  if (!IconComponent) {
    return null
  }

  return <IconComponent size={size} className={className} />
}
