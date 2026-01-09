// src/app/(DashboardLayout)/components/QuickActionsModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  IconPlus,
  IconMinus,
  IconEdit,
  IconArrowsExchange,
  IconPackage,
} from '@tabler/icons-react';

interface Item {
  id: string;
  descripcion: string;
  categoria: string;
  status: string;
  qrCode: string;
}

interface Location {
  id: string;
  nombre: string;
  codigo: string;
  tipo: string;
  status: string;
}

interface QuickActionsModalProps {
  open: boolean;
  onClose: () => void;
  qrCode: string;
  onSuccess: () => void;
}

type ActionType = 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER' | null;

export default function QuickActionsModal({
  open,
  onClose,
  qrCode,
  onSuccess,
}: QuickActionsModalProps) {
  const [item, setItem] = useState<Item | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado de la acción
  const [action, setAction] = useState<ActionType>(null);
  const [locationId, setLocationId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && qrCode) {
      loadItemData();
      loadLocations();
    } else {
      resetForm();
    }
  }, [open, qrCode]);

  const loadItemData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/items/by-qr/${qrCode}`);
      
      if (!res.ok) {
        throw new Error('Item no encontrado');
      }

      const data = await res.json();
      setItem(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar item');
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      if (res.ok) {
        const data = await res.json();
        setLocations(data.filter((loc: Location) => loc.status === 'ACTIVA'));
      }
    } catch (err) {
      console.error('Error loading locations:', err);
    }
  };

  const resetForm = () => {
    setItem(null);
    setAction(null);
    setLocationId('');
    setCantidad('');
    setComentario('');
    setError(null);
  };

  const handleSubmit = async () => {
    if (!action || !item) return;

    if (!locationId) {
      setError('Selecciona una ubicación');
      return;
    }

    const cantidadNum = parseFloat(cantidad);
    if (!cantidadNum || cantidadNum <= 0) {
      setError('Cantidad inválida');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let endpoint = '';
      let payload: any = {
        itemId: item.id,
        locationId,
        cantidad: cantidadNum,
        comentario: comentario || undefined,
      };

      switch (action) {
        case 'IN':
          endpoint = '/api/inventory/in';
          break;
        case 'OUT':
          endpoint = '/api/inventory/out';
          break;
        case 'ADJUST':
          endpoint = '/api/inventory/adjust';
          break;
        default:
          throw new Error('Acción no válida');
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al procesar operación');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al procesar operación');
    } finally {
      setSubmitting(false);
    }
  };

  const getActionInfo = (actionType: ActionType) => {
    switch (actionType) {
      case 'IN':
        return { label: 'Entrada', color: 'success', icon: <IconPlus size={20} /> };
      case 'OUT':
        return { label: 'Salida', color: 'error', icon: <IconMinus size={20} /> };
      case 'ADJUST':
        return { label: 'Ajuste', color: 'info', icon: <IconEdit size={20} /> };
      default:
        return { label: '', color: 'default', icon: null };
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error && !item) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Alert severity="error">{error}</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconPackage size={24} />
          <Typography variant="h6">Acción Rápida</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Info del Item */}
          {item && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {item.descripcion}
              </Typography>
              <Stack direction="row" spacing={1} mb={1}>
                <Chip label={item.categoria} size="small" variant="outlined" />
                <Chip
                  label={item.status}
                  size="small"
                  color={item.status === 'EN OPERACIÓN' ? 'success' : 'default'}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                QR: {item.qrCode}
              </Typography>
            </Box>
          )}

          <Divider />

          {/* Selección de Acción */}
          {!action ? (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Selecciona una acción:
              </Typography>
              <Stack spacing={1} mt={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="success"
                  startIcon={<IconPlus />}
                  onClick={() => setAction('IN')}
                >
                  Entrada de Stock
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<IconMinus />}
                  onClick={() => setAction('OUT')}
                >
                  Salida de Stock
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="info"
                  startIcon={<IconEdit />}
                  onClick={() => setAction('ADJUST')}
                >
                  Ajustar Stock
                </Button>
              </Stack>
            </Box>
          ) : (
            /* Formulario de Acción */
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Chip
                  label={getActionInfo(action).label}
                  color={getActionInfo(action).color as any}
                  icon={getActionInfo(action).icon as any}
                />
                <Button size="small" onClick={() => setAction(null)}>
                  Cambiar
                </Button>
              </Stack>

              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Ubicación</InputLabel>
                  <Select
                    value={locationId}
                    label="Ubicación"
                    onChange={(e) => setLocationId(e.target.value)}
                  >
                    {locations.map((loc) => (
                      <MenuItem key={loc.id} value={loc.id}>
                        {loc.nombre} ({loc.codigo})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label={action === 'ADJUST' ? 'Nueva Cantidad' : 'Cantidad'}
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  inputProps={{ min: 0, step: 0.01 }}
                />

                <TextField
                  fullWidth
                  label="Comentario (opcional)"
                  multiline
                  rows={2}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />

                {error && (
                  <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancelar
        </Button>
        {action && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !locationId || !cantidad}
          >
            {submitting ? 'Procesando...' : 'Confirmar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}