// src/app/(DashboardLayout)/inventario/stock-location/components/TransferModal.tsx
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { IconArrowRight } from '@tabler/icons-react';

interface Location {
  id: string;
  nombre: string;
  codigo: string;
  tipo: string;
  status: string;
}

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
  locations: Array<{
    location: Location;
    stock: number;
  }>;
  allLocations: Location[];
  onSuccess: () => void;
}

export default function TransferModal({
  open,
  onClose,
  itemId,
  itemName,
  locations,
  allLocations,
  onSuccess,
}: TransferModalProps) {
  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ubicaciones con stock (para origen)
  const locationsWithStock = locations.filter((loc) => loc.stock > 0);

  // Stock disponible en ubicación seleccionada
  const selectedFromLocation = locations.find((loc) => loc.location.id === fromLocationId);
  const availableStock = selectedFromLocation?.stock || 0;

  // Ubicaciones disponibles para destino (todas menos la de origen)
  const availableToLocations = allLocations.filter(
    (loc) => loc.id !== fromLocationId && loc.status === 'ACTIVA'
  );

  const handleSubmit = async () => {
    setError(null);

    // Validaciones
    if (!fromLocationId || !toLocationId) {
      setError('Selecciona ubicación de origen y destino');
      return;
    }

    const cantidadNum = parseFloat(cantidad);
    if (!cantidadNum || cantidadNum <= 0) {
      setError('Cantidad inválida');
      return;
    }

    if (cantidadNum > availableStock) {
      setError(`Stock insuficiente. Disponible: ${availableStock.toFixed(2)}`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/inventory/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          fromLocationId,
          toLocationId,
          cantidad: cantidadNum,
          comentario: comentario || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al realizar transferencia');
      }

      // Resetear form y cerrar
      handleReset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al realizar transferencia');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromLocationId('');
    setToLocationId('');
    setCantidad('');
    setComentario('');
    setError(null);
  };

  const handleClose = () => {
    if (!loading) {
      handleReset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>🔄 Transferir Stock</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 2 }}>
          {/* Info del Item */}
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Item:</strong> {itemName}
            </Typography>
          </Alert>

          {/* Ubicación Origen */}
          <FormControl fullWidth>
            <InputLabel>Ubicación Origen</InputLabel>
            <Select
              value={fromLocationId}
              label="Ubicación Origen"
              onChange={(e) => {
                setFromLocationId(e.target.value);
                setToLocationId(''); // Reset destino cuando cambia origen
                setCantidad(''); // Reset cantidad
              }}
              disabled={loading}
            >
              {locationsWithStock.length === 0 ? (
                <MenuItem value="" disabled>
                  No hay ubicaciones con stock
                </MenuItem>
              ) : (
                locationsWithStock.map((loc) => (
                  <MenuItem key={loc.location.id} value={loc.location.id}>
                    <Box display="flex" justifyContent="space-between" width="100%">
                      <Box>
                        <Typography variant="body2">{loc.location.nombre}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {loc.location.codigo}
                        </Typography>
                      </Box>
                      <Chip
                        label={`Stock: ${loc.stock.toFixed(2)}`}
                        size="small"
                        color={loc.stock < 10 ? 'warning' : 'success'}
                      />
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* Indicador Visual */}
          {fromLocationId && (
            <Box display="flex" justifyContent="center" alignItems="center">
              <IconArrowRight size={32} />
            </Box>
          )}

          {/* Ubicación Destino */}
          <FormControl fullWidth disabled={!fromLocationId}>
            <InputLabel>Ubicación Destino</InputLabel>
            <Select
              value={toLocationId}
              label="Ubicación Destino"
              onChange={(e) => setToLocationId(e.target.value)}
              disabled={loading || !fromLocationId}
            >
              {availableToLocations.length === 0 ? (
                <MenuItem value="" disabled>
                  No hay ubicaciones disponibles
                </MenuItem>
              ) : (
                availableToLocations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    <Box>
                      <Typography variant="body2">{loc.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {loc.codigo} - {loc.tipo}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* Cantidad */}
          <TextField
            fullWidth
            label="Cantidad a Transferir"
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            disabled={loading || !fromLocationId}
            inputProps={{
              min: 0.01,
              max: availableStock,
              step: 0.01,
            }}
            helperText={
              fromLocationId
                ? `Stock disponible: ${availableStock.toFixed(2)}`
                : 'Selecciona ubicación de origen primero'
            }
          />

          {/* Comentario */}
          <TextField
            fullWidth
            label="Comentario (opcional)"
            multiline
            rows={3}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            disabled={loading}
            placeholder="Ej: Transferencia para mantenimiento programado"
          />

          {/* Error */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Preview de Transferencia */}
          {fromLocationId && toLocationId && cantidad && parseFloat(cantidad) > 0 && (
            <Alert severity="success">
              <Typography variant="body2">
                <strong>Resumen:</strong>
              </Typography>
              <Typography variant="body2">
                • Origen: {selectedFromLocation?.location.nombre} (
                {availableStock.toFixed(2)} → {(availableStock - parseFloat(cantidad)).toFixed(2)})
              </Typography>
              <Typography variant="body2">
                • Destino: {availableToLocations.find((l) => l.id === toLocationId)?.nombre}
              </Typography>
              <Typography variant="body2">• Cantidad: {parseFloat(cantidad).toFixed(2)}</Typography>
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !fromLocationId || !toLocationId || !cantidad}
        >
          {loading ? 'Transfiriendo...' : 'Transferir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}