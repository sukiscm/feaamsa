// src/app/(DashboardLayout)/components/FloatingQRButton.tsx
'use client';

import React, { useState } from 'react';
import { Fab, Tooltip } from '@mui/material';
import { IconQrcode } from '@tabler/icons-react';
import QRScanner from './QRScanner';
import QuickActionsModal from './QuickActionsModal';

interface FloatingQRButtonProps {
  onSuccess?: () => void;
}

export default function FloatingQRButton({ onSuccess }: FloatingQRButtonProps) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [scannedQR, setScannedQR] = useState('');

  const handleScan = (qrCode: string) => {
    console.log('QR escaneado:', qrCode);
    setScannedQR(qrCode);
    setActionsOpen(true);
  };

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <>
      {/* Botón Flotante */}
      <Tooltip title="Escanear QR" placement="left">
        <Fab
          color="primary"
          aria-label="scan-qr"
          onClick={() => setScannerOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <IconQrcode size={28} />
        </Fab>
      </Tooltip>

      {/* Scanner Modal */}
      <QRScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />

      {/* Quick Actions Modal */}
      <QuickActionsModal
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        qrCode={scannedQR}
        onSuccess={handleSuccess}
      />
    </>
  );
}