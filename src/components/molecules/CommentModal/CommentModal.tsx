// 'use client'

// import React from 'react'
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   Typography,
//   Box,
//   IconButton,
// } from '@mui/material'
// import { Close as CloseIcon } from '@mui/icons-material'

// interface CommentModalProps {
//   open: boolean
//   onClose: () => void
//   comment: string
//   developer: string
//   activityId?: string | undefined
// }

// export const CommentModal: React.FC<CommentModalProps> = ({
//   open,
//   onClose,
//   comment,
//   developer,
//   activityId,
// }) => {
//   // Dummy comment text - you can replace this with actual comment data
//   const dummyCommentText = `This is a detailed comment for ${developer} regarding their project registration.

// The comment provides additional context about the current status and any specific requirements or issues that need to be addressed.

// Key points:
// • Project documentation review status
// • Compliance requirements
// • Next steps for approval process
// • Any outstanding items that need attention

// This comment helps track the progress and provides clear guidance for the next actions required.`

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="sm"
//       fullWidth
//       PaperProps={{
//         style: {
//           borderRadius: '12px',
//           boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
//         },
//       }}
//     >
//       <DialogTitle
//         sx={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           borderBottom: '1px solid #e5e7eb',
//           pb: 2,
//         }}
//       >
//         <Box>
//           <Typography
//             variant="h6"
//             component="div"
//             sx={{
//               fontFamily: 'Outfit',
//               fontWeight: 400,
//               fontStyle: 'normal',
//               fontSize: '20px',
//               lineHeight: '100%',
//               letterSpacing: '-0.02em',
//               verticalAlign: 'middle',
//               color: '#1E2939'
//             }}
//           >
//             Comment Details
//           </Typography>
//           <Typography
//             variant="body2"
//             sx={{
//               mt: 0.5,
//               fontFamily: 'Outfit',
//               fontWeight: 500,
//               color: '#1E2939'
//             }}
//           >
//             {developer} {activityId && `• ${activityId}`}
//           </Typography>
//         </Box>
//         <IconButton
//           onClick={onClose}
//           size="small"
//           sx={{
//             color: 'text.secondary',
//             '&:hover': {
//               backgroundColor: 'action.hover',
//             },
//           }}
//         >
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>

//       <DialogContent sx={{ pt: 3, pb: 2 }}>
//         <Box sx={{ mb: 3 }}>
//           <Typography
//             variant="subtitle2"
//             sx={{
//               mb: 1,
//               fontFamily: 'Outfit',
//               fontWeight: 500,
//               color: '#1E2939'
//             }}
//           >
//             Comment ID: {comment}
//           </Typography>
//           <Typography
//             variant="body1"
//             sx={{
//               lineHeight: 1.6,
//               fontFamily: 'Outfit',
//               fontWeight: 400,
//               color: '#1E2939',
//               fontSize: '14px',

//             }}
//           >
//             {dummyCommentText}
//           </Typography>
//         </Box>

//       </DialogContent>

//     </Dialog>
//   )
// }

'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Button,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'

interface DialogAction {
  label: string
  color?: 'primary' | 'error' | 'secondary' | 'success'
  onClick: () => void
  disabled?: boolean
}

interface CommentModalProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  message?: string
  children?: ReactNode
  actions?: DialogAction[]
  resetOnOpen?: boolean
}

export const CommentModal: React.FC<CommentModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  message,
  children,
  actions,
  resetOnOpen = true,
}) => {
  const [internalState, setInternalState] = useState('')
  console.log('internalState', internalState)
  useEffect(() => {
    if (open && resetOnOpen) {
      setInternalState('')
    }
  }, [open, resetOnOpen])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e5e7eb',
          pb: 2,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'Outfit',
              fontWeight: 400,
              fontSize: '24px',
              color: '#1E2939',
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{ mt: 0.2, fontFamily: 'Outfit', fontWeight: 500 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Body */}
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {message && (
          <Typography
            sx={{
              mb: 2,
              fontFamily: 'Outfit',
              fontSize: '20px',
              color: '#374151',
            }}
          >
            {message}
          </Typography>
        )}

        {children && <Box sx={{ mb: 2 }}>{children}</Box>}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          {actions && actions.length > 0 ? (
            actions.map((action, i) => (
              <Button
                key={i}
                variant="contained"
                color={action.color || 'primary'}
                onClick={action.onClick}
                disabled={action.disabled || false}
                sx={{ textTransform: 'none', borderRadius: '8px' }}
              >
                {action.label}
              </Button>
            ))
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={onClose}
              sx={{ textTransform: 'none', borderRadius: '8px' }}
            >
              Close
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}
