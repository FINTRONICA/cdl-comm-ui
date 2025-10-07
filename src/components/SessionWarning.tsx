'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { SessionController } from '../controllers/sessionController';
import { AuthController } from '../controllers/authController';

export function SessionWarning() {
  const [showWarning, setShowWarning] = useState(false);
  
  useEffect(() => {
    const checkWarning = () => {
      if (SessionController.shouldShowWarning()) {
        setShowWarning(true);
      }
    };
    
    const interval = setInterval(checkWarning, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);
  
  const handleExtendSession = () => {
    SessionController.extendSession();
    setShowWarning(false);
  };
  
  const handleLogout = () => {
    AuthController.logout();
    setShowWarning(false);
  };
  
  return (
    <Dialog open={showWarning} onClose={handleLogout}>
      <DialogTitle>Session Timeout Warning</DialogTitle>
      <DialogContent>
        <Typography>
          Your session will expire in 5 minutes due to inactivity.
          Would you like to extend your session?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLogout}>Logout</Button>
        <Button onClick={handleExtendSession} variant="contained">
          Extend Session
        </Button>
      </DialogActions>
    </Dialog>
  );
}
