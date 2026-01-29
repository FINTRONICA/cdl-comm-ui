import React from 'react'
import { Badge } from '../../atoms/Badge'
import { Typography } from '../../atoms/Typography'
import { CopyableTableCell } from '../CopyableTableCell'
import { MoreHorizontal } from 'lucide-react'

interface TableRowProps {
  data: Record<string, string | React.ReactNode>
  columns: {
    key: string
    type?: 'text' | 'badge' | 'date' | 'amount' | 'actions'
    badgeVariant?: 'approved' | 'rejected' | 'incomplete' | 'inReview' | 'default'
    copyable?: boolean
  }[]
  onActionClick?: (action: string, data: Record<string, string | React.ReactNode>) => void
}

export const TableRow: React.FC<TableRowProps> = ({
  data,
  columns,
  onActionClick,
}) => {
  const renderCell = (
    column: {
      key: string
      type?: 'text' | 'badge' | 'date' | 'amount' | 'actions'
      badgeVariant?: 'approved' | 'rejected' | 'incomplete' | 'inReview' | 'default'
      copyable?: boolean
    },
    value: string | React.ReactNode
  ) => {
    const copyValue =
      typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : ''
    const isIdLikeValue = /^[A-Z]+-\d+$/.test(copyValue)
    const isColumnCopyable =
      typeof column.copyable === 'boolean' ? column.copyable : isIdLikeValue
    const isCopyable = isColumnCopyable && copyValue.length > 0

    switch (column.type) {
      case 'badge': {
        const rendered = (
          <Badge variant={column.badgeVariant || 'default'}>{value}</Badge>
        )
        return isCopyable ? (
          <CopyableTableCell value={copyValue} displayValue={copyValue} />
        ) : (
          rendered
        )
      }
      case 'date': {
        const formatted =
          typeof value === 'string'
            ? new Date(value).toLocaleDateString()
            : String(value ?? '')
        const rendered = <Typography variant="body">{formatted}</Typography>
        return isCopyable ? (
          <CopyableTableCell value={copyValue} displayValue={formatted} />
        ) : (
          rendered
        )
      }
      case 'amount': {
        const formatted =
          typeof value === 'number'
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(value)
            : String(value ?? '')
        const rendered = (
          <Typography variant="body" className="font-medium">
            {formatted}
          </Typography>
        )
        return isCopyable ? (
          <CopyableTableCell value={copyValue} displayValue={formatted} />
        ) : (
          rendered
        )
      }
      case 'actions':
        return (
          <button
            onClick={() => onActionClick?.('more', data)}
            className="p-1 rounded hover:bg-gray-100"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        )
      default: {
        const textValue = typeof value === 'string' ? value : String(value ?? '')
        const rendered = <Typography variant="body">{textValue}</Typography>
        return isCopyable ? (
          <CopyableTableCell value={copyValue} displayValue={textValue} />
        ) : (
          rendered
        )
      }
    }
  }

  return (
    <tr className="align-middle border-b border-gray-200 hover:bg-gray-50">
      {columns.map((column, colIndex) => (
        <td
          key={`${column.key}-${colIndex}`}
          className="px-6 py-4 text-base align-middle whitespace-nowrap"
        >
          {renderCell(column, data[column.key])}
        </td>
      ))}
    </tr>
  )
}
