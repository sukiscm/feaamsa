'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { type MaterialRequest } from '@/app/hooks/useMaterialRequests';

interface RejectModalProps {
  open: boolean;
  onClose: () => void;
  request: MaterialRequest;
  onSuccess: () => void;
}

export default function RejectModal({ open, onClose, request, onSuccess }: RejectModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setRejectionReason('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!rejectionReason.trim()) {
      setError('Debes especificar un motivo de rechazo');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/material-requests/${request.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al rechazar la solicitud');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al rechazar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box>
            <Typography variant="h5">✗ Rechazar Solicitud</Typography>
            <Typography variant="body2" color="text.secondary">
              Folio: {request.folio}
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Alert severity="warning" sx={{ mb: 3 }}>
            Estás por rechazar esta solicitud. El técnico será notificado del motivo.
          </Alert>

          <TextField
            label="Motivo del Rechazo *"
            multiline
            rows={4}
            fullWidth
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Ej: No hay suficiente stock disponible, Items descontinuados, etc."
            required
            disabled={loading}
            helperText="Este motivo será visible para el solicitante"
          />
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} variant="outlined">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Rechazando...' : 'Rechazar Solicitud'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}