import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import TasPaymentDetailView from '../TasPaymentDetailView/TasPaymentDetailView';

interface TasPaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  onEdit?: () => void;
}

const TasPaymentDetailModal: React.FC<TasPaymentDetailModalProps> = ({
  isOpen,
  onClose,
  paymentId,
  onEdit,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          maxHeight: '90vh',
          margin: '24px',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0px 0px',
         border: 'none',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          TAS Payment Details
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ padding: 0 }}>
        <Box sx={{ padding: '24px' }}>
          <TasPaymentDetailView
            paymentId={paymentId}
            onEdit={onEdit}
            onClose={onClose}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TasPaymentDetailModal;
