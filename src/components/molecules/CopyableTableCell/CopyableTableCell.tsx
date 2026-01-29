'use client'

import React from 'react'
import { CopyableValue } from '@/components/atoms/CopyableValue'

interface CopyableTableCellProps {
  value: string | number
  displayValue?: string | number
  tooltipText?: string
  showIconOnHover?: boolean
  className?: string
}

export const CopyableTableCell: React.FC<CopyableTableCellProps> = ({
  value,
  displayValue,
  tooltipText = 'Copy',
  showIconOnHover = true,
  className = '',
}) => {
  return (
    <CopyableValue
      value={value}
      displayValue={displayValue === undefined ? value : displayValue}
      tooltipText={tooltipText}
      showIconOnHover={showIconOnHover}
      className={`min-w-0 ${className}`}
      valueClassName="min-w-0 truncate"
    />
  )
}
