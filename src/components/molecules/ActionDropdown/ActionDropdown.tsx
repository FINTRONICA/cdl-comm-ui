'use client'

import React from 'react'
import { Trash2, Eye, GalleryThumbnails, Pencil } from 'lucide-react'

export interface ActionDropdownProps {
  onDelete?: () => void
  onView?: () => void
  onEdit?: () => void
  onGallery?: () => void
  onTransaction?: () => void
  showDelete?: boolean
  showView?: boolean
  showEdit?: boolean
  showGallery?: boolean
  showTransaction?: boolean
  className?: string
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
  onDelete,
  onView,
  onEdit,
  onGallery,
  onTransaction,
  showDelete = true,
  showView = true,
  showEdit = true,
  showTransaction = true,
  showGallery = true,
  className = '',
}) => {
  const stop = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* View */}
      {showView && onView && (
        <button
          data-row-action="view"
          onClick={(e) => {
            stop(e)
            onView()
          }}
          className="p-1 transition-colors rounded cursor-pointer hover:bg-gray-100"
          aria-label="View"
          title="View"
        >
          <Eye className="w-4 h-4 text-gray-500 hover:text-gray-700" />
        </button>
      )}

      {/* Edit */}
      {showEdit && onEdit && (
        <button
          data-row-action="edit"
          onClick={(e) => {
            stop(e)
            onEdit()
          }}
          className="p-1 transition-colors rounded cursor-pointer hover:bg-blue-50"
          aria-label="Edit"
          title="Edit"
        >
          <Pencil className="w-4 h-4 text-blue-600 hover:text-blue-800" />
        </button>
      )}

      {/* Gallery Thumbnails */}
      {showGallery && onGallery && (
        <button
          data-row-action="gallery"
          onClick={(e) => {
            stop(e)
            onGallery()
          }}
          className="p-1 transition-colors rounded cursor-pointer hover:bg-gray-100"
          aria-label="Open gallery thumbnails"
          title="Gallery thumbnails"
        >
          <GalleryThumbnails className="w-4 h-4 text-gray-600 hover:text-gray-800" />
        </button>
      )}

      {/* Delete */}
      {/* {showDelete && onDelete && (
        <button
          onClick={onDelete}
          className="p-1 transition-colors rounded hover:bg-gray-100"
          aria-label="Delete"
          title="Delete"
        >
          <Trash2 className="w-4 h-4 text-gray-500 hover:text-gray-700" />
        </button>
      )} */}

        {showDelete && onDelete && (
          <button
            data-row-action="delete"
            onClick={(e) => {
              stop(e)
              onDelete()
            }}
            className="p-1 transition-colors rounded cursor-pointer hover:bg-red-50"
            aria-label="Delete"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-600 hover:text-red-800" />
          </button>
        )}
      

      {/* Transaction */}
      {showTransaction && onTransaction && (
        <button
          data-row-action="transaction"
          onClick={(e) => {
            stop(e)
            onTransaction()
          }}
          className="p-1 transition-colors rounded cursor-pointer hover:bg-gray-100"
          aria-label="View transaction"
          title="Transaction"
        >
          <GalleryThumbnails className="w-4 h-4 text-gray-600 hover:text-gray-800" />
        </button>
      )}
    </div>
  )
}
