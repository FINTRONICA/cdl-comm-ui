'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import copy from 'copy-to-clipboard'
import { Copy } from 'lucide-react'

interface CopyableValueProps {
  value: string | number
  displayValue?: string | number
  showIconOnHover?: boolean
  tooltipText?: string
  maxDisplayLength?: number
  className?: string
  valueClassName?: string
  iconClassName?: string
}

const CopyableValueComponent: React.FC<CopyableValueProps> = ({
  value,
  displayValue,
  showIconOnHover = true,
  tooltipText = 'Copy',
  maxDisplayLength = 16,
  className = '',
  valueClassName = '',
  iconClassName = '',
}) => {
  const stringValue = useMemo(() => String(value ?? ''), [value])
  const displayText = useMemo(() => {
    const raw = displayValue ?? stringValue
    const rawString = String(raw ?? '')
    if (maxDisplayLength <= 0) return rawString
    if (rawString.length <= maxDisplayLength) return rawString
    // Only truncate IDs like AGR-1768829631732
    if (!/^[A-Z]+-\d+$/.test(rawString)) return rawString
    const tailLength = 6
    const headLength = Math.max(0, maxDisplayLength - tailLength)
    const head = rawString.slice(0, headLength)
    const tail = rawString.slice(-tailLength)
    return `${head}...${tail}`
  }, [displayValue, stringValue, maxDisplayLength])
  const isCopyable = stringValue.length > 0
  const [showCopied, setShowCopied] = useState(false)

  useEffect(() => {
    if (!showCopied) return
    const timer = setTimeout(() => setShowCopied(false), 1200)
    return () => clearTimeout(timer)
  }, [showCopied])

  const handleCopy = useCallback((event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation()
    if (!isCopyable) return
    const copied = copy(stringValue)
    if (copied) {
      setShowCopied(true)
    }
  }, [isCopyable, stringValue])

  const iconVisibilityClass = showIconOnHover
    ? 'opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 group-hover:pointer-events-auto group-focus-within:pointer-events-auto'
    : 'opacity-100'

  return (
    <div
      className={`group relative inline-flex flex-col gap-1 min-w-0 ${className}`}
    >
      {showCopied && (
        <span className="absolute left-0 text-xs text-blue-600 -top-4 dark:text-blue-400">
          Copied
        </span>
      )}
      <div className="inline-flex items-center min-w-0 gap-2">
        <span
          className={`min-w-0 truncate ${valueClassName}`}
          title={stringValue}
        >
          {displayText}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          title={tooltipText}
          aria-label={tooltipText}
          disabled={!isCopyable}
          className={`rounded p-0.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity cursor-pointer ${iconVisibilityClass}`}
        >
          <Copy className={`h-3.5 w-3.5 ${iconClassName}`} />
        </button>
      </div>
    </div>
  )
}

export const CopyableValue = React.memo(CopyableValueComponent)
