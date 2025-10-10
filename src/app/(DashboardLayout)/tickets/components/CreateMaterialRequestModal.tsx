// src/app/(DashboardLayout)/tickets/CreateMaterialRequestModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Autocomplete,
  IconButton,
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
} from '@mui/material';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { useItems, type Item } from '@/app/hooks/useItems';

interface MaterialRequestItemForm {
  item: Item | null;
  quantityRequested: number;
  notes?: string;
}

interface CreateMaterialRequestModalProps {
  open: boolean;
  onClose: () => void;
  ticketId: string;
  ticketTitle: string;
  onSuccess: () => void;
}

export default function CreateMaterialRequestModal({
  open,
  onClose,
  ticketId,
  ticketTitle,
  onSuccess,
}: CreateMaterialRequestModalProps) {
  const { data: items, loading: loadingItems } = useItems();
  const [requestItems, setRequestItems] = useState<MaterialRequestItemForm[]>([
    { item: null, quantityRequested: 1 },
  ]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setRequestItems([{ item: null, quantityRequested: 1 }]);
      setNotes('');
      setError(null);
    }
  }, [open]);

  const handleAddItem = () => {
    setRequestItems([...requestItems, { item: null, quantityRequested: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setRequestItems(requestItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...requestItems];
    updated[index] = { ...updated[index], [field]: value };
    setRequestItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validItems = requestItems.filter((ri) => ri.item && ri.quantityRequested > 0);

    if (validItems.length === 0) {
      setError('Debes agregar al menos un item');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ticketId,
        items: validItems.map((ri) => ({
          itemId: ri.item!.id,
          quantityRequested: ri.quantityRequested,
          notes: ri.notes || undefined,
        })),
        notes: notes || undefined,
      };

      console.log('📦 Enviando payload:', payload);

      const response = await fetch('/api/material-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('📥 Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(errorText || 'Error al crear la solicitud');
      }

      const result = await response.json();
      console.log('✅ Creado:', result);

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('❌ Error completo:', err);
      setError(err.message || 'Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box>
            <Typography variant="h5">📋 Solicitar Materiales</Typography>
            <Typography variant="body2" color="text.secondary">
              Ticket: {ticketTitle}
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

          {loadingItems ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Items Solicitados
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<IconPlus size={18} />}
                    onClick={handleAddItem}
                    disabled={loading}
                  >
                    Agregar Item
                  </Button>
                </Box>

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell width={120}>Cantidad</TableCell>
                      <TableCell width={200}>Notas</TableCell>
                      <TableCell width={60}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requestItems.map((requestItem, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Autocomplete
                            size="small"
                            options={items}
                            value={requestItem.item}
                            onChange={(e, newValue) => handleItemChange(index, 'item', newValue)}
                            getOptionLabel={(option) => option.descripcion}
                            renderOption={(props, option) => (
                              <Box component="li" {...props}>
                                <Box>
                                  <Typography variant="body2">{option.descripcion}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {option.categoria} • Stock: {option.inventario}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Seleccionar item"
                                required
                              />
                            )}
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            fullWidth
                            value={requestItem.quantityRequested}
                            onChange={(e) =>
                              handleItemChange(index, 'quantityRequested', parseInt(e.target.value) || 1)
                            }
                            inputProps={{ min: 1 }}
                            required
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={requestItem.notes || ''}
                            onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                            placeholder="Opcional"
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell>
                          {requestItems.length > 1 && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveItem(index)}
                              disabled={loading}
                            >
                              <IconTrash size={18} />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <TextField
                label="Observaciones Generales"
                multiline
                rows={3}
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agregar observaciones sobre esta solicitud (opcional)"
                disabled={loading}
              />
            </>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} variant="outlined">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || loadingItems}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Creando...' : 'Crear Solicitud'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}