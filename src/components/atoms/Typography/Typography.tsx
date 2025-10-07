import React from 'react'

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label'
  children: React.ReactNode
  className?: string
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  children,
  className = '',
}) => {
  const variants = {
    h1: 'text-3xl font-bold text-gray-900',
    h2: 'text-2xl font-semibold text-gray-900',
    h3: 'text-xl font-semibold text-gray-900',
    h4: 'text-lg font-medium text-gray-900',
    body: 'text-sm text-gray-700',
    caption: 'text-xs text-gray-500',
    label: 'text-sm font-medium text-gray-700',
  }

  const Component = variant.startsWith('h')
    ? (variant as 'h1' | 'h2' | 'h3' | 'h4')
    : 'p'

  return (
    <Component className={`${variants[variant]} ${className}`}>
      {children}
    </Component>
  )
}
