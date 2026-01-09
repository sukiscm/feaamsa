// src/app/(DashboardLayout)/components/QRScanner.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  TextField,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (qrCode: string) => void;
  title?: string;
}

export default function QRScanner({
  open,
  onClose,
  onScan,
  title = 'Escanear Código QR',
}: QRScannerProps) {
  const [tabValue, setTabValue] = useState(0); // 0: Cámara, 1: Manual
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerIdRef = useRef('qr-reader');

  useEffect(() => {
    if (open && tabValue === 0) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [open, tabValue]);

  const startScanner = async () => {
    setError(null);
    setScanning(true);

    try {
      // Verificar permisos de cámara
      const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(permissionStatus.state);

      if (permissionStatus.state === 'denied') {
        setError('Permiso de cámara denegado. Por favor, habilita el acceso a la cámara en la configuración del navegador.');
        setScanning(false);
        return;
      }

      // Inicializar scanner
      scannerRef.current = new Html5Qrcode(scannerIdRef.current);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      await scannerRef.current.start(
        { facingMode: 'environment' }, // Cámara trasera
        config,
        (decodedText) => {
          // QR detectado
          console.log('QR detectado:', decodedText);
          onScan(decodedText);
          stopScanner();
          onClose();
        },
        (errorMessage) => {
          // Error de decodificación (normal, significa que no detectó QR todavía)
          // No mostramos esto al usuario
        }
      );

      setScanning(false);
    } catch (err: any) {
      console.error('Error al iniciar scanner:', err);
      setError(err.message || 'Error al acceder a la cámara');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error al detener scanner:', err);
      }
    }
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      setError('Ingresa un código válido');
      return;
    }

    onScan(manualCode.trim());
    setManualCode('');
    onClose();
  };

  const handleClose = () => {
    stopScanner();
    setManualCode('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>

      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
      >
        <Tab label="📷 Escanear" />
        <Tab label="⌨️ Manual" />
      </Tabs>

      <DialogContent>
        {/* TAB: Cámara */}
        {tabValue === 0 && (
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {scanning && (
              <Box display="flex" justifyContent="center" alignItems="center" py={3}>
                <CircularProgress />
              </Box>
            )}

            {/* Área del scanner */}
            <Box
              id={scannerIdRef.current}
              sx={{
                width: '100%',
                minHeight: 300,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'grey.100',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            />

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Coloca el código QR frente a la cámara
            </Typography>
          </Box>
        )}

        {/* TAB: Manual */}
        {tabValue === 1 && (
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Código QR"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ej: ITEM-L23X-9K4A"
              helperText="Ingresa el código manualmente si no puedes escanearlo"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleManualSubmit();
                }
              }}
              sx={{ mt: 2 }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        {tabValue === 1 && (
          <Button onClick={handleManualSubmit} variant="contained" disabled={!manualCode.trim()}>
            Buscar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}