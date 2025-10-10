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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { type MaterialRequest } from '@/app/hooks/useMaterialRequests';

interface ApproveModalProps {
  open: boolean;
  onClose: () => void;
  request: MaterialRequest;
  onSuccess: () => void;
}

interface ApproveItem {
  itemId: string;
  descripcion: string;
  quantityRequested: number;
  quantityApproved: number;
  currentStock: number;
}

export default function ApproveModal({ open, onClose, request, onSuccess }: ApproveModalProps) {
  const [items, setItems] = useState<ApproveItem[]>([]);
  const [notes, setNotes] = useState('');
  const [locationId, setLocationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      // Inicializar items con cantidades solicitadas
      const initialItems: ApproveItem[] = request.items.map((item) => ({
        itemId: item.item.id,
        descripcion: item.item.descripcion,
        quantityRequested: Number(item.quantityRequested),
        quantityApproved: Number(item.quantityRequested), // Por defecto, aprobar todo
        currentStock: 0, // Lo cargaremos después
      }));
      setItems(initialItems);
      setNotes('');
      setError(null);
      
      // Cargar stock actual de cada item
      loadItemsStock(initialItems);
    }
  }, [open, request]);

  const loadItemsStock = async (itemsList: ApproveItem[]) => {
    try {
      // Cargar inventario de cada item
      for (const item of itemsList) {
        const response = await fetch(`/api/items/${item.itemId}`);
        if (response.ok) {
          const itemData = await response.json();
          item.currentStock = itemData.inventario || 0;
        }
      }
      setItems([...itemsList]);
    } catch (err) {
      console.error('Error loading stock:', err);
    }
  };

  const handleQuantityChange = (itemId: string, value: number) => {
    setItems(items.map(item => 
      item.itemId === itemId 
        ? { ...item, quantityApproved: Math.max(0, value) }
        : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    const validItems = items.filter(i => i.quantityApproved > 0);
    if (validItems.length === 0) {
      setError('Debes aprobar al menos un item con cantidad mayor a 0');
      return;
    }

    // Verificar stock
    const insufficientStock = validItems.find(i => i.quantityApproved > i.currentStock);
    if (insufficientStock) {
      setError(`Stock insuficiente para: ${insufficientStock.descripcion}. Disponible: ${insufficientStock.currentStock}`);
      return;
    }

    if (!locationId.trim()) {
      setError('Debes especificar el ID de la ubicación/almacén');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        items: validItems.map(i => ({
          itemId: i.itemId,
          quantityApproved: i.quantityApproved,
        })),
        notes: notes || undefined,
      };

      const response = await fetch(
        `/api/material-requests/${request.id}/approve?locationId=${locationId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error al aprobar la solicitud');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al aprobar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box>
            <Typography variant="h5">✓ Aprobar Solicitud</Typography>
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

          {/* Items */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Revisar Cantidades
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Ajusta las cantidades a aprobar según disponibilidad
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="center" width={120}>Solicitado</TableCell>
                  <TableCell align="center" width={120}>Stock</TableCell>
                  <TableCell align="center" width={150}>Aprobar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => {
                  const hasStock = item.quantityApproved <= item.currentStock;
                  return (
                    <TableRow key={item.itemId}>
                      <TableCell>
                        <Typography variant="body2">{item.descripcion}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={item.quantityRequested} 
                          size="small" 
                          color="info"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={item.currentStock} 
                          size="small"
                          color={hasStock ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          fullWidth
                          value={item.quantityApproved}
                          onChange={(e) => 
                            handleQuantityChange(item.itemId, parseInt(e.target.value) || 0)
                          }
                          inputProps={{ 
                            min: 0,
                            max: item.currentStock,
                          }}
                          error={!hasStock}
                          disabled={loading}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>

          {/* Location ID */}
          <Box sx={{ mb: 3 }}>
            <TextField
              label="ID de Ubicación/Almacén *"
              fullWidth
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              placeholder="Ej: almacen-central-uuid"
              helperText="Ingresa el UUID de la ubicación desde donde se entregarán los materiales"
              required
              disabled={loading}
            />
          </Box>

          {/* Observaciones */}
          <TextField
            label="Observaciones"
            multiline
            rows={3}
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Agregar observaciones sobre la aprobación (opcional)"
            disabled={loading}
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Nota:</strong> Al aprobar, se generará automáticamente una salida (OUT) del inventario.
          </Alert>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} variant="outlined">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="success"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Aprobando...' : 'Aprobar Solicitud'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}