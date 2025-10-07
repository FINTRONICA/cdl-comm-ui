import React from 'react'
import { Typography } from '../../atoms/Typography'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  bgColor?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  bgColor = 'bg-white',
}) => {
  return (
    <div className={`${bgColor} rounded-lg p-6 border border-gray-200`}>
      <Typography variant="caption" className="text-gray-500 uppercase">
        {title}
      </Typography>
      <Typography variant="h2" className="mt-2 mb-1">
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" className="text-gray-500">
          {subtitle}
        </Typography>
      )}
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          <span
            className={`text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '↗' : '↘'} {trend.value}
          </span>
        </div>
      )}
    </div>
  )
}
