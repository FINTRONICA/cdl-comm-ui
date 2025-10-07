import React from 'react'
import { cn } from '@/utils'
import { type BaseComponentProps } from '@/types'

interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  hover = false,
  ...props
}) => {
  const baseClasses =
    'bg-white rounded-lg border border-gray-200 transition-all duration-200'

  const variantClasses = {
    default: 'shadow-sm',
    elevated: 'shadow-md',
    outlined: 'shadow-none border-2',
  }

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const hoverClasses = hover ? 'hover:shadow-lg hover:border-gray-300' : ''

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    hoverClasses,
    className
  )

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

interface CardHeaderProps extends BaseComponentProps {
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('flex items-center justify-between mb-4', className)}
      {...props}
    >
      <div className="flex-1">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        )}
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  )
}

export const CardContent: React.FC<BaseComponentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

export const CardFooter: React.FC<BaseComponentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between pt-4 mt-4 border-t border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
